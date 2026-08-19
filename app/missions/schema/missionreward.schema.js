const mongoose = require('mongoose');

const typeSchema = {
    label: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        default: null
    }
}

const missionReward = new mongoose.Schema({
    rewardNumber: {
        type: Number,
        default: null,
    },
    explore: [
        typeSchema

    ],
    combat: [
        typeSchema
    ],
    mining: [
        typeSchema
    ],
    social: [
        typeSchema
    ],
    isActive: { type: Boolean, default: true },
});

const missionReward_db = mongoose.model('missionReward', missionReward);
module.exports = missionReward_db;



