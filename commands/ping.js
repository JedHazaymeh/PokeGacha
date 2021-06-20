module.exports = {
    name: 'ping',
    aliases: [],
    description: 'Simple latency ping.',
    execute(message, args, client) {
        message.channel.send('🏓 ...').then(async (msg) =>{
            msg.edit(`🏓 Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);
        }).catch(console.error);
    }
}