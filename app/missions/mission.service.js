import { TokenOwnerAggregate_service } from '../nft/nft.services';
import battleStats from './schema/battlestats.schema';
import missionStats from './schema/missionStatus.schema';
import missionReward from './schema/missionreward.schema';
import explored from './schema/explored.schema';

import constants from '../../shared/constant';

import explorePlanet from './schema/exploredPlanets.schema';
import missionBonusReward from './schema/missionBonusReward.schema';

export const CreateMissionReward = async (data) => {
    return await missionReward.create(data);
};
export const FindMissionReward = async (data) => {
    return await missionReward.find(data);
};
export const FindOneAndUpdateMissionReward = async (find, update) => {
    return await missionReward.findOneAndUpdate(find, update);
};

// service in game module
export const InsertManyMissionReward = async (data) => {
    return await missionReward.insertMany(data);
};
export const FindOneMissionReward = async (data) => {
    return await missionReward.findOne(data);
};

export const missionRewardDeleteOne = async (query) => {
    return await missionReward.deleteOne(query);
};

export const find_BattleStatus = async (data) => {
    return await battleStats.find(data).sort({ updatedAt: -1 });
};

export const findOne_BattleStatus = async (data) => {
    return await battleStats.findOne(data).populate('userShip', {}).populate('crew.tokenId', {});
};
export const FindOneAndUpdateBattleStatus = async (find, update) => {
    return await battleStats.findOneAndUpdate(find, update);
};

// service for user module
export const countOfMission = async (data) => {
    return await missionStats.find(data).countDocuments();
};

export const createBattleStats_Service = async (data) => {
    return await battleStats.create(data);
};

/**
 * Service to get the mission crew for a given user and type.
 */
export const missionCrew_Service = async (userData, Type, skip, limit) => {
    console.log('missionCrew_Service', userData, Type, skip, limit);
    const query = [
        {
            $match: { NFTOwner: userData.WalletAddress, NFTBalance: { $ne: '0' } },
        },
        {
            $lookup: {
                from: 'tokens',
                localField: 'NFTId',
                foreignField: 'NFTId',
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$collectionTypeId', Type._id] },
                        },
                    },
                ],
                as: 'tokenData',
            },
        },
        {
            $unwind: '$tokenData', // Deconstruct the "tokenData" array
        },
        {
            $facet: {
                totalCount: [
                    { $count: 'count' }, // This will count the total number of matching documents
                ],
                results: [
                    { $skip: skip }, // Pagination logic
                    { $limit: limit }, // Limit the number of documents
                ],
            },
        },
    ];
    return await TokenOwnerAggregate_service(query);
};

export const searchMissionService = async (data) => {
    const { walletAddress, skip, limit } = data;
    const query = [
        {
            $match: {
                NFTOwner: { $ne: walletAddress }, // Exclude NFTs owned by the given walletAddress
                NFTBalance: { $ne: '0' }, // Exclude NFTs with balance 0
            },
        },
        {
            $lookup: {
                from: 'tokens', // Join with the "tokens" collection
                let: { nft_id: '$NFTId', contractAddr: '$ContractAddress' }, // Define variables for matching
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$NFTId', '$$nft_id'] }, // Match on NFTId
                                    { $eq: ['$ContractAddress', '$$contractAddr'] }, // Match on contractAddress
                                ],
                            },
                        },
                    },
                ],
                as: 'tokenData', // Store result in tokenData array
            },
        },
        { $unwind: '$tokenData' }, // Flatten the tokenData array
        {
            $lookup: {
                from: 'userplanets', // Join with the "userPlanet" collection
                localField: 'tokenData._id', // Match _id from tokenData (from "tokens" collection)
                foreignField: 'nftId', // Match with nftId in userPlanet
                as: 'userplanets', // Store the result in userPlanets array
                pipeline: [
                    { $sort: { createdAt: 1 } }, // Sort by createdAt in ascending order
                    { $skip: skip }, // Skip first `skip` documents
                    { $limit: limit }, // Limit the result to `limit` documents
                    {
                        $lookup: {
                            from: 'planets', // Join with "planets" collection
                            localField: 'planetId', // Match planetId in userplanets
                            foreignField: '_id', // Match with _id in planets
                            as: 'planetDetails', // Store the result in planetDetails array
                        },
                    },
                    // Optionally, you can use `$unwind` to simplify the array structure
                    { $unwind: { path: '$planetDetails', preserveNullAndEmptyArrays: true } },
                ],
            },
        },
        { $unwind: '$userplanets' }, // Unwind the userPlanets array
    ];
    return await TokenOwnerAggregate_service(query);
};

export const createExplored = async (data) => {
    return await explored.create(data);
};

export const findOneExplored = async (data) => {
    return await explored.findOne(data);
};

export const findExplored = async (data) => {
    return await explored.find(data);
};

export const findExploredPopulate = async (data) => {
    return await explored
        .find(data)
        .populate({
            path: 'missionStatsId',
            select: {},
            populate: [
                {
                    path: 'crew.tokenId',
                },
                {
                    path: 'userShipId',
                    populate: {
                        path: 'shipId', // Populate field inside `userShipId`
                        model: constants.SHIP_DB,
                    },
                },
            ],
        })
        .populate('missionPlanetId', {})
        .lean();
};

export const findOneAndUpdateExplored = async (find, update) => {
    return await explored.findOneAndUpdate(find, update, { new: true });
};
export const InsertManyExplored = async (data) => {
    return await explored.insertMany(data);
};
export const createMissionStats = async (data) => {
    return await missionStats.create(data);
};

export const getMissionStatus = async (query, page, limit) => {
    const skip = (page - 1) * limit;
    const total = await missionStats.countDocuments(query);

    const missions = await missionStats
        .find(query)
        .populate('missionPlanetId', { name: 1, image: 1, imageUrl: 1, planetNumber: 1 })
        .populate('userId', { WalletAddress: 1 })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    return {
        data: missions,
        total,
        page,
        limit,
    };
};

export const FindOneMissionStats = async (data) => {
    return await missionStats.findOne(data).lean();
};

// export const findOneMissionStatswithPopulate = async (data) => {
//     return await missionStats
//         .findOne(data)
//         .populate('crew.tokenId')
//         .populate({
//             path: 'userShipId',
//             populate: {
//                 path: 'nftId', // 👈 this populates the nftId inside userShip
//                 model: constants.TOKEN_DB,
//             },
//         })
//         .populate('missionPlanetId')
//         .lean();

//     const formattedItems = items.map((item) => ({
//         ...item,
//         crew: item.crew?.map((c) => c.tokenId || c) || [], // replace each crew element with tokenId
//     }));
// };

// export const findOneMissionStatswithPopulate = async (data) => {
//     const item = await missionStats
//         .findOne(data)
//         .populate('crew.tokenId')
//         .populate({
//             path: 'userShipId',
//             populate: {
//                 path: 'nftId', // populates nftId inside userShip
//                 model: constants.TOKEN_DB,
//             },
//         })
//         .populate('missionPlanetId', { _id: 1 })
//         .lean();

//     if (!item) return null; // handle case where not found

//     // 🔥 Flatten crew.tokenId to direct objects
//     const formattedItem = {
//         ...item,
//         crew: item.crew?.map((c) => c.tokenId || c).filter(Boolean) || [],
//     };

//     return formattedItem;
// };

export const findOneMissionStatswithPopulate = async (data) => {
    const item = await missionStats
        .findOne(data)
        .populate([
            {
                path: "crew.tokenId",
                select: "_id",
                model: constants.TOKEN_DB,
            },
            {
                path: "userShipId",
                select: "_id",
                // populate: {
                //     path: "nftId",
                //     model: constants.TOKEN_DB,
                // },
            },
            {
                path: "missionPlanetId",
                select: "_id name",
            },
        ])
        .lean();

    if (!item) return null;

    // 🔥 Flatten crew.tokenId to direct objects
    const formattedItem = {
        ...item,
        crew: (item.crew || []).map((c) => c.tokenId?._id || c.tokenId).filter(Boolean),
        userShipId: item.userShipId?._id || item.userShipId,
        missionPlanetId: item.missionPlanetId?._id || item.missionPlanetId,
        missionPlanetName: item.missionPlanetId?.name || item.name,
    };

    return formattedItem
};

export const findOneAndUpdateMissionStats = async (find, update) => {
    return await missionStats.findOneAndUpdate(find, update);
};

export const missionStatsFind = async (data) => {
    return await missionStats.find(data).sort({ updatedAt: -1 }).lean();
};

// export const missionStatsFindwithPagenation = async (data, skip, limit) => {
//     return await missionStats.find(data).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();
// };

export const missionStatsFindWithPagination = async (filter, skip, limit = 12) => {
    const [items, total] = await Promise.all([
        missionStats
            .find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            // .populate({
            //     path: 'userShipId',
            //     populate: {
            //         path: 'shipId', // Populate field inside `userShipId`
            //         model: constants.SHIP_DB,
            //     },
            // })
            // .populate('crew.tokenId')
            .populate('missionPlanetId', {})
            .lean(),
        missionStats.countDocuments(filter),
    ]);

    const formattedItems = items.map((item) => ({
        ...item,
        crew: item.crew?.map((c) => c.tokenId || c) || [], // replace each crew element with tokenId
    }));

    return {
        items: formattedItems,
        total,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

export const findUserBasedMissionStatswithPopulate = async (filter, skip, limit = 10) => {
    const [item, total] = await Promise.all([
        missionStats
            .find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate([
                {
                    path: "crew.tokenId",
                    select: "_id",
                    model: constants.TOKEN_DB,
                },
                {
                    path: "userShipId",
                    select: "_id",
                },
                {
                    path: "missionPlanetId",
                    select: "_id name",
                },
            ])
            .lean(),
        missionStats.countDocuments(filter),
    ]);


    if (!item || item.length === 0) return [];

    // 🔥 Flatten crew.tokenId to direct objects
    const formattedItem = item.map((item) => ({
        ...item,
        crew: (item.crew || []).map((c) => c.tokenId?._id || c.tokenId).filter(Boolean),
        userShipId: item.userShipId?._id || item.userShipId,
        missionPlanetId: item.missionPlanetId?._id || item.missionPlanetId,
        missionPlanetName: item.missionPlanetId?.name || item.name,
    }));

    return {
        items: formattedItem,
        total,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

//  new flow

export const exploredPlanetFindOne = (find) => {
    return explorePlanet.findOne(find);
};

export const exploredPlanetCreate = (payload) => {
    return explorePlanet.create(payload);
};

export const findOneMissionStatsPopulate = async (data) => {
    return await missionStats
        .findOne(data)
        .populate({
            path: 'crew.tokenId',
        })
        .populate({
            path: 'userShipId',
            populate: {
                path: 'shipId',
                model: constants.SHIP_DB,
            },
        })
        .populate({
            path: 'missionPlanetId',
        });
};

export const findOneAndUpdateMissionBonusReward = async (find, update) => {
    return await missionBonusReward.findOneAndUpdate(find, update, { new: true });
};

export const findMissionBonusReward = async (find) => {
    return await missionBonusReward.find(find);
};

export const findOneMissionBonusReward = async (crewName) => {
    return await missionBonusReward.findOne({
        crew: crewName,
        isActive: true,
    }).lean();
};