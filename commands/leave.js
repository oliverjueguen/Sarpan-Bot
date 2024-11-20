const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'leave',
  description: 'Leave the voice channel',
  execute(message) {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      message.reply('He salido del canal de voz!');
    } else {
      message.reply('¡No estoy en ningún canal de voz!');
    }
  },
};