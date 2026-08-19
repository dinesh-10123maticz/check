import { model, Schema } from 'mongoose';

const transaction = Schema(
    {
        from: { type: String, default: '' },
        to: { type: String, default: '' },
        action: { type: String, default: '' }, // deposit ,  withdraw , swap
        hash: { type: String, default: '' },
        tokenName: { type: String, default: '' },
        tokens: [
            {
                label: { type: String, default: '' },
                amount: { type: Number, default: '' },
            },
        ],
        userassetId: { type: Schema.Types.ObjectId, ref: 'userasset' },
        walletAddress: { type: String, default: '' },
        fromTokenName: { type: String, default: '' },
        toTokenName: { type: String, default: '' },
        fromToken: { type: String, default: '' },
        toToken: { type: String, default: '' },
    },
    { timestamps: true },
);

module.exports = model('transaction', transaction);
