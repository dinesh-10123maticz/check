import constant from '../../../shared/constant';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let news = new Schema(
    {
        heading: {
            type: String,
            index: true,
        },
        description: {
            type: String,
            index: true,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
            default: '',
        },
        video: {
            type: String,
            default: null,
        },
        url: {
            type: String,
            default: '',
        },
        navLink: {
            type: String,
            default: '',
        },
    },
    { timestamps: true },
);
module.exports = mongoose.model(constant.NEWS_DB, news, constant.NEWS_DB);
