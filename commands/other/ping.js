module.exports = {
    name: 'ping',
    aliases: [],
    admin: false,
    cooldown: 5,
    description: 'Simple latency ping',
    execute(message, args) {
        message.channel.send('🏓 ...').then(async (msg) =>{
            msg.edit(`🏓 Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);
        }).catch(console.error);
    }
}