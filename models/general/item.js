const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    id: { type: Number },
    name: { type: Object, required: true },
    alt: { type: String },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['Poké Balls', 'Medicine', 'Berries', 'Battle', 'Machines', 'Utility', 'General', 'Special'],
        required: true
    },
    use: {
        type: {
            effect: { type: String, enum: ['XP', 'Evolve', 'Enhance', 'Special'] },
            value: { type: Number }
        }
    }
})

module.exports = mongoose.model('Item', itemSchema);