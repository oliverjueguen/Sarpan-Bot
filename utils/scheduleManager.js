const schedule = require('node-schedule');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const { areNotificationsEnabled } = require('../commands/notificationstl');

class ScheduleManager {
    constructor(client, textChannelId, voiceChannelId, roleId) {
        this.client = client;
        this.textChannelId = textChannelId;
        this.voiceChannelId = voiceChannelId;
        this.roleId = roleId;
    }

    scheduleNotification(time, message) {
        const [hour, minute] = time.split(':').map(Number);

        // Configura la hora de la notificación 5 minutos antes
        const notificationTime = new Date();
        notificationTime.setHours(hour);
        notificationTime.setMinutes(minute - 5);
        notificationTime.setSeconds(0);

        console.log(`Notificación programada para: ${notificationTime}`); // Log para mostrar cuándo está programado el próximo evento

        schedule.scheduleJob(notificationTime, async () => {
            if (!areNotificationsEnabled()) {
                console.log('Las notificaciones están desactivadas. No se enviará ninguna notificación.');
                return;
            }

            console.log(`Enviando notificación para el evento a las ${time}`);
            const channel = this.client.channels.cache.get(this.textChannelId);
            if (channel && channel.isTextBased()) {
                channel.send(message);
            } else {
                console.error('Canal no encontrado o no es un canal de texto.');
            }

            // Conectar al canal de voz y reproducir audio
            const connection = joinVoiceChannel({
                channelId: this.voiceChannelId,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
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
        });
    }

    scheduleMultipleNotifications(times, messageTemplate) {
        times.forEach(time => {
            this.scheduleNotification(time, `Recordatorio: ${messageTemplate} a las ${time} UTC! <@&${this.roleId}>`);
        });
    }
}

module.exports = ScheduleManager;