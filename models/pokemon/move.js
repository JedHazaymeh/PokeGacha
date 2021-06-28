const mongoose = require('mongoose');

const moveSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Physical', 'Special', 'Status'], required: true },
    type: { type: String, required: true },
    effects: { type: [Object] },
    power: { type: Number },
    pp: { type: Number },
    description: { type: String }
})

module.exports = mongoose.model('Move', moveSchema);