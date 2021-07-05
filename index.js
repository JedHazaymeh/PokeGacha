require('dotenv').config();

const mongoose = require('mongoose'),
    config = require('./config'),
    fs = require('fs'),
    { Client, Collection } = require('discord.js');
const client = new Client(config.clientOptions);

// new tools collection
client.tools = new Collection();
// load tools
const tools = require('./tools');
for (const key of Object.keys(tools)) client.tools.set(key, tools[key]);

// new cooldowns collection
client.cooldowns = new Collection();
// new command collection
client.commands = new Collection();
// load commands
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}


// register event listeners
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
}

// connect to MongoDB
mongoose.connect(process.env.MONGODB, config.dbOptions)
    .then(() => console.log("Database connected"))
    .catch(err => console.log("Error connecting to database: " + err.message));

// start bot
client.login(process.env.TOKEN);