import {
    add_minutes,
    calculateRewardforRefferedUser,
    formatTheUrlPath,
    GetOriginalImage,
    getRandomNumberInRange,
    ipfs_add_for_meta,
    sendRes,
    signature_imageURL,
    toFixedNumber,
    uploadAndGenerateUrl,
} from '../../../shared/commonFunction';
import config, { CURRENT_NETWORK } from '../../../config/config';
import CONFIG from '../../../config/config';

import * as gameservice from '../game.service';
import * as userService from '../../user/user.services';
import * as nftService from '../../nft/nft.services';
import {
    addpriceCurrencyinCirculate_service,
    justwriteinCurrency,
} from '../../admin/cms/cms.service';
import { get_GameValues, getGameValues } from '../../admin/adminlogin/admin.service';
import { TranscationService } from '../../exchange/exchange.service';
import { getTokenDetailes } from '../../nft/nft.services';
import { checkforenounghbalance } from '../game.validation';
import { uploadImageToS3, uploadOrUpdateIpfsToS3 } from '../../../services/aws';
import { httpStatus } from '../../../utils/httpStatus';
import CONSTANTS from '../../../shared/constant';
import { SettingCrewMetaData, SettingShipMetaData } from '../../nft/nft.controlller';
import { generateMetaStoreFilePath } from '../../../services/ipfs';
import * as adminservice from '../../admin/adminlogin/admin.service';
import logger from '../../../utils/logger';
import { crewData } from './crew.controller';
import planetdb from '../schema/planet.schema';
import { RedisGet, RedisSet } from '../../../services/redisclient';
import shipsdb from '../schema/ship.schema';
import currenciesdb from '../../exchange/schema/currency.schema';
import { convertUsdToAsset } from '../../exchange/exchange.controller';
import professionSchema from '../../profession/profession.schema';
import BigNumber from 'bignumber.js';
import level_db from '../schema/level.schema';
import crew_db from '../schema/crew.schema';

const getMetaDataKey = (data) => {
    return data;
};

export const checkFirstBuy = async (walletAddress) => {
    const count = await nftService.tokenFindOne({ NFTCreator: walletAddress });
    return count ? false : true;
};
export const gameAsset_Imageupload = async (req, res) => {
    try {
        const { location, fileName } = req.body;
        let time = Date.now();
        const key = fileName
            ? location + '/' + fileName
            : location +
              '/' +
              time +
              '.' +
              req.files.image.name.split('.')[req.files.image.name.split('.').length - 1];
        const url = await uploadImageToS3(key, req.files.image.data, req.files.mimetype);
        const result = {
            imageKey: url?.Key, // need to store in db imageurl
            imageLocation: url?.Location,
        };

        return sendRes(res, httpStatus.OK, true, url ? 'uploaded' : 'failed', result);
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

// api : /game/assetbyplanetid
// method : post
// body : { planetId  }
// get the level 1 asset for the planet for shop to buy
export const AssetByPlanetId = async (req, res) => {
    try {
        const { planetId } = req.body;

        const data = await gameservice.findOneleveldb_service({ planetId: planetId, level: 1 });

        data.forEach((element) => {
            element.image_url = signature_imageURL(element.image);
        });

        sendRes(res, httpStatus.OK, true, 'success', data);
    } catch (error) {
        sendRes(res, httpStatus.INTERNAL_SERVER_ERROR, fasle, error.message, {});
    }
};

// api : /game/assetshop
// method : post
export const assetshop = async (req, res) => {
    try {
        const { userPlanetId } = req.body;
        if (!userPlanetId) {
            return sendRes(400, false, 'need userPlanetId', {});
        }
        const [userAssetforPlanet, userPlanetData] = await Promise.all([
            gameservice.UserAssetList_service({ userPlanetId: userPlanetId }),
            gameservice.userPlanetFindOneWithPopulate({ _id: userPlanetId }),
        ]);

        const packId = userPlanetData?.planetId?.packId;
        const findBuild = {
            level: { level: 1 },
            asset: { isBuilding: true },
        };

        const findPack = {
            level: { level: 1 },
            asset: { isBuilding: false, packId: packId },
        };

        const [pack, building] = await Promise.all([
            gameservice.Findlevel(findPack),
            gameservice.Findlevel(findBuild),
        ]);

        // const building = await gameservice.Findlevel(findpayload)
        // const pack = await gameservice.Findlevel(findpayloadx)

        const data = building.concat(pack);
        const assetCountMap = new Map();

        for (const userAsset of userAssetforPlanet) {
            const assetId = userAsset.assetId._id;
            if (assetCountMap.has(assetId)) {
                assetCountMap.set(assetId, assetCountMap.get(assetId) + 1);
            } else {
                assetCountMap.set(assetId, 1);
            }
        }

        for (const asset of data) {
            const count = assetCountMap.get(asset._id) || 0;
            asset.image_url = signature_imageURL(asset.image);
            asset.buildCount = count;
        }

        sendRes(res, httpStatus.OK, true, 'success', data);
    } catch (error) {
        logger.info('error', error);
        sendRes(res, 500, false, error.message, {});
    }
};

export const createUserAsset = async (req, res) => {
    try {
        const {
            build_Number,
            walletAddress,
            userPlanetId,
            assetId,
            asset_Name,
            x,
            y,
            pricetype,
            optionalCost,
            slotType,
        } = req.body;
        req.body.walletAddress = walletAddress.toLowerCase();
        let price = [];
        const exist = await gameservice.checkexistuserAsset(build_Number);

        if (exist) {
            const update_positions = {
                x: x,
                y: y,
                isInventory: false,
            };
            const find = {
                userPlanetId: userPlanetId,
                build_Number: build_Number,
            };
            await gameservice.updateUserAsset(find, update_positions);

            const updatedfind = await gameservice.UserAssetFindOne_service(find);

            updatedfind.levelId.image_url = updatedfind.levelId.image
                ? signature_imageURL(updatedfind.levelId.image)
                : null;
            if (updatedfind.next) {
                updatedfind.next.image_url = updatedfind.next.image
                    ? signature_imageURL(updatedfind.next.image)
                    : null;
            }
            updatedfind.planetId.image_url = updatedfind.planetId.image_url
                ? signature_imageURL(updatedfind.planetId.image_url)
                : null;
            return sendRes(res, 200, true, 'Updated successfully', updatedfind);
        }

        const currlvl = await gameservice.findOne_level_db({ assetId: assetId, level: 1 });
        const type = pricetype.toLowerCase();
        if (!(type === 'cost' || type === 'optionalcost')) {
            return sendRes(
                res,
                409,
                false,
                'Need to select pricetype as either cost or optionalCost',
            );
        }
        // price = currlvl[pricetype];
        let cost = [];

        if (pricetype === 'cost') {
            cost = currlvl.cost || [];
        } else {
            cost = optionalCost || [];
        }

        // validation for have balance
        const status = await checkforenounghbalance(cost, req.body.walletAddress);
        if (!status.status) {
            return sendRes(res, 409, false, status.message, {});
        }

        // if (price.length === 0) {
        // }

        const find = {
            _id: userPlanetId,
        };

        const userplanetdetails = await gameservice.userPlanetFindOne(find);
        console.log('🚀 ~ createUserAsset ~ userplanetdetails:', userplanetdetails);

        if (!userplanetdetails) {
            return sendRes(res, 409, false, 'Planet not found', {});
        }
        const asstdata = await gameservice.findAssetbyid(assetId);
        console.log('🚀 ~ createUserAsset ~ asstdata:', asstdata, asstdata?.asset_Name);

        // Validate build slot limit

        // const buildSlotTypes = (asstdata.buildSlotType || []).map(type => type.toUpperCase());
        // console.log("🚀 ~ createUserAsset ~ buildSlotTypes:", buildSlotTypes)

        // let placedSlotType = "";
        // let currentSlotCount = 0;

        // // Existing assets on this planet
        // const existingAssets = await gameservice.UserAssetList_service({
        //     userPlanetId: userplanetdetails._id,
        // });
        // console.log("🚀 ~ createUserAsset ~ existingAssets:", existingAssets)

        // for (const slotType of buildSlotTypes) {

        //     const slotConfig = (userplanetdetails.planetId.slots || []).find(
        //         slot => slot.type.toUpperCase() === slotType
        //     );
        //     console.log("🚀 ~ createUserAsset ~ slotConfig:", slotConfig)

        //     if (!slotConfig) {
        //         continue;
        //     }
        //     const extraSlot = (userplanetdetails.extraSlots || []).find(
        //         slot => slot.type.toUpperCase() === slotType)?.slot || 0;
        //     console.log("🚀 ~ createUserAsset ~ extraSlot:", extraSlot)

        //     const totalAllowedSlots = slotConfig.slot + extraSlot;
        //     console.log("🚀 ~ createUserAsset ~ totalAllowedSlots:", totalAllowedSlots)

        //     const occupiedSlots = existingAssets.filter(asset =>
        //         asset.placedSlotType?.toUpperCase() === slotType
        //     ).length;

        //     console.log("Slots__", slotType, occupiedSlots, totalAllowedSlots, occupiedSlots < totalAllowedSlots);

        //     if (occupiedSlots < totalAllowedSlots) {
        //         placedSlotType = slotType;
        //         currentSlotCount = occupiedSlots;
        //         break;
        //     }
        // }

        // if (!placedSlotType) {
        //     return sendRes(
        //         res,
        //         409,
        //         false,
        //         "No available slot for this building.",
        //         {}
        //     );
        // }

        // Validate build slot limit

        const buildSlotTypes = (asstdata.buildSlotType || []).map((type) => type.toUpperCase());

        console.log('Allowed buildSlotTypes:', buildSlotTypes);
        console.log('Frontend selected slotType:', slotType);

        let placedSlotType = '';
        let currentSlotCount = 0;

        // Existing assets on this planet
        const existingAssets = await gameservice.UserAssetList_service({
            userPlanetId: userplanetdetails._id,
        });
        console.log('🚀 ~ createUserAsset ~ existingAssets:', existingAssets);

        // If building supports multiple slots, frontend must select one
        if (buildSlotTypes.length > 1 && !slotType) {
            return sendRes(res, 409, false, 'Please select build slot type.', {});
        }

        // If frontend sends slotType validate it
        if (slotType) {
            console.log('condition 1 sends slottype');
            const selectedSlotType = slotType.toUpperCase();
            console.log(
                '🚀 ~ createUserAsset ~ selectedSlotType:',
                selectedSlotType,
                buildSlotTypes,
                !buildSlotTypes.includes(selectedSlotType),
            );
            if (!buildSlotTypes.includes(selectedSlotType)) {
                return sendRes(
                    res,
                    409,
                    false,
                    `${selectedSlotType} is not available for this building.`,
                    {},
                );
            }

            // const slotConfig = (userplanetdetails.planetId.slots || []).find(
            //     slot => slot.type.toUpperCase() === selectedSlotType
            // );
            const slotConfig = (userplanetdetails.planetId.slots || []).find((slot) =>
                selectedSlotType.includes(slot.type.toUpperCase()),
            );

            if (!slotConfig) {
                return sendRes(
                    res,
                    409,
                    false,
                    `${selectedSlotType} slot is not available on this planet.`,
                    {},
                );
            }

            const extraSlot =
                (userplanetdetails.extraSlots || []).find(
                    (slot) => slot.type.toUpperCase() === selectedSlotType,
                )?.slot || 0;

            const totalAllowedSlots = slotConfig.slot + extraSlot;
            console.log('🚀 ~ createUserAsset ~ totalAllowedSlots:', totalAllowedSlots);

            const occupiedSlots = existingAssets.filter(
                (asset) => asset.placedSlotType?.toUpperCase() === selectedSlotType,
            ).length;

            console.log(
                'Selected Slot Check:',
                selectedSlotType,
                occupiedSlots,
                totalAllowedSlots,
                occupiedSlots >= totalAllowedSlots,
            );

            if (occupiedSlots >= totalAllowedSlots) {
                return sendRes(
                    res,
                    409,
                    false,
                    `${selectedSlotType} slot limit reached. Maximum allowed is ${totalAllowedSlots}.`,
                    {},
                );
            }

            placedSlotType = selectedSlotType;
            currentSlotCount = occupiedSlots;
        } else {
            console.log('condition 2 not sends slottype');
            // Single slot buildings
            const selectedSlotType = buildSlotTypes[0];
            console.log('🚀 ~ createUserAsset ~ selectedSlotType:', selectedSlotType);

            // const slotConfig = (userplanetdetails.planetId.slots || []).find(
            //     slot => slot.type.toUpperCase() === selectedSlotType
            // );
            const slotConfig = (userplanetdetails.planetId.slots || []).find((slot) =>
                selectedSlotType.includes(slot.type.toUpperCase()),
            );
            console.log('🚀 ~ createUserAsset ~ slotConfig:', slotConfig);

            if (!slotConfig) {
                return sendRes(
                    res,
                    409,
                    false,
                    `${selectedSlotType} slot is not available on this planet.`,
                    {},
                );
            }

            const extraSlot =
                (userplanetdetails.extraSlots || []).find(
                    (slot) => slot.type.toUpperCase() === selectedSlotType,
                )?.slot || 0;
            console.log('🚀 ~ createUserAsset ~ extraSlot:', extraSlot);

            const totalAllowedSlots = slotConfig.slot + extraSlot;
            console.log('🚀 ~ createUserAsset ~ totalAllowedSlots:', totalAllowedSlots);

            const occupiedSlots = existingAssets.filter(
                (asset) => asset.placedSlotType?.toUpperCase() === selectedSlotType,
            ).length;
            console.log(
                'Selected Slot Check:',
                selectedSlotType,
                occupiedSlots,
                totalAllowedSlots,
                occupiedSlots >= totalAllowedSlots,
            );

            if (occupiedSlots >= totalAllowedSlots) {
                return sendRes(
                    res,
                    409,
                    false,
                    `${selectedSlotType} slot limit reached. Maximum allowed is ${totalAllowedSlots}.`,
                    {},
                );
            }
            placedSlotType = selectedSlotType;
            currentSlotCount = occupiedSlots;
        }

        console.log('Final placedSlotType:', placedSlotType);

        // const buildSlotType = (asstdata.buildSlotType || "").toUpperCase();
        // const buildSlotType = (asstdata.buildOnTypeSlot || []).map(type => type.toUpperCase());
        // console.log("🚀 ~ createUserAsset ~ buildSlotType:", buildSlotType)

        // let currentSlotCount

        // if (buildSlotType) {
        //     // Find slot configuration from the planet

        //     // const slotConfig = (userplanetdetails.planetId.slots || []).find(
        //     //     slot => slot.type.toUpperCase() === buildSlotType
        //     // );
        //     // const slotConfig = userplanetdetails.planetId.slots.find(
        //     //     slot => buildSlotType.includes(slot.type.toUpperCase())
        //     // );
        //     const slotConfig = userplanetdetails.planetId.slots.filter(
        //         slot => buildSlotType.includes(slot.type.toUpperCase())
        //     );
        //     console.log("🚀 ~ createUserAsset ~ slotConfig:", slotConfig)

        //     if (slotConfig.length === 0) {
        //         return sendRes(
        //             res,
        //             409,
        //             false,
        //             `No valid slot is available for this building.`,
        //             // `${buildSlotType} slot is not available on this planet.`,
        //             {}
        //         );
        //     }

        //     // Existing assets on this planet
        //     const existingAssets = await gameservice.UserAssetList_service({
        //         userPlanetId: userplanetdetails._id,
        //     });

        //     let occupiedSlots = 0;

        //     for (const item of existingAssets) {
        //         const assetDetails = item.assetId;
        //         console.log("🚀 ~ createUserAsset ~ assetDetails:", assetDetails)

        //         if (
        //             assetDetails &&
        //             assetDetails.buildOnTypeSlot &&
        //             assetDetails.buildOnTypeSlot.some(type =>
        //                 buildSlotType.includes(type.toUpperCase())
        //             )

        //         ) {
        //             occupiedSlots++;
        //         }
        //     }

        //     currentSlotCount = occupiedSlots;

        //     // Get extra slots from userPlanet
        //     // const extraSlotConfig = (userplanetdetails.extraSlots || []).find(
        //     //     slot => slot.type.toUpperCase() === buildSlotType
        //     // );
        //     const extraSlotConfig = (userplanetdetails.extraSlots || []).find(
        //         slot => buildSlotType.includes(slot.type.toUpperCase())
        //     );

        //     const extraSlots = extraSlotConfig ? extraSlotConfig.slot : 0;
        //     console.log("🚀 ~ createUserAsset ~ extraSlots:", extraSlots)
        //     // Total allowed slots
        //     // const totalAllowedSlots = slotConfig.slot + extraSlots;
        //     let totalAllowedSlots = 0;

        //     for (const slotConfigs of slotConfig) {
        //         const extraSlot =
        //             (userplanetdetails.extraSlots || []).find(
        //                 slot => slot.type.toUpperCase() === slotConfigs.type.toUpperCase()
        //             )?.slot || 0;

        //         totalAllowedSlots += slotConfigs.slot + extraSlot;
        //     }
        //     console.log("🚀 ~ createUserAsset ~ totalAllowedSlots:", totalAllowedSlots)

        //     console.log("🚀 ~ createUserAsset ~ occupiedSlots:", occupiedSlots, occupiedSlots >= totalAllowedSlots)
        //     if (occupiedSlots >= totalAllowedSlots) {
        //         return sendRes(
        //             res,
        //             409,
        //             false,
        //             `Slot limit reached. Maximum allowed is ${totalAllowedSlots}.`,
        //             {}
        //         );
        //     }
        // }

        // ---------------------------- validation for build limit
        const dataType = userplanetdetails.type; // planettype planet or asteroid
        const dataRarity = userplanetdetails.rarity; // rare , common , uncommon
        // concat type and rarity for get the build limit
        const newval = `${dataType === 'planet' ? 'planet' : 'asteroid'}${dataRarity === 'common' ? 'common' : dataRarity === 'uncommon' ? 'uncommon' : 'rare'}`;
        // build limit for the type and rarity
        const limit = asstdata[newval];
        // find the user created existing assent
        const existingbuilds = await gameservice.UserAssetList_service({
            userPlanetId: userplanetdetails._id,
            assetId: asstdata._id,
        });
        const buildcount = existingbuilds.length;
        // check the build limit
        if (limit === buildcount) {
            return sendRes(res, 409, false, 'Build limit reached', {});
        }
        ///----------------------------------------------
        let nextlvl = await gameservice.findOneleveldb_service({
            // asset_Name: asstdata?.asset_Name,
            assetId: asstdata._id,
            level: 2,
        });
        console.log('🚀 ~ createUserAsset ~ nextlvl:', nextlvl);
        const time = Date.now();
        const endtime = add_minutes(time, currlvl?.build_time_min);

        const createdata = {
            assetId: assetId,
            x: x,
            y: y,
            build_Number: build_Number,
            planetId: userplanetdetails.planetId,
            asset_Name: asstdata?.asset_Name,
            startTime: time,
            endTime: pricetype === 'cost' ? endtime : time, // option cost get the building instant
            buildStatus: false,
            nextClaim:
                currlvl?.dailyConsumption.length === 0
                    ? pricetype === 'cost'
                        ? endtime
                        : time
                    : null, // if dailyConsumption is empty then nextClaim will auto reward generate
            // nextClaim: price.length == 0 ? time : pricetype === 'cost' ? endtime : time,
            levelId: currlvl?._id,
            next: nextlvl?._id,
            reward: currlvl?.reward,
            dailyConsumption: currlvl?.dailyConsumption,
            AttackPoints: currlvl?.AttackPoints,
            HullPoints: currlvl?.HullPoints,
            userPlanetId: userplanetdetails._id,
            placedSlotType: placedSlotType,
            isBuilding: asstdata.isBuilding,
        };
        if (currlvl?.dailyConsumption.length === 0) {
            createdata.startProduction = cost.length == 0 ? time : endtime;
            createdata.endProduction = cost.length == 0 ? time : endtime;
        }

        await gameservice.createUserAsset_service(createdata);

        // Add extra LAND slots for Megastructure
        const isMegaStructure = buildSlotTypes.includes('SUN');
        const megaStructures = ['RINGWORLD', 'DYSON SPHERE'];
        if (isMegaStructure && megaStructures.includes(asstdata.asset_Name.toUpperCase())) {
            const sunLimit = userplanetdetails.planetId.slots.find(
                (x) => x.type.toUpperCase() === 'SUN',
            );
            console.log('🚀 ~ createUserAsset ~ sunLimit:', sunLimit);

            // only add extra if SUN is not exceeded
            if (sunLimit && currentSlotCount < sunLimit.slot) {
                await gameservice.updateUserPlanet(
                    {
                        _id: userplanetdetails._id,
                    },
                    {
                        $inc: {
                            'extraSlots.$[land].slot': 5,
                        },
                    },
                    {
                        arrayFilters: [
                            {
                                'land.type': 'LAND',
                            },
                        ],
                    },
                );
            }
        }

        const resultfind = await gameservice.UserAssetFindOne_service({
            build_Number: build_Number,
            userPlanetId: userplanetdetails._id,
        });
        console.log('🚀 ~ createUserAsset ~ resultfind:', resultfind);

        // let cost = price;

        let dataforbulkwirte = [];

        for (let i = 0; i < cost.length; i++) {
            let data = cost[i];
            let a = {
                updateOne: {
                    filter: { label: data.label, walletAddress: walletAddress },
                    update: { $inc: { balance: -Number(data.amount) } },
                },
            };
            dataforbulkwirte.push(a);
        }

        const resultchnage = await userService.bulkwriteuserCurrency_service(dataforbulkwirte);

        await userService.addpriceinadminCurrency_service(cost);

        resultfind.levelId.image_url = resultfind.levelId.image
            ? signature_imageURL(resultfind.levelId.image)
            : null;

        if (resultfind.next) {
            resultfind.next.image_url = resultfind.next.image_url
                ? signature_imageURL(resultfind.next.image_url)
                : null;
        }

        sendRes(res, 201, true, 'created successfully', resultfind);
    } catch (error) {
        logger.info(error);
        return sendRes(res, 500, false, error.message, {});
    }
};

export const UserAssetList = async (req, res) => {
    try {
        // const { walletAddress , planetId } = req.query
        const { userPlanetId } = req.query;
        const { userData } = req;

        // const userPlanetData = await gameservice.userPlanetFindOne({
        //     _id: userPlanetId,
        // });

        const find_data = {
            userPlanetId: userPlanetId,
            // isInventory: false,
        };

        const userAsset = await gameservice.UserAssetList_service_game(find_data);

        userAsset.forEach((element) => {
            element.levelId.image_url = signature_imageURL(element.levelId.image);

            if (element.next) {
                element.next.image_url = signature_imageURL(element.next.image);
            }
        });

        // const equiedShips = await gameservice.UserShip_Service({ equippedPlanet: userPlanetId });
        // if (equiedShips.length) {
        //     equiedShips.forEach((element) => {
        //         element.shipId.image_url = signature_imageURL(element.shipId?.image);
        //     });
        // }

        const data = {
            userAsset: userAsset,
            // equippedShips: equiedShips,
        };

        sendRes(res, 200, true, 'success', data);
    } catch (error) {
        return sendRes(res, 500, false, error.message, {});
    }
};

/**
 * api : /game/userassetlevelup
 * method : post
 * Updates the user's asset level based on the provided request body.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.build_Number - The build number of the asset.
 * @param {string} req.body.planetId - The ID of the planet.
 * @param {string} req.body.assetId - The ID of the asset.
 * @param {Object} req.userData - The user data.
 * @param {string} req.userData.WalletAddress - The wallet address of the user.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} The updated asset level.
 *       pricetype  =  "cost" or  "optionalCost"
 * nextAssetId ->nextLevelId
 */

// export const UserAssetLevelUp = async (req, res) => {
//     try {
//         const { build_Number, planetId, nextLevelId, pricetype, optionalCost } = req.body;
//         const { userData, userId } = req;

//         const walletAddress = userData.WalletAddress.toLowerCase();

//         const nextlvldetails = await gameservice.LevelfindById(nextLevelId);
//         if (!nextlvldetails) {
//             return sendRes(res, 409, false, 'not valid nextLevelId');
//         }

//         // Get current building
//         const currentBuilding = await gameservice.UserAssetFindOne_service({
//             build_Number,
//         });
//         console.log("currentBuilding", currentBuilding)
//         if (!currentBuilding) {
//             return sendRes(res, 409, false, 'Building not found');
//         }

//         // Level limit validation
//         const assetData = await gameservice.findAssetOne({
//             _id: currentBuilding.assetId
//         });
//         console.log("assetData", assetData)
//         if (currentBuilding?.levelId?.level >= assetData.levelLimit) {
//             return sendRes(
//                 res,
//                 409,
//                 false,
//                 `Maximum level reached. ${assetData.asset_Name} building can only be upgraded up to level ${assetData.levelLimit}.`
//             );
//         }

//         if (currentBuilding?.endProduction > new Date()) {
//             return sendRes(
//                 res,
//                 409,
//                 false,
//                 'Building cannot be upgraded while production is in progress.'
//             );
//         }

//         // Skip validation for Colony HQ itself
//         if (currentBuilding.asset_Name !== 'COLONY HQ') {
//             const colonyHQ = await gameservice.UserAssetFindOne_service({
//                 userPlanetId: currentBuilding.userPlanetId,
//                 asset_Name: 'COLONY HQ',
//                 isActive: true,
//             });
//             console.log("colonyHQ", colonyHQ)

//             if (!colonyHQ) {
//                 return sendRes(res, 409, false, 'Colony HQ not found');
//             }
//             console.log("condition", nextlvldetails?.level, colonyHQ?.levelId?.level, nextlvldetails?.level > colonyHQ?.levelId?.level)
//             // Building cannot exceed Colony HQ level
//             if (nextlvldetails?.level > colonyHQ?.levelId?.level) {
//                 return sendRes(
//                     res,
//                     409,
//                     false,
//                     `Upgrade not allowed. Colony HQ must be level ${nextlvldetails.level} or higher.`
//                 );
//             }
//         }

//         const type = pricetype;

//         if (!(type === 'cost' || type === 'optionalCost')) {
//             return sendRes(res, 409, false, 'Need to select pricetype');
//         }

//         // let price = [];

//         // price = nextlvldetails[pricetype];
//         let cost = [];

//         if (type === "cost") {
//             cost = nextlvldetails.cost || [];
//         } else {
//             cost = optionalCost || [];
//         }

//         // validation for have balance
//         const status = await checkforenounghbalance(cost, walletAddress);
//         if (!status.status) {
//             return sendRes(res, 409, false, status.message);
//         }

//         // const asstdata = await findAssetbyid(nextAssetId)
//         // const nextlvl = await findAssetOne({ asset_name : asstdata?.asset_Name , level : asstdata?.level + 1})
//         // const nextlvldetailsnextlvl = await gameservice.LevelfindById(nextLevelId)

//         let newreward = nextlvldetails.reward;
//         let coons = nextlvldetails.dailyConsumption;

//         // let newreward =[]
//         // creating for next reward
//         // for(let i = 0 ; i < asstdata?.reward?.reward.length ; i++){
//         //     let data = asstdata?.reward?.reward[i]
//         //     let newdata = {
//         //       label : data?.label ,
//         //       amount : data?.amount * Math.pow(  GameValue[0].rewardTimes  , asstdata.level -1 )
//         //     }
//         //     newreward.push(newdata)
//         // }

//         // let coons =[]
//         // for(let i = 0 ; i < asstdata?.price.dailyConsumption.length ; i++){
//         //     let data = asstdata?.price.dailyConsumption[i];
//         //     let newdata = {
//         //       label : data.label ,
//         //       amount : data.amount * Math.pow(  GameValue[0].rewardTimes  , asstdata.level -1)
//         //     }
//         //     coons.push(newdata)
//         // }

//         const time = Date.now();
//         const nextlvldetailsnextlvl = await gameservice.findOneleveldb_service({
//             assetId: nextlvldetails?.assetId,
//             level: nextlvldetails?.level + 1,
//         });

//         const update = {
//             levelId: nextlvldetails._id,
//             level: nextlvldetails.level,
//             startTime: time,
//             endTime: type === 'cost' ? add_minutes(time, nextlvldetails?.build_time_min) : time,
//             buildStatus: false,
//             next: nextlvldetailsnextlvl ? nextlvldetailsnextlvl._id : null,
//             reward: newreward,
//             dailyConsumption: coons,
//         };

//         // for price deduction
//         // let cost = price;
//         let dataforbulkwirte = [];
//         let CurrentassetPrice = cost;

//         for (let i = 0; i < CurrentassetPrice.length; i++) {
//             let data = CurrentassetPrice[i];
//             let a = {
//                 updateOne: {
//                     filter: { label: data.label, walletAddress: walletAddress },
//                     update: { $inc: { balance: - Number(data.amount) } },
//                 },
//             };
//             dataforbulkwirte.push(a);
//         }

//         const resultchnage = await userService.bulkwriteuserCurrency_service(dataforbulkwirte);
//         const result = await gameservice.updateUserAsset({ build_Number: build_Number }, update);
//         // add the price into admin currency
//         await userService.addpriceinadminCurrency_service(CurrentassetPrice);
//         const resultfind = await gameservice.UserAssetFindOne_service({
//             build_Number: build_Number,
//         });

//         resultfind.levelId.image_url = resultfind.levelId.image
//             ? signature_imageURL(resultfind.levelId.image)
//             : null;

//         if (resultfind.next) {
//             resultfind.next.image_url = resultfind.next.image_url
//                 ? signature_imageURL(resultfind.next.image_url)
//                 : null;
//         }

//         return sendRes(res, 200, result ? true : false, result ? 'success' : 'failed', resultfind);
//     } catch (error) {
//         console.log('userAseetLevel_error', error);
//         return sendRes(res, 500, false, error.message, {});
//     }
// };

export const UserAssetLevelUp = async (req, res) => {
    try {
        const { build_Number, planetId, nextLevelId, pricetype, optionalCost } = req.body;
        const { userData, userId } = req;

        const walletAddress = userData.WalletAddress.toLowerCase();

        const nextlvldetails = await gameservice.LevelfindById(nextLevelId);
        if (!nextlvldetails) {
            return sendRes(res, 409, false, 'Not valid nextLevelId');
        }

        // Get current building
        const currentBuilding = await gameservice.UserAssetFindOne_service({
            build_Number,
        });
        console.log('currentBuilding', currentBuilding);
        if (!currentBuilding) {
            return sendRes(res, 409, false, 'Building not found');
        }

        // Level limit validation
        const assetData = await gameservice.findAssetOne({
            _id: currentBuilding.assetId,
        });
        console.log('assetData', assetData);
        if (currentBuilding?.levelId?.level >= assetData.levelLimit) {
            return sendRes(
                res,
                409,
                false,
                `Maximum level reached. ${assetData.asset_Name} building can only be upgraded up to level ${assetData.levelLimit}.`,
            );
        }

        // if (currentBuilding?.endProduction > new Date()) {
        //     return sendRes(
        //         res,
        //         409,
        //         false,
        //         'Building cannot be upgraded while production is in progress.'
        //     );
        // }

        // const isColonyHQ = currentBuilding.asset_Name === "COLONY HQ";

        const isNoConsumptionBuilding =
            !currentBuilding.dailyConsumption ||
            currentBuilding.dailyConsumption.length === 0 ||
            currentBuilding.dailyConsumption.every((item) => Number(item.amount) === 0);

        const now = new Date();
        let rewardClaimed = null;
        let updateuserAsset = {};
        if (
            !isNoConsumptionBuilding &&
            currentBuilding?.endProduction &&
            currentBuilding.endProduction > now
        ) {
            return sendRes(
                res,
                409,
                false,
                'Building cannot be upgraded while production is in progress.',
            );
        }
        // Special handling only for Colony HQ, Space Acrology, Residential Acrology
        else if (
            isNoConsumptionBuilding &&
            currentBuilding?.endProduction &&
            currentBuilding.endProduction > now
        ) {
            const startTime = new Date(currentBuilding.startProduction);
            const endTime = new Date(currentBuilding.endProduction);
            console.log('startTime', startTime, 'endTime', endTime, 'now', now);
            const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            console.log('totalMinutes', totalMinutes);
            const producedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
            console.log('producedMinutes', producedMinutes);
            const totalProductionMs = endTime.getTime() - startTime.getTime();
            console.log('totalProductionMs', totalProductionMs);
            const totalProductionDays = totalProductionMs / (1000 * 60 * 60 * 24);
            console.log('totalProductionDays', totalProductionDays);
            const productionRatio = Math.max(0, Math.min(producedMinutes / totalMinutes, 1));
            console.log('productionRatio', productionRatio);
            // Calculate partial reward
            const reward = currentBuilding.reward.map((item) => ({
                label: item.label,
                amount: new BigNumber(item.amount).multipliedBy(productionRatio).toString(),
            }));
            rewardClaimed = reward;

            console.log('Partial reward calculated:', reward);
            const gameValue = await get_GameValues();

            const dataforbulkwirte = [];
            const refferalreward = [];
            const rewculateboth = [];
            let reffere = [];

            // Build reward operations
            for (let i = 0; i < reward.length; i++) {
                let r = reward[i];

                // User reward update
                dataforbulkwirte.push({
                    updateOne: {
                        filter: { label: r.label, walletAddress },
                        update: { $inc: { balance: Number(r.amount) } },
                    },
                });

                // Referral reward
                const isValidRefferal = await userService.isValidReferredBy(
                    userData?.WalletAddress,
                    userData?.refferedBy?.WalletAddress,
                );

                if (isValidRefferal) {
                    const refAmt = calculateRewardforRefferedUser(
                        r.amount,
                        gameValue.refferal_Percent,
                    );

                    refferalreward.push({
                        updateOne: {
                            filter: {
                                label: r.label,
                                walletAddress: userData?.refferedBy?.WalletAddress,
                            },
                            update: { $inc: { balance: Number(refAmt) } },
                        },
                    });

                    rewculateboth.push({
                        label: r.label,
                        amount: Number(refAmt) + Number(r.amount),
                    });

                    reffere.push({
                        label: r.label,
                        amount: Number(refAmt),
                    });
                }
            }

            const upgradeEndTime =
                pricetype === 'cost' ? add_minutes(now, nextlvldetails.build_time_min) : now;
            console.log(
                '🚀 ~ UserAssetLevelUp ~ upgradeEndTime:',
                nextlvldetails.build_time_min,
                now,
                upgradeEndTime,
            );

            const productionDays = nextlvldetails.level * 7;
            const endtimer = new Date(
                upgradeEndTime.getTime() + productionDays * 24 * 60 * 60 * 1000,
            );
            console.log('🚀 ~ UserAssetLevelUp ~ endtimer:', endtimer, now);

            updateuserAsset = {
                startTime: now,
                endTime: upgradeEndTime,
                startProduction: upgradeEndTime,
                endProduction: endtimer,
                nextClaim: endtimer,
            };

            // ---------------- REFERRAL FLOW ------------------

            const isValidRefferal = await userService.isValidReferredBy(
                userData?.WalletAddress,
                userData?.refferedBy?.WalletAddress,
            );

            if (isValidRefferal) {
                await Promise.all([
                    userService.bulkwriteuserCurrency_service(refferalreward),

                    TranscationService({
                        from: userData?.WalletAddress,
                        to: userData?.refferedBy?.WalletAddress,
                        price: reward,
                        userassetId: userData?.refferedBy?._id,
                        action: CONSTANTS.TRANSACTION_TYPE.REFFERAL_REWARD,
                    }),

                    addpriceCurrencyinCirculate_service(rewculateboth),

                    userService.bulkwriteuserCurrency_service(dataforbulkwirte),

                    TranscationService({
                        from: '',
                        to: userData?.WalletAddress,
                        price: reward,
                        userassetId: currentBuilding._id,
                        action: CONSTANTS.TRANSACTION_TYPE.CLAIM_REWARD,
                    }),
                ]);
            } else {
                await Promise.all([
                    addpriceCurrencyinCirculate_service(reward),

                    // gameservice.updateUserAsset({ build_Number: build_Number }, updateuserAsset),

                    userService.bulkwriteuserCurrency_service(dataforbulkwirte),

                    TranscationService({
                        from: '',
                        to: userData?.WalletAddress,
                        price: reward,
                        userassetId: currentBuilding._id,
                        action: CONSTANTS.TRANSACTION_TYPE.CLAIM_REWARD,
                    }),
                ]);
            }
        }

        // Skip validation for Colony HQ itself
        if (currentBuilding.asset_Name !== 'COLONY HQ') {
            const colonyHQ = await gameservice.UserAssetFindOne_service({
                userPlanetId: currentBuilding.userPlanetId,
                asset_Name: 'COLONY HQ',
                isActive: true,
            });
            console.log('colonyHQ', colonyHQ);

            if (!colonyHQ) {
                return sendRes(res, 409, false, 'Colony HQ not found');
            }
            console.log(
                'condition',
                nextlvldetails?.level,
                colonyHQ?.levelId?.level,
                nextlvldetails?.level > colonyHQ?.levelId?.level,
            );
            // Building cannot exceed Colony HQ level
            if (nextlvldetails?.level > colonyHQ?.levelId?.level) {
                return sendRes(
                    res,
                    409,
                    false,
                    `Upgrade not allowed. Colony HQ must be level ${nextlvldetails.level} or higher.`,
                );
            }
        }

        const type = pricetype;

        if (!(type === 'cost' || type === 'optionalCost')) {
            return sendRes(res, 409, false, 'Need to select pricetype');
        }

        // let price = [];

        // price = nextlvldetails[pricetype];
        let cost = [];

        if (type === 'cost') {
            cost = nextlvldetails.cost || [];
        } else {
            cost = optionalCost || [];
        }

        // validation for have balance
        const status = await checkforenounghbalance(cost, walletAddress);
        if (!status.status) {
            return sendRes(res, 409, false, status.message);
        }

        let newreward = nextlvldetails.reward;
        let coons = nextlvldetails.dailyConsumption;

        // const time = Date.now();
        const nextlvldetailsnextlvl = await gameservice.findOneleveldb_service({
            assetId: nextlvldetails?.assetId,
            level: nextlvldetails?.level + 1,
        });

        const update = {
            levelId: nextlvldetails._id,
            level: nextlvldetails.level,
            // startTime: time,
            // endTime: type === 'cost' ? add_minutes(time, nextlvldetails?.build_time_min) : time,
            buildStatus: false,
            next: nextlvldetailsnextlvl ? nextlvldetailsnextlvl._id : null,
            reward: newreward,
            dailyConsumption: coons,
            // Default values for all buildings
            startTime: now,
            endTime: type === 'cost' ? add_minutes(now, nextlvldetails.build_time_min) : now,

            // Override only for Colony HQ
            ...updateuserAsset,
        };

        // for price deduction
        let dataforbulkwirte = [];
        let CurrentassetPrice = cost;

        for (let i = 0; i < CurrentassetPrice.length; i++) {
            let data = CurrentassetPrice[i];
            let a = {
                updateOne: {
                    filter: { label: data.label, walletAddress: walletAddress },
                    update: { $inc: { balance: -Number(data.amount) } },
                },
            };
            dataforbulkwirte.push(a);
        }

        const resultchnage = await userService.bulkwriteuserCurrency_service(dataforbulkwirte);
        const result = await gameservice.updateUserAsset({ build_Number: build_Number }, update);
        // add the price into admin currency
        await userService.addpriceinadminCurrency_service(CurrentassetPrice);
        const resultfind = await gameservice.UserAssetFindOne_service({
            build_Number: build_Number,
        });

        resultfind.levelId.image_url = resultfind.levelId.image
            ? signature_imageURL(resultfind.levelId.image)
            : null;

        if (resultfind.next) {
            resultfind.next.image_url = resultfind.next.image_url
                ? signature_imageURL(resultfind.next.image_url)
                : null;
        }
        let data = {
            buildingData: resultfind,
            rewardData: rewardClaimed,
        };

        return sendRes(res, 200, result ? true : false, result ? 'success' : 'failed', data);
    } catch (error) {
        console.log('userAseetLevel_error', error);
        return sendRes(res, 500, false, error.message, {});
    }
};

export const PlanetList = async (req, res) => {
    try {
        const {
            query: { page },
        } = req;

        const limit = 12;
        let skip = page == 1 ? 0 : page * limit;
        const result = await gameservice.getPlanetList(skip, limit);
        result.forEach((element) => {
            element.image_url = signature_imageURL(element.image);
        });

        sendRes(res, 200, true, 'fetched', result);
    } catch (error) {
        return sendRes(res, 500, false, error.message, {});
    }
};

/**
 * Initializes the IPFS process for creating and minting NFTs.
 *
 * @param {Object} req - The request object containing the planetId, WalletAddress, and userid.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the IPFS process is completed.
 */
export const initipfs = async (req, res) => {
    try {
        const {
            body: { planetId },
            userData,
        } = req;
        const walletAddress = userData.WalletAddress;
        const planetdata = await gameservice.findBYPlanetID(planetId);
        const NFTIpfs = await uploadAndGenerateUrl({
            item: 'img',
            path: GetOriginalImage(planetdata.image),
        });

        if (!NFTIpfs) {
            return sendRes(res, 400, false, 'Uploaded Failed', {});
        }

        const JSOnpat = generateMetaStoreFilePath(walletAddress);
        // const NewName = await nftService.getNextName(planetdata?.name);
        const NewName = planetdata?.name;

        const payload = {
            names: NewName,
            description: planetdata?.description,
            image: CONFIG.IPFS_IMG + NFTIpfs,
            attributes: [],
            gameAssets: [],
        };

        const timestamp = Date.now();
        const key = JSOnpat;
        const senddata = JSON.stringify(payload);
        // const savedins = await uploadImageToS3(key, senddata, 'text/plain');
        const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');

        if (savedins.status) {
            const MetaData = await ipfs_add_for_meta(savedins.key); // get the s3 data with key  and save in ipfs
            const isCheckForFirstTimeCreator = await checkFirstBuy({ walletAddress });
            const gameValues = await get_GameValues();

            if (isCheckForFirstTimeCreator) {
                // first time buyer

                let payloadForShip = {
                    shipId: gameValues.freeShipId,
                    walletAddress: walletAddress,
                    userData: userData,
                    type: 'ship',
                };

                let payloadForCrew = {
                    crewData: gameValues.freeCrewId,
                    walletAddress: walletAddress,
                    userData: userData,
                    type: 'crew',
                };

                const [crewmeta, shipmeta] = await Promise.all([
                    SettingCrewMetaData(payloadForCrew),
                    SettingShipMetaData(payloadForShip),
                ]);

                const datapayloadforairdrop = {
                    metadatas: [MetaData, crewmeta.metadata, shipmeta.metadata],
                    price: [planetdata.price ?? 0, 0, 0],
                    collection: [
                        planetdata.collectionId.CollectionContractAddress,
                        crewmeta.collection,
                        shipmeta.collection,
                    ],
                    ipfs: [NFTIpfs, crewmeta.ipfs, shipmeta.ipfs],
                    // dont changes
                    planet: planetdata,
                    image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
                    MetaData: MetaData,
                    metaKey: savedins.Key,
                    names: [NewName, crewmeta.name, shipmeta.name],
                };

                return sendRes(res, 200, true, 'airdrop', datapayloadforairdrop);
            }

            if (MetaData) {
                return sendRes(res, 200, true, 'metafile created ready to mint', {
                    planet: planetdata,
                    image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
                    MetaData: getMetaDataKey(savedins.Key),
                    metaKey: savedins.Key,
                    names: [NewName], // array with single name or multiple names same for airdrop and others
                });
            }
        }

        sendRes(res, 400, false, 'Uploaded Failed', {});
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const deletalluserasset = async (req, res) => {
    try {
        const { walletAddress, planetId } = req.body;
        const created = await gameservice.userAssetsdbdelete({
            walletAddress: walletAddress,
            planetId: planetId,
        });

        sendRes(res, 201, created ? true : false, 'deleted', created);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const deleteassetbyuserplanet = async (req, res) => {
    try {
        const {
            body: { userPlanetId },
        } = req;
        const data = await gameservice.DeleteUserAsset({ userPlanetId: userPlanetId });
        sendRes(res, 200, 'deleted', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};
/**
 * Asynchronously claims rewards for a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} A Promise that resolves with the claimed result.
 */
export const claimBuildingreward = async (req, res) => {
    try {
        const { userData } = req;
        const { build_Number } = req.body;
        const gameValue = await get_GameValues();
        if (!build_Number) {
            return sendRes(res, 400, false, 'Building number not found', null);
        }

        const walletAddress = userData?.WalletAddress;

        // Always use a real Date object
        let time = new Date();

        // Fetch building
        const data = await gameservice.getOnebultingdata({ build_Number: build_Number });
        console.log('🚀 ~ claimBuildingreward ~ data:', data);

        if (!data) return sendRes(res, 400, false, 'No building available', null);

        if (!data.nextClaim) return sendRes(res, 400, false, 'No claim available', null);
        // if (data.nextClaim > time) {
        //     return sendRes(res, 400, false, 'Wait for claim', null);
        // }

        // Use Date instead of timestamp — FIXED
        // time = new Date();

        let reward = data.reward;
        let consumptionRefund = [];

        console.log(
            'data_endProduction',
            data.endProduction,
            'time',
            time,
            data.endProduction && time < new Date(data.endProduction),
        );
        // If production is not completed, calculate proportional reward
        if (data.endProduction && time < new Date(data.endProduction)) {
            console.log('Calculating proportional reward...', time < new Date(data.endProduction));
            const startTime = new Date(data.startProduction);
            const endTime = new Date(data.endProduction);
            console.log('startTime', startTime, 'endTime', endTime, 'time', time);
            const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            console.log('totalMinutes', totalMinutes);
            const producedMinutes = (time.getTime() - startTime.getTime()) / (1000 * 60);
            console.log('producedMinutes', producedMinutes);
            const totalProductionMs = endTime.getTime() - startTime.getTime();
            console.log('totalProductionMs', totalProductionMs);
            const totalProductionDays = totalProductionMs / (1000 * 60 * 60 * 24);
            console.log('totalProductionDays', totalProductionDays);
            const productionRatio = Math.max(0, Math.min(producedMinutes / totalMinutes, 1));
            console.log('productionRatio', productionRatio);
            // Calculate partial reward

            // reward = data.reward.map((item) => ({
            //     label: item.label,
            //     amount: Math.floor(item.amount * productionRatio),
            // }));

            // // Refund unused consumables
            // consumptionRefund = data.dailyConsumption.map((item) => ({
            //     label: item.label,
            //     amount:
            //         item.amount -
            //         Math.floor(item.amount * productionRatio),
            // }));

            reward = data.reward.map((item) => ({
                label: item.label,
                amount: new BigNumber(item.amount).multipliedBy(productionRatio).toString(),
            }));

            consumptionRefund = data.dailyConsumption.map((item) => {
                const totalConsumption = new BigNumber(item.amount).multipliedBy(
                    totalProductionDays,
                );
                console.log('totalConsumption', totalConsumption.toString());
                const consumed = totalConsumption.multipliedBy(productionRatio);
                console.log('consumed', consumed.toString());

                return {
                    label: item.label,
                    amount: totalConsumption.minus(consumed).toString(),
                };
            });

            console.log(
                'Partial reward calculated:',
                reward,
                'Consumption refund:',
                consumptionRefund,
            );
        }

        const dataforbulkwirte = [];
        const refferalreward = [];
        const rewculateboth = [];
        let reffere = [];

        // Build reward operations
        for (let i = 0; i < reward.length; i++) {
            let r = reward[i];

            // User reward update
            dataforbulkwirte.push({
                updateOne: {
                    filter: { label: r.label, walletAddress },
                    update: { $inc: { balance: Number(r.amount) } },
                },
            });

            // Referral reward
            const isValidRefferal = await userService.isValidReferredBy(
                userData?.WalletAddress,
                userData?.refferedBy?.WalletAddress,
            );
            console.log('🚀 ~ claimBuildingreward ~ isValidRefferal:', isValidRefferal);

            if (isValidRefferal) {
                const refAmt = calculateRewardforRefferedUser(r.amount, gameValue.refferal_Percent);
                console.log('🚀 ~ claimBuildingreward ~ refAmt:', refAmt);

                refferalreward.push({
                    updateOne: {
                        filter: {
                            label: r.label,
                            walletAddress: userData?.refferedBy?.WalletAddress,
                        },
                        update: { $inc: { balance: Number(refAmt) } },
                    },
                });

                rewculateboth.push({
                    label: r.label,
                    amount: Number(refAmt) + Number(r.amount),
                });

                reffere.push({
                    label: r.label,
                    amount: Number(refAmt),
                });
            }
        }

        // Refund unused daily consumables to the user
        for (const item of consumptionRefund) {
            dataforbulkwirte.push({
                updateOne: {
                    filter: {
                        label: item.label,
                        walletAddress,
                    },
                    update: {
                        $inc: {
                            balance: Number(item.amount),
                        },
                    },
                },
            });
        }

        let updateuserAsset = {};

        // If no daily consumption — set next production cycle
        if (
            !data.dailyConsumption ||
            data.dailyConsumption.length === 0 ||
            data.dailyConsumption.every((item) => Number(item.amount) === 0)
        ) {
            // const endtimer = add_minutes(time, Number(gameValue.production_time_in_min)); // FIXED (time is Date now)
            const currentLevel = data.levelId.level;
            const productionDays = currentLevel * 7;

            const endtimer = new Date(time.getTime() + productionDays * 24 * 60 * 60 * 1000);

            updateuserAsset = {
                startProduction: time,
                endProduction: endtimer,
                nextClaim: endtimer,
            };
        } else {
            updateuserAsset = { lastClaim: time, nextClaim: null, endProduction: time };
        }

        // ---------------- REFERRAL FLOW ------------------
        const isValidRefferal = await userService.isValidReferredBy(
            userData?.WalletAddress,
            userData?.refferedBy?.WalletAddress,
        );
        console.log('🚀 ~ claimBuildingreward ~ isValidRefferal:', isValidRefferal);

        if (isValidRefferal) {
            const [a, b, c, updatedclaim, e, f] = await Promise.all([
                userService.bulkwriteuserCurrency_service(refferalreward),

                TranscationService({
                    from: userData?.WalletAddress,
                    to: userData?.refferedBy?.WalletAddress,
                    price: reward,
                    userassetId: userData?.refferedBy?._id,
                    action: CONSTANTS.TRANSACTION_TYPE.REFFERAL_REWARD,
                }),

                addpriceCurrencyinCirculate_service(rewculateboth),

                gameservice.updateUserAsset({ build_Number: build_Number }, updateuserAsset),

                userService.bulkwriteuserCurrency_service(dataforbulkwirte),

                TranscationService({
                    from: '',
                    to: userData?.WalletAddress,
                    price: reward,
                    userassetId: data._id,
                    action: CONSTANTS.TRANSACTION_TYPE.CLAIM_REWARD,
                }),
            ]);

            const response = updatedclaim.toObject ? updatedclaim.toObject() : { ...updatedclaim };

            response.reward = reward;
            response.dailyConsumption = consumptionRefund;

            return sendRes(res, 200, true, 'claimed', response);
        }

        // ---------------- NORMAL CLAIM FLOW ------------------
        const [a, updatedclaim, c, d] = await Promise.all([
            addpriceCurrencyinCirculate_service(reward),

            gameservice.updateUserAsset({ build_Number: build_Number }, updateuserAsset),

            userService.bulkwriteuserCurrency_service(dataforbulkwirte),

            TranscationService({
                from: '',
                to: userData?.WalletAddress,
                price: reward,
                userassetId: data._id,
                action: CONSTANTS.TRANSACTION_TYPE.CLAIM_REWARD,
            }),
        ]);

        const response = updatedclaim.toObject ? updatedclaim.toObject() : { ...updatedclaim };

        response.reward = reward;
        response.dailyConsumption = consumptionRefund;

        console.log('Claim response:', response);

        return sendRes(res, 200, true, 'claimed', response);
    } catch (error) {
        logger.error(error);
        console.log('claimBuildingreward_err', error);
        return sendRes(res, 500, false, 'failed to claim', error.message);
    }
};

export const useConsumabels = async (req, res) => {
    try {
        const { build_Number, days } = req.body;
        const { userData } = req;
        console.log('useConsumabels', build_Number, days);
        const requestedDays = Number(days);
        if (!Number.isInteger(requestedDays) || requestedDays < 1) {
            return sendRes(res, 400, false, 'Production duration must be at least 1 day.');
        }

        // service from user.service
        const userWalletAddress = userData.WalletAddress;
        const balance = await userService.findinuserCurrency({ walletAddress: userWalletAddress });
        const buildingData = await gameservice.getOnebultingdata({ build_Number: build_Number });
        const gameValue = await get_GameValues();
        if (!buildingData) {
            return sendRes(res, 400, false, 'Building not found');
        }
        const currentLevel = buildingData.levelId.level;
        if (!currentLevel) {
            return sendRes(res, 400, false, 'Building level not found.');
        }

        const maxAllowedDays = currentLevel * 7;
        console.log('maxAllowedDays', maxAllowedDays, 'requestedDays', requestedDays);
        if (Number(days) > maxAllowedDays) {
            return sendRes(
                res,
                400,
                false,
                `Level ${currentLevel} buildings can only start production for up to ${maxAllowedDays} days.`,
            );
        }

        const tranreward = [];
        const dataforbulk = [];
        // const consuption = buildingData.dailyConsumption;
        const consumption = buildingData.dailyConsumption.map((item) => ({
            ...item,
            amount: item.amount * Number(days),
        }));

        const bal = await checkforenounghbalance(consumption, userWalletAddress);
        console.log('bal', bal);
        if (!bal.status) {
            return sendRes(res, 400, false, bal.message);
        }
        // time complexity O(n^2)
        for (let i = 0; i < consumption.length; i++) {
            let a = {
                updateOne: {
                    filter: {
                        $or: [{ label: consumption[i].label }, { name: consumption[i].label }],
                        walletAddress: userData?.WalletAddress,
                    },
                    update: { $inc: { balance: -consumption[i].amount } },
                },
            };
            let trans = { label: consumption[i].label, amount: consumption[i].amount };
            tranreward.push(trans);
            dataforbulk.push(a);
        }

        let trans = {
            from: userWalletAddress,
            to: CONFIG.ADMIN_WALLETADDRRESS,
            price: tranreward,
            userassetId: buildingData._id,
            action: 'consumables',
        };
        await TranscationService(trans);

        // const time = Date.now();
        // const endtimer = add_minutes(time, gameValue.production_time_in_min);
        const time = Date.now(); // Current time in milliseconds
        const endtimer = new Date(time + requestedDays * 24 * 60 * 60 * 1000);
        console.log('endtimer', endtimer);
        // start production and end after 24 hr so that click time is also nextClaim

        const update = {
            startProduction: new Date(time),
            endProduction: endtimer,
            nextClaim: endtimer,
        };

        const [updatedclaim, updateusercurrency, updateadmincurrency] = await Promise.all([
            gameservice.updateUserAsset({ build_Number: build_Number }, update),
            userService.bulkwriteuserCurrency_service(dataforbulk),
            userService.addpriceinadminCurrency_service(consumption),
        ]);

        return sendRes(res, 200, true, 'production started', updatedclaim);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const claimAllBuildingReward = async (req, res) => {
    try {
        const { userData } = req;
        const { userPlanetId } = req.body; // refoacter planetId --> userPlanetId
        const gameValue = await get_GameValues();
        const bulk = [];
        const bulkdataforcur = [];
        const userWalletAddress = userData.WalletAddress;
        const userAssetList = await gameservice.UserAssetList_service({
            userPlanetId: userPlanetId,
        });
        const time = Date.now();
        const userAssetchnage = [];
        // for refferal
        const dataforrefferal = [];
        const refferaldataforbulkwirte = [];
        const rewardcurcularbulk = [];
        for (let i = 0; i < userAssetList.length; i++) {
            const data = userAssetList[i];
            if (data.nextClaim != null) {
                if (data.nextClaim < time) {
                    for (let j = 0; j < data?.reward.length; j++) {
                        let reward = data?.reward[j];

                        let curculateamount = {
                            updateOne: {
                                filter: {
                                    $or: [{ label: reward.label }, { name: reward.label }],
                                    walletAddress: userWalletAddress,
                                },
                                update: { $inc: { balance: reward.amount } },
                            },
                        };

                        let curcular = {
                            updateOne: {
                                filter: {
                                    $or: [
                                        { label: reward.label },
                                        { name: reward.label },
                                        { value: reward.label },
                                    ],
                                },
                                update: { $inc: { circulateCurrency: reward.amount } },
                            },
                        };

                        let rewardcur = {
                            updateOne: {
                                filter: {
                                    $or: [
                                        { label: reward.label },
                                        { name: reward.label },
                                        { value: reward.label },
                                    ],
                                },
                                update: {
                                    $inc: {
                                        circulateCurrency:
                                            calculateRewardforRefferedUser(
                                                reward.amount,
                                                gameValue.refferal_Percent,
                                            ) + reward.amount,
                                    },
                                },
                            },
                        };

                        let nextClaim = {};
                        if (data?.dailyConsumption.length === 0) {
                            const endtimer = add_minutes(
                                time,
                                Number(gameValue.production_time_in_min),
                            );

                            const updateNonConsumableuserAsset = {
                                startProduction: new Date(time),
                                endProduction: endtimer,
                                nextClaim: endtimer,
                                lastClaim: new Date(time),
                            };

                            // { nextClaim: null, lastClaim: new Date(time) }
                            nextClaim = {
                                updateOne: {
                                    filter: {
                                        build_Number: data.build_Number,
                                        userPlanetId: userPlanetId,
                                    },
                                    update: { $set: updateNonConsumableuserAsset },
                                },
                            };
                        } else {
                            nextClaim = {
                                updateOne: {
                                    filter: {
                                        build_Number: data.build_Number,
                                        userPlanetId: userPlanetId,
                                    },
                                    update: {
                                        $set: { nextClaim: null, lastClaim: new Date(time) },
                                    },
                                },
                            };
                        }
                        const isValidRefferal = await userService.isValidReferredBy(
                            userData?.WalletAddress,
                            userData?.refferedBy?.WalletAddress,
                        );

                        if (isValidRefferal) {
                            refferaldataforbulkwirte.push({
                                updateOne: {
                                    filter: {
                                        $or: [{ label: reward.label }, { name: reward.label }],
                                        walletAddress: userData?.refferedBy?.WalletAddress,
                                    },
                                    update: { $inc: { balance: reward.amount } },
                                },
                            });
                        }

                        rewardcurcularbulk.push(rewardcur);
                        userAssetchnage.push(nextClaim);
                        bulkdataforcur.push(curcular);
                        bulk.push(curculateamount);

                        dataforrefferal.push({
                            label: reward.label,
                            amount: calculateRewardforRefferedUser(
                                reward.amount,
                                gameValue.refferal_Percent,
                            ),
                        });
                    }

                    await TranscationService({
                        from: null,
                        to: userWalletAddress,
                        price: data?.reward,
                        userassetId: null,
                        action: CONSTANTS.TRANSACTION_TYPE.CLAIM_REWARD,
                    });
                }
            }
        }

        // ! update from next claim in userAsset
        const isValidRefferal = await userService.isValidReferredBy(
            userData?.WalletAddress,
            userData.refferedBy?.WalletAddress,
        );
        if (isValidRefferal) {
            const [trasc, bulk, updateCurr] = await Promise.all([
                TranscationService({
                    from: userWalletAddress,
                    to: userData?.refferedBy?.WalletAddress,
                    price: dataforrefferal,
                    userassetId: null,
                    action: CONSTANTS.TRANSACTION_TYPE.REFFERAL_REWARD,
                }),
                userService.bulkwriteuserCurrency_service(refferaldataforbulkwirte),
                justwriteinCurrency(rewardcurcularbulk), // bulk write for both the userclaim curculate and refferalclaim  curculate
            ]);
        } else {
            await justwriteinCurrency(bulkdataforcur); // bulk write for the userclaim curculate  only
        }

        const [updateuserAsset, updateusercurrency] = await Promise.all([
            gameservice.bulkwriteuserAsset(userAssetchnage),
            userService.bulkwriteuserCurrency_service(bulk),
        ]);

        const updateduserAssetList = await gameservice.UserAssetList_service({
            userPlanetId: userPlanetId,
        });

        const notConsumableAsset = [];

        for (let i = 0; i < updateduserAssetList.length; i++) {
            if (updateduserAssetList[i]?.dailyConsumption.length === 0)
                notConsumableAsset.push(updateduserAssetList[i]);
        }

        return sendRes(res, 200, true, 'claimed', notConsumableAsset);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const buildinglist = async (req, res) => {
    try {
        const result = await gameservice.findBuildings();
        console.log('result', result);

        const assetIds = result.map((asset) => asset._id);

        const levelOneData = await level_db.find(
            {
                assetId: { $in: assetIds },
                level: 1,
            },
            {
                assetId: 1,
                build_time_min: 1,
                cost: 1,
                dailyConsumption: 1,
                reward: 1,
                image_url: 1,
            },
        );

        const levelMap = {};
        levelOneData.forEach((item) => {
            levelMap[item.assetId.toString()] = {
                build_time_min: item.build_time_min,
                cost: item.cost,
                dailyConsumption: item.dailyConsumption,
                reward: item.reward,
                image_url: item.image_url,
            };
        });

        const data = result.map((asset) => ({
            ...asset.toObject(),
            build_time_min: levelMap[asset._id.toString()]?.build_time_min || 0,
            cost: levelMap[asset._id.toString()]?.cost || [],
            dailyConsumption: levelMap[asset._id.toString()]?.dailyConsumption || [],
            reward: levelMap[asset._id.toString()]?.reward || [],
            image_url: levelMap[asset._id.toString()]?.image_url || '',
        }));

        return sendRes(res, 200, true, 'Building list', data);
    } catch (e) {
        console.log('buildinglist_err', e);
        return sendRes(res, 500, false, e);
    }
};

export const createship = async (req, res) => {
    try {
        const {
            shipName,
            shipType,
            rarity,
            capacity,
            attackPoints,
            price,
            canBuylimit,
            hullPoints,
            specialConditions,
            extraReward,
            nftSlots,
            imageKey,
        } = req.body;

        const payload = {
            shipName: shipName,
            shipType: shipType,
            capacity: capacity,
            extraReward: extraReward,
            nftSlots: nftSlots,
            canBuylimit: canBuylimit,
            specialConditions: specialConditions,
            hullPoints: hullPoints,
            attackPoints: attackPoints,
            price: price,
            image: imageKey,
            image_url: imageKey,
            rarity: rarity,
        };

        const saveres = gameservice.saveship(payload);
        sendRes(res, 201, true, 'created', saveres);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const updateShip = async (req, res) => {
    console.log('updateShip');
    try {
        const {
            body: {
                id,
                shipName,
                description,
                shipType,
                rarity,
                capacity,
                attackPoints,
                canBuylimit,
                hullPoints,
                extraReward,
                nftSlots,
                priceMultiplier,
            },
        } = req;
        const update = {
            shipName: shipName,
            description: description,
            shipType: shipType,
            rarity: rarity,
            capacity: capacity,
            attackPoints: attackPoints,
            canBuylimit: canBuylimit,
            hullPoints: hullPoints,
            extraReward: extraReward,
            nftSlots: nftSlots,
            priceMultiplier: priceMultiplier,
        };
        console.log('updateShip', id);

        const resu = await gameservice.UpdateOneShipdb({ _id: id }, { $set: update });
        console.log('updateship_result', resu);
        return sendRes(res, 200, true, 'updated');
    } catch (e) {
        console.log('updateShip_err', e);
        return sendRes(res, 500, false, error.message);
    }
};

export const updateShipPrice = async (req, res) => {
    const {
        body: { id, price, capacity, type, optionalCost },
    } = req;
    try {
        console.log('updateShipPrice', id, price, capacity, type, optionalCost);
        if (!['capacity', 'price', 'optionalcost'].includes(type.toLowerCase()))
            return sendRes(res, 400, false, 'Not valid type');

        if (type.toLowerCase() === 'capacity') {
            await gameservice.UpdateOneShipdb({ _id: id }, { $set: { capacity: capacity } });
        }

        if (type.toLowerCase() === 'price') {
            await gameservice.UpdateOneShipdb({ _id: id }, { $set: { price: price } });
        }

        if (type.toLowerCase() === 'optionalcost') {
            await gameservice.UpdateOneShipdb(
                { _id: id },
                { $set: { optionalCost: optionalCost } },
            );
        }

        let result = await shipsdb.findOne({ _id: id });
        return sendRes(res, 200, true, `${type}  updated`, result);
    } catch (e) {
        console.log('updateShipPrice_e', e);
        return sendRes(res, 500, false, error.message);
    }
};
export const getShip = async (req, res) => {
    try {
        const { userData } = req;
        const tokenDatas = await getTokenDetailes(userData.WalletAddress);
        const nftIDs = [];
        for (let i = 0; i < tokenDatas.length; i++) {
            nftIDs.push(tokenDatas[i].tokenData._id);
        }
        let usership = await gameservice.UserShip_Service({ nftId: { $in: nftIDs } });
        let shopdata = await gameservice.getShip_Service();
        for (let z = 0; z < shopdata.length; z++) {
            shopdata[z].buyStatus = false;
            shopdata[z].image_url = signature_imageURL(shopdata[z].image);
        }
        let set = new Set();
        for (let j = 0; j < usership.length; j++) {
            if (usership[j].shipId) {
                usership[j].shipId.image_url = signature_imageURL(usership[j].shipId?.image);
                set.add(usership[j].shipId._id);
            }
        }
        for (let i = 0; i < shopdata.length; i++) {
            if (set.has(shopdata[i]?._id)) {
                shopdata[i].buyStatus = true;
            }
        }
        let data = {
            owned: usership,
            shop: shopdata,
        };
        sendRes(res, 200, true, 'fetched ship data', data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

// api : /game/shiplist
// method : get
// desc : get ship list ( there is just 20 to 30 ships so no need of pagination for now )
export const shipList = async (req, res) => {
    try {
        // const {query: {page}} = req   // only 30 ships will me available for now so hide it
        // const limit = 12
        // const skip = (page - 1) * limit
        // const list = await RedisGet('shipList');
        // if (list) {
        //     return sendRes(res, 200, true, 'ship list data ', list);
        // }

        let shipData = await gameservice.getShip_Service();
        // await RedisSet('shipList', shipData, 86, 400);
        return sendRes(res, 200, true, 'ship list data ', shipData);
    } catch (error) {
        console.log('error', error);
        return sendRes(res, 500, false, error.message);
    }
};

export const ShipForMission = async (req, res) => {
    try {
        const { userData } = req;
        const { type, hexId } = req.body;

        if (!type) {
            return sendRes(res, 400, false, 'type is required');
        }
        const tokenDatas = await getTokenDetailes(userData.WalletAddress);
        console.log('tokenDatas', tokenDatas);
        const nftIDs = [];
        for (let i = 0; i < tokenDatas.length; i++) {
            nftIDs.push(tokenDatas[i].tokenData._id);
        }
        const now = new Date();

        console.log('nftIDs', nftIDs, hexId);
        let userMissonShip = await gameservice.UserMissonShip_Service(
            {
                nftId: { $in: nftIDs },
                currentHexId: Number(hexId),
                $or: [{ endTime: { $lt: now } }, { endTime: null }],
            },
            type,
        );

        userMissonShip.forEach((element) => {
            if (element.shipId) {
                element.shipId.image_url = signature_imageURL(element.shipId.image);
            }
        });
        console.log('userMissonShip', userMissonShip);

        sendRes(res, 200, true, 'fetched ship for Mission', userMissonShip);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const initipfsforship_v2 = async (req, res) => {
    try {
        const { shipId, priceType, symbol, hexId, optionalCost, costType, buildingId, planetId } =
            req.body;
        console.log(
            'initipfsforship_v2_req',
            shipId,
            priceType,
            symbol,
            hexId,
            optionalCost,
            costType,
            buildingId,
            planetId,
        );

        if (!buildingId) {
            return sendRes(res, 400, false, 'Building ID is required.');
        }

        const building = await gameservice.getOnebultingdata({ _id: buildingId });

        if (!building) {
            return sendRes(res, 400, false, 'Building not found.');
        }

        const orbitalShipyard = await gameservice.findOrbitalShipyard(planetId, 'ORBITAL SHIPYARD');

        if (!orbitalShipyard) {
            return sendRes(
                res,
                400,
                false,
                'You must have an Orbital Shipyard on this planet to mint a ship.',
            );
        }

        const now = new Date();

        if (!orbitalShipyard.endProduction || now >= new Date(orbitalShipyard.endProduction)) {
            return sendRes(
                res,
                400,
                false,
                'Orbital Shipyard production has ended. Please start production before minting a ship.',
            );
        }

        //! hexId  added new
        if (!shipId || typeof shipId !== 'string' || shipId.trim().length === 0) {
            return sendRes(res, 400, false, 'Valid shipId is required');
        }

        if (!priceType || !['coin', 'token'].includes(priceType)) {
            return sendRes(res, 400, false, 'Valid priceType (coin or token) is required');
        }

        if (
            priceType !== 'coin' &&
            (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0)
        ) {
            return sendRes(res, 400, false, 'Valid symbol is required when priceType is not coin');
        }

        if (!req.userData?.WalletAddress || typeof req.userData.WalletAddress !== 'string') {
            return sendRes(res, 401, false, 'Valid wallet address is required');
        }

        const walletAddress = req.userData.WalletAddress;
        // const walletAddress = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';

        const shipdata = await gameservice.findOneShip(shipId);
        shipdata.hexId = hexId ?? 0;
        console.log('shipdata1', shipdata, hexId);
        if (!shipdata) {
            return sendRes(res, 404, false, 'ship not found');
        }

        if (costType == 'optionalCost') {
            for (let i = 0; i < optionalCost.length; i++) {
                const cost = optionalCost[i];

                let getBalance = await userService.findUserbalance({
                    walletAddress: walletAddress.toLowerCase(),
                    label: cost.label,
                });
                console.log(
                    'getBalance',
                    getBalance,
                    cost.amount,
                    getBalance.balance < cost.amount,
                );
                const currentBalance = parseFloat(getBalance?.balance?.toString() || 0);
                const requiredAmount = Number(cost.amount);

                if (currentBalance < requiredAmount) {
                    return sendRes(
                        res,
                        400,
                        false,
                        `Insufficient ${cost.label}. Need ${requiredAmount - currentBalance} more`,
                    );
                }
            }
        } else if (costType == 'cost') {
            // Validate cumulative token balance from ship price
            if (Array.isArray(shipdata.price) && shipdata.price.length > 0) {
                for (let i = 0; i < shipdata.price.length; i++) {
                    const priceItem = shipdata.price[i];

                    const getBalance = await userService.findUserbalance({
                        walletAddress: walletAddress.toLowerCase(),
                        label: priceItem.label,
                    });
                    const currentBalance = parseFloat(getBalance?.balance?.toString() || 0);
                    const requiredAmount = Number(priceItem.amount);
                    console.log('PRICE_CHECK', priceItem.label, currentBalance, requiredAmount);

                    if (currentBalance < requiredAmount) {
                        return sendRes(
                            res,
                            400,
                            false,
                            `Insufficient ${priceItem.label}. Need ${requiredAmount - currentBalance} more`,
                        );
                    }
                }
            }
        }

        const URL = GetOriginalImage(shipdata?.image);
        const NFTIpfs = await uploadAndGenerateUrl({ item: 'img', path: URL });
        if (!NFTIpfs) {
            return sendRes(res, 400, false, 'Uploaded Failed', {});
        }

        const JSOnpat = generateMetaStoreFilePath(walletAddress);
        const NewName = shipdata?.shipName; //  await nftService.getNextName(shipdata?.shipName);

        const payload = {
            name: NewName,
            description: shipdata?.description,
            image: CONFIG.IPFS_IMG + NFTIpfs,
            attributes: [],
        };

        const key = JSOnpat;
        const senddata = JSON.stringify(payload);
        // const savedins = await uploadImageToS3(key, senddata, 'text/plain');
        const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');

        const gameValue = await adminservice.get_GameValues();
        const nftinfos = {
            uri: savedins.Key,
            nftType: 721,
            royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,
            price: 0,
            supply: 1,
            isAirdrop: false,
            buyWith: priceType === 'coin' ? '' : symbol,
        };

        const status = {
            ship: {
                data: shipdata,
                image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
                MetaData: getMetaDataKey(savedins.Key),
                metaKey: savedins.Key,
                name: NewName,
                collectionAddress: shipdata.collection.CollectionContractAddress,
                optionalCost: optionalCost,
                costType: costType,
                isType: 'ship',
            },
        };
        console.log('shipdata2', shipdata, hexId);
        if (savedins.status) {
            return sendRes(res, 200, true, 'metafile created ready to mint', {
                nftInfos: [nftinfos],
                address: [shipdata.collection.CollectionContractAddress],
                message: `3:${Date.now()}`,
                status: JSON.stringify(status),
                signature: '',
            });
        }

        return sendRes(res, 400, false, 'Uploaded Failed', {});
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const initipfsforcrew = async (req, res) => {
    try {
        const { crewId } = req.body;
        const walletAddress = req.userData.WalletAddress;
        const crewdata = await gameservice.FindOne_crewAsset({ _id: crewId });
        if (!crewdata || !crewdata.isActive) {
            return sendRes(res, 404, false, 'crew not found or created by another user');
        }

        if (
            crewdata.collection.CollectionSymbol === CONFIG.COLLECTION_CONTRACT_DETAILS.crew.symbol
        ) {
            // Handle specific logic for crew collection
            return sendRes(
                res,
                400,
                false,
                'sry this collection nft is only given when you buy the plant or astroid',
            );
        }
        const URL = GetOriginalImage(crewdata?.image);
        const NFTIpfs = await uploadAndGenerateUrl({ item: 'img', path: URL });
        if (!NFTIpfs) {
            return sendRes(res, 400, false, 'ipfs failed', {});
        }
        const tme = Date.now();
        const JSOnpat = generateMetaStoreFilePath(walletAddress);
        // const NewName = await nftService.getNextName(crewdata?.name);
        const NewName = crewdata?.name;

        const payload = {
            name: NewName,
            description: crewdata?.description,
            image: CONFIG.IPFS_IMG + NFTIpfs,
            attributes: crewdata.NFTProperties ? crewdata.NFTProperties : [],
            xp: 0,
        };
        const key = JSOnpat;
        const senddata = JSON.stringify(payload);
        const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');

        // const savedins = await uploadImageToS3(key, senddata, 'text/plain');

        if (savedins.status) {
            const MetaData = await ipfs_add_for_meta(savedins.key);
            if (MetaData) {
                return sendRes(res, 200, true, 'metafile created ready to mint', {
                    crewData: crewdata,
                    image_ipfs: savedins.Key,
                    MetaData: getMetaDataKey(savedins.Key),
                    metaKey: savedins.Key,
                    name: NewName,
                });
            }
        }
        return sendRes(res, 400, false, 'Uploaded Failed', {});
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

// create a cron that check for isActive true and isLocked true after the updateAt is 10 min later make that is Locker false
export const ipfsforcrew = async (req, res) => {
    try {
        const {
            body: { professionType, walletAddress },
        } = req;
        if (!CONSTANTS.PROFESSIONS.includes(professionType)) {
            return sendRes(res, 400, false, 'Invalid profession type', {});
        }
        const crews = await gameservice.findCrewAsset({
            profession: professionType,
            isActive: true,
            isLocked: false,
        });

        const randomIndex = getRandomNumberInRange(0, crews.length - 1);

        const crewdata = crews[randomIndex];

        const URL = GetOriginalImage(crewdata?.image);
        const NFTIpfs = await uploadAndGenerateUrl({ item: 'img', path: URL });
        if (!NFTIpfs) {
            return sendRes(res, 400, false, 'ipfs failed', {});
        }
        const JSOnpat = generateMetaStoreFilePath(walletAddress);
        // const NewName = await nftService.getNextName(crewdata?.name);
        const NewName = crewdata?.name;

        const payload = {
            name: NewName,
            description: crewdata?.description,
            image: CONFIG.IPFS_IMG + NFTIpfs,
            attributes: crewdata.NFTProperties ? crewdata.NFTProperties : [],
            xp: 0,
        };
        const key = JSOnpat;
        const senddata = JSON.stringify(payload);
        const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');

        // const savedins = await uploadImageToS3(key, senddata, 'text/plain');

        if (savedins.status) {
            const MetaData = await ipfs_add_for_meta(savedins.key);
            if (MetaData) {
                await gameservice.lockCrew(crewdata._id);

                return sendRes(res, 200, true, 'metafile created ready to mint', {
                    crewData: crewdata,
                    image_ipfs: savedins.Key,
                    MetaData: getMetaDataKey(savedins.Key),
                    metaKey: savedins.Key,
                    name: NewName,
                });
            }
        }
        return sendRes(res, 400, false, 'Uploaded Failed', {});
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
// api : /game/userInventory
// method : post
// body : { userPlanetId  }
// used to get the user inventory asset list for that user  planet
export const userInventory = async (req, res) => {
    try {
        const {
            body: { userPlanetId },
            userData,
        } = req;

        const find_data = {
            userPlanetId: userPlanetId,
            isInventory: true,
        };

        const data = await gameservice.UserAssetList_service(find_data);
        if (data.length === 0) {
            return sendRes(res, 200, true, 'no assets in inventory', data);
        }
        data.forEach((element) => {
            element.levelId.image_url = signature_imageURL(element.levelId?.image);

            if (element.next) {
                element.next.image_url = signature_imageURL(element.next?.image);
            }
        });

        sendRes(res, 200, true, 'success', data);
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

// api : /game/moveinventory
// method : post
// body : { userPlanetId , buildNumber  }
// used to move the asset from planet to  planet inventory
export const moveInventory = async (req, res) => {
    try {
        const {
            body: { userPlanetId, buildNumber },
        } = req;
        const result = await gameservice.updateUserAsset(
            { userPlanetId: userPlanetId, build_Number: buildNumber },
            { isInventory: true },
        );

        sendRes(res, 200, true, `${buildNumber} moved Successfully`, result);
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

export const updateManyUserAssets = async (req, res) => {
    try {
        const result = await gameservice.updateManyUserAsset({}, { isInventory: false });

        sendRes(res, 200, true, `updated Successfully`, result);
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

// api : /game/equipship
// method : post
// body : { userShipId , userPlanetIdToEquip  }
// used to equipped ship to the user  planet

export const equipShip = async (req, res) => {
    try {
        const {
            body: { userShipId, userPlanetIdToEquip },
            userData,
        } = req;
        if (!(userShipId && userPlanetIdToEquip)) {
            return sendRes(
                res,
                400,
                false,
                'userShipId or userPlanetIdToEquip keys are missing in body ',
            );
        }
        const planet = await gameservice.userPlanetFindOne({ _id: userPlanetIdToEquip });
        if (!planet) {
            return sendRes(res, 409, false, 'user planet not found', {});
        }
        const data = await gameservice.UserShipFindOneAndUpdate(
            { _id: userShipId },
            { isEquipped: true, equippedPlanet: userPlanetIdToEquip },
        );

        sendRes(
            res,
            200,
            data ? true : false,
            data ? `Ship is Equipped  ` : 'Ship Can`t Equipped',
            data,
        );
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

// api : /game/getbackship
// method : post
// body : { userShipId , userPlanetIdToEquip  }
// used to get back the ship from planet to user inventory
export const getBackEquipShip = async (req, res) => {
    try {
        const {
            body: { userShipId, userPlanetIdToEquip },
        } = req;

        const data = await gameservice.UserShipFindOneAndUpdate(
            { _id: userShipId, equippedPlanet: userPlanetIdToEquip },
            { isEquipped: false, equippedPlanet: null },
        );

        sendRes(
            res,
            200,
            data ? true : false,
            data ? `Ship is Getting Back ` : 'ship cannot get Back',
            data,
        );
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

// api : /game/isquote
// method : put
// body : { userPlanetId , build_Number  }
// used to update the quote is read or not after user read the quote set isQuote true
export const quoteRead = async (req, res) => {
    try {
        const {
            body: { userPlanetId, build_Number },
        } = req;
        if (!(userPlanetId && build_Number)) {
            return sendRes(
                res,
                400,
                false,
                'userPlanetId or build_Number keys are missing in body ',
            );
        }
        const userAsset = await gameservice.UserAssetFindOne_service({
            build_Number: build_Number,
            userPlanetId: userPlanetId,
        });
        if (!userAsset) {
            sendRes(res, 400, false, 'userAsset not found');
        }
        const upadated = await gameservice.updateUserAsset(
            { build_Number: build_Number, userPlanetId: userPlanetId },
            { isQuote: true },
        );
        sendRes(
            res,
            200,
            upadated ? true : false,
            upadated ? `quote is readed` : 'failed to read ',
            upadated,
        );
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

// service :  used in nft controller to get the asset by planetId
export const getAssetByPlanetId = async (userplanetId) => {
    const find_data = {
        userPlanetId: userplanetId,
    };

    const userAsset = await gameservice.UserAssetList_service(find_data);

    userAsset.forEach((element) => {
        element.levelId.image_url = signature_imageURL(element.levelId?.image);

        if (element.next) {
            element.next.image_url = signature_imageURL(element.next?.image);
        }
    });

    return userAsset;
};

// api : /api/v1/game/admin/assetsforairdrop
// method : post
// body : { type : 'crew' or 'ship' , page : 1 , limit : 12  }
// only admin
// used to get the asset list for airdrop to user
export const fetchAssetforAirdrop = async (req, res) => {
    try {
        const {
            body: { type, page = 1, limit = 12 },
        } = req;

        if (!['crew', 'ship'].includes(type)) {
            return sendRes(res, 400, false, 'not valid type', null);
        }
        if (type === 'crew') {
            const data = await gameservice.crewFind(
                {},
                (Number(page) - 1) * Number(limit),
                Number(limit),
            );
            return sendRes(res, 200, true, 'success', data);
        }

        if (type === 'ship') {
            const data = await gameservice.ship_Shop_service(
                {},
                (Number(page) - 1) * Number(limit),
                Number(limit),
            );
            return sendRes(res, 200, true, 'success', data);
        }
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

// api : admin/crew/price
// method : get
// only admin
// used to get the crew price by profession
export const CrewPrice = async (req, res) => {
    try {
        // const data = await gameservice.CrewAggregate([
        //     {
        //         $group: {
        //             _id: '$profession',
        //             price: { $first: '$price' }, // Collects unique prices for each category
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             profession: '$_id',
        //             price: 1,
        //         },
        //     },
        // ]);
        const data = await gameservice.CrewAggregate([
            {
                $group: {
                    _id: '$profession',
                    nftPrice: { $first: '$nftPrice' }, // Collects unique prices for each category
                },
            },
            {
                $project: {
                    _id: 0,
                    profession: '$_id',
                    nftPrice: 1,
                },
            },
        ]);
        return sendRes(res, 200, true, 'success', data);
    } catch (e) {
        sendRes(res, httpStatus.INTERNAL_SERVER_ERROR, false, e.message);
    }
};

// api : /api/v1/game/admin/crew/price
// method : put
// body : { profession : 'engineer' , price : [ { label : 'galfi' , amount : 100 } , { label : 'gfmnr' , amount : 200 } ]  }
// only admin
// used to update the new  crew price by admin
export const CrewPriceUpdate = async (req, res) => {
    try {
        const {
            body: { profession, price },
        } = req;
        const priceArray = [];
        for (let i = 0; i < price; i++) {
            priceArray.push({
                label: price[i].label,
                amount: price[i].amount,
            });
        }
        const data = await gameservice.UpdateManyCrew(
            { profession: profession },
            { $set: { price: priceArray } },
        );
        sendRes(res, httpStatus.OK, true, 'updated', data);
    } catch (e) {
        sendRes(res, httpStatus.INTERNAL_SERVER_ERROR, false, e.message);
    }
};

// api : /api/v1/v2/game/admin/crew/price
// method : put
// body : { profession : 'engineer' , price : 10
// only admin
// used to update the new  crew price by admin

export const CrewPriceUpdatev2 = async (req, res) => {
    try {
        const {
            body: { profession, price },
        } = req;

        // ---------- VALIDATION ----------
        if (!profession) {
            return sendRes(res, httpStatus.BAD_REQUEST, false, 'Profession is required');
        }

        if (price === undefined || price === null) {
            return sendRes(res, httpStatus.BAD_REQUEST, false, 'Price is required');
        }

        if (isNaN(price)) {
            return sendRes(res, httpStatus.BAD_REQUEST, false, 'Price must be a valid number');
        }

        if (Number(price) < 0) {
            return sendRes(res, httpStatus.BAD_REQUEST, false, 'Price cannot be less than 0');
        }

        const data = await gameservice.UpdateManyCrew(
            { profession: profession },
            { $set: { nftPrice: price } },
        );

        sendRes(res, httpStatus.OK, true, 'updated', data);
    } catch (e) {
        sendRes(res, httpStatus.INTERNAL_SERVER_ERROR, false, error.message);
    }
};

// api : /api/v1/game/nft/gameinfo
// used in nftmarket place to get the gameInfo of the nft to show the game info
// method : post
// body : { type : 'ship' or 'planet' or 'astroid' , nftId : 'nftId'  }
export const NftGameInfo = async (req, res) => {
    try {
        const {
            body: { type, nftId },
        } = req;

        const token = await nftService.tokenFindOne({ NFTId: nftId });
        if (type.includes('ship')) {
            const data = await gameservice.findOneUserShip({ nftId: token._id });
            sendRes(res, httpStatus.OK, true, 'fetched', data);
            return;
        }

        if (type.includes('planet') || type.includes('astroid')) {
            const data = await gameservice.userPlanetFindOneWithPopulate({ nftId: token._id });
            const userAsset = await gameservice.UserAssetFindService({ userPlanetId: data._id });
            const asset = [];
            userAsset.forEach((element) => {
                const paylaod = {
                    level: element.levelId.level,
                    name: element.levelId.asset_Name,
                    image: element.levelId.image,
                };
                asset.push(paylaod);
            });
            sendRes(res, httpStatus.OK, true, 'fetched', { data: data, asset: asset });
            return;
        }

        sendRes(res, httpStatus.OK, true, 'fetched', {});
    } catch (error) {
        sendRes(res, httpStatus.INTERNAL_SERVER_ERROR, false, error.message);
    }
};

// api : /api/v1/game/admin/planet/price
// method : put
// body : { type : "planet" , price : 200, rarity: "common"  }
// only admin
// used to update the new planet (or) asteroid price by admin
export const PlanetAsteroidPriceUpdate = async (req, res) => {
    try {
        const {
            body: { type, rarity, price },
        } = req;
        const data = await gameservice.UpdateManyPlanetAsset(
            { type, rarity, isActive: true },
            { price },
        );
        sendRes(res, httpStatus.OK, true, 'updated', data);
    } catch (e) {
        sendRes(res, httpStatus.INTERNAL_SERVER_ERROR, false, e.message);
    }
};

// api : admin/planet/price
// method : get
// used to get the planet or asteroid price by type, rarity
export const PlanetAsteroidPrice = async (req, res) => {
    try {
        const data = await gameservice.PlanetAggregate([
            {
                $match: {
                    isActive: true,
                },
            },
            {
                $group: {
                    _id: { type: '$type', rarity: '$rarity' },
                    price: { $first: '$price' },
                },
            },
            {
                $project: {
                    _id: 0,
                    type: '$_id.type',
                    rarity: '$_id.rarity',
                    price: 1,
                },
            },
        ]);

        return sendRes(res, 200, true, 'success', data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

/**
 * Initializes the IPFS process for creating and minting NFTs.
 *
 * @param {Object} req - The request object containing the planetId, WalletAddress, and userid.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the IPFS process is completed.
 */

//  struct NftInfo{
//         string uri;
//         uint nftType;
//         uint256 royalty;
//         uint256 price;
//         uint256 supply;
//         bool isAirdrop;
//         string buyWith;
//     }

//     function dropMint(
//         NftInfo[] calldata _nftInfos,
//         address[] calldata _collectionAddress,
//         uint256 _nonce,
//         string calldata _message, // is `${_nftInfos.length}:SECRETKEY`,
//         string calldata _status,
//         bytes memory signature
//     ) external payable{

// export const ipfsForPlanet = async (req, res) => {
//     try {
//         const {
//             body: { planetId, priceType, symbol }, // consider it is planet or astroid ID
//             userData,
//         } = req;

//         const walletAddress = userData.WalletAddress;
//         const planetdata = await gameservice.findBYPlanetID(planetId);
//         console.log("planetdata", planetdata)
//         const NFTIpfs = await uploadAndGenerateUrl({
//             item: 'img',
//             path: GetOriginalImage(planetdata.image),
//         });

//         if (!NFTIpfs) {
//             return sendRes(res, 400, false, 'Uploaded Failed', {});
//         }

//         const NewName = planetdata?.name;
//         // metadata
//         const payload = {
//             names: NewName,
//             description: planetdata?.description,
//             image: CONFIG.IPFS_IMG + NFTIpfs,
//             attributes: [],
//             gameAssets: [],
//         };
//         const JSOnpat = generateMetaStoreFilePath(walletAddress);
//         const key = JSOnpat;
//         const senddata = JSON.stringify(payload);
//         // const savedins = await uploadImageToS3(key, senddata, 'text/plain');
//         const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');
//         console.log("savedins", savedins)
//         if (!savedins.status) return sendRes(res, 400, false, 'Uploaded Failed', {});
//         const gameSettings = await getGameValues();
//         const crewIpfsData = await createIpfsForFreeCrew(planetdata, walletAddress);
//         logger.info('crewIpfsData', crewIpfsData);
//         const ShipIpfsData = await createIpfsForFreeShip(walletAddress);
//         ShipIpfsData.data.hexId = planetdata.hexId ?? 0;
//         logger.info('ShipIpfsData', ShipIpfsData);

//         // const [crewIpfsData, ShipIpfsData] = await Promise.all([
//         //     createIpfsForFreeCrew(planetdata, walletAddress),
//         //     createIpfsForFreeShip(walletAddress),
//         // ]);

//         const gameValue = await adminservice.get_GameValues();

//         const mainData = {
//             data: planetdata,
//             image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
//             MetaData: getMetaDataKey(savedins.Key),
//             metaKey: savedins.Key,
//             collectionAddress: planetdata.collectionId.CollectionContractAddress,
//             name: NewName, // array with single name o multiple names same for airdrop and others
//             isType: 'planet',
//         };
//         // const crewIpfsData = await createIpfsForFreeCrew(planetdata, walletAddress);

//         const data = {
//             nftInfos: [
//                 {
//                     uri: getMetaDataKey(savedins.Key),
//                     nftType: 721,
//                     royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,
//                     // price: convertUsdToAsset(planetdata.price, priceType),
//                     price: 1,

//                     supply: 1,
//                     isAirdrop: false,
//                     buyWith: priceType === 'token' ? symbol : '',
//                 },
//                 {
//                     uri: crewIpfsData.metaKey,
//                     nftType: 721,
//                     royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,

//                     price: 0,
//                     supply: 1,
//                     isAirdrop: true,
//                     buyWith: '',
//                 },
//                 {
//                     uri: ShipIpfsData.metaKey,
//                     nftType: 721,
//                     royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,

//                     price: 0,
//                     supply: 1,
//                     isAirdrop: true,
//                     buyWith: '',
//                 },
//             ],
//             address: [
//                 planetdata.collectionId.CollectionContractAddress,
//                 crewIpfsData.collectionAddress,
//                 ShipIpfsData.collectionAddress,
//             ],
//             message: `3:${Date.now()}`,
//             // status: { planet: mainData, crew: crewIpfsData, ship: ShipIpfsData },
//             status: JSON.stringify({
//                 planet: mainData,
//                 crew: crewIpfsData,
//                 ship: ShipIpfsData,
//             }),
//             // status: [{ planet: mainData }, { crew: crewIpfsData }, { ship: ShipIpfsData }],
//             // status: [mainData, crewIpfsData, ShipIpfsData],
//             signature: '',
//         };

//         return sendRes(res, 200, true, 'metafile created ready to mint', data);
//     } catch (error) {
//         console.log("ipfsForPlanet", error)
//         sendRes(res, 500, false, error.message);
//     }
// };

export const ipfsForPlanet = async (req, res) => {
    try {
        const {
            body: { rarity, priceType, symbol },
            userData,
        } = req;
        console.log('ipfsForPlanet', rarity, priceType, symbol, userData);

        const walletAddress = userData.WalletAddress;
        // const planetdata = await gameservice.findNextPlanetByRarity(rarity);

        let planetPayload = {
            rarity: rarity,
            type: 'planet',
        };

        let planetdata = await gameservice.findNextPlanetByRarity(planetPayload);

        // planetdata = await planetdata.populate({
        //     path: "crewId",
        //     populate: {
        //         path: "collection"
        //     }
        // });

        console.log('planetdata', planetdata);
        if (!planetdata) {
            return sendRes(res, 404, false, 'No planet available for this rarity');
        }
        const NFTIpfs = await uploadAndGenerateUrl({
            item: 'img',
            path: GetOriginalImage(planetdata.image),
        });
        console.log('🚀 ~ ipfsForPlanet ~ NFTIpfs:', NFTIpfs);

        if (!NFTIpfs) {
            return sendRes(res, 400, false, 'Uploaded Failed', {});
        }

        const NewName = planetdata?.name;
        // metadata
        const payload = {
            names: NewName,
            description: planetdata?.description,
            image: CONFIG.IPFS_IMG + NFTIpfs,
            attributes: [],
            gameAssets: [],
        };
        const JSOnpat = generateMetaStoreFilePath(walletAddress);
        console.log('🚀 ~ ipfsForPlanet ~ JSOnpat:', JSOnpat);
        const key = JSOnpat;
        console.log('🚀 ~ ipfsForPlanet ~ key:', key);
        const senddata = JSON.stringify(payload);
        console.log('🚀 ~ ipfsForPlanet ~ senddata:', senddata);
        // const savedins = await uploadImageToS3(key, senddata, 'text/plain');
        const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');
        console.log('🚀 ~ ipfsForPlanet ~ savedins:', savedins);
        if (!savedins.status) return sendRes(res, 400, false, 'Uploaded Failed', {});
        const gameSettings = await getGameValues();
        console.log('🚀 ~ ipfsForPlanet ~ gameSettings:', gameSettings);
        const crewIpfsData = await createIpfsForFreeCrew(planetdata, walletAddress);
        console.log('🚀 ~ ipfsForPlanet ~ crewIpfsData:', crewIpfsData);
        logger.info('crewIpfsData', crewIpfsData);
        const ShipIpfsData = await createIpfsForFreeShip(walletAddress);
        console.log('🚀 ~ ipfsForPlanet ~ ShipIpfsData:', ShipIpfsData);
        ShipIpfsData.data.hexId = planetdata.hexId ?? 0;
        logger.info('ShipIpfsData', ShipIpfsData);

        // const [crewIpfsData, ShipIpfsData] = await Promise.all([
        //     createIpfsForFreeCrew(planetdata, walletAddress),
        //     createIpfsForFreeShip(walletAddress),
        // ]);

        const gameValue = await adminservice.get_GameValues();

        const mainData = {
            data: planetdata,
            image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
            MetaData: getMetaDataKey(savedins.Key),
            metaKey: savedins.Key,
            collectionAddress: planetdata.collectionId.CollectionContractAddress,
            name: NewName, // array with single name o multiple names same for airdrop and others
            isType: 'planet',
        };
        console.log('🚀 ~ ipfsForPlanet ~ mainData:', mainData);
        // const crewIpfsData = await createIpfsForFreeCrew(planetdata, walletAddress);

        let ethPrice = 0;
        if (priceType == 'coin') {
            const priceData = await convertUsdToAsset({
                usd: planetdata.price,
                assetType: priceType,
            });
            console.log('ETH Price:', priceData.amount);
            // ethPrice = (Number(priceData.amount) * 10 ** 18).toString()
            ethPrice = new BigNumber(toFixedNumber(priceData.amount))
                .multipliedBy('1e18')
                .integerValue(BigNumber.ROUND_DOWN)
                .toFixed(0);
        }

        const data = {
            nftInfos: [
                {
                    uri: getMetaDataKey(savedins.Key),
                    nftType: 721,
                    royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,
                    // price: convertUsdToAsset(planetdata.price, priceType),
                    price:
                        priceType == 'token'
                            ? (Number(planetdata.price) * 10 ** 18).toString()
                            : ethPrice,

                    supply: 1,
                    isAirdrop: false,
                    buyWith: priceType === 'token' ? symbol : '',
                },
                {
                    uri: crewIpfsData.metaKey,
                    nftType: 721,
                    royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,

                    price: 0,
                    supply: 1,
                    isAirdrop: true,
                    buyWith: '',
                },
                {
                    uri: ShipIpfsData.metaKey,
                    nftType: 721,
                    royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,

                    price: 0,
                    supply: 1,
                    isAirdrop: true,
                    buyWith: '',
                },
            ],
            address: [
                planetdata.collectionId.CollectionContractAddress,
                crewIpfsData.collectionAddress,
                ShipIpfsData.collectionAddress,
            ],
            message: `3:${Date.now()}`,
            // status: { planet: mainData, crew: crewIpfsData, ship: ShipIpfsData },
            status: JSON.stringify({
                planet: mainData,
                crew: crewIpfsData,
                ship: ShipIpfsData,
            }),
            // status: [{ planet: mainData }, { crew: crewIpfsData }, { ship: ShipIpfsData }],
            // status: [mainData, crewIpfsData, ShipIpfsData],
            signature: '',
        };

        return sendRes(res, 200, true, 'metafile created ready to mint', data);
    } catch (error) {
        console.log('ipfsForPlanet_err', error);
        sendRes(res, 500, false, error.message);
    }
};

export const ipfsForAstroid = async (req, res) => {
    try {
        const {
            body: { rarity, priceType, symbol }, // consider it is planet or astroid ID
            userData,
        } = req;

        const walletAddress = userData.WalletAddress;
        // const planetdata = await gameservice.findBYPlanetID(planetId);
        let astroidPayload = {
            rarity: rarity,
            type: 'asteroid',
        };

        let asteroiddata = await gameservice.findNextPlanetByRarity(astroidPayload);

        // asteroiddata = await asteroiddata.populate({
        //     path: "crewId",
        //     populate: {
        //         path: "collection"
        //     }
        // });

        console.log('asteroiddata', asteroiddata);
        if (!asteroiddata) {
            return sendRes(res, 404, false, 'No asteroid available for this rarity');
        }

        const NFTIpfs = await uploadAndGenerateUrl({
            item: 'img',
            path: GetOriginalImage(asteroiddata.image),
        });

        if (!NFTIpfs) {
            return sendRes(res, 400, false, 'Uploaded Failed', {});
        }

        const NewName = asteroiddata?.name;

        const payload = {
            names: NewName,
            description: asteroiddata?.description,
            image: CONFIG.IPFS_IMG + NFTIpfs,
            attributes: [],
            gameAssets: [],
        };

        const JSOnpat = generateMetaStoreFilePath(walletAddress);
        const key = JSOnpat;
        const senddata = JSON.stringify(payload);
        // const savedins = await uploadImageToS3(key, senddata, 'text/plain');
        const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');

        if (!savedins.status) return sendRes(res, 400, false, 'Uploaded Failed', {});
        // const [crewIpfsData, ShipIpfsData] = await Promise.all([
        //     createIpfsForFreeCrew(planetdata, walletAddress),
        //     createIpfsForFreeShip(walletAddress),
        // ]);

        const crewIpfsData = await createIpfsForFreeCrew(asteroiddata, walletAddress);
        logger.info('crewIpfsData', crewIpfsData);

        const ShipIpfsData = await createIpfsForFreeShip(walletAddress);
        logger.info('ShipIpfsData', ShipIpfsData);
        ShipIpfsData.data.hexId = asteroiddata.hexId ?? 0;

        //       return {
        //     data: shipData,
        //     image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
        //     MetaData: getMetaDataKey(savedins.Key),
        //     metaKey: savedins.Key,
        //     name: NewName,
        //     collectionAddress: shipData.collection.CollectionContractAddress,
        //     isType: 'ship',
        // };

        const mainData = {
            data: asteroiddata,
            image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
            MetaData: getMetaDataKey(savedins.Key),
            metaKey: savedins.Key,
            name: NewName, // array with single name or multiple names same for airdrop and others
            collectionAddress: asteroiddata.collectionId.CollectionContractAddress,
            // names: [NewName], // array with single name or multiple names same for airdrop and others
            isType: 'planet',
        };
        const gameValue = await adminservice.get_GameValues();
        // let usd = asteroiddata.price;
        // let assetType = priceType;

        let ethPrice = 0;
        if (priceType == 'coin') {
            const priceData = await convertUsdToAsset({
                usd: asteroiddata.price,
                assetType: priceType,
            });
            console.log('ETH Price:', priceData.amount);
            // ethPrice = (Number(priceData.amount) * 10 ** 18).toString()
            ethPrice = new BigNumber(toFixedNumber(priceData.amount))
                .multipliedBy('1e18')
                .integerValue(BigNumber.ROUND_DOWN)
                .toFixed(0);
        }

        const data = {
            nftInfos: [
                {
                    uri: getMetaDataKey(savedins.Key),
                    nftType: 721,
                    royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,
                    // price: (Number(usd) * 10 ** 18).toString(),                                 // convertUsdToAsset({ usd, assetType }),
                    price:
                        priceType == 'token'
                            ? (Number(asteroiddata.price) * 10 ** 18).toString()
                            : ethPrice,
                    supply: 1,
                    isAirdrop: false,
                    buyWith: priceType === 'token' ? symbol : '',
                },
                {
                    uri: crewIpfsData.metaKey,
                    nftType: 721,
                    royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,
                    price: 0,
                    supply: 1,
                    isAirdrop: true,
                    buyWith: '',
                },
                {
                    uri: ShipIpfsData.metaKey,
                    nftType: 721,
                    royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,
                    price: 0,
                    supply: 1,
                    isAirdrop: true,
                    buyWith: '',
                },
            ],
            address: [
                asteroiddata.collectionId.CollectionContractAddress,
                crewIpfsData.collectionAddress,
                ShipIpfsData.collectionAddress,
            ],
            message: `3:${Date.now()}`,
            status: JSON.stringify({
                planet: mainData,
                crew: crewIpfsData,
                ship: ShipIpfsData,
            }),
            signature: '',
        };
        console.log(data, 'ipfsForAstroid');
        return sendRes(res, 200, true, 'metafile created ready to mint', data);
    } catch (error) {
        console.error(error);
        sendRes(res, 500, false, error.message);
    }
};

function buildOffsets(config) {
    const offsets = {};
    let currentOffset = 0;

    for (const asset of config) {
        offsets[asset.type] = {};
        for (const rarity of asset.rarities) {
            offsets[asset.type][rarity.name] = currentOffset;
            currentOffset += rarity.count;
        }
    }

    return offsets;
}

const OFFSETS = buildOffsets(CONFIG.PLANET_ASTROID_OFFSET);

function getCrewName({ type, rarity, localId }) {
    const offset = OFFSETS?.[type]?.[rarity];

    if (offset === undefined) {
        throw new Error('Invalid type or rarity');
    }

    const crewNumber = offset + localId;

    return `crew #${String(crewNumber).padStart(3, '0')}`;
}

// function getCrewName({ type, rarity, localId }) {
//     return `crew_${type}_${rarity}_${String(localId).padStart(3, "0")}`;
// }

function extractLocalIdFromName(name) {
    const match = name.match(/\d+/);
    if (!match) {
        throw new Error('No local ID found in name');
    }
    return Number(match[0]);
}

// this function use to get the free crew for that planet
// like the way crew is assigned to a planet

// async function getTheFreeCrewForThatPlanet(planetData) {
//     const crewNameNeedtoFind = getCrewName({
//         type: planetData.type,
//         rarity: planetData.rarity,
//         localId: extractLocalIdFromName(planetData.name),
//     });
//     console.log("crewNameNeedtoFind", crewNameNeedtoFind)

//     const FreeCrewAsset = await gameservice.FindOne_crewAsset({
//         name: crewNameNeedtoFind,
//         isActive: true,
//         profession: 'crew',
//     });
//     console.log("FreeCrewAsset", FreeCrewAsset)

//     return FreeCrewAsset;
// }

async function getTheFreeCrewForThatPlanet(planetData) {
    const crewData = planetData.crewId;
    console.log('getTheFreeCrewForThatPlanet', crewData);

    if (!crewData) {
        throw new Error('No crew assigned to this planet');
    }

    return crewData;
}

async function createIpfsForFreeCrew(planetData, walletAddress) {
    // Implementation for creating IPFS for free crew[x]
    const gameSettings = await getGameValues();

    console.log('createIpfsForFreeCrew', planetData);
    // will work for astroid and planet
    const crewdata = await getTheFreeCrewForThatPlanet(planetData);
    console.log('crewdata', crewdata, crewdata?.image);
    const URL = GetOriginalImage(crewdata?.image);
    console.log('createIpfsForFreeCrew_URL', URL);
    const NFTIpfs = await uploadAndGenerateUrl({ item: 'img', path: URL });
    console.log('NFTIpfs', NFTIpfs);
    if (!NFTIpfs) throw new Error('ipfs failed for free Crew ');

    const tme = Date.now();
    // const NewName = await nftService.getNextName(crewdata?.name);
    const NewName = crewdata?.name;

    const payload = {
        name: NewName,
        description: crewdata?.description,
        image: CONFIG.IPFS_IMG + NFTIpfs,
        attributes: crewdata.NFTProperties ? crewdata.NFTProperties : [],
        xp: 0,
    };

    const JSOnpat = generateMetaStoreFilePath(walletAddress);

    const key = JSOnpat;
    const senddata = JSON.stringify(payload);
    const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');

    // const savedins = await uploadImageToS3(key, senddata, 'text/plain');

    if (!savedins.status) throw new Error('failed to save');

    return {
        data: crewdata,
        image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
        MetaData: getMetaDataKey(savedins.Key),
        metaKey: savedins.Key,
        name: NewName,
        collectionAddress: crewdata.collection.CollectionContractAddress,
        isType: 'crew',
    };
}

async function createIpfsForFreeShip(walletAddress) {
    const gameSettings = await getGameValues();
    console.log('gameSettings', gameSettings);
    const shipData = await gameservice.findOneShip({
        _id: gameSettings.freeShipId,
    });

    if (!shipData) {
        throw new Error(' Free Ship not found');
    }

    const URL = GetOriginalImage(shipData?.image);

    const NFTIpfs = await uploadAndGenerateUrl({ item: 'img', path: URL });
    logger.info('uploadAndGenerateUrl for free ship  NFTIpfs ', NFTIpfs);

    if (!NFTIpfs) {
        throw new Error('Uploaded Failed');
    }

    const tme = Date.now();
    const NewName = shipData?.shipName;

    const payload = {
        name: NewName,
        description: shipData?.description,
        image: config.IPFS_IMG + NFTIpfs,
        attributes: [],
    };
    const JSOnpat = generateMetaStoreFilePath(walletAddress);

    const key = JSOnpat;
    const senddata = JSON.stringify(payload);
    // const savedins = await uploadImageToS3(key, senddata, 'text/plain');
    const savedins = await uploadOrUpdateIpfsToS3(key, senddata, 'text/plain');
    logger.info('uploadAndGenerateUrl for free ship  NFTIpfs ', savedins);

    if (!savedins.status) throw new Error('Uploaded Failed');

    return {
        data: shipData,
        image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
        MetaData: getMetaDataKey(savedins.Key),
        metaKey: savedins.Key,
        name: NewName,
        collectionAddress: shipData.collection.CollectionContractAddress,
        isType: 'ship',
    };
}

export const getPlanetAsteroidAssets = async (req, res) => {
    try {
        const rarities = ['common', 'uncommon', 'rare'];
        const result = {
            planet: [],
            asteroid: [],
        };

        for (const rarity of rarities) {
            const randomPlanet = await planetdb.aggregate([
                {
                    $match: {
                        type: 'planet',
                        rarity: rarity,
                        isActive: true,
                    },
                },
                { $sample: { size: 1 } },
                {
                    $project: {
                        _id: 0,
                        slots: 1,
                        price: 1,
                    },
                },
            ]);

            const randomAsteroid = await planetdb.aggregate([
                {
                    $match: {
                        type: 'asteroid',
                        rarity: rarity,
                        isActive: true,
                    },
                },
                { $sample: { size: 1 } },
                {
                    $project: {
                        _id: 0,
                        slots: 1,
                        price: 1,
                    },
                },
            ]);

            // result.planet[rarity] = randomPlanet[0];
            // result.asteroid[rarity] = randomAsteroid[0];

            const planetLeftCount = await planetdb.countDocuments({
                type: 'planet',
                rarity: rarity,
                isActive: true,
            });

            const asteroidLeftCount = await planetdb.countDocuments({
                type: 'asteroid',
                rarity: rarity,
                isActive: true,
            });

            result.planet.push({
                ...randomPlanet[0],
                name: rarity,
                image: `/planettype/${rarity}.png`,
                leftCount: planetLeftCount,
            });

            result.asteroid.push({
                ...randomAsteroid[0],
                name: rarity,
                image: `/asteroidtype/${rarity}.png`,
                leftCount: asteroidLeftCount,
            });
        }
        console.log('getPlanetAsteroidAssets', result);
        return sendRes(res, 200, true, 'Assets fetched successfully', result);
    } catch (error) {
        console.log('error', error);
        return sendRes(res, 500, false, error.message);
    }
};

function selectRarityByAvailability(availability) {
    const available = [];

    if (availability.common > 0) {
        available.push({
            rarity: 'common',
            weight: availability.common,
        });
    }

    if (availability.uncommon > 0) {
        available.push({
            rarity: 'uncommon',
            weight: availability.uncommon,
        });
    }

    if (availability.rare > 0) {
        available.push({
            rarity: 'rare',
            weight: availability.rare,
        });
    }

    if (available.length === 0) {
        return null;
    }

    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    console.log('🚀 ~ selectRarityByAvailability ~ totalWeight:', totalWeight);

    let random = Math.random() * totalWeight;
    console.log('🚀 ~ selectRarityByAvailability ~ random:', random);

    for (const item of available) {
        random -= item.weight;

        if (random < 0) {
            return item.rarity;
        }
    }

    return available[available.length - 1].rarity;
}

export const ipfsForSpecialCrew = async (req, res) => {
    try {
        const {
            body: { gender, key, priceType, symbol },
            userData,
        } = req;
        console.log('ipfsForSpecialCrew', gender, key, priceType, symbol, userData);

        const walletAddress = userData.WalletAddress;

        // Get remaining crew availability for this profession + gender
        const availableCrews = await crew_db
            .find({
                profession: key,
                gender: gender,
                isActive: true,
            })
            .select('rarity');

        if (!availableCrews.length) {
            return sendRes(
                res,
                404,
                false,
                'No special crew available for this profession or gender',
            );
        }

        // Count remaining crew by rarity
        const availability = {
            common: 0,
            uncommon: 0,
            rare: 0,
        };

        availableCrews.forEach((crew) => {
            const rarity = (crew.rarity || '').toLowerCase();

            if (rarity === 'common') {
                availability.common++;
            } else if (rarity === 'uncommon') {
                availability.uncommon++;
            } else if (rarity === 'rare') {
                availability.rare++;
            }
        });

        console.log('Crew availability:', availability);

        // Select rarity based on remaining supply
        const selectedRarity = selectRarityByAvailability(availability);

        if (!selectedRarity) {
            return sendRes(res, 404, false, 'No special crew available');
        }

        console.log('Selected rarity:', selectedRarity);

        // Get random crew from selected rarity
        const crewpayload = {
            key: key,
            gender: gender,
            rarity: selectedRarity,
        };

        let crewData = await gameservice.getSpecialCrew(crewpayload);

        console.log('crewData', crewData);
        if (!crewData) {
            return sendRes(
                res,
                404,
                false,
                'No special crew available for this profession or gender',
            );
        }
        const NFTIpfs = await uploadAndGenerateUrl({
            item: 'img',
            path: GetOriginalImage(crewData.image),
        });

        if (!NFTIpfs) {
            return sendRes(res, 400, false, 'Uploaded Failed', {});
        }

        const NewName = crewData?.name;
        // metadata
        const payload = {
            names: NewName,
            description: crewData?.description,
            image: CONFIG.IPFS_IMG + NFTIpfs,
            attributes: crewData.NFTProperties ? crewData.NFTProperties : [],
            xp: 0,
        };
        const JSOnpat = generateMetaStoreFilePath(walletAddress);
        const keyss = JSOnpat;
        const senddata = JSON.stringify(payload);

        const savedins = await uploadOrUpdateIpfsToS3(keyss, senddata, 'text/plain');
        if (!savedins.status) return sendRes(res, 400, false, 'Uploaded Failed', {});

        const gameValue = await adminservice.get_GameValues();

        const mainData = {
            data: crewData,
            image_ipfs: CONFIG.IPFS_IMG + NFTIpfs,
            MetaData: getMetaDataKey(savedins.Key),
            metaKey: savedins.Key,
            collectionAddress: crewData.collection.CollectionContractAddress,
            name: NewName, // array with single name o multiple names same for airdrop and others
            isType: 'specialcrew',
        };
        // const crewIpfsData = await createIpfsForFreeCrew(planetdata, walletAddress);

        const professionData = await professionSchema
            .findOne({ key: crewData.profession.toUpperCase() }, { nftCost: 1, key: 1 })
            .lean();
        const nftCost = professionData.nftCost;

        console.log('Profession:', professionData.key);
        console.log('NFT Cost:', nftCost);

        if (!professionData) {
            return sendRes(res, 404, false, 'Profession not found');
        }

        const priceData = await convertUsdToAsset({
            usd: nftCost,
            assetType: priceType,
        });

        console.log('ETH Price:', priceData.amount);
        // const ethPrice = (Number(priceData.amount) * 10 ** 18).toString()
        const ethPrice = new BigNumber(toFixedNumber(priceData.amount))
            .multipliedBy('1e18')
            .integerValue(BigNumber.ROUND_DOWN)
            .toFixed();

        const data = {
            nftInfos: [
                {
                    uri: getMetaDataKey(savedins.Key),
                    nftType: 721,
                    royalty: gameValue?.default_royalty ?? CONFIG.DEFAULT_ROYALTY,
                    // price: convertUsdToAsset(planetdata.price, priceType),
                    // price: (Number(crewData.nftPrice) * 10 ** 18).toString(), //only buy with token
                    price:
                        priceType == 'token' ? (Number(nftCost) * 10 ** 18).toString() : ethPrice,
                    supply: 1,
                    level: 1,
                    isAirdrop: false,
                    buyWith: priceType === 'token' ? symbol : '',
                },
            ],
            address: [crewData.collection.CollectionContractAddress],
            message: `3:${Date.now()}`,
            status: JSON.stringify({
                specialcrew: mainData,
            }),
            signature: '',
        };

        return sendRes(res, 200, true, 'metafile created ready to mint', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

// api : /api/v1/game/planetrewards

export const getPlanetRewards = async (req, res) => {
    try {
        // const { walletAddress , planetId } = req.query
        const { userPlanetId } = req.query;
        const { userData } = req;

        const userPlanetData = await gameservice.userPlanetFindOne({
            _id: userPlanetId,
        });

        const find_data = {
            userPlanetId: userPlanetId,
            isInventory: false,
        };

        const userAsset = await gameservice.UserAssetList_service(find_data);

        // Get all currencies/tokens
        const currencies = await currenciesdb.find({
            isActive: true,
        });

        // Total rewards accumulator
        const totalRewards = {};

        currencies.forEach((token) => {
            totalRewards[token.label] = 0;
        });

        userAsset.forEach((element) => {
            // Add current reward totals
            if (element.reward?.length) {
                element.reward.forEach((reward) => {
                    if (!totalRewards[reward.label]) {
                        totalRewards[reward.label] = 0;
                    }

                    totalRewards[reward.label] += Number(reward.amount || 0);
                });
            }
        });

        // Convert object to array format
        const allRewards = Object.keys(totalRewards).map((key) => ({
            label: key,
            amount: Number(totalRewards[key].toFixed(3)),
        }));

        // userAsset.forEach((element) => {
        //     element.levelId.image_url = signature_imageURL(element.levelId?.image);

        //     if (element.next) {
        //         element.next.image_url = signature_imageURL(element.next?.image);
        //     }
        // });

        // const equiedShips = await gameservice.UserShip_Service({ equippedPlanet: userPlanetId });
        // if (equiedShips.length) {
        //     equiedShips.forEach((element) => {
        //         element.shipId.image_url = signature_imageURL(element.shipId?.image);
        //     });
        // }

        // const data = {
        //     // userAsset: userAsset,
        //     // equippedShips: equiedShips,
        //     totalRewards: allRewards
        // };

        sendRes(res, 200, true, 'success', allRewards);
    } catch (error) {
        return sendRes(res, 500, false, error.message, {});
    }
};
