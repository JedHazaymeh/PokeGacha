const Discord = require('discord.js');
const User = require('../../models/general/user');
const Capsule = require('../../models/general/capsule');
const Tools = require('../../tools');

module.exports = {
    name: 'capsules',
    aliases: ['c', 'caps'],
    admin: false,
    description: 'View your unopened capsules',
    async execute(message, args) {
        try {
            // find user document
            const user = await User.findOne({ id: message.author.id }).exec();
            // if no document found
            if (!user) {
                // register user and continue
                user = new User({
                    id: message.author.id,
                    name: message.author.username
                });
                user.save(function (err) {
                    if (err) return console.error(err);
                    console.log('New user added: ' + user.name);
                });
            }
            
            // if capsules empty, build 'empty' message
            if (!user.capsules.length) {
                // create embed displaying inventory
                const embed = new Discord.MessageEmbed()
                    .setColor('#ebbd34')
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setTitle('Capsules')
                    .setDescription('\u200B')
                    .addField('You currently do not have any capsules.', 'Obtained capsules will appear here.\n\u200B')
                    .setTimestamp();
                // send embed message
                message.channel.send(embed);
            } else {
                const capsLeft = [...user.capsules];
                var pages = [];
                var i = 0;
                while (capsLeft.length) {
                    pages.push({ fields: [] });
                    for (j = 0; j < 15; j++) {
                        if (capsLeft.length) {
                            const cap = capsLeft.splice(0, 1)[0]
                            const capsule = await Capsule.findOne({ name: cap.name}).exec();
                            let field = { inline: true };
                            field['name'] = capsule.name + ' \u200B \u200B';
                            field['value'] = `\`${capsule.rarity}\``;
                            pages[i].fields.push(field);
                        } else {
                            pages[i].fields.push({ name: '\u200B', value: '⬛⬛⬛⬛⬛', inline: true });
                        }
                    }
                    i += 1;
                }

                // create embed displaying inventory
                const embed = new Discord.MessageEmbed()
                    .setColor('#ebbd34')
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setTitle('Capsules')
                    .setDescription('\u200B')
                    .addFields(pages[0].fields)
                    .setTimestamp();
                // send embed message
                const sentEmbed = await message.channel.send(embed);
                if (pages.length - 1) message.client.tools.get('insertPages')(sentEmbed, embed, pages, message.author.id);
            }

        } catch (err) {
            console.error(err);
        }
    }
}