import { model, Schema } from "mongoose";

const activity = Schema(
    {
        From: { type: String, default: null },
        To: { type: String, default: null },
        Activity: { type: String, default: null },
        NFTPrice: { type: Number, default: null },
        CoinName: { type: String, default: null },
        NFTQuantity: { type: String, default: null },
        HashValue: { type: String, default: null },
        Type: { type: String, default: null },
        NFTId: { type: String, default: null },
        NFTName: { type: String, default: null },
        Category: { type: String, default: null },
        ContractType: { type: String, default: null },
        ContractAddress: { type: String, default: null },
        CollectionNetwork: { type: String, default: null },
        CollectionSymbol: { type: String, default: null },
        SignatureHash: { type: String, default: null },
        fromToken: { type: String, default: null },
        toToken: { type: String, default: null },
        FromToken: { type: String, default: null },
    },
    { timestamps: true }
);

module.exports = model('activity', activity)