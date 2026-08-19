import { Schema, model } from 'mongoose';
const mongoose = require('mongoose');
import constanst from '../../../shared/constant';
const user = Schema(
    {
        DisplayName: { type: String, default: '' },
        EmailId: { type: String, default: '' },
        Youtube: { type: String, default: '' },
        Facebook: { type: String, default: '' },
        Twitter: { type: String, default: '' },
        Instagram: { type: String, default: '' },
        level: { type: Number, default: 1 },
        refferalCode: { type: String, default: null, index: true },
        refferalByCode: { type: String, default: null, index: true },
        refferedBy: { type: mongoose.Schema.Types.ObjectId, ref: constanst.USER_DB, default: null },
        WalletAddress: { type: String, default: null, index: true, unique: true },
        WalletType: { type: String, default: '' },
        Profile: { type: String, default: '' },
        profile_url: { type: String, default: '' },
        Cover: { type: String, default: '' },
        Bio: { type: String, default: '' },
        CustomUrl: { type: String, default: '' },
        freeNftClaimed: { type: Boolean, default: false },
        isClaimed: { type: Boolean, default: false },
        softClaimStart: { type: Date, default: null },
        softClaimEnd: { type: Date, default: null },
        Follower: {
            type: Array,
            default: [
                {
                    Address: '',
                    CustomUrl: '',
                },
            ],
        },
        Following: {
            type: Array,
            default: [
                {
                    Address: '',
                    CustomUrl: '',
                },
            ],
        },

        planetSync: {
            type: Date,
            default: null,
        },

        astroidSync: {
            type: Date,
            default: null,
        },

        shipSync: {
            type: Date,
            default: null,
        },

        crewSync: {
            type: Date,
            default: null,
        },
        specialCrewSync: {
            type: Date,
            default: null,
        },
        isTutorialPlayed: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        blockedStatus: {
            type: String,
            enum: ['active', 'suspended', 'blocked'],
            default: 'active'
        }

    },
    { timestamps: true },
);

module.exports = model(constanst.USER_DB, user);
