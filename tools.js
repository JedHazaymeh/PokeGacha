const Discord = require('discord.js');
const User = require('./models/general/user');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
    allPokemon: [
        // "Nidoran♀",
        // "Nidoran♂",
        // "Farfetch’d",
        // "Mr. Mime",
        // "Deoxys",
        // "Wormadam",
        // "Mime Jr.",
        // "Giratina",
        // "Shaymin",
        // "Basculin",
        // "Darmanitan",
        // "Tornadus",
        // "Thundurus",
        // "Landorus",
        // "Keldeo",
        // "Meloetta",
        // "Meowstic",
        // "Aegislash",
        // "Pumpkaboo",
        // "Gourgeist",
        // "Oricorio",
        // "Lycanroc",
        // "Wishiwashi",
        // "Type: Null",
        // "Minior",
        // "Mimikyu",
        // "Tapu Koko",
        // "Tapu Lele",
        // "Tapu Bulu",
        // "Tapu Fini",
        // "Toxtricity",
        // "Sirfetch'd",
        // "Mr. Rime",
        // "Eiscue",
        // "Indeedee",
        // "Morpeko",
        // "Zacian",
        // "Zamazenta",
    ],
    // general commands
    capitalize(string) {
        const line = string.split(/ +/);
        for (const i of Array(line.length).keys()) line[i] = line[i][0].toUpperCase() + line[i].slice(1).toLowerCase();
        return line.join(' ');
    },
    async request(category, value) {
        try {
            const res = await axios.get(`http://pokeapi.co/api/v2/${category.toLowerCase()}/${value.toLowerCase()}/`);
            if (res.data) console.log(`Request complete: ${category} ${value}`);
            return res.data;
        } catch(err) {
            console.log('Error: ' + value);
        }
    },
    // bot commands
    async pokemonBadge(pokemon) {
        const name = pokemon.replace(' ', '-');
        const canvas = createCanvas(72, 72);
        const ctx = canvas.getContext('2d');
        const badge = await loadImage('https://i.ibb.co/93gg95G/badge.png')
        .catch(() => {
            console.log('Error: Badge URL not found');
        });
        const sprite = await loadImage(`https://raw.githubusercontent.com/itsjavi/pokemon-assets/master/assets/img/pokemon/${name.toLowerCase()}.png`)
        .catch(() => {
            console.log('Error: Pokemon sprite URL not found');
        });
        
        ctx.drawImage(badge, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(sprite, -17, -25, 68 * 1.5, 56 * 1.5);
        return canvas.toBuffer();
    },
    async itemBadge(item) {
        const name = item.replace(' ', '-');
        const canvas = createCanvas(72, 72);
        const ctx = canvas.getContext('2d');
        const badge = await loadImage('https://i.ibb.co/93gg95G/badge.png')
        .catch(() => {
            console.log('Error: Badge URL not found');
        });
        const sprite = await loadImage(`https://raw.githubusercontent.com/itsjavi/pokemon-assets/master/assets/img/items/${name.toLowerCase()}.png`)
        .catch(() => {
            console.log('Error: Item sprite URL not found');
        });
        
        ctx.drawImage(badge, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(sprite, 12, 10, 48, 48);
        return canvas.toBuffer();
    },
}