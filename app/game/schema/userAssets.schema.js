import mongoose from 'mongoose';
import constant from '../../../shared/constant';

const Schema = mongoose.Schema;
const userasset = new Schema(
    {
        asset_Name: {
            type: String,
            default: null,
        },
        assetId: {
            type: Schema.Types.ObjectId,
            ref: constant.ASSET_DB,
            default: null,
        },
        levelId: {
            type: Schema.Types.ObjectId,
            ref: constant.LEVEL,
            default: null,
        },
        planetId: {
            type: Schema.Types.ObjectId,
            ref: constant.PLANET_DB,
        },
        assignNftId: {
            type: Schema.Types.ObjectId,
            ref: constant.TOKEN_DB,
            default: null,
        },
        next: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: constant.LEVEL,
        },
        userPlanetId: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: constant.USERPLANET_DB,
        },
        build_Number: {
            type: String,
            index: true,
            default: '',
        },
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
        startTime: {
            type: Date,
            default: '',
        },
        endTime: {
            type: Date,
            default: '',
        },

        clickTime: {
            type: Date,
            default: Date.now(),
        },

        buildStatus: {
            type: Boolean,
            default: true,
        },

        reward: [],

        dailyConsumption: [],

        startProduction: {
            type: Date,
            default: Date.now(),
        },
        endProduction: {
            type: Date,
            default: Date.now(),
        },
        boostedTime: {
            type: Date,
            default: null,
        },
        AttackPoints: {
            type: Number,
            default: 0,
        },
        HullPoints: {
            type: Number,
            default: 0,
        },
        lastClaim: {
            type: Date,
            default: Date.now(),
        },
        nextClaim: {
            type: Date,
            default: Date.now(),
        },
        isInventory: {
            type: Boolean,
            default: false,
        },

        isQuote: {
            type: Boolean,
            default: false,
        },

        isboosted: {
            type: Boolean,
            default: false,
        },
        isBuilding: {
            type: Boolean,
            default: true,
        },
        placedSlotType: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

const userassetdb = mongoose.model(constant.userasset, userasset, constant.userasset);
export default userassetdb;
