import constant from '../../../shared/constant';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let blog = new Schema(
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
            default: true,
        },
        image: {
            type: String,
            default: '',
        },
        url: {
            type: String,
            default: '',
        },
    },
    { timestamps: true },
);
module.exports = mongoose.model(constant.BLOG_DB, blog, constant.BLOG_DB);
