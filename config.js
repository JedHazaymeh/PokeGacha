const { Intents } = require('discord.js');

const intents = new Intents(Intents.NON_PRIVILEGED).add('GUILD_MEMBERS');

module.exports = {
    dbOptions: {
        "useNewUrlParser": true,
        "useUnifiedTopology": true,
        "useCreateIndex": true,
        "useFindAndModify": false
    },
    clientOptions: {
        partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"],
        ws: { intents: intents }
    },
    admins: [
        '418378647229956096'
    ],
    invite: 'https://discord.com/oauth2/authorize?client_id=767407824963108925&permissions=2147871808&scope=bot'
}