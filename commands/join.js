const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  name: 'join',
  description: 'Join the voice channel',
  execute(message) {
    if (message.member.voice.channel) {
      joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      message.reply('He entrado al canal de voz!');
    } else {
      message.reply('¡Debes estar en un canal de voz para usar este comando!');
    }
  },
};