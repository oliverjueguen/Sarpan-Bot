require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { scheduleNightNotifications } = require('./utils/scheduleNight');
const ScheduleManager = require('./utils/scheduleManager');
const handleVoiceStateUpdate = require('./voiceStateHandler');
const handleMessageDelete = require('./messageDeleteHandler');
const playAudio = require('./playAudio');
const updateServerStats = require('./utils/updateServerStats');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences] });

// Configuración de colección de comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.name, command);
}

// Evento para manejar comandos
client.on('messageCreate', message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    try {
        client.commands.get(commandName).execute(message);
    } catch (error) {
        console.error(error);
        message.reply('Hubo un error al ejecutar ese comando.');
    }
});

// Evento para manejar interacciones con botones
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    try {
        let role;
        if (interaction.customId === 'saurodoma') {
            role = interaction.guild.roles.cache.get('1305310749949693955');
        } else if (interaction.customId === 'tevent') {
            role = interaction.guild.roles.cache.get('1303767471014281218');
        }

        if (role) {
            if (interaction.member.roles.cache.has(role.id)) {
                // Si el usuario ya tiene el rol, se lo quita
                await interaction.member.roles.remove(role);
                await interaction.reply({ content: `El rol "${role.name}" ha sido eliminado.`, ephemeral: true });
            } else {
                // Si el usuario no tiene el rol, se lo añade
                await interaction.member.roles.add(role);
                await interaction.reply({ content: `El rol "${role.name}" ha sido añadido.`, ephemeral: true });
            }
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Hubo un error al procesar tu solicitud.', ephemeral: true });
    }
});

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

// Actualizar estadísticas del servidor al iniciar el bot
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    updateServerStats(client, '1300875878481268820'); // Reemplaza con el ID de tu servidor

    // Actualizar estadísticas del servidor cada 10 minutos
    setInterval(() => {
        updateServerStats(client, '1300875878481268820'); // Reemplaza con el ID de tu servidor
    }, 10 * 60 * 1000);
});

client.login(process.env.DISCORD_TOKEN);