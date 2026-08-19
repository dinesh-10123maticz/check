import { model, Schema } from 'mongoose';

const collection = new Schema(
    {
        CollectionName: {
            type: String,
            default: '',
        },
        displayName: {
            type: String,
            required: true,
        },
        type: { type: Schema.Types.ObjectId, ref: 'collectiontype', required: true },
        CollectionProfileImage: {
            type: String,
            default: '',
        },
        image_url: {
            type: String,
            default: '',
        },
        banner_url: {
            type: String,
            default: '',
        },
        opensea_url: {
            type: String,
            default: '',
        },
        total_supply: {
            type: String,
            default: '',
        },

        CollectionCoverImage: {
            type: String,
            default: '',
        },
        CollectionSymbol: {
            type: String,
            default: '',
        },
        CollectionBio: {
            type: String,
            default: '',
        },
        CollectionType: {
            type: String,
            default: '',
        },
        CollectionNetwork: {
            type: String,
            default: '',
        },
        CollectionCreator: {
            type: String,
            default: '',
        },
        Category: {
            type: String,
            default: '',
        },
        CollectionContractAddress: {
            type: String,
            default: '',
        },
        status: {
            // type: String,
            // default: 'false',
            type: Boolean,
            default: true,
        },
        fees: [],
        Approved: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

module.exports = model('collection', collection);
