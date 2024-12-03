const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');

module.exports = {
    name: 'reve',
    description: 'Reproduce el audio reve.mp3 en el canal de voz del usuario y se desconecta después de 5 segundos.',
    async execute(message) {
        const { channel } = message.member.voice;

        if (!channel) {
            return message.reply('¡Debes estar en un canal de voz para usar este comando!');
        }

        const audioFilePath = path.join(__dirname, '../sounds/reve.mp3'); // Ruta del archivo de audio

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(audioFilePath);

            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                connection.disconnect();
                console.log('Bot desconectado del canal de voz.');
            });

            player.on('error', error => {
                console.error('Error al reproducir el audio:', error);
                connection.disconnect();
            });

            message.reply('Reproduciendo audio reve en tu canal de voz.');
        } catch (error) {
            console.error(error);
            message.reply('Hubo un error al intentar reproducir el audio reve.');
        }
    },
};