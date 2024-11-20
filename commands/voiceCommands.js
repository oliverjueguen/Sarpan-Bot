const { getVoiceConnection } = require('@discordjs/voice');
const { Wit } = require('node-wit');
const dotenv = require('dotenv');

dotenv.config();

const witClient = new Wit({ accessToken: process.env.WIT_AI_TOKEN });

module.exports = {
  name: 'voiceCommands',
  description: 'Handle voice commands',
  async execute(connection, client) {
    const receiver = connection.receiver;

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
  },
};