const mongoose = require('mongoose');

const typeSchema = mongoose.Schema({
    name: { type: String, required: true },
    immunes: { type: [String], required: true },
    resists: { type: [String], required: true },
    strengths: { type: [String], required: true }
})

// typeSchema.methods.versus = function(target) { // returns damage multiplier
//     {'immunes' ; 0, 'resists' ; 0.5, 'strengths' ; 2}.forEach(effect => {
//         if (mongoose.model('Type').find({ effect: target })) {
//             return effect.multiplier;
//         }
//     })
// }

module.exports = mongoose.model('Type', typeSchema);