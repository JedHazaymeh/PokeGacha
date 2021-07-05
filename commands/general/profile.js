const User = require('../../models/general/user');
const Discord = require('discord.js')

module.exports = {
    name: 'profile',
    aliases: ['level', 'me', 'character', 'char'],
    admin: false,
    description: 'View your PokéGacha profile',
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

            // get discord user data
            if (user.id == message.author.id) member = message.author;
            else member = await message.client.tools.get('getUserFromId')(user.id, message);
            if (!member) return;

            // create embed displaying profile
            const embed = new Discord.MessageEmbed()
            .setColor('#9B30FF')
            .setAuthor(member.tag, member.displayAvatarURL({ dynamic: true }))
            .setTitle(member.username)
            .setDescription('\u200B')
            .addFields([{
                name: `Level: ${user.level}`, value: `XP: ${user.xp}`,
            }])
            .setTimestamp();
            // send embed message
            message.channel.send(embed);

        } catch (err) {
            console.error(err);
        }
    }
}