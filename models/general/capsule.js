const mongoose = require('mongoose');

const capsuleSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    rarity: {
        type: String,
        enum: ['Common', 'Uncommon', 'Rare', 'Special'],
        required: true
    },
    content: {
        type: {
            common: [{
                type: String,
                _id: false
            }],
            uncommon: [{
                type: String,
                _id: false
            }],
            rare: [{
                type: String,
                _id: false
            }],
            special: [{
                type: String,
                _id: false
            }]
        },
        required: true
    }
})

module.exports = mongoose.model('Capsule', capsuleSchema);