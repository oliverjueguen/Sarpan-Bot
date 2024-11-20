const schedule = require('node-schedule');
const playAudio = require('../playAudio'); // Asegúrate de que la ruta sea correcta

function scheduleNightNotifications(client, textChannelId, voiceChannelId, roleId) {
    const startDate = new Date('2024-11-17T21:00:00'); // Primera noche a las 21:00 en la hora de la máquina
    const nightDuration = 30 * 60 * 1000; // 30 minutos en milisegundos
    const dayDuration = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
    const cycleDuration = nightDuration + dayDuration; // Duración total de un ciclo

    let nextNightTime = new Date(startDate);

    // Avanza al próximo ciclo de noche si ya pasó
    while (nextNightTime <= new Date()) {
        nextNightTime = new Date(nextNightTime.getTime() + cycleDuration);
    }

    // Agrega logs para depuración
    console.log(`Próxima noche calculada para: ${nextNightTime}`);

    // Programar notificación 5 minutos antes de la próxima noche
    const notificationTime = new Date(nextNightTime.getTime() - 5 * 60 * 1000); // 5 minutos antes
    console.log(`Notificación programada para: ${notificationTime}`);

    schedule.scheduleJob(notificationTime, async () => {
        console.log('Ejecutando notificación de noche');
        const textChannel = client.channels.cache.get(textChannelId);
        if (textChannel) {
            textChannel.send(`La noche en el juego está a punto de comenzar en 5 minutos! <@&${roleId}>`);
        } else {
            console.error('Canal de texto no encontrado o no es un canal de texto.');
        }

        // Reproducir audio en el canal de voz
        try {
            await playAudio(client, voiceChannelId, 'sounds/noche.mp3');
        } catch (error) {
            console.error('Error al reproducir el audio de noche:', error);
        }

        // Reprogramar la siguiente notificación
        try {
            scheduleNightNotifications(client, textChannelId, voiceChannelId, roleId);
        } catch (error) {
            console.error('Error al reprogramar la notificación de noche:', error);
        }
    });

    return nextNightTime;
}

module.exports = { scheduleNightNotifications };