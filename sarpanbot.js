const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, EndBehaviorType } = require('@discordjs/voice');
const { Wit } = require('node-wit');
const { scheduleNightNotifications } = require('./utils/scheduleNight');
const ScheduleManager = require('./utils/scheduleManager');
const handleVoiceStateUpdate = require('./voiceStateHandler');
const handleMessageDelete = require('./messageDeleteHandler');
const playAudio = require('./playAudio');
const updateServerStats = require('./utils/updateServerStats');

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const witClient = new Wit({ accessToken: process.env.WIT_AI_TOKEN });

client.commands = new Collection();

// Cargar comandos desde la carpeta commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  updateServerStats(client, '1300875878481268820'); // Reemplaza con el ID de tu servidor

  // Actualizar estadísticas del servidor cada 10 minutos
  setInterval(() => {
    updateServerStats(client, '1300875878481268820'); // Reemplaza con el ID de tu servidor
  }, 10 * 60 * 1000);

  // Programar una tarea para enviar notificaciones periódicas
  schedule.scheduleJob('0 * * * *', () => { // Cada hora
    const channel = client.channels.cache.get('ID_DEL_CANAL_DE_VOZ');
    if (channel) {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // Ejecutar comandos de voz
      const voiceCommand = client.commands.get('voiceCommands');
      if (voiceCommand) {
        voiceCommand.execute(connection, client);
      }
    }
  });
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.slice(1).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    command.execute(message);
  } catch (error) {
    console.error(error);
    message.reply('Hubo un error al ejecutar ese comando!');
  }
});

// Manejar errores y reconexiones
client.on('error', console.error);
client.on('disconnect', () => {
  console.log('Bot desconectado, intentando reconectar...');
  client.login(process.env.DISCORD_TOKEN);
});
client.on('reconnecting', () => {
  console.log('Bot reconectando...');
});

// Mantener la conexión activa enviando un ping cada 30 minutos
setInterval(() => {
  client.ws.ping();
  console.log('Ping enviado para mantener la conexión activa');
}, 1800000); // 30 minutos

// Usar el manejador de eventos de estado de voz
handleVoiceStateUpdate(client);

// Usar el manejador de eventos de eliminación de mensajes
handleMessageDelete(client);

// Definir la variable nextNightTime antes de usarla
let nextNightTime;

// Programar notificación de audio 5 minutos antes de las noches
const textChannelId = '1305310810007928945'; // Reemplaza con el ID del canal de texto
const voiceChannelId = '1300875878481268824'; // Reemplaza con el ID del canal de voz
const roleId = '1305310749949693955'; // Reemplaza con el ID del rol

nextNightTime = scheduleNightNotifications(client, textChannelId, voiceChannelId, roleId);

// Uso de nextNightTime
console.log(nextNightTime);

// Programar notificación de audio 5 minutos antes de los eventos
const baseDate = new Date('2024-11-18T03:00:00');
const events = [
    { name: 'Evento 1', date: new Date(baseDate.setHours(3)), voiceChannelId: '1300875878481268824' },
    { name: 'Evento 2', date: new Date(baseDate.setHours(6)), voiceChannelId: '1300875878481268824' },
    { name: 'Evento 3', date: new Date(baseDate.setHours(9)), voiceChannelId: '1300875878481268824' },
    { name: 'Evento 4', date: new Date(baseDate.setHours(12)), voiceChannelId: '1300875878481268824' },
    { name: 'Evento 5', date: new Date(baseDate.setHours(15)), voiceChannelId: '1300875878481268824' },
    { name: 'Evento 6', date: new Date(baseDate.setHours(18)), voiceChannelId: '1300875878481268824' },
    { name: 'Evento 7', date: new Date(baseDate.setHours(21)), voiceChannelId: '1300875878481268824' },
    { name: 'Evento 8', date: new Date(baseDate.setHours(0)), voiceChannelId: '1300875878481268824' },
];

events.forEach(event => {
    const notificationTime = new Date(event.date.getTime() - 5 * 60000); // 5 minutos antes del evento

    schedule.scheduleJob(notificationTime, async () => {
        console.log('Ejecutando notificación de evento');
        try {
            await playAudio(client, event.voiceChannelId, 'sounds/tevent.mp3');
        } catch (error) {
            console.error('Error al reproducir el audio del evento:', error);
        }
    });
});

client.login(process.env.DISCORD_TOKEN);

// Función para manejar comandos de voz
async function handleVoiceCommand(connection) {
  const receiver = connection.receiver;
  const audioPlayer = createAudioPlayer();

  receiver.speaking.on('start', userId => {
    const audioStream = receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 100,
      },
    });

    const buffer = [];
    audioStream.on('data', chunk => buffer.push(chunk));
    audioStream.on('end', async () => {
      const audioBuffer = Buffer.concat(buffer);
      const response = await witClient.message(audioBuffer.toString('base64'), {});
      console.log('Respuesta de Wit.ai:', response);

      // Manejar la respuesta de Wit.ai y ejecutar comandos
      if (response.intents.length > 0) {
        const intent = response.intents[0].name;
        if (intent === 'leave') {
          // Ejecutar comando leave
          const command = client.commands.get('leave');
          if (command) command.execute({ guild: connection.channel.guild, reply: console.log });
        }
      }
    });
  });
}