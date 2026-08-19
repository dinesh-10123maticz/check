import AdminSchema from './schema/admin.schema';
import gameSetting from './schema/gameSettings.schema';
import jwt from 'jsonwebtoken';

import Config from '../../../config/config';
import { config } from 'dotenv';
import logger from '../../../utils/logger';
import missionBonusReward_db from '../../missions/schema/missionBonusReward.schema';
import shipsdb from '../../game/schema/ship.schema';
import SubscriberSchema from '../../user/schema/subcriber.schema';
import TokenSchema from '../../nft/schema/token.schema';
import UserSchema from '../../user/schema/user.schema';
import CollectionSchema from '../../nft/schema/collection.schema';

export const Authendicateadmin = async (req, res, next) => {
    try {
        console.log(req.url, "Authendicateadmin")
        if (!req.headers.authorization) {
            return res.status(422).json({ status: false, message: 'Please send validate token.' });
        }

        req.headers.authorization = req?.headers?.authorization.replace('Bearer ', '');

        const decoded = jwt.verify(req.headers.authorization, Config.SECRET_KEY);
        if (decoded.id) {
            const data = await AdminSchema.findById({ _id: decoded.id });
            if (data) {
                next();
            } else {
                console.log("condition_error")
                return res.status(422).json({ status: false, message: 'UnAuthorized token!' });
            }
        }
    } catch (error) {
        logger.error('Authendicateadmin_error', error);
        return res.status(500).json({ status: false, message: error });
    }
};

export const AdminfindOne = async (Query) => {
    const data = await AdminSchema.find(Query);
    return data;
};

export const GameValues_update = async (Query) => {
    return await gameSetting.findByIdAndUpdate(Query);
};

export const UpdateOneGameValues = async (find, payload, options = {}) => {
    return await gameSetting.findOneAndUpdate(find, payload, options);
};

export const FindOneGameValues = async (filter) => {
    return await gameSetting.findOne(filter);
};

export const DeleteOneGameValues = async (find, payload, options = {}) => {
    return await gameSetting.findOneAndUpdate(find, payload, options);
};

export const get_GameValues = async () => {
    return await gameSetting.findOne();
    // return Config.GAME_SETTINGS;
};

export const getGameValues = async () => {
    const dat = await gameSetting.find().lean();
    return dat[0];
};

export const Create_GameValues = async (data) => {
    return await gameSetting.create(data);
};

export const getDashboardData = async () => {
    try {
        const [missionBonusStats, shipStats, subscriberStats, tokenStats, userStats, collectionStats] = await Promise.all([
            missionBonusReward_db.aggregate([
                {
                    $facet: {
                        totalBonusRewards: [{ $count: 'count' }],
                        totalBonusAmount: [
                            { $group: { _id: null, total: { $sum: '$amount' } } },
                        ],
                    },
                },
            ]),
            shipsdb.aggregate([
                {
                    $facet: {
                        totalShips: [{ $count: 'count' }],
                        activeShips: [
                            { $match: { isActive: true } },
                            { $count: 'count' },
                        ],
                    },
                },
            ]),
            SubscriberSchema.aggregate([
                {
                    $facet: {
                        totalSubscribers: [{ $count: 'count' }],
                        activeSubscribers: [
                            { $match: { maySent: true } },
                            { $count: 'count' },
                        ],
                    },
                },
            ]),
            TokenSchema.aggregate([
                {
                    $facet: {
                        totalTokens: [{ $count: 'count' }],
                        totalSupply: [
                            { $group: { _id: null, total: { $sum: { $toInt: '$NFTQuantity' } } } },
                        ],
                    },
                },
            ]),
            UserSchema.aggregate([
                {
                    $facet: {
                        totalUsers: [{ $count: 'count' }],
                        activeUsers: [
                            { $match: { isActive: true } },
                            { $count: 'count' },
                        ],
                    },
                },
            ]),
            CollectionSchema.aggregate([
                {
                    $facet: {
                        totalCollections: [{ $count: 'count' }],
                        activeCollections: [
                            { $match: { isActive: true } },
                            { $count: 'count' },
                        ],
                    },
                },
            ]),
        ]);

        return {
            data: {
                missionBonusRewards: {
                    total: missionBonusStats[0]?.totalBonusRewards[0]?.count ?? 0,
                    totalAmount: missionBonusStats[0]?.totalBonusAmount[0]?.total ?? 0,
                },
                ships: {
                    total: shipStats[0]?.totalShips[0]?.count ?? 0,
                    active: shipStats[0]?.activeShips[0]?.count ?? 0,
                },
                subscribers: {
                    total: subscriberStats[0]?.totalSubscribers[0]?.count ?? 0,
                    active: subscriberStats[0]?.activeSubscribers[0]?.count ?? 0,
                },
                tokens: {
                    total: tokenStats[0]?.totalTokens[0]?.count ?? 0,
                    totalSupply: tokenStats[0]?.totalSupply[0]?.total ?? 0,
                },
                users: {
                    total: userStats[0]?.totalUsers[0]?.count ?? 0,
                    active: userStats[0]?.activeUsers[0]?.count ?? 0,
                },
                collections: {
                    total: collectionStats[0]?.totalCollections[0]?.count ?? 0,
                    active: collectionStats[0]?.activeCollections[0]?.count ?? 0,
                },
            },
        };
    } catch (error) {
        logger.error('getDashboardData_error', error);
        throw new Error(error);
    }
};