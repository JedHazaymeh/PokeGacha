const Discord = require('discord.js');
const User = require('../models/general/user');

module.exports = {
    name: 'items',
    aliases: ['i'],
    admin: false,
    description: 'View your obtained items.',
    async execute(message, args, client) {
        // set target to specified user, else to self
        const target = args[0] || message.author.username;
        // find target document
        let user = await User.findOne({ name: target }).exec();
        // if no document found
        if (!user) {
            // if user specified, return error
            if (args.length) return message.channel.send(`No user '${target}' found (Names are case-sensitive)`);
            // if self, register user and continue
            user = new User({
                id: message.author.id,
                name: message.author.username
            })
            user.save(function (err) {
                if (err) return handleError(err);
                console.log('New user added: ' + user.name)
            })
        };

        // get member data from cache
        var member = message.guild.members.cache.get(user.id);
        // if not cached, fetch member data
        if (!member) {
            member = await message.guild.members.fetch(user.id);
            console.log(`username: ${member.user.username}, from: fetch`);
        } else console.log(`username: ${member.user.username}, from: cache`);

        // build inventory array to display as embed fields
        var itemList = [];
        // if inventory empty, build 'empty' message
        if (!user.inventory.length) {
            itemList.push({
                name: 'Your inventory is empty.',
                value: 'Obtained items will appear here'
            })
        } else {
            user.inventory.forEach(e => {
                var item = { inline: true }
                item['name'] = e.name;
                item['value'] = 'ˣ ' + e.amount;
                itemList.push(item);
            })
        };

        // create embed displaying inventory
        const invEmbed = new Discord.MessageEmbed()
            .setColor('#e8eeff')
            .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
            .setTitle('Inventory')
            .setDescription('\u200B')
            .setThumbnail('https://static.thenounproject.com/png/574915-200.png')
            .addFields(...itemList)
            .setFooter('Page 1 / 1')
            .setTimestamp();
        // send embed message
        message.channel.send(invEmbed);
    }
}