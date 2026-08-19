const mongoose = require('mongoose');
import constant from '../../../shared/constant';

const pack = new mongoose.Schema(
    {
        packNumber: {
            type: Number,
            default: 0,
            unique: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model(constant.PACK, pack);
