const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const playAudio = require('../playAudio');

module.exports = {
    name: 'tevent',
    description: 'Muestra cuánto tiempo queda para el siguiente evento y reproduce un audio en el canal de voz.',
    async execute(message) {
        // IDs de los canales y roles
        const voiceChannelId = '1300875878481268824'; // ID del canal de voz

        // Horas de los eventos en formato 24 horas (HH:MM)
        const eventTimes = ['03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'];

        // Obtener la hora actual en formato de 24 horas
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Convertir a minutos totales

        // Buscar el próximo evento
        let nextEvent = null;
        for (const time of eventTimes) {
            const [hour, minute] = time.split(':').map(Number);
            const eventTimeInMinutes = hour * 60 + minute;

            if (eventTimeInMinutes > currentTime) {
                nextEvent = { hour, minute };
                break;
            }
        }

        // Si no hay eventos futuros hoy, el próximo es el primero de mañana
        if (!nextEvent) {
            const [hour, minute] = eventTimes[0].split(':').map(Number);
            nextEvent = { hour, minute };
        }

        // Calcular la diferencia de tiempo hasta el próximo evento
        const eventDate = new Date();
        eventDate.setHours(nextEvent.hour, nextEvent.minute, 0, 0);

        if (eventDate < now) {
            eventDate.setDate(now.getDate() + 1); // Mover al día siguiente si el evento ya pasó hoy
        }

        const timeDifference = eventDate - now; // Diferencia en milisegundos
        const minutesLeft = Math.floor((timeDifference / 1000) / 60);
        const hoursLeft = Math.floor(minutesLeft / 60);
        const remainingMinutes = minutesLeft % 60;

        // Formatear el mensaje de respuesta
        const response = `El siguiente evento es en ${hoursLeft} horas y ${remainingMinutes} minutos.`;

        message.reply(response);

        // Conectar al canal de voz y reproducir audio
        const voiceChannel = message.guild.channels.cache.get(voiceChannelId);
        if (voiceChannel) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(path.join(__dirname, '../sounds/tevent.mp3'));

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
        } else {
            console.error('Canal de voz no encontrado.');
        }
    },
};