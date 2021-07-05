const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const cheerio = require('cheerio');
const Discord = require('discord.js');
const { create } = require('./models/general/user');

// string title case function
if (typeof(String.prototype.toTitleCase) === 'undefined') {
    String.prototype.toTitleCase = function() { 
        const line = String(this).split(/ +/);
        for (const i of Array(line.length).keys()) line[i] = String(line[i][0]).toUpperCase() + String(line[i]).slice(1).toLowerCase();
        return line.join(' ');
    }
}

if (typeof(Math.randomNum) === 'undefined') {
    Math.randomNum = function(max) {
        return Math.floor(Math.random() * (max + 1));
    }
}

function getLevelXP(level) {
    if (!(level - 1)) return 0;
    return 5 * Math.floor((level - 1) ** 2) + getLevelXP(level - 1);
}

module.exports = {
    skipPokemon: [
        "Nidoran♀",
        "Nidoran♂",
        "Farfetch’d",
        "Mr. Mime",
        "Deoxys",
        "Wormadam",
        "Mime Jr.",
        "Giratina",
        "Shaymin",
        "Basculin",
        "Darmanitan",
        "Tornadus",
        "Thundurus",
        "Landorus",
        "Keldeo",
        "Meloetta",
        "Meowstic",
        "Aegislash",
        "Pumpkaboo",
        "Gourgeist",
        "Oricorio",
        "Lycanroc",
        "Wishiwashi",
        "Type: Null",
        "Minior",
        "Mimikyu",
        "Tapu Koko",
        "Tapu Lele",
        "Tapu Bulu",
        "Tapu Fini",
        "Toxtricity",
        "Sirfetch'd",
        "Mr. Rime",
        "Eiscue",
        "Indeedee",
        "Morpeko",
        "Zacian",
        "Zamazenta"
    ],
    // === bot commands === //

    // retrieve user from id
    async getUserFromId(userId, message) {
        // if executed in DMs
        if (!message.guild) {
            console.log('Error: Cannot inspect users in DMs');
            message.channel.send('`Error: Cannot inspect users in DMs`')
            return;
        }

        try {
            // get user data from guild cache
            var member = message.guild.members.cache.get(userId);
            // if not cached, fetch member data
            if (!member) {
                member = await message.guild.members.fetch(userId);
                console.log(`username: ${member.user.username}, from: fetch`);
            } else console.log(`username: ${member.user.username}, from: cache`);

            return member.user;

        } catch (err) {
            // API error, meaning member doesn't exist in guild
            if (err.message == 'Unknown Member') {
                console.log('Error: User not found in server');
                message.channel.send('`Error: User not found in server`')
                return;
            }
        }
    },
    // inserts pages into embed message
    async insertPages(embedMsg, embedObj, pages, userId, discardValue, message) {
        try {
            const self = embedMsg;
            const emotes = ['◀️', '▶️'];
            if (discardValue && typeof(discardValue) === 'number') emotes.push('♻️');
            for (const emote of emotes) await self.react(emote);
            const filter = (reaction, user) => {
                return emotes.includes(reaction.emoji.name) && user.id === userId;
            };
            const collector = self.createReactionCollector(filter, { idle: 60000, dispose: true });
            var i = 0,
                total = 0;

            embedObj.footer = { text: `Page ${i + 1} / ${pages.length}` };
            self.edit(embedObj);

            const execute = async (reaction, user) => {
                console.log(`Received ${reaction.emoji.name} from ${user.tag}`);
                total += 1;

                if (reaction.emoji.name == '♻️') {
                    collector.stop();
                    message.client.commands.get('discard').execute(message, ['pokemon', discardValue]);
                    setTimeout(() => self.delete(), 300);
                }
                else {
                    if (reaction.emoji.name == '◀️' && i) i -= 1;
                    else if (reaction.emoji.name == '▶️' && pages.length - 1 - i) i += 1;

                    for (const key of Object.keys(pages[i])) embedObj[key] = pages[i][key];
                    embedObj.footer = { text: `Page ${i + 1} / ${pages.length}` };
                }
                self.edit(embedObj);
            }

            collector.on('collect', (reaction, user) => execute(reaction, user));

            collector.on('remove', (reaction, user) => execute(reaction, user));

            collector.once('end', () => {
                console.log(`Counted ${total} interactions before timing out.`)
                self.reactions.removeAll();
            });

        } catch (err) {
            console.error(err);
        }
    },
    // add confirm to embed and return response
    async awaitConfirm(embedMsg, userId) {
        try {
            const self = embedMsg;
            const emotes = ['🚫', '☑️'];
            for (const emote of emotes) await self.react(emote);
            const filter = (reaction, user) => {
                return emotes.includes(reaction.emoji.name) && user.id === userId;
            };
            const collected = await self.awaitReactions(filter, { max: 1, idle: 30000, dispose: true });
            const reaction = collected.findKey(() => true);
            var res = false;
            if (reaction) {
                console.log(`Received ${reaction}`);
                if (reaction == '☑️') res = true;
            }
            else console.log(`Confirm collector timed out.`);

            self.reactions.removeAll();
            return res;

        } catch (err) {
            console.error(err);
        }
    },
    // add counter and confirm to embed and return response
    async awaitXPConfirm(embedMsg, embedObj, userId, pokemon, xpValue, maxAmount, receiver) {
        try {
            const self = embedMsg;
            const emotes = ['⬆️', '⬇️', '☑️', '🚫'];
            for (const emote of emotes) await self.react(emote);
            const filter = (reaction, user) => {
                return emotes.includes(reaction.emoji.name) && user.id === userId;
            };
            const collector = self.createReactionCollector(filter, { idle: 40000, dispose: true });
            var c_level = pokemon.level,
                start_xp = pokemon.xp || getLevelXP(c_level),
                c_xp = start_xp,
                xp_from_last = pokemon.xp_from_last || 0,
                i = 1,
                total = 0,
                res = false;
                console.log('start:', start_xp, c_xp, xp_from_last);

            updateXP = function() {
                xp_needed = 5 * Math.floor((c_level - 1) ** 2);
                c_xp = start_xp + xpValue * i;
                xp_from_last = c_xp - getLevelXP(c_level);
                // if level up
                if (xp_needed <= xp_from_last) {
                    console.log('+1 level');
                    c_level += 1;
                    xp_from_last -= xp_needed; 
                }
                // if level down
                else if (xp_from_last < 0) {
                    console.log('-1 level');
                    c_level -= 1;
                    xp_from_last = c_xp - getLevelXP(c_level);
                }
                xp_needed = 5 * Math.floor((c_level - 1) ** 2);
                console.log(xp_from_last, xp_needed)
                // build xp bar
                if (xp_from_last) fullBar = Math.round((xp_from_last / xp_needed) * 20);
                else fullBar = 0;
                if (xp_from_last) emptyBar = Math.round(((xp_needed - xp_from_last) / xp_needed) * 20);
                else emptyBar = 20;
                console.log('full =', fullBar, 'empty =', emptyBar);
                var xp_bar = '▰'.repeat(fullBar) + '▱'.repeat(emptyBar);
                console.log(xp_bar);
                // update message
                embedObj.fields = { name: `Lvl. ${pokemon.level} \u200B\` ==> \`\u200B Lvl. ${c_level}`, value: xp_bar };
                self.edit(embedObj);
            }

            await updateXP();

            const execute = async (reaction, user) => {
                console.log(`Received ${reaction.emoji.name} from ${user.tag}`);
                total += 1;

                if (['☑️', '🚫'].includes(reaction.emoji.name)) {
                    if (reaction.emoji.name == '☑️') res = true;
                    collector.stop();
                }
                else {
                    if (reaction.emoji.name == '⬇️' && i - 1) i -= 1;
                    else if (reaction.emoji.name == '⬆️' && maxAmount - i) i += 1;
                    await updateXP();
                }
            }
            
            collector.on('collect', (reaction, user) => execute(reaction, user));
            
            collector.on('remove', (reaction, user) => execute(reaction, user));
            
            collector.once('end', () => {
                console.log(`Counted ${total} interactions before timing out.`)
                self.reactions.removeAll();
                if (res) receiver.emit('response', c_level, c_xp, c_xp - start_xp, xp_from_last, i);
            });

        } catch (err) {
            console.error(err);
        }
    },
    // grab pokemon art image from bulbapedia
    async getPokeGraphic(pokemon) {
        try {
            // argument should be pokemon document
            const { data } = await axios.get(`https://bulbapedia.bulbagarden.net/wiki/File:${String(pokemon.id).padStart(3, '0')}${pokemon.name}.png`);
            const $ = await cheerio.load(data);

            const img = 'https:' + $('#file > a').attr('href');
            return img;

        } catch (err) {
            console.error(err)
        }
    },
    async getItemGraphic(item) {
        try {
            const width = 300;
            const height = 200;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            const item_name = item.split(' ').join('_');
            const { data } = await axios.get(`https://bulbapedia.bulbagarden.net/wiki/File:Dream_${item_name}_Sprite.png`);
            const $ = await cheerio.load(data);

            const base = await loadImage('https://raw.githubusercontent.com/MagmaJed/PokeGacha/main/src/base.png');
            const icon = await loadImage('https:' + $('#file > a').attr('href'));
            const iconW = $('#file > a > img').attr('width') * 1.2;
            const iconH = $('#file > a > img').attr('height') * 1.2;

            ctx.drawImage(base, width / 2 - 60, height / 2)
            ctx.drawImage(icon, width / 2 - iconW / 2, height / 3 - iconH / 2, iconW, iconH);

            return canvas.toBuffer();

        } catch (err) {
            console.error(err)
        }
    },
    async checkLevelUp(user, message) {
        function getLevelXP(level) {
            if (!(level - 1)) return 0;
            return 50 * ((level - 1) ** 2) + getLevelXP(level - 1);
        }
    
        var xp_needed = 50 * (user.level ** 2);
        user.xp_from_last = user.xp - getLevelXP(user.level);
    
        // check for level ups
        while (xp_needed <= user.xp_from_last) {
            user.level += 1;
            user.xp_from_last -= xp_needed; 
            xp_needed = 50 * (user.level ** 2);
            message.channel.send(`**${user.name}** leveled up to **Lvl. ${user.level}**!`);
            console.log(`${user.name} leveled up to Lvl. ${user.level}!`);
        }
    }
}