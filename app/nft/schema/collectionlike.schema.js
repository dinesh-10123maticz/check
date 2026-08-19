import { model, Schema } from 'mongoose';

const CollectionLikesSchema = new Schema(
    {
        CollectionSymbol: {
            type: String, //changed
            default: 0,
        },
        CustomUrl: {
            type: String,
            default: '',
        },
        deleted: {
            type: Number,
            default: 1, // 1 Active 0 Deleted
        },
    },
    { timestamps: true },
);
module.exports = model('collectionlikes', CollectionLikesSchema);
