const Discord = require('discord.js');
const User = require('../models/general/user');
const Battler = require('../models/pokemon/battler');
const Pokemon = require('../models/pokemon/pokemon');

module.exports = {
    name: 'pokemon',
    aliases: ['p'],
    admin: false,
    description: 'View your collected Pokémon.',
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
        }

        // get member data from cache
        var member = message.guild.members.cache.get(user.id);
        // if not cached, fetch member data
        if (!member) {
            member = await message.guild.members.fetch(user.id);
            console.log(`username: ${member.user.username}, from: fetch`);
        } else console.log(`username: ${member.user.username}, from: cache`);

        // build pokemon array to display as embed fields
        var pkmnList = [];
        // if pokemon empty, build 'empty' message
        if (!user.battlers.length) {
            pkmnList.push({
                name: 'You haven\'t collected any Pokémon yet.',
                value: 'Collected Pokémon will appear here'
            })
        } else {
            for (const poke of user.battlers) {
                const battler = await Battler.findById(poke).exec();
                const species = await Pokemon.findOne({ name: battler.species }).exec();
                console.log(species.types);
                var pkmn = { inline: true };
                pkmn['name'] = battler.nickname || battler.species;
                pkmn['value'] = `${client.emojis.cache.find(e => e.name === species.types[0])} ${battler.species}`;
                pkmnList.push(pkmn);
            }
            console.log(pkmnList);
        }

        // create embed displaying inventory
        const pkmnEmbed = new Discord.MessageEmbed()
            .setColor('#e8eeff')
            .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
            .setTitle('Pokémon')
            .setDescription('\u200B')
            .setThumbnail('https://static.thenounproject.com/png/574915-200.png')
            .addFields(...pkmnList)
            .setFooter('Page 1 / 1')
            .setTimestamp();
        // send embed message
        message.channel.send(pkmnEmbed);
    }
}