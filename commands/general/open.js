const Battler = require('../../models/pokemon/battler');
const Capsule = require('../../models/general/capsule');
const User = require('../../models/general/user');

module.exports = {
    name: 'open',
    aliases: [],
    admin: false,
    description: 'Open a specified capsule',
    async execute(message, args) {
        try {
            if (!args.length || isNaN(args[0])) return message.channel.send(`Correct command usage is: \`${process.env.PREFIX}open <slot number>\``);

            const i = Number(args[0]) - 1
            const user = await User.findOne({ id: message.author.id }).exec();
            if (user.capsules.length < i + 1) return message.channel.send('`Error: You don\'t have a capsule in that slot`');

            const user_capsule = user.capsules[i].name;
            message.channel.send(`\`${message.author.username}\` is opening 1 **${user_capsule}**!`);
            const capsule = await Capsule.findOne({ name: user_capsule }).exec();

            const n = Math.randomNum(300);
            if (n <= 240) {
                var drops = capsule.content.common;
                var min_level = 10;
            }
            else if (n <= 280) {
                var drops = capsule.content.uncommon;
                var min_level = 20;
            }
            else if (n <= 299) {
                var drops = capsule.content.rare;
                var min_level = 30;
            }
            else {
                var drops = capsule.content.special;
                var min_level = 50;
            }

            const x = Math.randomNum(drops.length - 1);
            const poke = new Battler({
                species: drops[x],
                level: Math.randomNum(10) + min_level,
                OT: user.name
            });
            console.log(n, drops[x], poke.species)
            await poke.save();

            user.capsules.splice(i, 1);
            user.markModified('capsules');
            user.battlers.push(poke);
            user.markModified('battlers');
            await user.save();

            message.channel.send(`\`${message.author.username}\` received **${poke.species}**!`);
            console.log(`${message.author.username} received ${poke.species}!`);

            message.client.commands.get('inspect').execute(message, ['pokemon', user.battlers.length]);

        } catch (err) {
            console.error(err);
        }
    }
}