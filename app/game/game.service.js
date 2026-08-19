import assetdb from './schema/asset.schema';
import userassetdb from './schema/userAssets.schema';
import planetdb from './schema/planet.schema';
import userPlanetdb from './schema/userplanet.schema';
import shipdb from '../game/schema/ship.schema';
import userShipdb from '../game/schema/userShip.schema';
// import battleStats_db from './schema/battlestats.schema'
// import missionReward_db from "./schema/missionreward.schema";
import level_db from './schema/level.schema';
import crew_db from './schema/crew.schema';
import {
    addAdditionalNearByPlanetOnMint,
    AddParentPlanetIdToNearByPlanet,
} from './services/game.helpers';
import shipsdb from '../game/schema/ship.schema';
import mongoose from 'mongoose';

export const createAsset = async (payload) => {
    const create = await assetdb.create(payload);
    return create;
};

export const findOneUserShip = async (data) => {
    return await userShipdb
        .findOne(data)
        .populate('shipId', {})
        .populate('nfts', {})
        .populate('nftId', {});
};
export const checkexistAsset = async (name) => {
    const create = await assetdb.findOne({ asset_name: name });
    return create;
};

export const findAsset = async (data) => {
    const find = await assetdb.find(data).lean();;
    // .populate('price', { isActive: 0 })
    // .populate('reward', { isActive: 0 });
    return find;
};

export const findBuildings = async (data) => {
    return await assetdb.find(data);
};

export const findOneleveldb_service = async (data) => {
    const find = await level_db.findOne(data).populate('assetId', {});
    return find;
};
export const AssetShopservice = async (level) => {
    const find = await level_db.find({ level: 1 }).populate('assetId', {}).lean();
    return find;
};
export const Findlevel = async (data) => {
    const results = await level_db
        .find(data.level)
        .populate({
            path: 'assetId',
            match: data.asset,
        })
        .lean();

    const filteredResults = results.filter((doc) => doc.assetId !== null);
    return filteredResults;
};

export const FindAndUpdateManyLevel = async (find, payload) => {
    return await level_db.updateMany(find, payload);
};
export const findAssetOne = async (data) => {
    const find = await assetdb.findOne(data);
    return find;
};

export const checkexistuserAsset = async (buildnumber) => {
    const create = await userassetdb.findOne({ build_Number: buildnumber });
    return create;
};

export const createUserAsset_service = async (payload) => {
    const create = await userassetdb.create(payload);
    return create;
};
export const updateUserAsset = async (find, payload) => {
    const update = await userassetdb.findOneAndUpdate(find, payload, { new: true });
    return update;
};

export const updateManyUserAsset = async (find, payload) => {
    const update = await userassetdb.updateMany(find, payload);
    return update;
};

export const UserAssetList_service = async (find) => {
    const list = await userassetdb
        .find(find)
        .populate('assetId', {})
        .populate('planetId', {})
        .populate('next', {})
        .populate('levelId', {})
        .populate('userPlanetId', {});
    return list;
};

export const UserAssetList_service_game = async (find) => {
    const list = await userassetdb
        .find(
            find,
            {
                asset_Name: 1,
                build_Number: 1,
                x: 1,
                y: 1,
                startTime: 1,
                endTime: 1,
                startProduction: 1,
                endProduction: 1,
                nextClaim: 1,
                placedSlotType: 1,
                isQuote: 1,
                assetId: 1,
                levelId: 1,
                next: 1,
            }
        )
        .populate({
            path: "assetId",
            select: "_id asset_Name quote buildSlotType buildLandType buildOnTypeSlot buildLocationType",
        })
        .populate({
            path: "levelId",
            select: "_id level image reward dailyConsumption cost build_time_min",
        })
        .populate({
            path: "next",
            select: "_id level image reward dailyConsumption cost build_time_min",
        });

    return list;
};

export const userasset_list_service_projection = async (find) => {
    const list = await userassetdb
        .find(find)
        .populate('assetId', { asset_Name: 1 })
        .populate('levelId', { level: 1 });
    return list;
};

export const findAssetbyid = async (id) => {
    const list = await assetdb.findById(id);
    return list;
};

export const UserAssetFindOne_service = async (find) => {
    const update = await userassetdb
        .findOne(find)
        .populate('next', {})
        .populate('assetId', {})
        .populate('planetId', {})
        .populate('levelId', {})
        .lean();
    return update;
};

export const UserAssetFindService = async (find) => {
    const update = await userassetdb
        .find(find)
        .populate('levelId', { asset_Name: 1, level: 1, image: 1, image_url: 1 })
        .lean();
    return update;
};

export const getPlanetList = async (skip, limit) => {
    const get = await planetdb.find().populate('collectionId', {}).skip(skip).limit(limit);
    return get;
};

export const findBYPlanetID = async (Id) => {
    const objectId = new mongoose.Types.ObjectId(Id);

    const created = await planetdb.findById(objectId).populate('collectionId');

    return created;
};

export const findNextPlanetByRarity = async (data) => {
    return planetdb
        .findOne({
            rarity: data.rarity,
            type: data.type,
            isActive: true,
            crewId: { $ne: null }
        })
        .sort({ sequence: 1 })
        .populate("collectionId")
        .populate({
            path: "crewId",
            populate: {
                path: "collection"
            }
        });
};


export const planetInsertMany = async (array) => {
    return await planetdb.insertMany(array);
};
export const createPlanet = async (payload) => {
    const created = await planetdb.create(payload);
    return created;
};

/**
 * Creates a user planet with the given user data, planet ID, NFT ID, and token owner ID.
 *
 * @param {Object} userData - The user data object.
 * @param {string} planetId - The ID of the planet.
 * @param {string} nftId - The ID of the NFT.
 * @param {string} TokenOwnerId - The ID of the token owner.
 * @return {Promise<void>} - A promise that resolves when the user planet is created.
 */
export async function CreateuserPlanet(userData, planetData, nftId, TokenOwnerId = "", extraSlots = []) {
    const payload = {
        // userId : userData?._id ,
        // walletAddress : userData?.walletAddress ,
        planetId: planetData._id,
        type: planetData.type,
        rarity: planetData.rarity,
        nftId: nftId,
        TokenOwnerId: TokenOwnerId,
        hexId: planetData.hexId,
        extraSlots: extraSlots,
    };
    const created = await userPlanetdb.create(payload);
    await addAdditionalNearByPlanetOnMint(payload);
    await AddParentPlanetIdToNearByPlanet(created._id, payload?.hexId, payload.rarity);
    await disabledThePlanetAssent(planetData._id);
    return created;
}
export async function disabledThePlanetAssent(planetAssetId) {
    await planetdb.findOneAndUpdate({ _id: planetAssetId }, { isActive: false });
}
export async function userPlanetFindOne(payload) {
    return await userPlanetdb
        .findOne(payload)
        .populate({
            path: "planetId",
            select: "slots rarity type"
        });
}
export const userPlanetFindOneWithPopulate = async (payload) => {
    return await userPlanetdb.findOne(payload).populate('planetId', {}).populate('nftId', {});
};

export const updateUserPlanet = async (
    find,
    update,
    options = {}
) => {
    try {
        return await userPlanetdb.updateOne(find, update, options);
    } catch (error) {
        throw error;
    }
};
// development services

export const userAssetsdbdelete = async (payload) => {
    // await userPlanetdb.deleteMany(payload)
    await userShipdb.deleteMany(payload);
    return await userassetdb.deleteMany(payload);
};

export const userPlanetdbdelete = async (payload) => {
    await userPlanetdb.deleteMany(payload);
};

export const getOnebultingdata = async (find) => {
    return await userassetdb.findOne(find).populate("levelId");
};

export const bulkwriteuserAsset = async (data) => {
    return await userassetdb.bulkWrite(data);
};

export const saveship = async (data) => {
    //  const pay =[
    // {

    //     "shipName" : "Micro Shuttle",
    //     "description" : "",
    //     "image" : "1718708222225.jpg",
    //     "image_url" : "/gameAssets/ships/1.jpg",
    //     "nftSlots" : 1,
    //     "extraReward" : 0,
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 50
    //         }
    //     ],
    //     "capacity" : [
    //         {
    //             "label" : "GFRCE",
    //             "amount" : 1
    //         }
    //     ],
    //     "shipType" : "galfiship",
    //     "specialConditions" : "Each account can only have 1",
    //     "allowMission" : "all",
    //     "hullPoints" : 1,
    //     "attackPoints" : 1,
    //     "collectionId" : null,
    //     "canBuylimit" : 1,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }
    // ,
    // {

    //     "shipName" : "Small Fighter",
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "description" : "",
    //     "image" : "2.jpg",
    //     "image_url" : "/gameAssets/ships/2.jpg",
    //     "nftSlots" : 3,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 50
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 100
    //         },
    //         {
    //             "label" : "GFAAC",
    //             "amount" : 3
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 1
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 10
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 5,
    //     "attackPoints" : 5,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }
    // ,
    // {

    //     "shipName" : "Medium Fighter",
    //     "description" : "",
    //     "image" : "3.jpg",
    //     "image_url" : "/gameAssets/ships/3.jpg",
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "nftSlots" : 6,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 100
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 5
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 1
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 20
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 10,
    //     "attackPoints" : 10,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }
    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Large Fighter",
    //     "description" : "",
    //     "image" : "4.jpg",
    //     "image_url" : "/gameAssets/ships/4.jpg",
    //     "nftSlots" : 9,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 5000
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 5000
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 10
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 5
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 40
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 20,
    //     "attackPoints" : 20,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Capital Class Fighter",
    //     "description" : "",
    //     "image" : "5.jpg",
    //     "image_url" : "/gameAssets/ships/5.jpg",
    //     "nftSlots" : 20,
    //     "extraReward" : 4,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 30000
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 30000
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 2000
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 10000
    //         },
    //         {
    //             "label" : "AMRIT",
    //             "amount" : 1000
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 25
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 10
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 200
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "+4 on combat missions",
    //     "allowMission" : "combat",
    //     "hullPoints" : 100,
    //     "attackPoints" : 100,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Small Explorer",
    //     "description" : "",
    //     "image" : "6.jpg",
    //     "image_url" : "/gameAssets/ships/6.jpg",
    //     "nftSlots" : 3,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 50
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 100
    //         },
    //         {
    //             "label" : "GFAAC",
    //             "amount" : 3
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 1
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 5
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 5,
    //     "attackPoints" : 3,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Medium Explorer",
    //     "description" : "",
    //     "image" : "7.jpg",
    //     "image_url" : "/gameAssets/ships/7.jpg",
    //     "nftSlots" : 6,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 100
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 5
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 1
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 10
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 10,
    //     "attackPoints" : 6,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Large Explorer",
    //     "description" : "",
    //     "image" : "8.jpg",
    //     "image_url" : "/gameAssets/ships/8.jpg",
    //     "nftSlots" : 9,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 5000
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 5000
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 10
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 5
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 20
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 20,
    //     "attackPoints" : 9,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }
    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Capital Class Explorer",
    //     "description" : "",
    //     "image" : "9.jpg",
    //     "image_url" : "/gameAssets/ships/9.jpg",
    //     "nftSlots" : 20,
    //     "extraReward" : 4,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 30000
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 30000
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 2000
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 10000
    //         },
    //         {
    //             "label" : "AMRIT",
    //             "amount" : 1000
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 25
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 10
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 100
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "+4 on exploration missions",
    //     "allowMission" : "exploration",
    //     "hullPoints" : 100,
    //     "attackPoints" : 40,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Small Miner",
    //     "description" : "",
    //     "image" : "10.jpg",
    //     "image_url" : "/gameAssets/ships/10.jpg",
    //     "nftSlots" : 3,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 50
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 100
    //         },
    //         {
    //             "label" : "GFAAC",
    //             "amount" : 3
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 1
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 5
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 5,
    //     "attackPoints" : 3,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Medium Miner",
    //     "description" : "",
    //     "image" : "11.jpg",
    //     "image_url" : "/gameAssets/ships/11.jpg",
    //     "nftSlots" : 6,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 100
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 5
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 1
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 10
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 10,
    //     "attackPoints" : 6,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Large Miner",
    //     "description" : "",
    //     "image" : "12.png",
    //     "image_url" : "/gameAssets/ships/12.png",
    //     "nftSlots" : 9,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 5000
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 5000
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 10
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 5
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 20
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 20,
    //     "attackPoints" : 9,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Capital Class Miner",
    //     "description" : "",
    //     "image" : "13.png",
    //     "image_url" : "/gameAssets/ships/13.png",
    //     "nftSlots" : 20,
    //     "extraReward" : 4,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 30000
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 30000
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 2000
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 10000
    //         },
    //         {
    //             "label" : "AMRIT",
    //             "amount" : 1000
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 25
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 10
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 100
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "+4 on mining missions",
    //     "allowMission" : "mining",
    //     "hullPoints" : 100,
    //     "attackPoints" : 40,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  :new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Small Pleasure Yacht",
    //     "description" : "",
    //     "image" : "14.png",
    //     "image_url" : "/gameAssets/ships/14.png",
    //     "nftSlots" : 3,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 50
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 100
    //         },
    //         {
    //             "label" : "GFAAC",
    //             "amount" : 3
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 1
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 5
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 5,
    //     "attackPoints" : 3,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }

    // ,
    // {
    //     "collection"  : new Object("6672aa34a584de6bba4620b1"),
    //     "shipName" : "Medium Pleasure Yacht",
    //     "description" : "",
    //     "image" : "15.png",
    //     "image_url" : "/gameAssets/ships/15.png",
    //     "nftSlots" : 6,
    //     "extraReward" : 0,
    //     "price" : [
    //         {
    //             "label" : "GFORE",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "GFMNR",
    //             "amount" : 1500
    //         },
    //         {
    //             "label" : "TETRA",
    //             "amount" : 100
    //         },
    //         {
    //             "label" : "GFCMP",
    //             "amount" : 500
    //         },
    //         {
    //             "label" : "GFAAR",
    //             "amount" : 5
    //         },
    //         {
    //             "label" : "GFAAA",
    //             "amount" : 1
    //         }
    //     ],
    //     "capacity" : {
    //         "label" : "GFRCE",
    //         "amount" : 10
    //     },
    //     "shipType" : "galfiship",
    //     "specialConditions" : "None",
    //     "allowMission" : "all",
    //     "hullPoints" : 10,
    //     "attackPoints" : 6,
    //     "collectionId" : null,
    //     "canBuylimit" : 0,
    //     "createdAt" : "2024-06-18T00:00:00.000Z",
    //     "updatedAt" : "2024-06-18T00:00:00.000Z"
    // }
    //  ]

    return await shipdb.insertMany(data);
};

export const getShip_Service = async (find = {}) => {
    return await shipdb.find().populate('collection', {}).lean();
};

export const findOneShip = async (shipId) => {
    return await shipdb.findById(shipId).populate('collection', {}).lean();
};

export const findOneUserShipData = async (usershipId) => {
    return await userShipdb.findById(usershipId).populate('shipId', {}).populate('nfts.nftId');
};
export const findOneUserShipById = async (usershipId) => {
    return await userShipdb.findById(usershipId).populate('shipId', {}).populate('nfts.nftId');
};
export const UserShipFindOneAndUpdate = async (find, update) => {
    return await userShipdb
        .findOneAndUpdate(find, update, { new: true })
        .populate('shipId', {})
        .populate('nftId', {})
        .populate('nfts.nftId');
};
export const UserShipFindOne = async (find, update) => {
    return await userShipdb.findOne(find, update).populate('shipId', {});
};
export const createUserShip = async (userData, planetId, nftId, hexId = 0) => {
    const payload = {
        userId: userData?._id,
        walletAddress: userData?.walletAddress,
        shipId: planetId,
        nftId: nftId,
        currentHexId: hexId,
    };
    return await userShipdb.create(payload);
};

export const UserShip_Service = async (data, type) => {
    return await userShipdb
        .find(data)
        .populate({
            path: 'shipId',
            select: { isActive: 0 },
            populate: {
                path: 'collection',
                select: { isActive: 0 },
            },
        })
        .populate('nftId', {})
        .lean();
};

export const UserMissonShip_Service = async (data, type) => {
    console.log(JSON.stringify(data), "UserMissonShip_Service")
    const result = await userShipdb
        .find(data)
        .populate({
            path: 'shipId',
            match: { allowMission: { $in: ['all', type] } },
            select: { isActive: 0, createdAt: 0, updatedAt: 0 },
            populate: {
                path: 'collection',
                select: { isActive: 0 },
            },
        })
        .populate('nftId', {})
        .lean();
    console.log("result", result)
    // remove entries where shipId is null
    return result.filter((item) => item.shipId !== null);
};

export const createLevelforAsset = async (data) => {
    return await level_db.create(data);
};

export const LevelfindById = async (data) => {
    return await level_db.findById(data);
};

export const findOne_level_db = async (data) => {
    // return await level_db.find(data).sort({  level : -1  }).limit(1)
    return await level_db.findOne(data);
};

export const findLevels = async (data) => {
    return await level_db.find(data);
};

export const findOneandUpdate_level_db = async (find, update) => {
    return await level_db.findOneAndUpdate(find, update);
};

export const CrewDataInsertMany = async (array) => {
    return await crew_db.insertMany(array);
};

export const ShipDataInsertMany = async (data) => {
    return await shipsdb.insertMany(data);
};
export const deActiveCrew = async (id) => {
    return await crew_db.findOneAndUpdate({ _id: id }, { isActive: false });
};
export const lockCrew = async (id) => {
    return await crew_db.findOneAndUpdate({ _id: id }, { isLocked: true });
};

export const save_crewAsset = async (data) => {
    return await crew_db.create(data);
};
export const FindOne_crewAsset = async (data) => {
    return await crew_db.findOne(data).populate('collection', {});
};
export const find_crewAsset = async (skip, lmit, find = {}) => {
    return await crew_db.find(find).populate('collection', {}).skip(skip).limit(lmit);
};
export const getAllCrewAsset = async (query = {}) => {
    return await crew_db
        .find(query)
        .select({ name: 1, rarity: 1, crewType: 1, gender: 1, price: 1 });
};
export const findCrewAsset = async (query = {}) => {
    return await crew_db.find(query).lean();
};
export const CrewAggregate = async (data) => {
    return await crew_db.aggregate(data);
};
export const getCrewData = async (id) => {
    return await crew_db.findById(id).populate('collection', {});
};

export const findOneUserPlanetService = async (data) => {
    await userPlanetdb.findOne(data).populate('planetId', {});
};
export const getUserPlanetsService = async (data) => {
    return await userPlanetdb.find(data).populate('nftId', {}).populate('planetId', {});
};

export const planetAstroid_Shop_service = async (find, skip, limit) => {
    return await planetdb.find(find).skip(skip).limit(limit).populate('collectionId', {
        CollectionName: 1,
        CollectionSymbol: 1,
        CollectionType: 1,
        CollectionNetwork: 1,
        CollectionContractAddress: 1,
    });
};

export const findAllPlanet = async (find) => {
    return await planetdb.find(find).populate('collectionId', {
        CollectionName: 1,
        CollectionSymbol: 1,
        CollectionType: 1,
        CollectionNetwork: 1,
        CollectionContractAddress: 1,
    });
};
export const planetShopCounts = async (find) => {
    return await planetdb.countDocuments(find);
};
export const ship_Shop_service = async (find, skip, limit) => {
    return await shipdb.find(find).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('collection', {
        CollectionName: 1,
        CollectionSymbol: 1,
        CollectionType: 1,
        CollectionNetwork: 1,
        CollectionContractAddress: 1,
    });
};
export const shipShopCounts = async (find) => {
    return await shipdb.countDocuments(find);
};

export const UsersplanetAstroid_Shop_service = async (find, skip, limit) => {
    return await userPlanetdb
        .find(find)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('planetId', {})
        .populate('nftId', {});
};
export const UserPlantCount = async (find) => {
    return await userPlanetdb.find(find).countDocuments();
};

export const UserShip_Shop_service = async (find, allowmission, skip, limit) => {
    return await userShipdb
        .find(find)
        .sort({ createdAt: -1 })
        .populate({
            path: 'shipId',
            select: { isActive: 0 },
            populate: {
                path: 'collection',
                match: allowmission,
                select: {
                    CollectionName: 1,
                    CollectionSymbol: 1,
                    CollectionType: 1,
                    CollectionNetwork: 1,
                    CollectionContractAddress: 1,
                },
            },
        })
        .populate('nftId', {})
        .skip(skip)
        .limit(limit)
        .lean();
};

export const userShipCounts = async (find) => {
    return await userShipdb.countDocuments(find);
};
export const DeleteUserAsset = async (data) => {
    return await userassetdb.deleteMany(data);
};

export const crew_MarketPlace_service = async (find, collectionmatch, page, limit) => {
    return await crew_db
        .find(find)
        .populate({
            path: 'collection',
            match: collectionmatch,
            select: {},
        })
        .skip(page)
        .limit(limit)
        .lean();
};

export const crewFindWithpagination = async (find, page, limit) => {
    return await crew_db.find(find).populate('collection', {}).skip(page).limit(limit).lean();
};

export const crewFind = async (find, skip, limit) => {
    return await crew_db.find(find).skip(skip).limit(limit).populate('collection', {}).lean();
};
export const crewCount = async (find = {}) => {
    return await crew_db.countDocuments(find);
};

export const UpdateManyCrew = async (find, update) => {
    return await crew_db.updateMany(find, update);
};

export const planetSearch = async (word, skip, limit) => {
    return await planetdb.find();
};

export const UpdateManyPlanetAsset = async (find, update) => {
    return await planetdb.updateMany(find, update);
};

export const UpdateOneShipdb = async (find, update) => {
    return await shipdb.findOneAndUpdate(find, update);
};

export const PlanetAggregate = async (data) => {
    return await planetdb.aggregate(data);
};

// export const getSpecialCrew = async (data) => {
//     return crew_db
//         .findOne({
//             crewType: data.key,
//             gender: data.gender,
//             isActive: true
//         })
//         .populate("collection");
// };

export const getSpecialCrew = async (data) => {
    return crew_db
        .findOne({
            crewType: data.key,
            gender: data.gender,
            rarity: data.rarity,
            isActive: true
        })
        .populate("collection");
};

export const findOrbitalShipyard = async (planetId, assetName) => {
    return await userassetdb.findOne({
        userPlanetId: planetId,
        asset_Name: assetName,
        isBuilding: true,
        isActive: true,
    });
};