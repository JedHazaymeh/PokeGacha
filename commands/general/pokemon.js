const Discord = require('discord.js');
const User = require('../../models/general/user');
const Battler = require('../../models/pokemon/battler');
const Pokemon = require('../../models/pokemon/pokemon');

module.exports = {
    name: 'pokemon',
    aliases: ['p'],
    admin: false,
    description: 'View your collected Pokémon',
    async execute(message, args) {
        // set target to specified user, else to self
        const target = (args[0] || message.author.username).split('-').join(' ');
        // find target document
        let user = await User.findOne({ name: target }).exec();
        // if no document found
        if (!user) {
            // if user specified, return error
            if (args.length) return message.channel.send(`Error: No registered user \`${target}\` found\n\`(Usernames are case-sensitive, use '-' for spaces)\``);
            // if self, register user and continue
            user = new User({
                id: message.author.id,
                name: message.author.username
            })
            user.save(function (err) {
                if (err) return handleError(err);
                console.log('New user added: ' + user.name)
            })
        }

        if (user.id == message.author.id) member = message.author;
        else member = await message.client.tools.get('getUserFromId')(user.id, message);
        if (!member) return;

        // if pokemon empty, build 'empty' message
        if (!user.battlers.length) {
            // create embed displaying message
            const pkmnEmbed = new Discord.MessageEmbed()
            .setColor('#ff4056')
            .setAuthor(member.tag, member.displayAvatarURL({ dynamic: true }))
            .setTitle('Pokémon')
            .setDescription('\u200B')
            .addFields([{
                name: 'You haven\'t collected any Pokémon yet.',
                value: 'Collected Pokémon will appear here.\n\u200B'
            }])
            .setTimestamp();
            // send embed message
            message.channel.send(pkmnEmbed);

        } else {
            const battlersLeft = [...user.battlers];
            var pages = [];
            var i = 0;
            while (battlersLeft.length) {
                pages.push({ fields: [] });
                for (j = 0; j < 15; j++) {
                    if (battlersLeft.length) {
                        const poke = battlersLeft.splice(0, 1)
                        const battler = await Battler.findById(...poke).exec();
                        const species = await Pokemon.findOne({ name: battler.species }).exec();
                        const lvl_icon = message.client.emojis.cache.find(e => e.name == 'Level');
                        const pos = i * 15 + j + 1;
                        var pkmn = { inline: true };
                        pkmn['name'] = `\`${pos}\` ${battler.nickname || battler.species} ${lvl_icon}${battler.level} \u200B \u200B`;
                        pkmn['value'] = `${message.client.emojis.cache.find(e => e.name === species.types[0])} ${battler.species} \u200B`;
                        pages[i].fields.push(pkmn);
                    } else {
                        pages[i].fields.push({ name: '\u200B', value: '⚫ ⬛⬛⬛⬛', inline: true });
                    }
                }
                i += 1;
            }

            // create embed displaying inventory
            const pkmnEmbed = new Discord.MessageEmbed()
                .setColor('#ff4056')
                .setAuthor(member.tag, member.displayAvatarURL({ dynamic: true }))
                .setTitle('Pokémon')
                .setDescription('\u200B')
                .addFields(pages[0].fields)
                .setTimestamp();
            // send embed message
            const sentEmbed = await message.channel.send(pkmnEmbed);
            if (pages.length - 1) message.client.tools.get('insertPages')(sentEmbed, pkmnEmbed, pages, message.author.id);
        }
    }
}