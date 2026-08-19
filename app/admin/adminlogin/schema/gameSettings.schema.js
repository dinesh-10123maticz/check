import mongoose from 'mongoose';
import constant from '../../../../shared/constant';
const Schema = mongoose.Schema;
const GAMESETTING = new Schema({
    rewardTimes: {
        type: Number,
        default: 0
    },
    adminPrivateKey: {
        type: String,
        default: ''
    },
    costTimes: {
        type: Number,
        default: 0
    },
    optionalCost: {
        type: Number,
        default: 0
    },
    consumabelTimes: {
        type: Number,
        default: 0
    },
    production_time_in_min: {
        type: Number,
        default: 0
    },
    contruction_time_in_min: {
        type: Number,
        default: 0
    },
    hex_jump_time_in_min: {
        type: Number,
        default: 0
    },
    refferal_Percent: {
        // one day refferal percent
        type: Number,
        default: 0
    },
    default_royalty: {
        type: Number,
        default: 0,
    },
    missionReward: [
        // one day refferal percent
        {
            scope: { type: Number, default: 0 },
            mission_min: { type: Number, default: 0 },
            rewardTimes: { type: Number, default: 0 },
            xpmin: { type: Number, default: 0 },
            xpmax: { type: Number, default: 0 },
        },
    ],
    missionPlanetsLimit: [
        {
            rarity: { type: String, default: '' },
            limit: { type: Number, default: 0 },
        },
    ],
    freeShipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: constant.SHIP_DB,
    },
    missionRarityLevel: [
        {
            rarity: { type: String, default: '' },
            xpPoints: { type: Number, default: 0 },
        },
    ],
    missionMultiplier: [
        {
            minlevel: { type: Number, default: 0 },
            maxlevel: { type: Number, default: 0 },
            multiplier: { type: Number, default: 0 },
        },
    ],
    maxWithdrawLimit: {
        type: Number,
        default: 0,
    },
    withdrawHitLimit: {
        type: Number,
        default: 0,
    },
});

export default mongoose.model(constant.GAMESETTING_DB, GAMESETTING, constant.GAMESETTING_DB);
