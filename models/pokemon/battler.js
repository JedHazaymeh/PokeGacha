const mongoose = require('mongoose');
const Pokemon = require('./pokemon');

const stats = ['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed'];

const battlerSchema = mongoose.Schema({
    species: { type: String, required: true },
    nickname: {
        type: String,
        validate: [(val) => { return val.length < 13; }, 'Exceeded 12 char limit'],
        default: ''
    },
    level: { type: Number, max: 100, required: true},
    xp: { type: Number },
    passive: { type: Number, max: 2 },
    talent: {
        type: [{
            name: { type: String, enum: stats },
            value: { type: Number, max: 10 },
            _id: false
        }],
        validate: [(val) => { return val.length < 7; }, 'Exceeded 6 talent limit']
    },
    moves: {
        type: [{ type: String, _id: false }],
        validate: [(val) => { return val.length < 4; }, 'Exceeded 3 move limit']
    },
    obtained: { type: Date, default: Date.now() },
    OT: { type: String }
})

battlerSchema.pre('save', async function(next) {
    var self = this;
    const pokemon = await Pokemon.findOne({ name: self.species }).exec();

    // fill move slots
    while (self.moves.length < 3) {
        const move = pokemon.moves[Math.randomNum(pokemon.moves.length - 1)]
        if (!self.moves.includes(move)) self.moves.push(move);
    }

    // determine passive
    if (pokemon.passives.some(a => a.hidden)) var i = Math.randomNum(pokemon.passives.length - 2);
    else var i = Math.randomNum(pokemon.passives.length - 1);
    self.passive = i;

    // determine talent values
    if (self.talent.length != 6) {
        self.talent = [];
        for (stat of stats) {
            self.talent.push({
                name: stat,
                value: Math.randomNum(10)
            })
        }
    }

    next();
})

module.exports = mongoose.model('Battler', battlerSchema);