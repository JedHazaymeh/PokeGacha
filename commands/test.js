const Tools = require('../tools');
const Pokemon = require('../models/pokemon/pokemon');
const Type = require('../models/pokemon/type');
const Move = require('../models/pokemon/move');

module.exports = {
    name: 'test',
    aliases: ['t'],
    admin: true,
    description: 'Test command',
    async execute(message, args, client) {
        const poke = args[0];
        if (!poke) return message.channel.send('Error: No Pokemon name provided')

        const species = await Tools.request('pokemon-species', poke);
        const pokemon = await Tools.request('pokemon', poke);

        if (!(species || pokemon)) return message.channel.send(`Error: '${poke}' not found`);

        Pokemon.updateOne({ name: Tools.capitalize(species.name)}, {
            id: species.id,
            name: Tools.capitalize(species.name),
            types: pokemon.types.map(a => Tools.capitalize(a.type.name)),
            passives: pokemon.abilities.map(a => {
                return {
                    name: Tools.capitalize(a.ability.name.replace('-', ' ')),
                    hidden: a.is_hidden
                }
            }),
            base: {
                hp: pokemon.stats[0].base_stat,
                atk: pokemon.stats[1].base_stat,
                def: pokemon.stats[2].base_stat,
                sp_atk: pokemon.stats[3].base_stat,
                sp_def: pokemon.stats[4].base_stat,
                speed: pokemon.stats[5].base_stat
            },
            evo: {
                prev: (() => {
                    if (!species.evolves_from_species) return null;
                    return Tools.capitalize(species.evolves_from_species.name);
                })()
            },
            drops: pokemon.held_items.map(a => {
                return {
                    item: Tools.capitalize(a.item.name.replace('-', ' ')),
                    rarity: a.version_details[0].rarity
                }
            }),
            pokedex: {
                genus: species.genera[7].genus,
                entry: Array.from(species.flavor_text_entries.map(a => a.language.name == 'en')).pop(),
                habitat: (() => {
                    if (!species.habitat) return 'Unknown';
                    return Tools.capitalize(species.habitat.name);
                })()
            },
            catch_rate: species.capture_rate,
            color: species.color.name,
            egg_groups: species.egg_groups.map(a => Tools.capitalize(a.name))
        },
        { upsert: true }).catch(err => { return console.log(err); });

        console.log('New Pokemon added: ' + pokemon.name);
        message.channel.send('New Pokemon added: ' + pokemon.name);
    }
}