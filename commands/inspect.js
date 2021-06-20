const Discord = require('discord.js'),
    Tools = require('../tools'),
    User = require('../models/general/user'),
    Battler = require('../models/pokemon/battler'),
    Item = require('../models/general/item'),
    Pokemon = require('../models/pokemon/pokemon');


module.exports = {
    name: 'inspect',
    aliases: [],
    admin: false,
    description: 'Inspect a specified item/Pokémon.',
    async execute(message, args, client) {
        // set query type and value
        const [type, value] = args;
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
                if (err) return handleError(err);
                console.log('New user added: ' + user.name);
            });
        }

        // get member data from cache
        var member = message.guild.members.cache.get(user.id);
        // if not cached, fetch member data
        if (!member) {
            member = await message.guild.members.fetch(user.id);
            console.log(`username: ${member.user.username}, from: fetch`);
        } else console.log(`username: ${member.user.username}, from: cache`);

        // if inspecting pokemon
        if (['pokemon', 'p'].includes(type)) {
            if (user.battlers.length < value) return message.channel.send(`Error: Invalid value given.`);

            const pokemon = await Battler.findById(user.battlers[value - 1]).exec();
            const species = await Pokemon.findOne({ name: pokemon.species }).exec();
            // load image attachments and emoji icons
            const badge = new Discord.MessageAttachment(await Tools.pokemonBadge(pokemon.species), 'badge.png');
            // create embed displaying pokemon
            const pkmnEmbed = new Discord.MessageEmbed()
            .setColor('#e8eeff')
            .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
            .setTitle(pokemon.nickname || pokemon.species)
            .setDescription(`#${species.id} ${pokemon.species}`)
            .attachFiles([badge])
            .setThumbnail('attachment://badge.png')
            .addFields([
                { name: `\`\`\`${species.pokedex.genus}\`\`\``, value: species.pokedex.entry},
                { name: `\`\`\`Type\`\`\` ${client.emojis.cache.find(e => e.name == species.types[0])} \u200B`, value: species.types[0], inline: true},
                { name: `\`\`\`Passive\`\`\``, value: species.passives[pokemon.passive].name, inline: true },
                { name: `\`\`\`Moves\`\`\``, value: pokemon.moves }
            ])
            .setFooter('Page 1 / 1')
            .setTimestamp();
            // send embed message
            message.channel.send(pkmnEmbed);
        }
        // else if inspecting item
        else if (['item', 'i'].includes(type)) {
            if (user.inventory.length < value) return message.channel.send(`Error: Invalid value given.`);

            const item = await Item.findOne({ 'name.english': user.inventory[value - 1].name }).exec();

            // load image attachments
            const item_name = item.alt || item.name.english;
            const badge = new Discord.MessageAttachment(await Tools.itemBadge(item_name), 'badge.png');
            // create embed displaying inventory
            const itemEmbed = new Discord.MessageEmbed()
            .setColor('#e8eeff')
            .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
            .setTitle(item.name.english)
            .setDescription(item.description)
            .attachFiles([badge])
            .setThumbnail('attachment://badge.png')
            .addField(`ˣ ${user.inventory[value - 1].amount} available`, '\u200B')
            .setFooter('Page 1 / 1')
            .setTimestamp();
            // send embed message
            message.channel.send(itemEmbed);
        }
    }
}