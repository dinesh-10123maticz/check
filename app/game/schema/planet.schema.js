import mongoose from 'mongoose';

const worldSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        image_url: { type: String },
        collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'collection' },
        type: { type: String, default: 'planet' }, // planet , astroid, asteroid
        rarity: { type: String, default: 'uncommon' }, // rare , common , uncommon
        salt: { type: String, default: null },
        slots: [],
        price: { type: String, default: null },
        packId: { type: mongoose.Schema.Types.ObjectId, ref: 'pack', default: null },
        coinName: { type: String, default: null },
        hexId: {
            type: Number,
            require: true,
        },
        crewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "crew",
            default: null,
            index: true
        },

        isActive: { type: Boolean, default: true },
        sequence: { type: Number, index: true }
    },
    { timestamps: true },
);

module.exports = mongoose.model('planet', worldSchema);
