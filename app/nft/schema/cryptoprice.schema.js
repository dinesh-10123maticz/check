const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for BNB and MATIC prices
const CryptoPriceSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    bnbPriceUSD: {
        type: Number,
        required: true,
    },
    maticPriceUSD: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
});

// Create a model using the schema
const CryptoPrice = mongoose.model('CryptoPrice', CryptoPriceSchema);

module.exports = CryptoPrice;
