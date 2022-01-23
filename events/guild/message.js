require('dotenv').config();
module.exports = (Discord, client, receivedMessage) =>{
    const prefix = process.env.PREFIX;

    if(!receivedMessage.content.startsWith(prefix) || receivedMessage.author.bot) return;

    const args = receivedMessage.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    if(command) {
        command.execute(receivedMessage, args, cmd, client, Discord)
    }
}