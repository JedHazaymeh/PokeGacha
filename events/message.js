const config = require('../config');

module.exports = {
    name: 'message',
    execute(message) {
        if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

        const args = message.content.slice(process.env.PREFIX.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        // invalid command name
        if (!command) return message.channel.send(`\`${commandName}\` is not a valid command. Use \`${process.env.PREFIX}help\` for available commands.`);
        // non-admin execute admin command
        if (command.admin && !config.admins.includes(message.author.id)) return message.channel.send(`Error: \`${message.author.username}\` has insufficient permissions`);
        
        console.log(`${message.author.tag} issued command: ${command.name} ${args.join(', ')}`);
        try {
            command.execute(message, args);
        } catch (err) {
            console.error(err);
            message.channel.send(`Error has occurred while executing command \`${command.name}\`:\n\`${err.message}\``);
        }
    }
}