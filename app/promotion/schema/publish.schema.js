import constant from '../../../shared/constant';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let PUBLISH_DB = new Schema(
    {
        companyName: {
            type: String,
            index: true,
        },
        image: {
            type: String,
            default: null,
        },
        navLink: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);
module.exports = mongoose.model(constant.PUBLISH_DB, PUBLISH_DB, constant.PUBLISH_DB);
