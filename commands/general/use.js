const Discord = require('discord.js'),
    User = require('../../models/general/user'),
    Battler = require('../../models/pokemon/battler'),
    Item = require('../../models/general/item'),
    Pokemon = require('../../models/pokemon/pokemon'),
    Type = require('../../models/pokemon/type'),
    EventEmitter = require('events');


module.exports = {
    name: 'use',
    aliases: [],
    admin: false,
    description: 'Use a specified item on a specified Pokémon',
    async execute(message, args) {
        if (!args.length || args.slice(0, 2).some(arg => isNaN(arg))) return message.channel.send(`Correct command usage is: \`${process.env.PREFIX}use <item slot> <pokémon slot>\``);

        const item_slot = Number(args[0]) - 1
        const target_slot = Number(args[1]) - 1
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

        if (user.inventory.length < item_slot + 1) return message.channel.send('`Error: You don\'t have an item in that slot`');
        if (user.battlers.length < target_slot + 1) return message.channel.send('`Error: You don\'t have a Pokémon in that slot`');

        const item = await Item.findOne({ 'name.english': user.inventory[item_slot].name}).exec();
        const pokemon = await Battler.findById(user.battlers[target_slot]).exec();
        const species = await Pokemon.findOne({ name: pokemon.species }).exec();

        if (!item.use) return message.channel.send('`Using this item did nothing ...`');
        // if item gives xp
        if (item.use.effect == 'XP') {
            // load / build embed essentials
            const type_color = await Type.findOne({ name: species.types[0] }).then(type => type.color);
            const lvl_icon = message.client.emojis.cache.find(e => e.name == 'Level');
            // create embed displaying pokemon
            const embed = new Discord.MessageEmbed()
                .setColor(type_color)
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle(`${pokemon.nickname || pokemon.species} ${lvl_icon}${pokemon.level}`)
                .setDescription(`How many **Razz Berries** would you like to use?\n\`Razz Berries available: ${user.inventory[item_slot].amount}\``)
                .setImage(await message.client.tools.get('getPokeGraphic')(species))
                .setFooter('Interact using the reactions')
                .setTimestamp();
            // send embed message
            const sentEmbed = await message.channel.send(embed);
            // create receiver to get new xp from awaitXPConfirm
            const receiver = new EventEmitter();
            message.client.tools.get('awaitXPConfirm')(sentEmbed, embed, message.author.id, pokemon, item.use.value, user.inventory[item_slot].amount, receiver);
            // if item usage confirmed and new xp received
            receiver.once('response', async (new_level, new_xp, xp_gained, xp_from_last, item_amount) => {
                console.log('Response received')
                // use up items
                user.inventory[item_slot].amount -= item_amount;
                // if none left, remove from inventory
                if (!user.inventory[item_slot].amount) user.inventory.splice(item_slot, 1);
                user.markModified('inventory');
                await user.save();
                // update pokemon
                leveled_up = false;
                if (pokemon.level < new_level) leveled_up = true;
                pokemon.level = new_level;
                pokemon.xp = new_xp;
                pokemon.xp_from_last = xp_from_last;

                await pokemon.save();
                message.channel.send(`**${pokemon.nickname || pokemon.species}** gained **${xp_gained}** XP!`);
                if (leveled_up) message.channel.send(`**${pokemon.nickname || pokemon.species}** leveled up to **Lvl. ${pokemon.level}**!`);
            });
        }
        // if evolution item
        else if (item.use.effect == 'Evolve') {
            console.log('Evolve');
        }
        // if battle enhancement
        else if (item.use.effect == 'Enhance') {
            console.log('Enhance');
        }
        // if special case
        else if (item.use.effect == 'Special') {
            console.log('Special');
        }
    }
}