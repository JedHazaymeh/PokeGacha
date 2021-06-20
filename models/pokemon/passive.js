const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    id: { type: Number },
    name: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['Poké Balls', 'Medicine', 'Berries', 'Battle', 'Machines', 'Utility', 'Treasure', 'General', 'Special'],
        required: true
    }
})

module.exports = mongoose.model('Item', itemSchema);