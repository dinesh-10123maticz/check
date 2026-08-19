import constant from '../../../shared/constant';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let cmsbuilding_DB = new Schema(
    {
        buildingName: {
            type: String,
            index: true,
        },
        description: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        image: {
            type: String,
            default: null,
        },
    },
    { timestamps: true },
);
module.exports = mongoose.model(constant.cmsbuilding_DB, cmsbuilding_DB, constant.cmsbuilding_DB);
