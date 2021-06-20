const mongoose = require('mongoose');

const battlerSchema = mongoose.Schema({
    species: { type: String, required: true },
    nickname: {
        type: String,
        validate: [(val) => { return val.length < 13; }, 'Exceeded 12 char limit'],
        default: ''
    },
    level: { type: Number, max: 100, required: true},
    xp: { type: Number },
    passive: { type: Number, max: 2, required: true},
    moves: {
        type: [{ type: String }],
        validate: [(val) => { return val.length && val.length < 5; }, 'Exceeded 4 move limit or empty move list'],
        required: true
    },
    obtained: { type: Date, default: Date.now() },
    OT: { type: String }
})

module.exports = mongoose.model('Battler', battlerSchema);