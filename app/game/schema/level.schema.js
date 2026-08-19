import mongoose from 'mongoose';
import constant from '../../../shared/constant';
const Schema = mongoose.Schema;
const level = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        index: true,
        ref: constant.ASSET_DB,
    },
    level: {
        type: Number,
        default: 1,
    },
    asset_Name: {
        type: String,
        default: '',
    },
    // planetId: {
    //   type :  Schema.Types.ObjectId ,
    //   index : true ,
    //   default : null ,
    //   ref : 'planet',
    // },
    asset_Symbol: {
        type: String,
        default: '',
    },
    reward: [
        {
            label: { type: String },
            amount: { type: Number },
        },
    ],
    image_url: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: constant.REWARD,
    },

    specialConditions: {
        type: String,
        default: '',
    },

    Blocks: {
        type: Number,
        default: 0,
    },

    cost: [
        {
            label: { type: String },
            amount: { type: Number },
        },
    ],
    AttackPoints: {
        type: Number,
        default: 0,
    },
    HullPoints: {
        type: Number,
        default: 0,
    },
    optionalCost: [
        {
            label: { type: String },
            amount: { type: Number },
        },
    ],

    dailyConsumption: [
        {
            label: { type: String },
            amount: { type: Number },
        },
    ],

    build_time_min: {
        // for building build time in minutes
        type: Number,
        default: 0,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
});

const level_db = mongoose.model(constant.LEVEL, level, constant.LEVEL);

export default level_db;
