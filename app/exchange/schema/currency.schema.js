import { Schema, model } from 'mongoose';

const currency = new Schema(
    {
        name: {
            type: String,
            default: '',
        },
        label: {
            type: String,
            default: '',
            unique: true,
        },
        value: {
            type: String,
            default: '',
        },
        notes: {
            type: String,
            default: null,
        },
        decimal: {
            type: Number,
            default: '',
        },
        address: {
            type: String,
            default: '',
        },
        network: {
            type: String,
            default: null,
        },
        valueofGalfi: {
            // galfis for 1 token
            type: Schema.Types.Decimal128,
            default: 0,
        },
        circulateCurrency: {
            type: Schema.Types.Decimal128,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isWithdraw: {
            type: Boolean,
            default: true,
        },
        isDeposit: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

module.exports = model('currency', currency);
