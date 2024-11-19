const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');

module.exports = async (client, channelId, audioFilePath) => {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel || channel.type !== 2) return; // 2 is the type for GUILD_VOICE

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(path.join(__dirname, audioFilePath));

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('El audio está reproduciéndose.');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('El audio ha terminado de reproducirse.');
            setTimeout(() => {
                connection.destroy();
            }, 5000); // Desconectar después de 5 segundos
        });

        player.on('error', error => {
            console.error('Error al reproducir el audio:', error);
            connection.destroy();
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            connection.destroy();
        });
    } catch (error) {
        console.error('Error al conectar al canal de voz:', error);
    }
};