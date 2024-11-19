const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'rolebuttons',
    description: 'Envía un mensaje con botones para asignar roles.',
    async execute(message) {
        if (message.channel.id !== '1305314001797775444') {
            return message.reply('Este comando solo se puede usar en el canal específico.');
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('saurodoma')
                    .setLabel('Saurodoma')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('tevent')
                    .setLabel('Tevent')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({
            content: 'Haz clic en un botón para obtener un rol:',
            components: [row],
        });

        const collector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000, // El tiempo que el collector estará activo (en milisegundos)
        });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'saurodoma') {
                const role = interaction.guild.roles.cache.get('1305310749949693955');
                if (role) {
                    await interaction.member.roles.add(role);
                    await interaction.reply({ content: 'Has recibido el rol "Saurodoma".', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'No se pudo asignar el rol "Saurodoma".', ephemeral: true });
                }
            } else if (interaction.customId === 'tevent') {
                const role = interaction.guild.roles.cache.get('1303767471014281218');
                if (role) {
                    await interaction.member.roles.add(role);
                    await interaction.reply({ content: 'Has recibido el rol "Tevent".', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'No se pudo asignar el rol "Tevent".', ephemeral: true });
                }
            }
        });

        collector.on('end', collected => {
            console.log(`Se recogieron ${collected.size} interacciones.`);
        });
    },
};
