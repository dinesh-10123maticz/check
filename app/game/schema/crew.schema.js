const mongoose = require('mongoose');
import constants from '../../../shared/constant';
const crew = new mongoose.Schema(
    {
        name: { type: String, default: '' },
        description: { type: String, default: '' },
        image: { type: String, default: null },
        image_url: { type: String, default: null },
        crewType: { type: String, default: 'crew' },
        rarity: { type: String, default: 'uncommon' },
        profession: { type: String, enum: constants.PROFESSIONS },
        gender: { type: String, default: 'male' },
        NFTProperties: [
            new mongoose.Schema(
                {
                    trait_type: { type: String },
                    value: { type: String },
                },
                { _id: false },
            ),
        ],
        price: [
            {
                label: { type: String }, //ignore
                amount: { type: Number },
            },
        ],
        nftPrice: { type: String, default: '0' },//if ask have to update price
        // nftPrice: {},
        priceType: { type: String, default: 'usd' },

        bonus: { type: [], default: [] },
        specialConditions: { type: String, default: null },
        collection: { type: mongoose.Schema.Types.ObjectId, ref: 'collection', default: null },
        isActive: { type: Boolean, default: true },
        isAssignable: { type: Boolean, default: false },
        isPassive: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false },
    },
    { timestamps: true },
);

const crew_db = mongoose.model(constants.CREW, crew);
module.exports = crew_db;
