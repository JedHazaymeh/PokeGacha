const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'help',
    aliases: ['commands'],
    admin: false,
    description: 'Inspect all available commands',
    execute(message, args) {
        const commandList = [];
        message.client.commands.map(cmd => {
            if (cmd.aliases && cmd.aliases.length) var aliases = cmd.aliases.join(', ');
            else var aliases = 'None';
            if (!cmd.admin) commandList.push({ name: `\`${process.env.PREFIX}${cmd.name}\``, value: `${cmd.description} \u200B\n\`Aliases: ${aliases}\``, inline: true });
        });
        // tidy up embed columns
        while (commandList.length % 3) commandList.push({ name: '\u200B', value: '\u200B', inline: true })

        // build embed message
        const embed = new MessageEmbed()
            .setAuthor('Available commands')
            .addFields(commandList)
            .setFooter('Page 1 / 1')
            .setTimestamp();

        message.channel.send(embed);
    }
}