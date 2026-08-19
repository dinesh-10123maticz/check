import { Schema, model } from 'mongoose';

const bid = Schema(
    {
        TokenBidAmt: {
            type: Number,
            default: '',
        },
        TokenBidderAddress: {
            type: String,
            required: true,
        },
        NFTId: {
            type: String, //changed
            required: true,
        },
        status: {
            type: String,
            default: 'pending',
        },
        ContractAddress: {
            type: String,
            default: '',
        },
        ContractType: {
            type: String,
            default: '721',
        },
        HashValue: {
            type: String,
            default: '',
        },
        CoinName: {
            type: String,
            default: '',
        },
        deleted: {
            type: Number,
            default: 1, // 1 Active 0 Deleted
        },
        NFTQuantity: {
            type: Number,
            default: 0,
        },
        Completed: {
            type: Number,
            default: 0,
        },
        Pending: {
            type: Number,
            default: 0,
        },
        Cancel: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

module.exports = model('bid', bid);
