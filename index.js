require('dotenv').config();

const mongoose = require('mongoose'),
    config = require('./config'),
    fs = require('fs');

const { Client, Collection } = require('discord.js'),
    client = new Client(config.clientOptions);

mongoose.connect(process.env.MONGODB, config.dbOptions).then(() => {
    console.log("Database connected");
}).catch(err => console.log("Error connecting to database: " + err));

// new command collection
client.commands = new Collection();
// load commands
for (const file of fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('PokeGacha ready');
    console.log('Available commands: ' + Array.from(client.commands.keys()));
})

client.on('error', err => { console.log(err) });

client.on('message', message => {
    if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

    const args = message.content.slice(process.env.PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return message.channel.send(`'${command}' is not a valid command. Use ${process.env.PREFIX}help for available commands.`);

    console.log(`${message.author.username} issued command: ${command} ${args}`);
    client.commands.get(command).execute(message, args, client);

})

client.login(process.env.TOKEN);