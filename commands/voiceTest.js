const { Wit } = require('node-wit');
const dotenv = require('dotenv');

dotenv.config();

const witClient = new Wit({ accessToken: process.env.WIT_AI_TOKEN });

module.exports = {
  name: 'voiceTest',
  description: 'Test voice commands',
  async execute(connection, client) {
    const receiver = connection.receiver;

    receiver.speaking.on('start', userId => {
      console.log(`User ${userId} started speaking`);
      const audioStream = receiver.subscribe(userId, {
        end: {
          behavior: EndBehaviorType.AfterSilence,
          duration: 100,
        },
      });

      const buffer = [];
      audioStream.on('data', chunk => buffer.push(chunk));
      audioStream.on('end', async () => {
        console.log('Audio stream ended, processing...');
        const audioBuffer = Buffer.concat(buffer);
        try {
          const response = await witClient.message(audioBuffer.toString('base64'), {});
          console.log('Respuesta de Wit.ai:', response);

          // Manejar la respuesta de Wit.ai y ejecutar comandos
          if (response.intents.length > 0) {
            const intent = response.intents[0].name;
            console.log(`Intent detected: ${intent}`);
            if (intent === 'funcionas_sarpan_bot') {
              const textChannel = client.channels.cache.get('1308902912533069825');
              if (textChannel) {
                textChannel.send('Sí, te escucho.');
              }
            }
          } else {
            console.log('No intents detected');
          }
        } catch (error) {
          console.error('Error processing audio with Wit.ai:', error);
        }
      });
    });
  },
};