const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { scheduleNightNotifications } = require('./utils/scheduleNight'); // Asegúrate de que la ruta sea correcta

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

  // Programar notificaciones de noche
  const textChannelId = '1305310810007928945'; // Reemplaza con el ID real del canal de texto
  const voiceChannelId = '1300875878481268824'; // Reemplaza con el ID real del canal de voz
  const roleId = '1305310749949693955'; // Reemplaza con el ID real del rol

  scheduleNightNotifications(client, textChannelId, voiceChannelId, roleId);
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