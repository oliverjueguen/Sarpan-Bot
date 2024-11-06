const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const { token, channelId, eventRole } = require('./config.json'); // Carga la configuración desde config.json
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const eventStartHour = 2; // El primer evento es a las 2:00 en horario local de Alemania

function getTimeUntilNextEvent() {
    const now = new Date();
    const eventStart = new Date(now);
    eventStart.setHours(eventStartHour, 0, 0, 0);

    while (eventStart <= now) {
        eventStart.setHours(eventStart.getHours() + 3); // Siguiente evento cada 3 horas
    }

    const diff = eventStart - now;
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours} horas y ${minutes} minutos`;
}

client.on('messageCreate', (message) => {
    if (message.content === '!tevent') {
        const timeUntilNextEvent = getTimeUntilNextEvent();
        message.channel.send(`El siguiente Tevent Soul Fragment Event empezará en ${timeUntilNextEvent}`);
    }
});

cron.schedule('55 1-23/3 * * *', () => {
    const channel = client.channels.cache.get(channelId);
    if (channel) {
        channel.send(`${eventRole} El Tevent Soul Fragment Event empezará en 5 minutos`);
    }
});

client.once('ready', () => {
    console.log('Bot listo y conectado en horario local de Alemania!');
});

client.login(token);
