const User = require('../models/general/user');
const Item = require('../models/general/item');

module.exports = {
    name: 'give',
    aliases: [],
    admin: true,
    description: 'Give item to specified user',
    async execute(message, args, client) {
        // sets variables from arguments
        var [target, searched_item, amount] = args;
        searched_item = searched_item.replace('-', ' ');
        amount = parseInt(amount);

        const user = await User.findOne({ name: target }).exec();
        if (!user) return message.channel.send(`No user '${target}' found (Names are case-sensitive)`);

        const item = await Item.findOne({ $or: [{'name.english': searched_item }, {'alt': searched_item }] }).exec();
        if (!item) return message.channel.send(`Item '${searched_item}' not found (Names are case-sensitive, use '-' for spaces)`);

        const owned = user.inventory.some(item => item.name === searched_item);
        // if not already owned, push new item to inventory
        // else, just update amount
        if (!owned) user.inventory.push({ name: item.name.english, amount: amount });
        else user.inventory.find(item => item.name === searched_item).amount += amount;

        user.markModified('inventory');
        user.save().then(() => {
            message.channel.send(`Gave ${target} ${amount} ${item.name.english}`);
            console.log(`Gave ${target} ${amount} ${item.name.english}`);
        });
    }
}