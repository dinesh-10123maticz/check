import constant from '../../../shared/constant';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let partner = new Schema(
    {
        companyName: {
            type: String,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        image: {
            type: String,
            default: null,
        },
        navLink: {
            type: String,
            default: null,
        },
    },
    { timestamps: true },
);
module.exports = mongoose.model(constant.PARTNER_DB, partner, constant.PARTNER_DB);
