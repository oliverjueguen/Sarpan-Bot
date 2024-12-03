let notificationsEnabled = false;

module.exports = {
    name: 'notificationstl',
    description: 'Activa o desactiva las notificaciones de saurodoma y tevent.',
    execute(message) {
        const adminRoleId = '1303507361972883606'; // ID del rol admin

        if (!message.member.roles.cache.has(adminRoleId)) {
            return message.reply('No tienes permiso para usar este comando.');
        }

        notificationsEnabled = !notificationsEnabled;
        const status = notificationsEnabled ? 'activadas' : 'desactivadas';
        message.reply(`Las notificaciones han sido ${status}.`);
    },
    areNotificationsEnabled() {
        return notificationsEnabled;
    }
};