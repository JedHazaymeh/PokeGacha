const mongoose = require('mongoose');

const moveSchema = mongoose.Schema({
    id: { type: Number },
    name: { type: String, required: true },
    category: { type: String, enum: ['Physical', 'Special', 'Status'], required: true },
    type: { type: String, required: true },
    effects: { type: [Object] },
    power: { type: Number },
    accuracy: { type: Number },
    pp: { type: Number }
})

module.exports = mongoose.model('Move', moveSchema);