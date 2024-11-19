const { EmbedBuilder } = require('discord.js');
const adminChannelId = '1306020789623066645';

module.exports = (client) => {
    client.on('voiceStateUpdate', (oldState, newState) => {
        const member = newState.member;
        const adminChannel = client.channels.cache.get(adminChannelId);

        if (!adminChannel) return;

        let embed;

        if (!oldState.channel && newState.channel) {
            // User joined a voice channel
            embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`🔊 **@${member.displayName}** joined voice channel <#${newState.channel.id}>`)
                .setTimestamp();
        } else if (oldState.channel && !newState.channel) {
            // User left a voice channel
            embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`🔇 **@${member.displayName}** left voice channel <#${oldState.channel.id}>`)
                .setTimestamp();
        } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            // User moved between voice channels
            embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setDescription(`🔄 **@${member.displayName}** switched voice channels <#${oldState.channel.id}> -> <#${newState.channel.id}>`)
                .setTimestamp();
        }

        if (embed) {
            adminChannel.send({ embeds: [embed] });
        }
    });
};