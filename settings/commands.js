async function replyWithInvite(msg) {
  let invite = await msg.channel.createInvite(
  {
    maxAge: 10 * 600, // maximum time for the invite, in milliseconds
    maxUses: 1, // maximum times it can be used
    unique: true
  },
)
.catch(console.log);
   msg.reply(invite ? `Here's your invite: ${invite}` : "There has been an error during the creation of the invite.");
}
  
module.exports = function (bot, message) {
  if (msg.content.startsWith('!inv')) {
    replyWithInvite(message);
  }
}
