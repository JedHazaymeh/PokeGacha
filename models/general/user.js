const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    admin: { type: Boolean, default: false },
    level: { type: Number, min: 1, default: 1 },
    xp: { type: Number, min: 0, default: 0 },
    xp_from_last: { type: Number, min: 0, default: 0 },
    battlers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Battler', _id: false }],
        default: []
    },
    inventory: {
        type: [{
            name: { type: String },
            amount: { type: Number, max: 999 },
            _id: false
        }],
        default: [{
            name: 'Poké Ball',
            amount: 10
        }]
    },
    capsules: {
        type: [{
            name: { type: String },
            obtained: { type: Date, default: Date.now() },
            _id: false
        }],
        default: []
    }
})

userSchema.pre('save', async function(next) {
    var self = this;
    function getLevelXP(level) {
        if (!(level - 1)) return 0;
        return 50 * ((level - 1) ** 2) + getLevelXP(level - 1);
    }

    var xp_needed = 50 * (self.level ** 2);
    self.xp_from_last = self.xp - getLevelXP(self.level);

    // check for level ups
    while (xp_needed <= self.xp_from_last) {
        self.level += 1;
        self.xp_from_last -= xp_needed; 
        xp_needed = 50 * (self.level ** 2);
        console.log(`${self.name} leveled up to Lvl. ${self.level}!`);
    }

    // set user xp to specified level
    if (self.level != 1 && self.xp == 0) {
        self.xp = getLevelXP(self.level);
        self.xp_from_last = 0;
        console.log(self.xp);
    }

    next();
})

module.exports = mongoose.model('User', userSchema);