const ytdl = require('ytdl-core');
const ytSearch = require ('yt-search');
const Discord = require('discord.js');

const queue = new Map();
let song = {}

module.exports = {
    name: 'play',
    aliases: ['skip', 'disconnect', 'dc', 'pause', 'resume'],
    description: "This is a Play command.",

    async execute(receivedMessage, args, cmd, client, Discord){
        const voiceChannel = receivedMessage.member.voice.channel;

        if (!voiceChannel) return receivedMessage.channel.send(noVoiceChannel);
        const permissions = voiceChannel.permissionsFor(receivedMessage.client.user);
        if (!permissions.has('CONNECT')) return receivedMessage.channel.send(noConPerm);
        if (!permissions.has('SPEAK')) return receivedMessage.channel.send(noSpeakPerm);

        const server_queue = queue.get(receivedMessage.guild.id);

        if (cmd === 'play'){
            if (!args.length) return receivedMessage.channel.send(noLink);

            /**************************************************/
            if (ytdl.validateURL(args[0])){
                const song_info = await ytdl.getInfo(args[0]);
                song = {title: song_info.videoDetails.title, url: song_info.videoDetails.video_url}
            }

            else {
                // If not URL, use keywords to find video.
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    // Plays the first result from the search.
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                const video = await videoFinder(args.join(' '));
                if (video){
                    song = {title: video.title, url: video.url}
                }
                else {
                    receivedMessage.channel.send(noVideoFound);
                }
            }

            if (!server_queue){

                const queue_constructor = {
                    voice_channel: voiceChannel,
                    text_channel: receivedMessage.channel,
                    connection: null,
                    songs: []
                }
    
                queue.set(receivedMessage.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
                
    
                try {
                    const connection = await voiceChannel.join();
                    queue_constructor.connection = connection;
                    video_player(receivedMessage.guild, queue_constructor.songs[0]);
                } 
                catch (err) {
                    queue.delete(receivedMessage.guild.id);
                    let conError = new Discord.MessageEmbed()
                    .setTitle("⚠ There was an Error Connecting.")
                    .setTimestamp()
                    receivedMessage.channel.send(conError);
                    throw err;
                }
            }
    
            else {
                server_queue.songs.push(song);
                let addedQueue = new Discord.MessageEmbed()
                    .setTitle("🎵 ADDED TO QUEUE 🎵")
                    .setDescription(`${song.title}`)
                    .setColor('WHITE')
                return receivedMessage.channel.send(addedQueue);
            }
        }

        else if(cmd === 'skip') skip_song(receivedMessage, server_queue);

        else if(cmd === 'dc' || 'disconnect') disconnect_song(receivedMessage, server_queue);

        else if(cmd === 'pause') pause_song(receivedMessage, server_queue);

        else if(cmd === 'resume') resume_song(receivedMessage, server_queue);
    }
}

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    if(!song){
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, {filter: 'audioonly'});
    song_queue.connection.play(stream, {seek: 0, volume: 1})
    .on('finish', () => {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0]);
    });

    let playingMusic = new Discord.MessageEmbed()
    .setTitle("🎵 NOW PLAYING 🎵")
    .setDescription(`${song.title}`)
    .setColor('WHITE')
    await song_queue.text_channel.send(playingMusic);
}


// Skips Song

const skip_song = (receivedMessage, server_queue) => {
    if (!receivedMessage.member.voice.channel) return receivedMessage.channel.send(noVoiceChannel);
    if (!server_queue){
        let noQueue = new Discord.MessageEmbed()
            .setTitle("⚠ No songs in queue!")
            .setColor('RED')
            .setTimestamp()
        return receivedMessage.channel.send(noQueue);
    }
    server_queue.connection.dispatcher.end();
    let skipSong = new Discord.MessageEmbed()
        .setTitle("⏯ Skipping to the next song in the queue ⏯")
        .setColor('WHITE')
        .setTimestamp()
    receivedMessage.channel.send(skipSong);
}

// Stops Song and Disconnects with clearing queue (line 99).

const disconnect_song = (receivedMessage, server_queue) => {
    if (!receivedMessage.member.voice.channel) return receivedMessage.channel.send(noVoiceChannel);
    if (!server_queue.connection) return receivedMessage.channel.send(noMusic);
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}

// Pause Song

const pause_song = (receivedMessage, server_queue) => {
    if (!receivedMessage.member.voice.channel) return receivedMessage.channel.send(noVoiceChannel);
    if (!server_queue.connection) return receivedMessage.channel.send(noMusic);
    if (server_queue.connection.dispatcher.paused) return receivedMessage.channel.send(alreadyPaused);
    server_queue.connection.dispatcher.pause();
    receivedMessage.channel.send(musicPaused);
}

// Resume Song

const resume_song = (receivedMessage, server_queue) => {
    if (!receivedMessage.member.voice.channel) return receivedMessage.channel.send(noVoiceChannel);
    if (!server_queue.connection) return receivedMessage.channel.send(noMusic);
    if (server_queue.connection.dispatcher.resumed) return receivedMessage.channel.send(alreadyPlaying);
    server_queue.connection.dispatcher.resume();
    receivedMessage.channel.send(musicResumed);
}

// Embeds

let noVideoFound = new Discord.MessageEmbed()
    .setTitle("⚠ Couldn't find video!")

let noVoiceChannel = new Discord.MessageEmbed()
    .setTitle("⚠ You need to be in a voice channel!")
    .setColor('RED')
    .setTimestamp()

let noConPerm = new Discord.MessageEmbed()
    .setTitle("❌ Don't have Connect permissions!")
    .setColor('RED')
    .setTimestamp()

let noMusic = new Discord.MessageEmbed()
    .setTitle("⚠ There is no music currently playing!")
    .setColor('RED')
    .setTimestamp()

let alreadyPaused = new Discord.MessageEmbed()
    .setTitle("⚠ Music is already paused!")
    .setColor('RED')
    .setTimestamp()

let musicPaused = new Discord.MessageEmbed()
    .setTitle("⏸ PAUSED ⏸")
    .setColor('BLUE')
    .setTimestamp()

let alreadyPlaying = new Discord.MessageEmbed()
    .setTitle("⚠ Music is already playing!")
    .setColor('RED')
    .setTimestamp()

let musicResumed = new Discord.MessageEmbed()
    .setTitle("▶ RESUMING ▶")
    .setColor('BLUE')
    .setTimestamp()

let noSpeakPerm = new Discord.MessageEmbed()
    .setTitle("❌ Don't have Speak permissions!")
    .setColor('RED')
    .setTimestamp()
    
let noLink = new Discord.MessageEmbed()
    .setTitle("❌ You need to add a **YouTube** Link.")
    .setColor('RED')
    .setTimestamp()