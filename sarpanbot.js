const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

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

  // Programar una tarea para enviar notificaciones periódicas
  schedule.scheduleJob('0 * * * *', () => { // Cada hora
    const channel = client.channels.cache.get('ID_DEL_CANAL_DE_VOZ');
    if (channel) {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // Aquí puedes agregar el código para enviar la notificación
      connection.disconnect();
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

client.login(process.env.DISCORD_TOKEN);