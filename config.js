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
    }
}