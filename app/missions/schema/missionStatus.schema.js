import constant from '../../../shared/constant';
const mongoose = require('mongoose');

const missionStatus = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.USER_DB,
            index: true,
        },
        missionPlanetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.nearByPlanet_DB,
            default: null,
            index: true,
        },
        startAt: {
            type: Date,
            default: Date.now,
        },
        endAt: {
            type: Date,
            default: Date.now,
        },
        userShipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.USERSHIP_DB,
        },
        crew: [
            {
                tokenId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: constant.TOKEN_DB,
                },
            },
        ],
        mission: {
            type: String,
            default: '',
            enum: constant.MISSION_TYPE,
        },
        missionTime_in_min: {
            type: Number,
            default: 0,
        },
        rewardClaimed: {
            type: Boolean,
            default: false,
        },
        missionReward: [],

        isProgress: {
            type: Boolean,
            default: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

const missionStatusDB = mongoose.model(constant.MISSIONSTATS, missionStatus, constant.MISSIONSTATS);

export default missionStatusDB;

// planetResources
// {
//     name: String,

//     lable: String,

//     amount: Number
// }
