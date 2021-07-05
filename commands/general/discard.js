const Discord = require('discord.js'),
    User = require('../../models/general/user'),
    Battler = require('../../models/pokemon/battler'),
    Item = require('../../models/general/item'),
    Pokemon = require('../../models/pokemon/pokemon'),
    Type = require('../../models/pokemon/type');


module.exports = {
    name: 'discard',
    aliases: [],
    admin: false,
    description: 'Discard a specified item/Pokémon for rewards',
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
            try {
                if (user.battlers.length < value) return message.channel.send(`Error: Invalid value given.`);

                const pokemon = await Battler.findById(user.battlers[value - 1]).exec();
                const species = await Pokemon.findOne({ name: pokemon.species }).exec();
                // load / build embed essentials
                const type_color = await Type.findOne({ name: species.types[0] }).then(type => type.color);
                const lvl_icon = message.client.emojis.cache.find(e => e.name == 'Level');
                const reward_multiplier = Math.floor(pokemon.level / 15 + ((255 - species.catch_rate) / 20 || 0))
                if (species.drops && species.drops.length) var drops = species.drops.map(drop => drop.item).join(', ');
                else var drops = 'None';

                // create embed displaying pokemon
                const pkmnEmbed = new Discord.MessageEmbed()
                    .setColor(type_color)
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setTitle(`${pokemon.nickname || pokemon.species} ${lvl_icon}${pokemon.level}`)
                    .setDescription(`Are you sure you want to discard this Pokémon?\nYou will receive:`)
                    .addFields([
                        { name: 'Reward Multiplier:', value: `ˣ **${reward_multiplier}**` },
                        { name: 'Possible drops:', value: drops }
                    ])
                    .setImage(await message.client.tools.get('getPokeGraphic')(species))
                    .setFooter('Confirm using the reactions')
                    .setTimestamp();
                // send embed message
                const sentEmbed = await message.channel.send(pkmnEmbed);
                // await discard confirmation
                const confirmed = await message.client.tools.get('awaitConfirm')(sentEmbed, message.author.id);
                if (confirmed) {
                    message.channel.send(`**${message.author.username}** discarded **${pokemon.nickname || pokemon.species}**`);
                    // remove battler from user
                    user.battlers.splice(value - 1, 1);
                    // give xp based on discarded rarity
                    const xp_gained = 40 * reward_multiplier;
                    user.xp += xp_gained;
                    message.channel.send(`${message.author.username} gained **${xp_gained}** XP`);
                    await user.save();
                    // give rewards and drops
                    for (i in species.drops) {
                        const drop = species.drops[i];
                        console.log(drop)
                        if (Math.randomNum(100) <= drop.rarity) {
                            console.log(`Drop ${drop.item} activated`)
                            try {
                                await message.client.commands.get('give').execute(message, [user.name, drop.item]);
                            } catch (err) {
                                message.channel.send(`Could not give ${drop.item} to ${user.name}:\n\`${err.message}\``)
                            }
                        }
                    }
                    await message.client.commands.get('give').execute(message, [user.name, 'razz-berry', reward_multiplier]);
                    // check for level up and save
                    await message.client.tools.get('checkLevelUp')(user, message);
                    await user.save();
                    // delete discarded battler data
                    Battler.findByIdAndRemove(pokemon).then(() => console.log('Battler deleted'));
                }
            } catch (err) {
                console.error(err);
            }
        }
        // else if inspecting item
        else if (['item', 'i'].includes(type)) {
            try {
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
            } catch (err) {
                console.error(err);
            }
        }
    }
}