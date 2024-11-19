const { EmbedBuilder } = require('discord.js');
const adminChannelId = '1306020789623066645';

module.exports = (client) => {
    client.on('messageDelete', message => {
        // No enviar notificación si el mensaje fue borrado en el canal admin
        if (message.channel.id === adminChannelId) return;

        const adminChannel = client.channels.cache.get(adminChannelId);
        if (!adminChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Mensaje Eliminado')
            .setColor('#FF0000')
            .setDescription(`Un mensaje de **${message.author.tag}** fue eliminado en el canal **${message.channel.name}**.`)
            .addFields({ name: 'Contenido del mensaje', value: message.content || 'No había contenido' })
            .setTimestamp();

        adminChannel.send({ embeds: [embed] });
    });
};