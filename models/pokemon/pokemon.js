const mongoose = require('mongoose');

const pokemonSchema = mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    types: {
        type: [{ type: String, _id: false }],
        validate: [(val) => { return val.length < 3; }, 'Exceeded 2 type limit']
    },
    passives: {
        type: [{
            name: { type: String },
            hidden: { type: Boolean },
            _id: false
        }],
        required: true
    },
    base_stats: {
        type: [{
            name: String,
            value: Number,
            _id: false
        }],
        required: true
    },
    moves: {
        type: [{ type: String, _id: false }]
    },
    tutor_moves: {
        type: [{ type: String, _id: false }]
    },
    evo: {
        type: {
            prev: { type: String },
            next: [{
                name: { type: String },
                method: { type: String },
                _id: false
            }]
        },
        required: true
    },
    drops: {
        type: [{
            item: String,
            rarity: Number,
            _id: false
        }]
    },
    pokedex: {
        type: {
            genus: String,
            entries: [{ type: String, _id: false }],
            habitat: String
        }
    },
    catch_rate: { type: Number, max: 255 },
    color: { type: String },
    egg_groups: {
        type: [{
            type: String,
            validate: [(val) => { return val.length < 3; }, 'Exceeded 2 egg group limit'],
            _id: false
        }]
    }
})

module.exports = mongoose.model('Pokemon', pokemonSchema);