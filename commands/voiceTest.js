const { EndBehaviorType } = require('@discordjs/voice');
const SpeechToText = require('speech-to-text');

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
          const text = await SpeechToText.recognize(audioBuffer);
          console.log('Recognized text:', text);

          // Manejar la respuesta y ejecutar comandos
          if (text.toLowerCase().includes('funcionas sarpan bot')) {
            const textChannel = client.channels.cache.get('1308902912533069825');
            if (textChannel) {
              textChannel.send('Sí, te escucho.');
            }
          } else {
            console.log('No matching command found');
          }
        } catch (error) {
          console.error('Error processing audio:', error);
        }
      });
    });
  },
};