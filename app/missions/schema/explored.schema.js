import constant from '../../../shared/constant';
const mongoose = require('mongoose');

const explorePlanets = new mongoose.Schema(
    {
        fromNftId: { type: mongoose.Schema.Types.ObjectId, ref: constant.TOKEN_DB, required: true },
        missionPlanetId: { type: mongoose.Schema.Types.ObjectId, ref: constant.MISSIONPLANET },
        startAt: { type: Date, default: null },
        endAt: { type: Date, default: null },
        missionStatsId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.MISSIONSTATS,
            default: null,
        },
        planetResources: [],
        status: {
            type: String,
            default: constant.STATUS.NOTSTARTED,
            enum: [
                constant.STATUS.NOTSTARTED,
                constant.STATUS.INPROGRESS,
                constant.STATUS.COMPLETED,
            ],
        },
        isSurveyed: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

const EXPLORED = mongoose.model(constant.EXPLORED, explorePlanets, constant.EXPLORED);

export default EXPLORED;
