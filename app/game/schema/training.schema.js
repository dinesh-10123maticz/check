const mongoose = require('mongoose');
import constant from '../../../shared/constant';

const TRAINING = new mongoose.Schema(
    {
        nftId: { type: mongoose.Schema.Types.ObjectId, ref: constant.TOKEN_DB, required: true },
        walletAddress: { type: String, default: null, index: true },
        startAt: { type: Date, default: Date.now, index: true },
        endAt: { type: Date, default: Date.now, index: true },
        currency: { type: String, default: constant.TRAINING_PRICE.lable },
        amount: { type: Number, default: 0 },
        status: {
            type: String,
            default: 'onprogress',
            enum: ['onprogress', 'completed', 'returned'],
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

const traindb = mongoose.model(constant.TRAINING, TRAINING);
module.exports = traindb;
