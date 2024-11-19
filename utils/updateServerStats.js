const { PermissionsBitField } = require('discord.js');

module.exports = async (client, guildId) => {
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('Servidor no encontrado.');
        return;
    }

    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
    const offlineMembers = guild.members.cache.filter(member => !member.presence || member.presence.status === 'offline').size;

    const roleId = '1303520120722952232'; // ID del rol que tendrá acceso a los canales

    // Crear o actualizar los canales de estadísticas
    let totalMembersChannel = guild.channels.cache.find(channel => channel.name.startsWith('Total Members:'));
    let onlineMembersChannel = guild.channels.cache.find(channel => channel.name.startsWith('Online Members:'));
    let offlineMembersChannel = guild.channels.cache.find(channel => channel.name.startsWith('Offline Members:'));

    const permissionOverwrites = [
        {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: roleId,
            allow: [PermissionsBitField.Flags.ViewChannel],
        },
    ];

    if (!totalMembersChannel) {
        totalMembersChannel = await guild.channels.create({
            name: `Total Members: ${totalMembers}`,
            type: 2, // 2 is the type for GUILD_VOICE
            permissionOverwrites,
        });
    } else {
        await totalMembersChannel.setName(`Total Members: ${totalMembers}`);
        await totalMembersChannel.permissionOverwrites.set(permissionOverwrites);
    }

    if (!onlineMembersChannel) {
        onlineMembersChannel = await guild.channels.create({
            name: `Online Members: ${onlineMembers}`,
            type: 2, // 2 is the type for GUILD_VOICE
            permissionOverwrites,
        });
    } else {
        await onlineMembersChannel.setName(`Online Members: ${onlineMembers}`);
        await onlineMembersChannel.permissionOverwrites.set(permissionOverwrites);
    }

    if (!offlineMembersChannel) {
        offlineMembersChannel = await guild.channels.create({
            name: `Offline Members: ${offlineMembers}`,
            type: 2, // 2 is the type for GUILD_VOICE
            permissionOverwrites,
        });
    } else {
        await offlineMembersChannel.setName(`Offline Members: ${offlineMembers}`);
        await offlineMembersChannel.permissionOverwrites.set(permissionOverwrites);
    }
};