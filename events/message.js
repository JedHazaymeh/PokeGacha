const { Collection } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'message',
    execute(message) {
        if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

        const args = message.content.slice(process.env.PREFIX.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        // if invalid command name
        if (!command) return message.channel.send(`\`${commandName}\` is not a valid command. Use \`${process.env.PREFIX}help\` for available commands.`);
        // if non-admin execute admin command
        if (command.admin && !config.admins.includes(message.author.id)) return message.channel.send(`Error: \`${message.author.username}\` has insufficient permissions`);
        
        // if command not in cooldowns
        if (!message.client.cooldowns.has(command.name)) message.client.cooldowns.set(command.name, new Collection())
        // get command cooldown for user
        const now = Date.now()
        const timestamps = message.client.cooldowns.get(command.name);
        const cooldown = (command.cooldown || 3) * 1000;
        if (timestamps.has(message.author.id)) {
            const expire = timestamps.get(message.author.id) + cooldown;
            if (now < expire) {
                return message.reply(`please wait ${((expire - now) / 1000).toFixed(1)} second(s) before reusing the \`${command.name}\` command.`);
            }
        }

        console.log(`${message.author.tag} issued command: ${command.name} ${args.join(', ')}`);
        try {
            command.execute(message, args);
        } catch (err) {
            console.error(err);
            message.channel.send(`Error has occurred while executing command \`${command.name}\`:\n\`${err.message}\``);
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldown);
    }
}