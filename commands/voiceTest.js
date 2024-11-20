const { EndBehaviorType } = require('@discordjs/voice');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { exec } = require('child_process');
const { SpeechClient } = require('@google-cloud/speech');

const pipelineAsync = promisify(pipeline);

const speechClient = new SpeechClient();

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

      const filePath = `./audio_${userId}.pcm`;
      const writeStream = createWriteStream(filePath);

      pipeline(audioStream, writeStream, (err) => {
        if (err) {
          console.error('Pipeline failed', err);
        } else {
          console.log('Pipeline succeeded');
        }
      });

      audioStream.on('end', async () => {
        console.log('Audio stream ended, processing...');
        try {
          const [response] = await speechClient.recognize({
            config: {
              encoding: 'LINEAR16',
              sampleRateHertz: 16000,
              languageCode: 'en-US',
            },
            audio: {
              content: filePath,
            },
          });

          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
          console.log(`Transcription: ${transcription}`);

          // Manejar la respuesta y ejecutar comandos
          if (transcription.toLowerCase().includes('funcionas sarpan bot')) {
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