const mongoose = require('mongoose');
const { boolean } = require('yup');
import constant from '../../../shared/constant';

const missionBonusReward = new mongoose.Schema({
    crew: { type: String, required: true },
    miningBonusReward: { type: Number, required: true, default: 0 },
    exploreBonusReward: { type: Number, required: true, default: 0 },
    socialBonusReward: { type: Number, required: true, default: 0 },
    combatBonusReward: { type: Number, required: true, default: 0 },
    // Ship specific Roll On Reward
    rollOnReward: [
        {
            shipId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: constant.SHIP_DB,
                required: true
            },
            reward: {
                type: Number,
                default: 0
            }
        }
    ],

    // Mission specific Boost Reward
    boostReward: [
        {
            mission: {
                type: String,
                enum: constant.MISSION_TYPE_FOR_BOOST,
                required: true
            },
            reward: {
                type: Number,
                default: 0
            }
        }
    ],
    isActive: { type: Boolean, default: true },
});

const missionBonusReward_db = mongoose.model('missionBonusReward', missionBonusReward);
module.exports = missionBonusReward_db;
