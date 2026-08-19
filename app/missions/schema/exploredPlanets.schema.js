import constant from '../../../shared/constant';
const mongoose = require('mongoose');

const explorePlanets = new mongoose.Schema(
    {
        parentPlanetId: { type: mongoose.Schema.Types.ObjectId, ref: constant.USERPLANET_DB },
        nearByPlanetId: { type: mongoose.Schema.Types.ObjectId, ref: constant.nearByPlanet_DB },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.USER_DB,
            index: true,
        },
        isSurveyed: { type: Boolean, default: false },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

const EXPLORED = mongoose.model(constant.EXPLORED_PLANET, explorePlanets, constant.EXPLORED_PLANET);

export default EXPLORED;
