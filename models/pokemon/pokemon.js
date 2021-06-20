const mongoose = require('mongoose');

const pokemonSchema = mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    types: {
        type: [{ type: String }],
        validate: [(val) => { return val.length < 3; }, 'Exceeded 2 type limit']
    },
    passives: {
        type: [{
            name: { type: String },
            hidden: { type: Boolean }
        }],
        required: true
    },
    base: {
        type: {
            hp: { type: Number },
            atk: { type: Number },
            def: { type: Number },
            sp_atk: { type: Number },
            sp_def: { type: Number },
            speed: { type: Number }
        },
        required: true
    },
    evo: {
        type: {
            prev: { type: String },
            next: [{
                name: { type: String },
                method: { type: String }
            }]
        },
        required: true
    },
    drops: {
        type: [{
            item: String,
            rarity: Number
        }]
    },
    pokedex: {
        type: {
            genus: String,
            entry: String,
            habitat: String
        }
    },
    catch_rate: { type: Number, max: 255 },
    color: { type: String },
    egg_groups: {
        type: [{
            type: String,
            validate: [(val) => { return val.length < 3; }, 'Exceeded 2 egg group limit']
        }]
    }
})

module.exports = mongoose.model('Pokemon', pokemonSchema);