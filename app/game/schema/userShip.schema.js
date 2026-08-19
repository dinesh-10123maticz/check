import constants from '../../../shared/constant';
const mongoose = require('mongoose');

const userShip = new mongoose.Schema(
    {
        shipId: { type: mongoose.Schema.Types.ObjectId, ref: constants.SHIP_DB, required: true },
        nftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constants.TOKEN_DB,
            required: true,
        },
        nfts: [{ nftId: { type: mongoose.Schema.Types.ObjectId, ref: constants.TOKEN_DB } }],
        isEquipped: { type: Boolean, default: false },
        equippedPlanet: { type: mongoose.Schema.Types.ObjectId, ref: constants.USERPLANET_DB },
        isAvailableForMission: { type: Boolean, default: true },
        missionType: {
            type: String,
            enum: ['', 'explore', 'mining', 'combat', 'social'],
            default: ''
        }, // store the type of mission the ship is currently on (explore, mining, combat, social)
        isActive: { type: Boolean, default: true },
        currentHexId: { type: Number, default: 0 }, // store the hex of the planet where the ship is currently located
        isInGarage: { type: Boolean, default: true }, // if the ship is in garage it cant be used for mission or jump
        startTime: {
            type: Date,
            default: '',
        },
        endTime: {
            type: Date,
            default: '',
        },
    },
    { timestamps: true },
);

const userShipdb = mongoose.model(constants.USERSHIP_DB, userShip);
module.exports = userShipdb;
