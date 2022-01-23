const Discord = require('discord.js');
require('dotenv').config();
const client = new Discord.Client();

// Shows connection established and the name of the bot in the terminal

client.on('ready', () => {                                                 
    client.user.setActivity(".help", {type: "PLAYING"})

    // Shows list of servers the bot is connected to and the  number of channels and voice channel in the server

    client.guilds.cache.forEach((guild) => {    
        console.log(guild.name)
        guild.channels.cache.forEach((channel) => {
            console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
        })
    })
})

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client, Discord);
})

client.login(process.env.TOKEN);