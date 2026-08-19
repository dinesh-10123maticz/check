import constant from '../../../shared/constant';
const mongoose = require('mongoose');

const battlestatus = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.USER_DB,
            index: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.USER_DB,
            default: null,

            index: true,
        },
        toPlanetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.USERPLANET_DB,
            default: null,
            index: true,
        },
        userShip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: constant.USERSHIP_DB,
            required: true,
        },
        crew: [
            {
                tokenId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: constant.TOKEN_DB,
                },
            },
        ],
        from_walletAddress: {
            type: String,
            default: null,

            index: true,
        },
        to_walletAddress: {
            type: String,
            default: null,
            index: true,
        },

        mission: {
            type: String,
            enum: constant.MISSION_TYPE,
            default: null,
        },
        missionTime_in_min: {
            type: Number,
            default: 0,
        },
        mission_StatTime: {
            type: Date,
            default: Date.now,
        },
        mission_EndTime: {
            type: Date,
            default: Date.now,
        },
        rewardClaimed: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        won: {
            type: Boolean,
            default: true,
        },
        wonPercent: {
            type: Number,
            default: 0,
        },

        missionReward: [],
    },
    { timestamps: true },
);

const battlestatusdb = mongoose.model(
    constant.battlestatus_DB,
    battlestatus,
    constant.battlestatus_DB,
);

export default battlestatusdb;
