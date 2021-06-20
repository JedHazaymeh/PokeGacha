const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    admin: { type: Boolean, default: false },
    xp: { type: Number, min: 0, default: 0 },
    battlers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Battler' }],
        default: []
    },
    inventory: {
        type: [
            {
                name: { type: String },
                amount: { type: Number, max: 999 }
            }
        ],
        default: [
            {
                name: 'Poké Ball',
                amount: 10
            }
        ]
    }
})

module.exports = mongoose.model('User', userSchema);