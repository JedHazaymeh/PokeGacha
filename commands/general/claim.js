const User = require('../../models/general/user');
const { Collection } = require('discord.js');

module.exports = {
    name: 'claim',
    aliases: [],
    admin: false,
    description: 'Claim your pending rewards',
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

            // if claim reset timer not in cooldowns
            if (!message.client.cooldowns.has('claim_reset')) message.client.cooldowns.set('claim_reset', new Collection())
            // get command cooldown for user
            const now = Date.now()
            const timestamps = message.client.cooldowns.get('claim_reset');
            const cooldown = 20 * 60000; // 20 mins
            if (timestamps.has(message.author.id)) {
                const expire = timestamps.get(message.author.id) + cooldown;
                if (now < expire) {
                    const minutes = String(Math.floor((expire - now) / 60000)).padStart(2, '0');
                    const seconds = String(Math.floor((expire - now) / 1000) % (minutes * 60) || 0).padStart(2, '0');
                    return message.reply(`please wait **${minutes}**m **${seconds}**s until your next claim.`);
                }
            }

            message.client.commands.get('capgive').execute(message, [user.name, 'forest-capsule', 6]);

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldown);

        } catch (err) {
            console.error(err);
        }
    }
}