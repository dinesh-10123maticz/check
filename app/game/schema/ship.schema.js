const mongoose = require('mongoose');

const shipSchema = new mongoose.Schema(
    {
        shipName: { type: String, default: '' },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
        image_url: { type: String, default: '' },
        nftSlots: { type: Number, default: 0 },
        extraReward: { type: Number, default: 0 },
        price: [],
        capacity: [],
        shipType: { type: String },
        specialConditions: { type: String },
        allowMission: { type: String, default: 'all' }, // explore , mining , combat , social , all
        hullPoints: { type: Number, default: 0 },
        attackPoints: { type: Number, default: 0 },
        collection: { type: mongoose.Schema.Types.ObjectId, ref: 'collection' },
        canBuylimit: { type: Number, default: 0 },
        priceMultiplier: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

const shipsdb = mongoose.model('ship', shipSchema);
module.exports = shipsdb;
