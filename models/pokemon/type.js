const mongoose = require('mongoose');

const typeSchema = mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    immunes: { type: [{ type: String, _id: false }], required: true },
    resists: { type: [{ type: String, _id: false }], required: true },
    strengths: { type: [{ type: String, _id: false }], required: true }
})

// typeSchema.methods.versus = function(target) { // returns damage multiplier
//     {'immunes' ; 0, 'resists' ; 0.5, 'strengths' ; 2}.forEach(effect => {
//         if (mongoose.model('Type').find({ effect: target })) {
//             return effect.multiplier;
//         }
//     })
// }

module.exports = mongoose.model('Type', typeSchema);