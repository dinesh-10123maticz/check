import mongoose from 'mongoose';
import constant from '../../../shared/constant';
const Schema = mongoose.Schema;
const asset = new Schema({
    asset_Name: {
        type: String,
        index: true,
        default: '',
    },
    asset_Symbol: {
        type: String,
        index: true,
        default: '',
    },
    quote: {
        says: {
            type: String,
            default: null,
        },
        author: {
            type: String,
            default: null,
        },
    },
    rows: {
        type: Number,
        default: 0,
    },
    columns: {
        type: Number,
        default: 0,
    },
    commonplanetbuildlimit: {
        type: Number,
        default: 0,
    },
    uncommonplanetbuildlimit: {
        type: Number,
        default: 0,
    },
    rareplanetbuildlimit: {
        type: Number,
        default: 0,
    },
    commonasteroidbuildlimit: {
        type: Number,
        default: 0,
    },
    uncommonasteroidbuildlimit: {
        type: Number,
        default: 0,
    },
    rareasteroidbuildlimit: {
        type: Number,
        default: 0,
    },
    // buildSlotType: {
    //     type: String,
    //     default: 'land', // land , mineral , ore , tetra , lagrange , orbital , amrita , all
    // },
    buildSlotType: [],
    buildLandType: [], //SLOT TYPE Land (L) or Orbital (O) or Lagrange (LG) or Sun (S)
    buildOnTypeSlot: [],
    packId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: constant.PACK,
    },
    isBuilding: {
        type: Boolean,
        default: true,
    },
    levelLimit: {
        type: Number,
        default: 1,
    },
    buildLocationType: {
        type: String,
        enum: ["planet", "asteroid", "all"],
        default: "all",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const assetdb = mongoose.model(constant.ASSET_DB, asset, constant.ASSET_DB);

export default assetdb;
