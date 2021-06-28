const Discord = require('discord.js'),
    Tools = require('../../tools'),
    User = require('../../models/general/user'),
    Battler = require('../../models/pokemon/battler'),
    Item = require('../../models/general/item'),
    Pokemon = require('../../models/pokemon/pokemon'),
    Move = require('../../models/pokemon/move'),
    Type = require('../../models/pokemon/type');


module.exports = {
    name: 'inspect',
    aliases: [],
    admin: false,
    description: 'Inspect a specified item/Pokémon',
    async execute(message, args) {
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
                if (err) return console.error(err);
                console.log('New user added: ' + user.name);
            });
        }

        // if inspecting pokemon
        if (['pokemon', 'p'].includes(type)) {
            if (user.battlers.length < value) return message.channel.send(`Error: Invalid value given.`);

            const pokemon = await Battler.findById(user.battlers[value - 1]).exec();
            const species = await Pokemon.findOne({ name: pokemon.species }).exec();
            // load / build embed essentials
            const type_color = await Type.findOne({ name: species.types[0] }).then(type => type.color);
            const typeList = [];
            for (e of species.types) {
                typeList.push(`${message.client.emojis.cache.find(a => a.name == e)} ${e}`);
            }
            const moveList = [];
            for (e of pokemon.moves) {
                const move = await Move.findOne({ name: e }).exec();
                if (!move) moveList.push('⚫ ' + e);
                else moveList.push(`${message.client.emojis.cache.find(a => a.name == move.type)} ${move.name}`);
            }
            const lvl_icon = message.client.emojis.cache.find(e => e.name == 'Level');

            const pages = [
                {
                    description: `\`#${String(species.id).padStart(3, '0')} ${pokemon.species}\``,
                    fields: [
                        { name: `${species.pokedex.genus}`, value: species.pokedex.entries.pop()},
                        { name: `\`Type\``, value: typeList, inline: true},
                        { name: `\`Passive\``, value: species.passives[pokemon.passive].name, inline: true },
                        { name: `\`Moves\``, value: moveList, inline: true }
                    ]
                },
                {
                    description: null,
                    fields: [
                        { name: `\`Stats\``, value: species.base_stats.map(a => `**${a.name}**`), inline: true },
                        { name: 'Talent', value: pokemon.talent.map(a => '▰'.repeat(Math.round(a.value * 0.6)) + '▱'.repeat(6 - Math.round(a.value * 0.6))), inline: true },
                        { name: '\u200B', value: species.base_stats.map(a => a.value), inline: true },
                        { name: '`First collected`', value: `${pokemon.obtained.getDate()} **/** ${pokemon.obtained.getMonth() + 1} **/** ${pokemon.obtained.getFullYear()}`, inline: true},
                        { name: '`OT`', value: pokemon.OT, inline: true},
                        { name: '\u200B', value: '\u200B', inline: true}
                    ]
                }
            ]
            // create embed displaying pokemon
            const pkmnEmbed = new Discord.MessageEmbed()
                .setColor(type_color)
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle(`${pokemon.nickname || pokemon.species} ${lvl_icon}${pokemon.level}`)
                .setImage(await message.client.tools.get('getPokeGraphic')(species))
                .setTimestamp();
            for (const key of Object.keys(pages[0])) pkmnEmbed[key] = pages[0][key];
            // send embed message
            const sentEmbed = await message.channel.send(pkmnEmbed);
            message.client.tools.get('insertPages')(sentEmbed, pkmnEmbed, pages, message.author.id);
        }
        // else if inspecting item
        else if (['item', 'i'].includes(type)) {
            if (user.inventory.length < value) return message.channel.send(`Error: Invalid value given.`);

            const item = await Item.findOne({ 'name.english': user.inventory[value - 1].name }).exec();

            // load image attachments
            const icon = new Discord.MessageAttachment(await message.client.tools.get('getItemGraphic')(item.name.english), 'icon.png'); 
            // create embed displaying inventory
            const itemEmbed = new Discord.MessageEmbed()
            .setColor('#e8eeff')
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setTitle(item.name.english)
            .attachFiles(icon)
            .setImage('attachment://icon.png')
            .addFields(
                { name: '`Description`', value: item.description, inline: true },
                { name: '`Item Type`', value: item.type, inline: true },
                { name: '\u200B', value: '\u200B', inline: true},
                { name: `ˣ ${user.inventory[value - 1].amount}  available`, value: '\u200B'}
            )
            .setFooter('Page 1 / 1')
            .setTimestamp();
            // send embed message
            message.channel.send(itemEmbed);
        }
    }
}