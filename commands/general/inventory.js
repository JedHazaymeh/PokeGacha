const Discord = require('discord.js');
const User = require('../../models/general/user');
const Tools = require('../../tools');

module.exports = {
    name: 'inventory',
    aliases: ['i', 'items'],
    admin: false,
    description: 'View your obtained items',
    async execute(message, args) {
        // set target to specified user, else to self
        const target = args[0] || message.author.username;
        // find target document
        let user = await User.findOne({ name: target }).exec();
        // if no document found
        if (!user) {
            // if user specified, return error
            if (args.length) return message.channel.send(`No user '${target}' found (Use '-' for spaces)`);
            // if self, register user and continue
            user = new User({
                id: message.author.id,
                name: message.author.username
            })
            user.save(function (err) {
                if (err) return console.error(err);
                console.log('New user added: ' + user.name)
            })
        };

        if (user.id == message.author.id) member = message.author;
        else member = await message.client.tools.get('getUserFromId')(user.id, message);
        if (!member) return;

        // if inventory empty, build 'empty' message
        if (!user.inventory.length) {
            // create embed displaying message
            const invEmbed = new Discord.MessageEmbed()
            .setColor('#82d3ff')
            .setAuthor(member.tag, member.displayAvatarURL({ dynamic: true }))
            .setTitle('Inventory')
            .setDescription('\u200B')
            .addFields([{
                name: 'Your inventory is empty.',
                value: 'Obtained items will appear here.\n\u200B'
            }])
            .setTimestamp();
            // send embed message
            message.channel.send(invEmbed);
        } else {
            const itemsLeft = [...user.inventory];
            var pages = [];
            var i = 0;
            while (itemsLeft.length) {
                pages.push({ fields: [] });
                for (j = 0; j < 15; j++) {
                    if (itemsLeft.length) {
                        const item = itemsLeft.splice(0, 1)[0]
                        var field = { inline: true }
                        field['name'] = item.name + ' \u200B \u200B';
                        field['value'] = 'ˣ ' + item.amount;
                        pages[i].fields.push(field);
                    } else {
                        pages[i].fields.push({ name: '\u200B', value: '⚫ ⬛⬛⬛⬛', inline: true });
                    }
                }
                i += 1;
            }

            // create embed displaying inventory
            const invEmbed = new Discord.MessageEmbed()
                .setColor('#82d3ff')
                .setAuthor(member.tag, member.displayAvatarURL({ dynamic: true }))
                .setTitle('Inventory')
                .setDescription('\u200B')
                .addFields(pages[0].fields)
                .setTimestamp();
            // send embed message
            const sentEmbed = await message.channel.send(invEmbed);
            if (pages.length - 1) message.client.tools.get('insertPages')(sentEmbed, invEmbed, pages, message.author.id);
        }
    }
}