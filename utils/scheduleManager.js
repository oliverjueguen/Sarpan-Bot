const schedule = require('node-schedule');

class ScheduleManager {
    constructor(client, channelId) {
        this.client = client;
        this.channelId = channelId;
    }

    scheduleNotification(time, message) {
        const [hour, minute] = time.split(':').map(Number);

        // Configura la hora de la notificación 5 minutos antes
        schedule.scheduleJob({ hour: hour, minute: minute - 5, second: 0 }, () => {
            const channel = this.client.channels.cache.get(this.channelId);
            if (channel && channel.isTextBased()) {
                channel.send(message);
            } else {
                console.error('Canal no encontrado o no es un canal de texto.');
            }
        });
    }

    scheduleMultipleNotifications(times, messageTemplate) {
        times.forEach(time => {
            this.scheduleNotification(time, `Recordatorio: ${messageTemplate} a las ${time} UTC!`);
        });
    }
}

module.exports = ScheduleManager;
