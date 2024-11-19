const playAudio = require('../playAudio');

module.exports = {
    name: 'testsaurodoma',
    description: 'Testea la función de reproducir audio en un canal de voz con el audio noche.mp3.',
    async execute(message) {
        const voiceChannelId = '1300875878481268824'; // ID del canal de voz
        const audioFilePath = 'sounds/noche.mp3'; // Ruta del archivo de audio

        try {
            await playAudio(message.client, voiceChannelId, audioFilePath);
            message.reply('Reproduciendo audio de noche en el canal de voz.');
        } catch (error) {
            console.error(error);
            message.reply('Hubo un error al intentar reproducir el audio de noche.');
        }
    },
};