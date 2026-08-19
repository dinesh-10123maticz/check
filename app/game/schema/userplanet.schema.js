import constants from '../../../shared/constant';
const mongoose = require('mongoose');

const userPlanet = new mongoose.Schema(
    {
        planetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constants.PLANET_DB,
            required: true,
        },
        nftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constants.TOKEN_DB,
            required: true,
            index: true,
        },
        rarity: {
            type: String,
            default: 'uncommon',
        },
        type: {
            type: String,
            default: 'planet',
        },
        unlockedAt: { type: Date, default: Date.now },
        farmBonus: { type: Number, default: 0 },
        buildBoost: { type: Number, default: 0 },
        mineBoost: { type: Number, default: 0 },
        oreBoost: { type: Number, default: 0 },
        shipCombatBoost: { type: Number, default: 0 },
        assignes: [],
        extraSlots: [],
        isActive: { type: Boolean, default: true },
        hexId: { type: Number, default: 0 }, // store the hex of the planet
    },
    { timestamps: true },
);

const userPlanetdb = mongoose.model(constants.USERPLANET_DB, userPlanet);
module.exports = userPlanetdb;
