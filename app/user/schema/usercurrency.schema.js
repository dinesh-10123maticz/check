
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const usercurrency = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        index: true,
    },
    walletAddress: {
        type: String,
        index: true,
        default: "",
    },
    currencyId: {
        type: Schema.Types.ObjectId,
        ref: 'currency',
        index: true,
        required: true
    },
    label: {
        type: String,
        index: true,
        default: "",
    },
    name: {
        type: String,
        index: true,
        default: "",
    },
    stacked: {
        type: mongoose.Types.Decimal128,
        default: 0,
    },
    balance: {
        type: mongoose.Types.Decimal128,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true
    },


})


const usercurrencydb = mongoose.model("usercurrency", usercurrency, "usercurrency");
export default usercurrencydb;