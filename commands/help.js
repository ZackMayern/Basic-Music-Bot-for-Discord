const Discord = require('discord.js');
module.exports = {
    name: 'help',
    aliases: ['h'],
    description: "This is a help command.",

    execute(receivedMessage, args, cmd, client, Discord){
        receivedMessage.channel.send(helpDesk)
    }
}

let helpDesk = new Discord.MessageEmbed()
    .setTitle("⚠ Help Desk")
    .setAuthor("Music Bot")
    .setDescription("Hi! Welcome to the help section!")
        
    .addField("Commands", 
    "`.play <link>`- play music. Make sure you're connected to a voice channel that I can access.\n`.disconnect or .dc` - disconnect from the voice channel.\n`.pause` - pause the current song.\n`.skip` - skip to the next song in the queue.\n")

    .setColor("WHITE")
  
    .setTimestamp()