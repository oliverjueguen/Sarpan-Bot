const playAudio = require('../playAudio');

module.exports = {
    name: 'testevent',
    description: 'Testea la función de reproducir audio en un canal de voz.',
    async execute(message) {
        const voiceChannelId = '1300875878481268824'; // ID del canal de voz
        const audioFilePath = 'sounds/tevent.mp3'; // Ruta del archivo de audio

        try {
            await playAudio(message.client, voiceChannelId, audioFilePath);
            message.reply('Reproduciendo audio en el canal de voz.');
        } catch (error) {
            console.error(error);
            message.reply('Hubo un error al intentar reproducir el audio.');
        }
    },
};