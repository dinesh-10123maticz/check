import constants from '../../../shared/constant';

const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const CHAT_DB = Schema(
    {
        userName: { type: String },
        userId: { type: Schema.Types.ObjectId, ref: constants.USER_DB },
        roomId: { type: Schema.Types.String, default: '' },
        type: { type: String, default: 'text' },
        content: { type: String },
        isPrivate: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

module.exports = model(constants.CHAT_DB, CHAT_DB);
