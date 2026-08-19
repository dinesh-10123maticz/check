import {
    add_minutes,
    isEmpty,
    sendGameResponseEncrpted,
    sendRes,
    signature_imageURL,
} from '../../shared/commonFunction';
import { get_GameValues } from '../admin/adminlogin/admin.service';
import * as gameService from '../game/game.service';
import * as nftService from '../nft/nft.services';
import * as missionService from './mission.service';
import * as userService from '../user/user.services';
import * as exchangeService from '../exchange/exchange.service';
import * as adminService from "../admin/adminlogin/admin.service"
import {
    addpriceCurrencyinCirculate_service,
    collectiontypeFindOne,
} from '../admin/cms/cms.service';
import constant from '../../shared/constant';
import {
    explorePlanetCreate,
    explorePlanetFind,
    explorePlanetFindOne,
} from './services/exploredPlanet.service';
import {
    nearByPlanetFind,
    nearByPlanetFindOne,
    nearByPlanetwithSkipAndLimit,
} from '../game/services/nearbyPlanet.service';
import { httpStatus } from '../../utils/httpStatus';
import config from '../../config/config';
import CONSTANTS from '../../shared/constant';
import logger from '../../utils/logger';
import gameSettingsSchema from '../admin/adminlogin/schema/gameSettings.schema';

function addpercentinReward(array, time) {
    let arr = array;
    for (let i = 0; i < arr.length; i++) {
        arr[i].amount = (time / 100) * arr[i].amount + arr[i].amount; // find the percent value and add it to existing amount
    }
    return arr;
}
// async function getLevelWithXp(totalXp, rarity) {
//     let getGame = await adminService.getGameValues({})
//     console.log("getGame", getGame, getGame?.missionRarityLevel)
//     if (!totalXp) {
//         return 0;
//     }
//     const rarityConfig = getGame?.missionRarityLevel?.find(
//         (item) => item.rarity.toLowerCase() === rarity.toLowerCase()
//     );
//     if (!rarityConfig) {
//         console.log("Invalid rarity:", rarity);
//         return 0;
//     }
//     const xpPoints = Number(rarityConfig.xpPoints); // 100 / 90 / 80
//     console.log("getLevel", Math.floor(totalXp / xpPoints))
//     return Math.floor(totalXp / xpPoints);

// }

// function getLevelWithXp(previousLevel, previousXp, totalXp, rarity, missionRarityLevel, missionMultiplier) {
//     console.log("getLevelWithXp", previousLevel, previousXp, totalXp, rarity, missionRarityLevel, missionMultiplier)
//     if (!totalXp) {
//         return {
//             nftXpPercent: 0,
//             currentLevel: 1,
//             nextLevel: 2,
//             currentLevelXP: 0,
//             nextLevelRequiredXP: 0
//         };
//     }

//     const rarityConfig = missionRarityLevel.find(
//         (item) => item.rarity?.toLowerCase() === rarity?.toLowerCase()
//     );
//     console.log("rarityConfig", rarity, rarityConfig, Number(rarityConfig?.xpPoints))
//     if (!rarityConfig) {
//         return null;
//     }


//     let level = previousLevel;
//     let requiredXP = Number(rarityConfig?.xpPoints);

//     let multiplierConfig = missionMultiplier.find(
//         m => level >= m.minlevel && level <= m.maxlevel
//     );

//     let multiplier = multiplierConfig?.multiplier ?? 1;
//     // requiredXP = Math.floor(requiredXP * multiplier);

//     // requiredXP = Math.floor(
//     //     requiredXP * (level <= 20 ? 1.5 : 1.1)
//     // );
//     // let remainingXp = totalXp;
//     let remainingXp = totalXp - previousXp;

//     while (remainingXp >= requiredXP && level < 100) {
//         remainingXp -= requiredXP;
//         level++;

//         //  recalculate multiplier for new level
//         multiplierConfig = missionMultiplier.find(
//             m => level >= m.minlevel && level <= m.maxlevel
//         );

//         multiplier = multiplierConfig?.multiplier ?? 1;

//         requiredXP = Math.floor(requiredXP * multiplier);

//         // requiredXP = Math.floor(
//         //     requiredXP * (level <= 20 ? 1.5 : 1.1)
//         // );
//     }



//     let XpPercent = remainingXp / requiredXP
//     return {
//         nftXpPercent: XpPercent, //Total XP
//         previousLevel: previousLevel,
//         currentLevel: level, //Final level reached
//         nextLevel: level < 100 ? level + 1 : 100, //Next target level
//         perviousLevelXp: previousXp,
//         currentLevelXP: totalXp, //XP inside current level
//         nextLevelRequiredXP: requiredXP - remainingXp, //XP needed to level up
//     };
// }


function getLevelWithXp(
    previousLevel,
    previousXp,
    totalXp,
    rarity,
    missionRarityLevel,
    missionMultiplier
) {

    if (!totalXp || totalXp <= 0) {
        return {
            nftXpPercent: 0,

            previousLevel: previousLevel || 1,
            currentLevel: 1,

            nextLevel: 2,

            previousLevelXp: previousXp || 0,
            currentLevelXP: 0,

            nextLevelRequiredXP: 0,

            earnedXp: 0
        };
    }

    const rarityConfig = missionRarityLevel.find(
        item =>
            item.rarity?.toLowerCase() === rarity?.toLowerCase()
    );

    if (!rarityConfig) {
        return null;
    }

    let level = 1;

    // Base XP by rarity
    let requiredXP = Number(rarityConfig.xpPoints);

    // let multiplierConfig = missionMultiplier.find(
    //     m => level > m.minlevel && level <= m.maxlevel
    // );

    // let multiplier =
    //     multiplierConfig?.multiplier ?? 1;

    // requiredXP = Math.floor(requiredXP * multiplier);

    let remainingXp = totalXp;

    while (level < 100 && remainingXp >= requiredXP) {
        console.log("Level_before_upgrade", level, remainingXp, requiredXP)
        remainingXp -= requiredXP;

        level++;

        const multiplierConfig = missionMultiplier.find(
            m => level > m.minlevel && level <= m.maxlevel
        );

        const multiplier =
            multiplierConfig?.multiplier ?? 1;

        // Compounded progression
        requiredXP = requiredXP + (requiredXP * multiplier)
        console.log("Level_after_upgrade", level, remainingXp, requiredXP)
    }

    return {

        nftXpPercent:
            requiredXP > 0
                ? remainingXp / requiredXP
                : 0,

        // frontend previous data
        previousLevel,

        previousLevelXp: previousXp,

        // newly calculated data
        currentLevel: level,

        nextLevel:
            level < 100
                ? level + 1
                : 100,

        currentLevelXP: totalXp,

        nextLevelRequiredXP:
            requiredXP,

        earnedXp: totalXp - previousXp,
        remainingXp: remainingXp
        // totalXp
    };
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function get_total_nft_xp_percet_for_crewData(crewtokenData) {
    let nftXpPercent = 0; // variable for add xp in percent
    const crewDetails = [];

    let getGame = await adminService.getGameValues({})
    console.log("getGame", getGame, getGame?.missionRarityLevel)
    const missionRarityLevel = getGame?.missionRarityLevel;

    // Calculate total XP percent for crew tokens 100 == 1 percent 200 == 2 percent
    for (let i = 0; i < crewtokenData.length; i++) {
        const xp = crewtokenData[i]?.totalXP ?? 0;

        const rarityConfig = missionRarityLevel.find(
            (item) => item.rarity?.toLowerCase() === crewtokenData[i]?.rarity?.toLowerCase()
        );
        // const levelData = await getLevelWithXp(xp, crewtokenData[i]?.rarity, missionRarityLevel);
        // console.log("levelData", levelData)
        nftXpPercent += (xp / Number(rarityConfig.xpPoints)) || 0;

        // crewDetails.push({
        //     tokenId: crewtokenData[i]?._id,
        //     ...levelData
        // });
    }
    // return {
    //     nftXpPercent,
    //     crewDetails
    // }
    return nftXpPercent
}


// function multiamount(array, time) {
//     const times = Number(time);
//     let arr = array;
//     for (let i = 0; i < arr.length; i++) {
//         arr[i].amount = arr[i].amount * times;
//     }
//     return arr;
// }
function multiamount(array = [], time) {
    array = typeof array === 'string' ? JSON.parse(array) : array;
    console.log(array, "multiamount__multiamount")
    const times = Number(time);
    return array.map((item) => ({
        ...item,
        amount: item.amount * times,
    }));
}

function calculateRewardforRefferedUser(amount, refPercent) {
    conole.log("calculateRewardforRefferedUser", (refPercent / 100) * amount)
    return (refPercent / 100) * amount;
}

function resolveContribution({ profession, nft, missionType, context }) {
    // 1️⃣ base value
    let value = profession.baseContribution?.[missionType] || 0;

    const specials = profession.conditionalContribution || [];

    for (const rule of specials) {
        if (!checkCondition(rule.condition, nft, context)) continue;

        // ADD example (Pilot +2)
        if (rule.mode === 'ADD') {
            value += rule.stats?.[missionType] || 0;
        }

        // OVERRIDE example (Mech Pilot → 4)
        if (rule.mode === 'OVERRIDE') {
            value = rule.stats?.[missionType] ?? value;
        }
    }

    return value;
}

function checkCondition(condition, nft, context) {
    switch (condition) {
        case 'PILOT_SLOT':
            return nft.isPilot === true;

        case 'MECH_SHIP':
            return nft.isPilot && context.shipType === 'MECH_SHIP';

        case 'CAPITAL_SHIP':
            return nft.isPilot && context.shipType === 'CAPITAL_SHIP';

        case 'ON_SHIP':
            return context.onShip === true;

        default:
            return false;
    }
}

// used in game.helper.js
export const getSurveyMissionResource = () => {
    function getRandomNumber() {
        return Math.floor(Math.random() * 10) + 1;
    }

    const resource = [
        {
            name: 'Mining resources',
            lable: 'mining_resources',
            amount: getRandomNumber(),
        },
        {
            name: 'Xeno population',
            lable: 'xeno_population',
            amount: getRandomNumber(),
        },
        {
            name: 'Alien artifacts',
            lable: 'alien_artifacts',
            amount: getRandomNumber(),
        },
        {
            name: 'social',
            lable: 'social',
            amount: getRandomNumber(),
        },
    ];

    return resource;
};

export const MissionStatus = async (req, res) => {
    try {
        // get the user data from token
        const { userData } = req;

        const [claimed, notclaimed, pending] = await Promise.all([
            missionService.find_BattleStatus({ fromUserId: userData._id, rewardClaimed: true }),
            missionService.find_BattleStatus({
                fromUserId: userData._id,
                rewardClaimed: false,
                mission_EndTime: { $lt: new Date() },
            }),
            missionService.find_BattleStatus({
                fromUserId: userData._id,
                rewardClaimed: false,
                mission_EndTime: { $gt: new Date() },
            }),
        ]);

        const data = {
            claimed: claimed,
            notclaimed: notclaimed,
            pending: pending,
        };

        sendRes(res, 200, true, 'fetched', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const MissionStatusV3 = async (req, res) => {
    try {
        // get the user data from token
        let {
            userData,
            query: { page, limit, type },
        } = req;
        let data = {};

        if (['claimed', 'notclaimed', 'pending'].indexOf(type) === -1) {
            return sendRes(res, 400, false, 'invalid type');
        }
        page = Number(page) || 1;
        limit = Number(limit);
        // Calculate skip value
        const skip = (page - 1) * limit;
        if (type === 'claimed') {
            data = await missionService.missionStatsFindWithPagination(
                {
                    userId: userData._id,
                    rewardClaimed: true,
                },
                skip,
                limit,
            );
        }
        if (type === 'notclaimed') {
            data = await missionService.missionStatsFindWithPagination(
                {
                    userId: userData._id,
                    rewardClaimed: false,
                    endAt: { $lt: new Date() },
                },
                skip,
                limit,
            );
        }

        if (type === 'pending') {
            data = await missionService.missionStatsFindWithPagination(
                {
                    userId: userData._id,
                    rewardClaimed: false,
                    endAt: { $gt: new Date() },
                },
                skip,
                limit,
            );
        }
        console.log("MissionStatusV3_data", data)
        // const [claimed, notclaimed, pending] = await Promise.all([
        //     missionService.missionStatsFind({}),
        //     missionService.missionStatsFind({}),
        // ]);

        // const data = {
        //     claimed: claimed,
        //     notclaimed: notclaimed,
        //     pending: pending,
        // };

        sendRes(res, 200, true, 'fetched', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const MissionHistoryV3 = async (req, res) => {
    try {
        // get the user data from token
        let {
            userData,
            query: { page, limit },
        } = req;

        page = Number(page) || 1;
        limit = Number(limit);
        // Calculate skip value
        const skip = (page - 1) * limit;
        let data = await missionService.findUserBasedMissionStatswithPopulate(
            {
                userId: userData._id
            },
            skip,
            limit,
        );
        console.log("MissionHistoryV3_data", data)

        sendRes(res, 200, true, 'fetched', data);
    } catch (error) {
        console.log("🚀 ~ MissionHistoryV3 ~ error:", error)
        sendRes(res, 500, false, error.message);
    }
};

export const MissionStatusDetail = async (req, res) => {
    try {
        const {
            params: { missionStatsId },
        } = req;
        if (!missionStatsId) {
            return sendRes(res, 422, false, 'missionStatsId is required', {
                message: 'need to add the missionStatsId  that in the url path in last',
            });
        }
        const missionStatsData = await missionService.findOneMissionStatswithPopulate({
            _id: missionStatsId,
        });

        sendRes(res, 200, true, 'fetched', missionStatsData);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const missionRewardList = async (req, res) => {
    try {
        const data = await missionService.FindMissionReward({});
        sendRes(res, 200, true, 'fetched', data ? data : []);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const missionRewardDelete = async (req, res) => {
    try {
        const {
            params: { id },
        } = req;
        if (!id) {
            sendRes(res, 422, false, 'id required');
        }
        const deleted = await missionService.missionRewardDeleteOne({ _id: id });
        sendRes(res, 200, true, 'deleted', deleted);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const creatMissionReward = async (req, res) => {
    try {
        const { explore, combat, mining, social } = req.body;
        const list = await missionService.FindMissionReward({});
        explore.forEach((item) => {
            item.amount = Number(item.amount);
        });
        combat.forEach((item) => {
            item.amount = Number(item.amount);
        });
        mining.forEach((item) => {
            item.amount = Number(item.amount);
        });
        social.forEach((item) => {
            item.amount = Number(item.amount);
        });
        const payload = {
            rewardNumber: list.length + 1,
            explore: explore,
            combat: combat,
            mining: mining,
            social: social,
        };

        const data = await missionService.CreateMissionReward(payload);
        sendRes(res, 201, true, 'created', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const updateMissionReward = async (req, res) => {
    try {
        const { id, explore, combat, mining, social } = req.body;

        const payload = {
            explore: explore,
            combat: combat,
            mining: mining,
            social: social,
        };
        const updated = await missionService.FindOneAndUpdateMissionReward({ _id: id }, payload);
        sendRes(
            res,
            updated ? 200 : 400,
            updated ? true : false,
            updated ? 'updated success' : 'failed to update',
            updated,
        );
    } catch (e) {
        sendRes(res, 500, false, error.message);
    }
};
export const missionCrew = async (req, res) => {
    try {
        const {
            body: { page, limit },
            userData,
        } = req;
        const Type = await collectiontypeFindOne({ type: constant.CREW });
        const pageno = (page - 1) * limit;
        const crewDatax = await missionService.missionCrew_Service(userData, Type, pageno, limit);
        const data = crewDatax[0].results;
        const totCount = crewDatax[0].totalCount[0]?.count ?? 0;
        data.forEach((element) => {
            element.tokenData.image_url = signature_imageURL(element.tokenData.image_url);
        });

        const resPayload = {
            result: data,
            totalCount: totCount,
        };

        sendRes(res, 200, true, 'fetched', resPayload);
    } catch (error) {
        sendRes(res, 400, false, error.message);
    }
};

// multiple mission on same planet is not allowed restriction
const isUserOnGoingMissionOnThatPlanet = async (userId, nearByPlanetId, missionType) => {
    const data = await missionService.FindOneMissionStats({
        userId: userId,
        missionPlanetId: nearByPlanetId,
        mission: missionType,
        endAt: { $gt: new Date() },
    });

    return data ? true : false;
};

//same mission type on different planet is not alowed restriction
const isUserOnGoingMissionByType = async (userId, nearByPlanetId, missionType) => {
    const data = await missionService.FindOneMissionStats({
        userId,
        mission: missionType,
        missionPlanetId: { $ne: nearByPlanetId },
        endAt: { $gt: new Date() },
        isProgress: true
    });

    return data ? true : false;
};


// v3  find
// it is used to start the explore mission on the nearByPlanet

// export const missionExploreStart = async (req, res) => {
//     try {
//         const {
//             body: { nearByPlanetId, userShipId, crew, scope, missiontype },
//             userData,
//         } = req;
//         console.log("missionExploreStart_req", nearByPlanetId, userShipId, crew, scope, missiontype)
//         const exist = await explorePlanetFindOne({
//             nearByPlanetId: nearByPlanetId,
//             userId: userData._id,
//         });
//         const gameValue = await get_GameValues();

//         // if (exist) return sendGameResponseEncrpted(res, 400, false, 'planet already explored');
//         const isOnGoingMission = await isUserOnGoingMissionOnThatPlanet(
//             userData._id,
//             nearByPlanetId,
//             missiontype,
//         );

//         if (isOnGoingMission) {
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 'you have already an ongoing mission on this planet',
//             );
//         }

//         // get user ship data
//         const userShipData = await gameService.findOneUserShipById(userShipId);
//         console.log("userShipData", userShipData, userShipId)
//         // actual ship data
//         const shipdata = await userShipData?.shipId;

//         const nearByPlanet = await nearByPlanetFindOne({ _id: nearByPlanetId });
//         // check the ship can allow for this mission
//         if (userShipData?.shipId?.allowMission != 'all') {
//             if (userShipData?.shipId?.allowMission != missiontype) {
//                 return sendGameResponseEncrpted(
//                     res,
//                     400,
//                     false,
//                     'you cannot take this ship to this mission',
//                 );
//             }
//         }

//         if (userShipData.shipId.nftSlots < crew.length) {
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 `sorry ${userShipData.shipId?.shipName} only ${userShipData.shipId?.nftSlots} slots available`,
//             );
//         }

//         let randomNumber = Math.floor(Math.random() * 50) + 1; // randomly generate the value between 1 to 50
//         console.log("randomNumber", randomNumber)
//         // let randomNumber = 6
//         // console.log("randomNumber", randomNumber)
//         const missionReward = await missionService.FindOneMissionReward({
//             rewardNumber: randomNumber,
//         }); // get the mission reward based on the randomly generated value
//         console.log("missionReward", missionReward)
//         const findmin = gameValue.missionReward.find((x) => x.scope === scope); //  find the reward for that scope
//         console.log("rewardforScope", findmin)

//         const time = Date.now();
//         const crewnftidarray = [];
//         const crewforsearch = [];
//         const updateNFTMissionStarted = [];

//         for (let i = 0; i < crew.length; i++) {
//             crewnftidarray.push({ tokenId: crew[i]?.tokenId }); //tokenowners_list ---> tokenData
//             crewforsearch.push(crew[i]?.tokenId); //tokenowners_list ---> tokenData
//             // nftXpPercent = nftXpPercent + crew[i].tokenowners_list.XpPercent
//             updateNFTMissionStarted.push({
//                 updateOne: {
//                     filter: { ContractAddress: crew[i]?.ContractAddress, NFTId: crew[i]?.NFTId },
//                     update: { missionAvailability: false },
//                 },
//             });
//         }

//         const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);
//         // Special Crew Profession Validation

//         const professionSet = new Set();

//         for (let i = 0; i < crewtokenData.length; i++) {
//             const crewItem = crewtokenData[i];
//             const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
//             crewtokenData[i].rarity = crewData.rarity
//             console.log("crewData_rarity", crewData)
//             // Identify special crew
//             if (crewItem?.crewType !== "crew") {

//                 const professionKey = crewItem?.crewType?.toUpperCase();

//                 if (!professionKey) {
//                     return sendGameResponseEncrpted(
//                         res,
//                         400,
//                         false,
//                         "Invalid special crew: missing crewType"
//                     );
//                 }

//                 // Duplicate profession check
//                 if (professionSet.has(professionKey)) {
//                     return sendGameResponseEncrpted(
//                         res,
//                         400,
//                         false,
//                         `You can’t assign multiple crew with the same profession! (${professionKey}) `
//                     );
//                 }

//                 professionSet.add(professionKey);
//             }
//         }
//         console.log(crewtokenData, "crewtokenData___")

//         // Calculate total XP percent for crew tokens(xp points) 100 == 1 percent 200 == 2 percent
//         let nftXpPercent = await get_total_nft_xp_percet_for_crewData(crewtokenData); // variable for add xp in percent
//         logger.info('Total XP percent:', nftXpPercent);
//         console.log("nftXpPercent", nftXpPercent)

//         // // base contribution for each crew token
//         // const totalBaseContributionPercent = await getMissionBaseContribution({
//         //     crewTokens: crewtokenData,
//         //     missionType: missiontype,
//         // });

//         // logger.info('Total base contribution percent:', totalBaseContributionPercent);

//         const rewardarrary = multiamount(JSON.stringify(missionReward[missiontype]), findmin.rewardTimes); // mutiple the reward for that particular mission scope
//         console.log("rewardarrary", rewardarrary)

//         const rewardarraywithnftxp = nftXpPercent
//             ? addpercentinReward(rewardarrary, nftXpPercent)
//             : rewardarrary;
//         console.log("rewardarraywithnftxp", rewardarraywithnftxp)

//         const payload = {
//             userId: userData?._id,
//             walletAddress: userData?.WalletAddress,
//             missionPlanetId: nearByPlanetId, // nearByPlanetID
//             userShipId: userShipId,
//             crew: crewnftidarray,
//             missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
//             startAt: time,
//             endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
//             mission: missiontype,
//             missionReward: rewardarraywithnftxp,
//         };

//         const [missionStats, updateNFTmission, updatetoken, ship] = await Promise.all([
//             missionService.createMissionStats(payload),
//             nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
//             nftService.FindOneAndUpdateTokenService(
//                 { _id: userShipData.nftId._id },
//                 { missionAvailability: false, missionType: "explore" },
//             ),
//             gameService.UserShipFindOneAndUpdate(
//                 { _id: userShipData._id },
//                 { isAvailableForMission: false, missionType: "explore" },
//             ),
//         ]);
//         console.log("missionStats", missionStats, updateNFTmission, updatetoken, ship)
//         const payloadExplorePlanet = {
//             userId: userData._id,
//             parentPlanetId: nearByPlanet.parentPlanetId,
//             nearByPlanetId: nearByPlanet._id,
//             isSurveyed: false,
//         };
//         const exploredData = await explorePlanetCreate(payloadExplorePlanet);

//         const missionStatsData = await missionService.findOneMissionStatswithPopulate({
//             _id: missionStats._id,
//         });
//         // missionStatsData.xpData = xpData;
//         console.log("missionStatsData", missionStatsData)
//         sendGameResponseEncrpted(res, 201, true, 'survey started', {
//             data: exploredData,
//             missionStats: missionStatsData
//         });
//     } catch (e) {
//         console.log("missionexplore_err", e)
//         sendGameResponseEncrpted(res, 500, false, e.message);
//     }
// };


/** Mission steps **/

// Mission Validation
//         │
//         ▼
// Planet Score / 2
//         │
//         ▼
// Ship Extra Reward
//         │
//         ▼
// Total Score
//         │
//         ▼
// Crew Roll Score
//         │
//         ▼
// Final Roll Score
//         │
//         ▼
// Math.round()
//         │
//         ▼
// Mission Reward Table
//         │
//         ▼
// Scope Multiplier
//         │
//         ▼
// Booster %
//         │
//         ▼
// Crew Level %
//         │
//         ▼
// Save Mission

export const missionExploreStart = async (req, res) => {
    try {
        const {
            body: { nearByPlanetId, userShipId, crew, scope, missiontype },
            userData,
        } = req;
        console.log("missionExploreStart_req", nearByPlanetId, userShipId, crew, scope, missiontype)

        const gameValue = await get_GameValues();

        const isOnGoingMission = await isUserOnGoingMissionOnThatPlanet(
            userData._id,
            nearByPlanetId,
            missiontype,
        );

        if (isOnGoingMission) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                'You already have an ongoing mission on this planet.',
            );
        }

        const isOnGoingMissionByType = await isUserOnGoingMissionByType(
            userData._id,
            nearByPlanetId,
            missiontype,
        );

        if (isOnGoingMissionByType) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                `You already have an ongoing ${missiontype} mission. Complete it before starting another ${missiontype} mission.`,
            );
        }

        // get user ship data
        const userShipData = await gameService.findOneUserShipById(userShipId);
        console.log("userShipData", userShipData, userShipId)
        // actual ship data
        // const shipdata = userShipData?.shipId;

        // check the ship can allow for this mission
        if (userShipData?.shipId?.allowMission !== 'all') {
            if (userShipData?.shipId?.allowMission !== missiontype) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    'This ship is not eligible for the selected mission.',
                );
            }
        }

        if (userShipData.shipId.nftSlots < crew.length) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                `Sorry, ${userShipData.shipId?.shipName} has only ${userShipData.shipId?.nftSlots} crew slot${userShipData.shipId?.nftSlots > 1 ? "s" : ""} available.`,
            );
        }

        //**step 1** : Get planetResources based on mission type ( xeno : combat , Alien artifacts : explore , mining resources : mining , social : social)

        const nearByPlanet = await nearByPlanetFindOne({ _id: nearByPlanetId });

        const missionResourceMap = {
            explore: "alien_artifacts",
            social: "social",
            combat: "xeno_population",
            mining: "mining_resources",
        };

        const resourceLabel = missionResourceMap[missiontype];
        console.log("Mission Type:", missiontype);

        if (!resourceLabel) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                "Invalid mission type."
            );
        }

        const planetResource = nearByPlanet?.planetResources?.find(
            (resource) => resource.lable === resourceLabel
        );
        console.log("Planet Resource:", planetResource);

        const halfPlanetScore = (planetResource?.amount || 0) / 2;
        console.log("Half Planet Score:", halfPlanetScore);

        //**step 2** : Get ship details and Add Ship Bonus (Extra Reward)

        console.log("extraReward", userShipData?.shipId?.extraReward)
        let shipBonus = userShipData?.shipId?.extraReward || 0;

        //add both score and ship bonus
        let totalScore = halfPlanetScore + shipBonus;
        console.log("Total Score (Half Planet Score + Ship Bonus):", totalScore);

        //**step 3** : Prepare and validate selected crew
        const time = Date.now();
        const crewnftidarray = [];
        const crewforsearch = [];
        const updateNFTMissionStarted = [];

        for (let i = 0; i < crew.length; i++) {
            crewnftidarray.push({ tokenId: crew[i]?.tokenId }); //tokenowners_list ---> tokenData
            crewforsearch.push(crew[i]?.tokenId); //tokenowners_list ---> tokenData
            updateNFTMissionStarted.push({
                updateOne: {
                    filter: { ContractAddress: crew[i]?.ContractAddress, NFTId: crew[i]?.NFTId },
                    update: { missionAvailability: false },
                },
            });
        }

        const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);
        console.log("crewtokenData", crewtokenData)

        // Validate special crew professions

        const professionSet = new Set();

        const missionBonusMap = {};

        for (let i = 0; i < crewtokenData.length; i++) {
            const crewItem = crewtokenData[i];

            // Normal crew
            if (crewItem.crewType === "crew") {
                continue;
            }

            //special crew
            const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
            console.log("crewData", crewData, crewItem?.NFTName, crewItem.crewType)
            if (!crewData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Crew data not found for ${crewItem.NFTName}`
                );
            }

            crewtokenData[i].profession = crewItem?.crewType?.replace(/_/g, " ")?.toUpperCase();
            crewtokenData[i].rarity = crewData.rarity
            console.log("crewData_rarity", crewData)

            const profession = crewtokenData[i].profession;

            if (!missionBonusMap[profession]) {
                missionBonusMap[profession] =
                    await missionService.findOneMissionBonusReward(profession);
            }

            if (!missionBonusMap[profession]) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${profession}`
                );
            }


            // Identify special crew
            // if (crewItem?.crewType !== "crew") {

            const professionKey = crewItem?.crewType?.toUpperCase();

            if (!professionKey) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    "Invalid special crew: missing crewType"
                );
            }

            // Duplicate profession check
            if (professionSet.has(professionKey)) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `You can’t assign multiple crew with the same profession! (${professionKey}) `
                );
            }

            professionSet.add(professionKey);
            // }
        }
        console.log(crewtokenData, "crewtokenData___")

        //**step 4**: Add to roll(rollOnReward) based on ship which crew should be on that ship otherwise give rollonreward

        const missionFieldMap = {
            mining: "miningBonusReward",
            explore: "exploreBonusReward",
            social: "socialBonusReward",
            combat: "combatBonusReward",
        };

        let crewScore = 0;

        for (const crewItem of crewtokenData) {

            // Normal crew always contributes 1
            if (crewItem.crewType === "crew") {
                crewScore += 1;
                continue;
            }

            const bonusData = missionBonusMap[crewItem.profession];
            console.log("bonusData", bonusData)

            if (!bonusData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${crewItem.profession}`
                );
            }

            const shipRule = bonusData?.rollOnReward?.find(
                item => item.shipId.toString() === userShipData.shipId._id.toString()
            );
            console.log("shipRule", shipRule)

            if (shipRule) {
                // Required ship selected → give mission bonus
                crewScore += bonusData[missionFieldMap[missiontype]];
            } else if (bonusData?.rollOnReward?.length > 0) {
                // Wrong ship selected → give fallback roll contribution
                crewScore += bonusData?.rollOnReward[0]?.reward;
            } else {
                // No ship restriction → give mission bonus
                crewScore += bonusData[missionFieldMap[missiontype]];
            }
        }

        console.log("Crew Score:", crewScore);
        let finalRollScore = totalScore + crewScore;

        //**step 5**: Round of the rollon reward

        finalRollScore = Math.round(finalRollScore);
        console.log("Final Roll Score:", finalRollScore);

        //**step 6**: Base Mission reward calculation based on the finalRollScore and the missiontype and scope

        const missionReward = await missionService.FindOneMissionReward({ rewardNumber: finalRollScore });
        console.log("missionReward", missionReward)
        if (!missionReward) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                "Mission reward configuration not found."
            );
        }
        const findmin = gameValue.missionReward.find((x) => x.scope === scope);
        console.log("rewardforScope", findmin, findmin.rewardTimes)


        if (!findmin) {
            return sendGameResponseEncrpted(res, 400, false, "Invalid mission scope.");
        }
        // mutiple the reward for that particular mission scope
        const rewardarrary = multiamount(JSON.stringify(missionReward[missiontype]), findmin.rewardTimes);
        console.log("rewardarrary", rewardarrary)


        //**step 7**: Add and Multiply Base Mission reward by Boosters percentage

        let totalBoosterPercentage = 0;

        for (const crewItem of crewtokenData) {

            // Normal crew has no booster
            if (crewItem.crewType === "crew") continue;

            const bonusData = missionBonusMap[crewItem.profession];

            if (!bonusData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${crewItem.profession}`
                );
            }

            const boosters = bonusData?.boostReward || [];

            for (const booster of boosters) {
                if (
                    booster.mission === "all" ||
                    booster.mission === missiontype
                ) {
                    totalBoosterPercentage += booster.reward;
                }
            }
        }

        console.log("Total Booster Percentage:", totalBoosterPercentage);

        const rewardarraywithbooster = rewardarrary.map((reward) => ({
            ...reward,
            amount:
                reward.amount + (reward.amount * totalBoosterPercentage) / 100,
        }));

        console.log("Reward With Booster:", rewardarraywithbooster);

        // **step 8** : Calculate Crew Level based Reward

        let totalCrewLevel = 0;

        for (const crewItem of crewtokenData) {
            totalCrewLevel += Number(crewItem.level || 0);
        }

        console.log("Total Crew Level:", totalCrewLevel);

        // Example:
        // Total Level = 35
        // Bonus Percentage = 35 / 100 = 0.35 (35%)

        const crewLevelPercentage = totalCrewLevel / 100;

        console.log("Crew Level Percentage:", crewLevelPercentage);

        // Apply Crew Level Bonus on reward after boosters

        const rewardarraywithcrewlevel = rewardarraywithbooster.map((reward) => ({
            ...reward,
            amount:
                reward.amount +
                (reward.amount * crewLevelPercentage),
        }));

        console.log("Reward With Crew Level:", rewardarraywithcrewlevel);


        console.log("🚀 ~ missionExploreStart ~ time:", time, add_minutes(time, findmin.mission_min))

        const payload = {
            userId: userData?._id,
            walletAddress: userData?.WalletAddress,
            missionPlanetId: nearByPlanetId, // nearByPlanetID
            userShipId: userShipId,
            crew: crewnftidarray,
            missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
            startAt: time,
            endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
            mission: missiontype,
            // missionReward: rewardarraywithnftxp,
            missionReward: rewardarraywithcrewlevel,
        };

        const [missionStats, updateNFTmission, updatetoken, ship] = await Promise.all([
            missionService.createMissionStats(payload),
            nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
            nftService.FindOneAndUpdateTokenService(
                { _id: userShipData.nftId._id },
                { missionAvailability: false, missionType: "explore" },
            ),
            gameService.UserShipFindOneAndUpdate(
                { _id: userShipData._id },
                { isAvailableForMission: false, missionType: "explore" },
            ),
        ]);
        console.log("missionStats", missionStats, updateNFTmission, updatetoken, ship)

        const payloadExplorePlanet = {
            userId: userData._id,
            parentPlanetId: nearByPlanet.parentPlanetId,
            nearByPlanetId: nearByPlanet._id,
            isSurveyed: false,
        };
        const exploredData = await explorePlanetCreate(payloadExplorePlanet);

        const missionStatsData = await missionService.findOneMissionStatswithPopulate({
            _id: missionStats._id,
        });
        // missionStatsData.xpData = xpData;
        console.log("missionStatsData", missionStatsData)

        sendGameResponseEncrpted(res, 201, true, 'survey started', {
            data: exploredData,
            missionStats: missionStatsData
        });

    } catch (e) {
        console.log("missionexplore_err", e)
        sendGameResponseEncrpted(res, 500, false, e.message);
    }
};

// export const missionMiningStart = async (req, res) => {
//     try {
//         const {
//             body: { nearByPlanetId, userShipId, crew, scope, missiontype },
//             userData,
//         } = req;
//         const exist = await explorePlanetFindOne({
//             nearByPlanetId: nearByPlanetId,
//             userId: userData._id,
//         });
//         const gameValue = await get_GameValues();

//         if (!exist)
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 'Planet not explored please explore and come again! ',
//             );
//         const isOnGoingMission = await isUserOnGoingMissionOnThatPlanet(
//             userData._id,
//             nearByPlanetId,
//             missiontype,
//         );

//         if (isOnGoingMission) {
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 'you have already an ongoing mission on this planet',
//             );
//         }

//         // get user ship data
//         const userShipData = await gameService.findOneUserShipById(userShipId);
//         // actual ship data
//         const shipdata = await userShipData.shipId;

//         const nearByPlanet = await nearByPlanetFindOne({ _id: nearByPlanetId });
//         // check the ship can allow for this mission
//         if (userShipData.shipId.allowMission != 'all') {
//             if (userShipData.shipId.allowMission != missiontype) {
//                 return sendGameResponseEncrpted(
//                     res,
//                     400,
//                     false,
//                     'you cannot take this ship to this mission',
//                 );
//             }
//         }

//         if (userShipData.shipId.nftSlots < crew.length) {
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 `sorry ${userShipData.shipId?.shipName} only ${userShipData.shipId?.nftSlots} slots available`,
//             );
//         }

//         let randomNumber = Math.floor(Math.random() * 50) + 1; // randomly generate the value between 1 to 50
//         console.log("randomNumber", randomNumber)
//         const missionReward = await missionService.FindOneMissionReward({
//             rewardNumber: randomNumber,
//         }); // get the mission reward based on the randomly generated value
//         console.log("missionReward", missionReward)

//         const findmin = gameValue.missionReward.find((x) => x.scope === scope); //  find the reward for that scope

//         const time = Date.now();
//         const crewnftidarray = [];
//         const crewforsearch = [];
//         const updateNFTMissionStarted = [];

//         for (let i = 0; i < crew.length; i++) {
//             crewnftidarray.push({ tokenId: crew[i].tokenId }); //tokenowners_list ---> tokenData
//             crewforsearch.push(crew[i].tokenId); //tokenowners_list ---> tokenData
//             // nftXpPercent = nftXpPercent + crew[i].tokenowners_list.XpPercent
//             updateNFTMissionStarted.push({
//                 updateOne: {
//                     filter: { ContractAddress: crew[i].ContractAddress, NFTId: crew[i].NFTId },
//                     update: { missionAvailability: false },
//                 },
//             });
//         }

//         const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);


//         // Special Crew Profession Validation

//         const professionSet = new Set();

//         for (let i = 0; i < crewtokenData.length; i++) {
//             const crewItem = crewtokenData[i];
//             const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
//             crewtokenData[i].rarity = crewData.rarity
//             console.log("crewData_rarity", crewData)
//             // Identify special crew
//             if (crewItem?.crewType !== "crew") {

//                 const professionKey = crewItem?.crewType?.toUpperCase();

//                 if (!professionKey) {
//                     return sendGameResponseEncrpted(
//                         res,
//                         400,
//                         false,
//                         "Invalid special crew: missing crewType"
//                     );
//                 }

//                 // Duplicate profession check
//                 if (professionSet.has(professionKey)) {
//                     return sendGameResponseEncrpted(
//                         res,
//                         400,
//                         false,
//                         `You can’t assign multiple crew with the same profession! (${professionKey}) `
//                     );
//                 }

//                 professionSet.add(professionKey);
//             }
//         }


//         let nftXpPercent = await get_total_nft_xp_percet_for_crewData(crewtokenData); // variable for add xp in percent
//         const rewardarrary = multiamount(JSON.stringify(missionReward[missiontype]), findmin.rewardTimes); // mutiple the reward for that particular mission scope
//         console.log("rewardarrary", rewardarrary)
//         const rewardarraywithnftxp = nftXpPercent
//             ? addpercentinReward(rewardarrary, nftXpPercent)
//             : rewardarrary;
//         console.log("rewardarraywithnftxp", rewardarraywithnftxp)


//         const payload = {
//             userId: userData?._id,
//             walletAddress: userData?.WalletAddress,
//             missionPlanetId: nearByPlanetId, // nearByPlanetID
//             userShipId: userShipId,
//             crew: crewnftidarray,
//             missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
//             startAt: time,
//             endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
//             mission: missiontype,
//             missionReward: rewardarraywithnftxp,
//         };

//         const [missionStats, updateNFTmission, updatetoken, ship] = await Promise.all([
//             missionService.createMissionStats(payload),
//             nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
//             nftService.FindOneAndUpdateTokenService(
//                 { _id: userShipData.nftId._id },
//                 { missionAvailability: false, missionType: "mining" },
//             ),
//             gameService.UserShipFindOneAndUpdate(
//                 { _id: userShipData._id },
//                 { isAvailableForMission: false, missionType: "mining" },
//             ),
//         ]);

//         sendGameResponseEncrpted(res, 201, true, 'Mining started', {
//             // data: exploredData,
//             missionStats: await missionService.findOneMissionStatswithPopulate({
//                 _id: missionStats._id,
//             }),
//         });
//     } catch (e) {
//         sendGameResponseEncrpted(res, 500, false, e.message);
//     }
// };

export const missionMiningStart = async (req, res) => {
    try {
        const {
            body: { nearByPlanetId, userShipId, crew, scope, missiontype },
            userData,
        } = req;
        console.log("missionMiningStart_req", nearByPlanetId, userShipId, crew, scope, missiontype)
        const exist = await explorePlanetFindOne({
            nearByPlanetId: nearByPlanetId,
            userId: userData._id,
        });
        const gameValue = await get_GameValues();

        if (!exist)
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                'Planet not explored. Please explore it first and try again.',
            );

        const isOnGoingMission = await isUserOnGoingMissionOnThatPlanet(
            userData._id,
            nearByPlanetId,
            missiontype,
        );

        if (isOnGoingMission) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                'You already have an ongoing mission on this planet.',
            );
        }

        const isOnGoingMissionByType = await isUserOnGoingMissionByType(
            userData._id,
            nearByPlanetId,
            missiontype,
        );

        if (isOnGoingMissionByType) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                `You already have an ongoing ${missiontype} mission. Complete it before starting another ${missiontype} mission.`,
            );
        }


        // get user ship data
        const userShipData = await gameService.findOneUserShipById(userShipId);
        console.log("userShipData", userShipData, userShipId)
        // actual ship data
        // const shipdata = await userShipData.shipId;

        // check the ship can allow for this mission
        if (userShipData?.shipId?.allowMission !== 'all') {
            if (userShipData?.shipId?.allowMission !== missiontype) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    'This ship is not eligible for the selected mission.',
                );
            }
        }

        if (userShipData.shipId.nftSlots < crew.length) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                `Sorry, ${userShipData.shipId?.shipName} has only ${userShipData.shipId?.nftSlots} crew slot${userShipData.shipId?.nftSlots > 1 ? "s" : ""} available.`,
            );
        }



        //**step 1** : Get planetResources based on mission type ( xeno : combat , Alien artifacts : explore , mining resources : mining , social : social)

        const nearByPlanet = await nearByPlanetFindOne({ _id: nearByPlanetId });

        const missionResourceMap = {
            explore: "alien_artifacts",
            social: "social",
            combat: "xeno_population",
            mining: "mining_resources",
        };

        const resourceLabel = missionResourceMap[missiontype];
        console.log("Mission Type:", missiontype);

        if (!resourceLabel) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                "Invalid mission type."
            );
        }

        const planetResource = nearByPlanet?.planetResources?.find(
            (resource) => resource.lable === resourceLabel
        );
        console.log("Planet Resource:", planetResource);

        const halfPlanetScore = (planetResource?.amount || 0) / 2;
        console.log("Half Planet Score:", halfPlanetScore);

        //**step 2** : Get ship details and Add Ship Bonus (Extra Reward)

        console.log("extraReward", userShipData?.shipId?.extraReward)
        let shipBonus = userShipData?.shipId?.extraReward || 0;

        //add both score and ship bonus
        let totalScore = halfPlanetScore + shipBonus;
        console.log("Total Score (Half Planet Score + Ship Bonus):", totalScore);

        //**step 3** : Prepare and validate selected crew

        const time = Date.now();
        const crewnftidarray = [];
        const crewforsearch = [];
        const updateNFTMissionStarted = [];

        for (let i = 0; i < crew.length; i++) {
            crewnftidarray.push({ tokenId: crew[i].tokenId }); //tokenowners_list ---> tokenData
            crewforsearch.push(crew[i].tokenId); //tokenowners_list ---> tokenData
            updateNFTMissionStarted.push({
                updateOne: {
                    filter: { ContractAddress: crew[i].ContractAddress, NFTId: crew[i].NFTId },
                    update: { missionAvailability: false },
                },
            });
        }

        const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);
        console.log("crewtokenData", crewtokenData)

        // Special Crew Profession Validation

        const professionSet = new Set();

        const missionBonusMap = {};

        for (let i = 0; i < crewtokenData.length; i++) {
            const crewItem = crewtokenData[i];

            // Normal crew
            if (crewItem.crewType === "crew") {
                continue;
            }

            //special crew
            const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
            console.log("crewData", crewData, crewItem?.NFTName, crewItem.crewType)
            if (!crewData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Crew data not found for ${crewItem.NFTName}`
                );
            }

            crewtokenData[i].profession = crewItem?.crewType?.replace(/_/g, " ")?.toUpperCase();
            crewtokenData[i].rarity = crewData.rarity
            console.log("crewData_rarity", crewData)

            const profession = crewtokenData[i].profession;

            if (!missionBonusMap[profession]) {
                missionBonusMap[profession] =
                    await missionService.findOneMissionBonusReward(profession);
            }

            if (!missionBonusMap[profession]) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${profession}`
                );
            }

            // Identify special crew
            // if (crewItem?.crewType !== "crew") {

            const professionKey = crewItem?.crewType?.toUpperCase();

            if (!professionKey) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    "Invalid special crew: missing crewType"
                );
            }

            // Duplicate profession check
            if (professionSet.has(professionKey)) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `You can’t assign multiple crew with the same profession! (${professionKey}) `
                );
            }

            professionSet.add(professionKey);
            // }
        }
        console.log(crewtokenData, "crewtokenData___")

        //**step 4**: Add to roll(rollOnReward) based on ship which crew should be on that ship otherwise give rollonreward

        const missionFieldMap = {
            mining: "miningBonusReward",
            explore: "exploreBonusReward",
            social: "socialBonusReward",
            combat: "combatBonusReward",
        };

        let crewScore = 0;

        for (const crewItem of crewtokenData) {

            // Normal crew always contributes 1
            if (crewItem.crewType === "crew") {
                crewScore += 1;
                continue;
            }

            const bonusData = missionBonusMap[crewItem.profession];
            console.log("bonusData", bonusData)

            if (!bonusData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${crewItem.profession}`
                );
            }

            const shipRule = bonusData?.rollOnReward?.find(
                item => item.shipId.toString() === userShipData.shipId._id.toString()
            );
            console.log("shipRule", shipRule)

            if (shipRule) {
                // Required ship selected → give mission bonus
                crewScore += bonusData[missionFieldMap[missiontype]];
            } else if (bonusData?.rollOnReward?.length > 0) {
                // Wrong ship selected → give fallback roll contribution
                crewScore += bonusData?.rollOnReward[0]?.reward;
            } else {
                // No ship restriction → give mission bonus
                crewScore += bonusData[missionFieldMap[missiontype]];
            }
        }

        console.log("Crew Score:", crewScore);
        let finalRollScore = totalScore + crewScore;

        //**step 5**: Round of the rollon reward

        finalRollScore = Math.round(finalRollScore);
        console.log("Final Roll Score:", finalRollScore);

        //**step 6**: Base Mission reward calculation based on the finalRollScore and the missiontype and scope

        const missionReward = await missionService.FindOneMissionReward({ rewardNumber: finalRollScore });
        console.log("missionReward", missionReward)
        if (!missionReward) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                "Mission reward configuration not found."
            );
        }
        const findmin = gameValue.missionReward.find((x) => x.scope === scope);
        console.log("rewardforScope", findmin, findmin.rewardTimes)


        if (!findmin) {
            return sendGameResponseEncrpted(res, 400, false, "Invalid mission scope.");
        }
        // mutiple the reward for that particular mission scope
        const rewardarrary = multiamount(JSON.stringify(missionReward[missiontype]), findmin.rewardTimes);
        console.log("rewardarrary", rewardarrary)


        //**step 7**: Add and Multiply Base Mission reward by Boosters percentage

        let totalBoosterPercentage = 0;

        for (const crewItem of crewtokenData) {

            // Normal crew has no booster
            if (crewItem.crewType === "crew") continue;

            const bonusData = missionBonusMap[crewItem.profession];

            if (!bonusData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${crewItem.profession}`
                );
            }

            const boosters = bonusData?.boostReward || [];

            for (const booster of boosters) {
                if (
                    booster.mission === "all" ||
                    booster.mission === missiontype
                ) {
                    totalBoosterPercentage += booster.reward;
                }
            }
        }

        console.log("Total Booster Percentage:", totalBoosterPercentage);

        const rewardarraywithbooster = rewardarrary.map((reward) => ({
            ...reward,
            amount:
                reward.amount + (reward.amount * totalBoosterPercentage) / 100,
        }));

        console.log("Reward With Booster:", rewardarraywithbooster);

        // **step 8** : Calculate Crew Level based Reward

        let totalCrewLevel = 0;

        for (const crewItem of crewtokenData) {
            totalCrewLevel += Number(crewItem.level || 0);
        }

        console.log("Total Crew Level:", totalCrewLevel);

        // Example:
        // Total Level = 35
        // Bonus Percentage = 35 / 100 = 0.35 (35%)

        const crewLevelPercentage = totalCrewLevel / 100;

        console.log("Crew Level Percentage:", crewLevelPercentage);

        // Apply Crew Level Bonus on reward after boosters

        const rewardarraywithcrewlevel = rewardarraywithbooster.map((reward) => ({
            ...reward,
            amount:
                reward.amount +
                (reward.amount * crewLevelPercentage),
        }));

        console.log("Reward With Crew Level:", rewardarraywithcrewlevel);


        const payload = {
            userId: userData?._id,
            walletAddress: userData?.WalletAddress,
            missionPlanetId: nearByPlanetId, // nearByPlanetID
            userShipId: userShipId,
            crew: crewnftidarray,
            missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
            startAt: time,
            endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
            mission: missiontype,
            missionReward: rewardarraywithcrewlevel,
        };

        const [missionStats, updateNFTmission, updatetoken, ship] = await Promise.all([
            missionService.createMissionStats(payload),
            nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
            nftService.FindOneAndUpdateTokenService(
                { _id: userShipData.nftId._id },
                { missionAvailability: false, missionType: "mining" },
            ),
            gameService.UserShipFindOneAndUpdate(
                { _id: userShipData._id },
                { isAvailableForMission: false, missionType: "mining" },
            ),
        ]);
        console.log("missionStats", missionStats, updateNFTmission, updatetoken, ship)

        sendGameResponseEncrpted(res, 201, true, 'Mining started', {
            missionStats: await missionService.findOneMissionStatswithPopulate({
                _id: missionStats._id,
            }),
        });
    } catch (e) {
        console.log("missionMining_err", e)
        sendGameResponseEncrpted(res, 500, false, e.message);
    }
};

// export const missionCombatStart = async (req, res) => {
//     try {
//         const {
//             body: { nearByPlanetId, userShipId, crew, scope, missiontype },
//             userData,
//         } = req;
//         const exist = await explorePlanetFindOne({
//             nearByPlanetId: nearByPlanetId,
//             userId: userData._id,
//         });
//         const gameValue = await get_GameValues();

//         if (!exist)
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 'Planet not explored please explore and come again! ',
//             );
//         const isOnGoingMission = await isUserOnGoingMissionOnThatPlanet(
//             userData._id,
//             nearByPlanetId,
//             missiontype,
//         );

//         if (isOnGoingMission) {
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 'you have already an ongoing mission on this planet',
//             );
//         }

//         // get user ship data
//         const userShipData = await gameService.findOneUserShipById(userShipId);
//         // actual ship data
//         const shipdata = userShipData.shipId;

//         const nearByPlanet = await nearByPlanetFindOne({ _id: nearByPlanetId });
//         // check the ship can allow for this mission
//         if (userShipData.shipId.allowMission != 'all') {
//             if (userShipData.shipId.allowMission != missiontype) {
//                 return sendGameResponseEncrpted(
//                     res,
//                     400,
//                     false,
//                     'you cannot take this ship to this mission',
//                 );
//             }
//         }

//         if (userShipData.shipId.nftSlots < crew.length) {
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 `sorry ${userShipData.shipId?.shipName} only ${userShipData.shipId?.nftSlots} slots available`,
//             );
//         }

//         let randomNumber = Math.floor(Math.random() * 50) + 1; // randomly generate the value between 1 to 50

//         const missionReward = await missionService.FindOneMissionReward({
//             rewardNumber: randomNumber,
//         }); // get the mission reward based on the randomly generated value

//         const findmin = gameValue.missionReward.find((x) => x.scope === scope); //  find the reward for that scope

//         const time = Date.now();
//         const crewnftidarray = [];
//         const crewforsearch = [];
//         const updateNFTMissionStarted = [];

//         for (let i = 0; i < crew.length; i++) {
//             crewnftidarray.push({ tokenId: crew[i].tokenId }); //tokenowners_list ---> tokenData
//             crewforsearch.push(crew[i].tokenId); //tokenowners_list ---> tokenData
//             // nftXpPercent = nftXpPercent + crew[i].tokenowners_list.XpPercent
//             updateNFTMissionStarted.push({
//                 updateOne: {
//                     filter: { ContractAddress: crew[i].ContractAddress, NFTId: crew[i].NFTId },
//                     update: { missionAvailability: false },
//                 },
//             });
//         }

//         const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);


//         // Special Crew Profession Validation

//         const professionSet = new Set();

//         for (let i = 0; i < crewtokenData.length; i++) {
//             const crewItem = crewtokenData[i];
//             const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
//             crewtokenData[i].rarity = crewData.rarity
//             console.log("crewData_rarity", crewData)
//             // Identify special crew
//             if (crewItem?.crewType !== "crew") {

//                 const professionKey = crewItem?.crewType?.toUpperCase();

//                 if (!professionKey) {
//                     return sendGameResponseEncrpted(
//                         res,
//                         400,
//                         false,
//                         "Invalid special crew: missing crewType"
//                     );
//                 }

//                 // Duplicate profession check
//                 if (professionSet.has(professionKey)) {
//                     return sendGameResponseEncrpted(
//                         res,
//                         400,
//                         false,
//                         `You can’t assign multiple crew with the same profession! (${professionKey}) `
//                     );
//                 }

//                 professionSet.add(professionKey);
//             }
//         }

//         // Calculate total XP percent for crew tokens 100 == 1 percent 200 == 2 percent
//         let nftXpPercent = await get_total_nft_xp_percet_for_crewData(crewtokenData); // variable for add xp in percent


//         // let nftXpPercent = 0; // variable for add xp in percent

//         // for (let i = 0; i < crewtokenData.length; i++) {
//         //     nftXpPercent = nftXpPercent + getLevelWithXp(crewtokenData[i].totalXP); // add xp in percent for each crewdata
//         // }

//         const rewardarrary = multiamount(JSON.stringify(missionReward[missiontype]), findmin.rewardTimes);// mutiple the reward for that particular mission scope
//         const rewardarraywithnftxp = nftXpPercent
//             ? addpercentinReward(rewardarrary, nftXpPercent)
//             : rewardarrary;

//         const payload = {
//             userId: userData?._id,
//             walletAddress: userData?.WalletAddress,
//             missionPlanetId: nearByPlanetId, // nearByPlanetID
//             userShipId: userShipId,
//             crew: crewnftidarray,
//             missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
//             startAt: time,
//             endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
//             mission: missiontype,
//             missionReward: rewardarraywithnftxp,
//         };

//         const [missionStats, updateNFTmission, updatetoken, ship] = await Promise.all([
//             missionService.createMissionStats(payload),
//             nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
//             nftService.FindOneAndUpdateTokenService(
//                 { _id: userShipData.nftId._id },
//                 { missionAvailability: false, missionType: "combat" },
//             ),
//             gameService.UserShipFindOneAndUpdate(
//                 { _id: userShipData._id },
//                 { isAvailableForMission: false, missionType: "combat" },
//             ),
//         ]);

//         // const explorePayload = {
//         //     userId: userData._id,
//         //     walletAddress: userData?.WalletAddress,
//         //     missionPlanetId: missionPlanetId,
//         //     startAt: time,
//         //     endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin
//         //     missionStatsId: missionStats._id,
//         //     planetResources: getSurveyMissionResource(),
//         // };

//         // const exploredData = await missionService.createExplored(explorePayload);
//         // const explore = await missionService.findOneExploredPopulate({ _id: exploredData._id });

//         // const payloadExplorePlanet = {
//         //     userId: userData._id,
//         //     parentPlanetId: nearByPlanet.parentPlanetId,
//         //     nearByPlanetId: nearByPlanet._id,
//         //     isSurveyed: false,
//         // };

//         // const exploredData = await explorePlanetCreate(payloadExplorePlanet);

//         sendGameResponseEncrpted(res, 201, true, 'Xenos Engagement in Progress', {
//             // data: exploredData,
//             missionStats: await missionService.findOneMissionStatswithPopulate({
//                 _id: missionStats._id,
//             }),
//         });
//     } catch (e) {
//         sendGameResponseEncrpted(res, 500, false, e.message);
//     }
// };



export const missionCombatStart = async (req, res) => {
    try {
        const {
            body: { nearByPlanetId, userShipId, crew, scope, missiontype },
            userData,
        } = req;
        console.log("missionCombatStart_req", nearByPlanetId, userShipId, crew, scope, missiontype)
        const exist = await explorePlanetFindOne({
            nearByPlanetId: nearByPlanetId,
            userId: userData._id,
        });
        const gameValue = await get_GameValues();

        if (!exist)
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                'Planet not explored. Please explore it first and try again',
            );
        const isOnGoingMission = await isUserOnGoingMissionOnThatPlanet(
            userData._id,
            nearByPlanetId,
            missiontype,
        );

        if (isOnGoingMission) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                'You already have an ongoing mission on this planet.',
            );
        }

        const isOnGoingMissionByType = await isUserOnGoingMissionByType(
            userData._id,
            nearByPlanetId,
            missiontype,
        );

        if (isOnGoingMissionByType) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                `You already have an ongoing ${missiontype} mission. Complete it before starting another ${missiontype} mission.`,
            );
        }

        // get user ship data
        const userShipData = await gameService.findOneUserShipById(userShipId);
        console.log("userShipData", userShipData, userShipId)
        // actual ship data
        // const shipdata = userShipData.shipId;

        // check the ship can allow for this mission
        if (userShipData?.shipId?.allowMission !== 'all') {
            if (userShipData.shipId?.allowMission !== missiontype) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    'This ship is not eligible for the selected mission.',
                );
            }
        }

        if (userShipData.shipId.nftSlots < crew.length) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                `Sorry, ${userShipData.shipId?.shipName} has only ${userShipData.shipId?.nftSlots} crew slot${userShipData.shipId?.nftSlots > 1 ? "s" : ""} available.`,
            );
        }

        //**step 1** : Get planetResources based on mission type ( xeno : combat , Alien artifacts : explore , mining resources : mining , social : social)

        const nearByPlanet = await nearByPlanetFindOne({ _id: nearByPlanetId });

        const missionResourceMap = {
            explore: "alien_artifacts",
            social: "social",
            combat: "xeno_population",
            mining: "mining_resources",
        };

        const resourceLabel = missionResourceMap[missiontype];
        console.log("Mission Type:", missiontype);

        if (!resourceLabel) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                "Invalid mission type."
            );
        }

        const planetResource = nearByPlanet?.planetResources?.find(
            (resource) => resource.lable === resourceLabel
        );
        console.log("Planet Resource:", planetResource);

        const halfPlanetScore = (planetResource?.amount || 0) / 2;
        console.log("Half Planet Score:", halfPlanetScore);

        //**step 2** : Get ship details and Add Ship Bonus (Extra Reward)

        console.log("extraReward", userShipData?.shipId?.extraReward)
        let shipBonus = userShipData?.shipId?.extraReward || 0;

        //add both score and ship bonus
        let totalScore = halfPlanetScore + shipBonus;
        console.log("Total Score (Half Planet Score + Ship Bonus):", totalScore);

        //**step 3** : Prepare and validate selected crew
        const time = Date.now();
        const crewnftidarray = [];
        const crewforsearch = [];
        const updateNFTMissionStarted = [];

        for (let i = 0; i < crew.length; i++) {
            crewnftidarray.push({ tokenId: crew[i].tokenId }); //tokenowners_list ---> tokenData
            crewforsearch.push(crew[i].tokenId); //tokenowners_list ---> tokenData
            updateNFTMissionStarted.push({
                updateOne: {
                    filter: { ContractAddress: crew[i].ContractAddress, NFTId: crew[i].NFTId },
                    update: { missionAvailability: false },
                },
            });
        }

        const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);

        // Special Crew Profession Validation

        const professionSet = new Set();

        const missionBonusMap = {};

        for (let i = 0; i < crewtokenData.length; i++) {
            const crewItem = crewtokenData[i];


            // Normal crew
            if (crewItem.crewType === "crew") {
                continue;
            }

            //special crew
            const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
            if (!crewData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Crew data not found for ${crewItem.NFTName}`
                );
            }

            crewtokenData[i].profession = crewItem?.crewType?.replace(/_/g, " ")?.toUpperCase();
            crewtokenData[i].rarity = crewData.rarity
            console.log("crewData_rarity", crewData)

            const profession = crewtokenData[i].profession;

            if (!missionBonusMap[profession]) {
                missionBonusMap[profession] =
                    await missionService.findOneMissionBonusReward(profession);
            }

            if (!missionBonusMap[profession]) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${profession}`
                );
            }

            // Identify special crew
            // if (crewItem?.crewType !== "crew") {

            const professionKey = crewItem?.crewType?.toUpperCase();

            if (!professionKey) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    "Invalid special crew: missing crewType"
                );
            }

            // Duplicate profession check
            if (professionSet.has(professionKey)) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `You can’t assign multiple crew with the same profession! (${professionKey}) `
                );
            }

            professionSet.add(professionKey);
            // }
        }


        console.log(crewtokenData, "crewtokenData___")

        //**step 4**: Add to roll(rollOnReward) based on ship which crew should be on that ship otherwise give rollonreward

        const missionFieldMap = {
            mining: "miningBonusReward",
            explore: "exploreBonusReward",
            social: "socialBonusReward",
            combat: "combatBonusReward",
        };

        let crewScore = 0;

        for (const crewItem of crewtokenData) {

            // Normal crew always contributes 1
            if (crewItem.crewType === "crew") {
                crewScore += 1;
                continue;
            }

            const bonusData = missionBonusMap[crewItem.profession];
            console.log("bonusData", bonusData)

            if (!bonusData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${crewItem.profession}`
                );
            }

            const shipRule = bonusData?.rollOnReward?.find(
                item => item.shipId.toString() === userShipData.shipId._id.toString()
            );
            console.log("shipRule", shipRule)

            if (shipRule) {
                // Required ship selected → give mission bonus
                crewScore += bonusData[missionFieldMap[missiontype]];
            } else if (bonusData?.rollOnReward?.length > 0) {
                // Wrong ship selected → give fallback roll contribution
                crewScore += bonusData?.rollOnReward[0]?.reward;
            } else {
                // No ship restriction → give mission bonus
                crewScore += bonusData[missionFieldMap[missiontype]];
            }
        }

        console.log("Crew Score:", crewScore);
        let finalRollScore = totalScore + crewScore;

        //**step 5**: Round of the rollon reward

        finalRollScore = Math.round(finalRollScore);
        console.log("Final Roll Score:", finalRollScore);

        //**step 6**: Base Mission reward calculation based on the finalRollScore and the missiontype and scope

        const missionReward = await missionService.FindOneMissionReward({ rewardNumber: finalRollScore });
        console.log("missionReward", missionReward)
        if (!missionReward) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                "Mission reward configuration not found."
            );
        }
        const findmin = gameValue.missionReward.find((x) => x.scope === scope);
        console.log("rewardforScope", findmin, findmin.rewardTimes)


        if (!findmin) {
            return sendGameResponseEncrpted(res, 400, false, "Invalid mission scope.");
        }
        // mutiple the reward for that particular mission scope
        const rewardarrary = multiamount(JSON.stringify(missionReward[missiontype]), findmin.rewardTimes);
        console.log("rewardarrary", rewardarrary)


        //**step 7**: Add and Multiply Base Mission reward by Boosters percentage

        let totalBoosterPercentage = 0;

        for (const crewItem of crewtokenData) {

            // Normal crew has no booster
            if (crewItem.crewType === "crew") continue;

            const bonusData = missionBonusMap[crewItem.profession];

            if (!bonusData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${crewItem.profession}`
                );
            }

            const boosters = bonusData?.boostReward || [];

            for (const booster of boosters) {
                if (
                    booster.mission === "all" ||
                    booster.mission === missiontype
                ) {
                    totalBoosterPercentage += booster.reward;
                }
            }
        }

        console.log("Total Booster Percentage:", totalBoosterPercentage);

        const rewardarraywithbooster = rewardarrary.map((reward) => ({
            ...reward,
            amount:
                reward.amount + (reward.amount * totalBoosterPercentage) / 100,
        }));

        console.log("Reward With Booster:", rewardarraywithbooster);

        // **step 8** : Calculate Crew Level based Reward

        let totalCrewLevel = 0;

        for (const crewItem of crewtokenData) {
            totalCrewLevel += Number(crewItem.level || 0);
        }

        console.log("Total Crew Level:", totalCrewLevel);

        // Example:
        // Total Level = 35
        // Bonus Percentage = 35 / 100 = 0.35 (35%)

        const crewLevelPercentage = totalCrewLevel / 100;

        console.log("Crew Level Percentage:", crewLevelPercentage);

        // Apply Crew Level Bonus on reward after boosters

        const rewardarraywithcrewlevel = rewardarraywithbooster.map((reward) => ({
            ...reward,
            amount:
                reward.amount +
                (reward.amount * crewLevelPercentage),
        }));

        console.log("Reward With Crew Level:", rewardarraywithcrewlevel);


        const payload = {
            userId: userData?._id,
            walletAddress: userData?.WalletAddress,
            missionPlanetId: nearByPlanetId, // nearByPlanetID
            userShipId: userShipId,
            crew: crewnftidarray,
            missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
            startAt: time,
            endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
            mission: missiontype,
            missionReward: rewardarraywithcrewlevel,
        };

        const [missionStats, updateNFTmission, updatetoken, ship] = await Promise.all([
            missionService.createMissionStats(payload),
            nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
            nftService.FindOneAndUpdateTokenService(
                { _id: userShipData.nftId._id },
                { missionAvailability: false, missionType: "combat" },
            ),
            gameService.UserShipFindOneAndUpdate(
                { _id: userShipData._id },
                { isAvailableForMission: false, missionType: "combat" },
            ),
        ]);

        sendGameResponseEncrpted(res, 201, true, 'Xenos Engagement in Progress', {
            missionStats: await missionService.findOneMissionStatswithPopulate({
                _id: missionStats._id,
            }),
        });
    } catch (e) {
        console.log("missionCombat_err", e)
        sendGameResponseEncrpted(res, 500, false, e.message);
    }
};


// export const missionSocialStart = async (req, res) => {
//     try {
//         const {
//             body: { nearByPlanetId, userShipId, crew, scope, missiontype },
//             userData,
//         } = req;
//         const exist = await explorePlanetFindOne({
//             nearByPlanetId: nearByPlanetId,
//             userId: userData._id,
//         });
//         const gameValue = await get_GameValues();

//         if (!exist)
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 'Planet not explored please explore and come again! ',
//             );
//         const isOnGoingMission = await isUserOnGoingMissionOnThatPlanet(
//             userData._id,
//             nearByPlanetId,
//             missiontype,
//         );

//         if (isOnGoingMission) {
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 'you have already an ongoing mission on this planet',
//             );
//         }

//         // get user ship data
//         const userShipData = await gameService.findOneUserShipById(userShipId);
//         // actual ship data
//         const shipdata = await userShipData.shipId;

//         const nearByPlanet = await nearByPlanetFindOne({ _id: nearByPlanetId });
//         // check the ship can allow for this mission
//         if (userShipData.shipId.allowMission != 'all') {
//             if (userShipData.shipId.allowMission != missiontype) {
//                 return sendGameResponseEncrpted(
//                     res,
//                     400,
//                     false,
//                     'you cannot take this ship to this mission',
//                 );
//             }
//         }

//         if (userShipData.shipId.nftSlots < crew.length) {
//             return sendGameResponseEncrpted(
//                 res,
//                 400,
//                 false,
//                 `sorry ${userShipData.shipId?.shipName} only ${userShipData.shipId?.nftSlots} slots available`,
//             );
//         }

//         let randomNumber = Math.floor(Math.random() * 50) + 1; // randomly generate the value between 1 to 50

//         const missionReward = await missionService.FindOneMissionReward({
//             rewardNumber: randomNumber,
//         }); // get the mission reward based on the randomly generated value

//         const findmin = gameValue.missionReward.find((x) => x.scope === scope); //  find the reward for that scope

//         const time = Date.now();
//         const crewnftidarray = [];
//         const crewforsearch = [];
//         const updateNFTMissionStarted = [];

//         for (let i = 0; i < crew.length; i++) {
//             crewnftidarray.push({ tokenId: crew[i].tokenId }); //tokenowners_list ---> tokenData
//             crewforsearch.push(crew[i].tokenId); //tokenowners_list ---> tokenData
//             // nftXpPercent = nftXpPercent + crew[i].tokenowners_list.XpPercent
//             updateNFTMissionStarted.push({
//                 updateOne: {
//                     filter: { ContractAddress: crew[i].ContractAddress, NFTId: crew[i].NFTId },
//                     update: { missionAvailability: false },
//                 },
//             });
//         }

//         const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);


//         // Special Crew Profession Validation

//         const professionSet = new Set();

//         for (let i = 0; i < crewtokenData.length; i++) {
//             const crewItem = crewtokenData[i];
//             const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
//             crewtokenData[i].rarity = crewData.rarity
//             console.log("crewData_rarity", crewData)
//             // Identify special crew
//             if (crewItem?.crewType !== "crew") {

//                 const professionKey = crewItem?.crewType?.toUpperCase();

//                 if (!professionKey) {
//                     return sendGameResponseEncrpted(
//                         res,
//                         400,
//                         false,
//                         "Invalid special crew: missing crewType"
//                     );
//                 }

//                 // Duplicate profession check
//                 if (professionSet.has(professionKey)) {
//                     return sendGameResponseEncrpted(
//                         res,
//                         400,
//                         false,
//                         `You can’t assign multiple crew with the same profession! (${professionKey}) `
//                     );
//                 }

//                 professionSet.add(professionKey);
//             }
//         }



//         // let nftXpPercent = 0; // variable for add xp in percent

//         // for (let i = 0; i < crewtokenData.length; i++) {
//         //     nftXpPercent = nftXpPercent + getLevelWithXp(crewtokenData[i].totalXP); // add xp in percent for each crewdata
//         // }

//         let nftXpPercent = await get_total_nft_xp_percet_for_crewData(crewtokenData); // variable for add xp in percent


//         const rewardarrary = multiamount(JSON.stringify(missionReward[missiontype]), findmin.rewardTimes); // mutiple the reward for that particular mission scope
//         const rewardarraywithnftxp = nftXpPercent
//             ? addpercentinReward(rewardarrary, nftXpPercent)
//             : rewardarrary;

//         const payload = {
//             userId: userData?._id,
//             walletAddress: userData?.WalletAddress,
//             missionPlanetId: nearByPlanetId, // nearByPlanetID
//             userShipId: userShipId,
//             crew: crewnftidarray,
//             missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
//             startAt: time,
//             endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
//             mission: missiontype,
//             missionReward: rewardarraywithnftxp,
//         };

//         const [missionStats, updateNFTmission, updatetoken, ship] = await Promise.all([
//             missionService.createMissionStats(payload),
//             nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
//             nftService.FindOneAndUpdateTokenService(
//                 { _id: userShipData.nftId._id },
//                 { missionAvailability: false, missionType: "social" },
//             ),
//             gameService.UserShipFindOneAndUpdate(
//                 { _id: userShipData._id },
//                 { isAvailableForMission: false, missionType: "social" },
//             ),
//         ]);

//         // const payloadExplorePlanet = {
//         //     userId: userData._id,
//         //     parentPlanetId: nearByPlanet.parentPlanetId,
//         //     nearByPlanetId: nearByPlanet._id,
//         //     isSurveyed: false,
//         // };
//         // const exploredData = await explorePlanetCreate(payloadExplorePlanet);

//         sendGameResponseEncrpted(res, 201, true, 'Attending Social Event', {
//             // data: exploredData,
//             missionStats: await missionService.findOneMissionStatswithPopulate({
//                 _id: missionStats._id,
//             }),
//         });
//     } catch (e) {
//         sendGameResponseEncrpted(res, 500, false, e.message);
//     }
// };


export const missionSocialStart = async (req, res) => {
    try {
        const {
            body: { nearByPlanetId, userShipId, crew, scope, missiontype },
            userData,
        } = req;
        console.log("missionSocialStart_req", nearByPlanetId, userShipId, crew, scope, missiontype)
        const exist = await explorePlanetFindOne({
            nearByPlanetId: nearByPlanetId,
            userId: userData._id,
        });
        const gameValue = await get_GameValues();

        if (!exist)
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                'Planet not explored. Please explore it first and try again.',
            );
        const isOnGoingMission = await isUserOnGoingMissionOnThatPlanet(
            userData._id,
            nearByPlanetId,
            missiontype,
        );

        if (isOnGoingMission) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                'You already have an ongoing mission on this planet.',
            );
        }

        const isOnGoingMissionByType = await isUserOnGoingMissionByType(
            userData._id,
            nearByPlanetId,
            missiontype,
        );

        if (isOnGoingMissionByType) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                `You already have an ongoing ${missiontype} mission. Complete it before starting another ${missiontype} mission.`,
            );
        }

        // get user ship data
        const userShipData = await gameService.findOneUserShipById(userShipId);
        // actual ship data
        // const shipdata = await userShipData.shipId;

        // check the ship can allow for this mission
        if (userShipData?.shipId?.allowMission !== 'all') {
            if (userShipData?.shipId?.allowMission !== missiontype) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    'This ship is not eligible for the selected mission.',
                );
            }
        }

        if (userShipData.shipId.nftSlots < crew.length) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                `Sorry, ${userShipData.shipId?.shipName} has only ${userShipData.shipId?.nftSlots} crew slot${userShipData.shipId?.nftSlots > 1 ? "s" : ""} available.`,
            );
        }

        //**step 1** : Get planetResources based on mission type ( xeno : combat , Alien artifacts : explore , mining resources : mining , social : social)

        const nearByPlanet = await nearByPlanetFindOne({ _id: nearByPlanetId });

        const missionResourceMap = {
            explore: "alien_artifacts",
            social: "social",
            combat: "xeno_population",
            mining: "mining_resources",
        };

        const resourceLabel = missionResourceMap[missiontype];
        console.log("Mission Type:", missiontype);

        if (!resourceLabel) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                "Invalid mission type."
            );
        }

        const planetResource = nearByPlanet?.planetResources?.find(
            (resource) => resource.lable === resourceLabel
        );
        console.log("Planet Resource:", planetResource);

        const halfPlanetScore = (planetResource?.amount || 0) / 2;
        console.log("Half Planet Score:", halfPlanetScore);

        //**step 2** : Get ship details and Add Ship Bonus (Extra Reward)

        console.log("extraReward", userShipData?.shipId?.extraReward)
        let shipBonus = userShipData?.shipId?.extraReward || 0;

        //add both score and ship bonus
        let totalScore = halfPlanetScore + shipBonus;
        console.log("Total Score (Half Planet Score + Ship Bonus):", totalScore);

        //**step 3** : Prepare and validate selected crew

        const time = Date.now();
        const crewnftidarray = [];
        const crewforsearch = [];
        const updateNFTMissionStarted = [];

        for (let i = 0; i < crew.length; i++) {
            crewnftidarray.push({ tokenId: crew[i].tokenId }); //tokenowners_list ---> tokenData
            crewforsearch.push(crew[i].tokenId); //tokenowners_list ---> tokenData
            updateNFTMissionStarted.push({
                updateOne: {
                    filter: { ContractAddress: crew[i].ContractAddress, NFTId: crew[i].NFTId },
                    update: { missionAvailability: false },
                },
            });
        }

        const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);

        // Special Crew Profession Validation

        const professionSet = new Set();

        const missionBonusMap = {};

        for (let i = 0; i < crewtokenData.length; i++) {
            const crewItem = crewtokenData[i];

            // Normal crew
            if (crewItem.crewType === "crew") {
                continue;
            }

            //special crew
            const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
            if (!crewData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Crew data not found for ${crewItem.NFTName}`
                );
            }

            crewtokenData[i].profession = crewItem?.crewType?.replace(/_/g, " ")?.toUpperCase();
            crewtokenData[i].rarity = crewData.rarity
            console.log("crewData_rarity", crewData)

            const profession = crewtokenData[i].profession;

            if (!missionBonusMap[profession]) {
                missionBonusMap[profession] =
                    await missionService.findOneMissionBonusReward(profession);
            }

            if (!missionBonusMap[profession]) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${profession}`
                );
            }

            // Identify special crew
            // if (crewItem?.crewType !== "crew") {

            const professionKey = crewItem?.crewType?.toUpperCase();

            if (!professionKey) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    "Invalid special crew: missing crewType"
                );
            }

            // Duplicate profession check
            if (professionSet.has(professionKey)) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `You can’t assign multiple crew with the same profession! (${professionKey}) `
                );
            }

            professionSet.add(professionKey);
            // }
        }

        console.log(crewtokenData, "crewtokenData___")

        //**step 4**: Add to roll(rollOnReward) based on ship which crew should be on that ship otherwise give rollonreward

        const missionFieldMap = {
            mining: "miningBonusReward",
            explore: "exploreBonusReward",
            social: "socialBonusReward",
            combat: "combatBonusReward",
        };

        let crewScore = 0;

        for (const crewItem of crewtokenData) {

            // Normal crew always contributes 1
            if (crewItem.crewType === "crew") {
                crewScore += 1;
                continue;
            }

            const bonusData = missionBonusMap[crewItem.profession];
            console.log("bonusData", bonusData)

            if (!bonusData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${crewItem.profession}`
                );
            }

            const shipRule = bonusData?.rollOnReward?.find(
                item => item.shipId.toString() === userShipData.shipId._id.toString()
            );
            console.log("shipRule", shipRule)

            if (shipRule) {
                // Required ship selected → give mission bonus
                crewScore += bonusData[missionFieldMap[missiontype]];
            } else if (bonusData?.rollOnReward?.length > 0) {
                // Wrong ship selected → give fallback roll contribution
                crewScore += bonusData?.rollOnReward[0]?.reward;
            } else {
                // No ship restriction → give mission bonus
                crewScore += bonusData[missionFieldMap[missiontype]];
            }
        }

        console.log("Crew Score:", crewScore);
        let finalRollScore = totalScore + crewScore;

        //**step 5**: Round of the rollon reward

        finalRollScore = Math.round(finalRollScore);
        console.log("Final Roll Score:", finalRollScore);

        //**step 6**: Base Mission reward calculation based on the finalRollScore and the missiontype and scope

        const missionReward = await missionService.FindOneMissionReward({ rewardNumber: finalRollScore });
        console.log("missionReward", missionReward)
        if (!missionReward) {
            return sendGameResponseEncrpted(
                res,
                400,
                false,
                "Mission reward configuration not found."
            );
        }
        const findmin = gameValue.missionReward.find((x) => x.scope === scope);
        console.log("rewardforScope", findmin, findmin.rewardTimes)


        if (!findmin) {
            return sendGameResponseEncrpted(res, 400, false, "Invalid mission scope.");
        }
        // mutiple the reward for that particular mission scope
        const rewardarrary = multiamount(JSON.stringify(missionReward[missiontype]), findmin.rewardTimes);
        console.log("rewardarrary", rewardarrary)


        //**step 7**: Add and Multiply Base Mission reward by Boosters percentage

        let totalBoosterPercentage = 0;

        for (const crewItem of crewtokenData) {

            // Normal crew has no booster
            if (crewItem.crewType === "crew") continue;

            const bonusData = missionBonusMap[crewItem.profession];

            if (!bonusData) {
                return sendGameResponseEncrpted(
                    res,
                    400,
                    false,
                    `Mission bonus not configured for ${crewItem.profession}`
                );
            }

            const boosters = bonusData?.boostReward || [];

            for (const booster of boosters) {
                if (
                    booster.mission === "all" ||
                    booster.mission === missiontype
                ) {
                    totalBoosterPercentage += booster.reward;
                }
            }
        }

        console.log("Total Booster Percentage:", totalBoosterPercentage);

        const rewardarraywithbooster = rewardarrary.map((reward) => ({
            ...reward,
            amount:
                reward.amount + (reward.amount * totalBoosterPercentage) / 100,
        }));

        console.log("Reward With Booster:", rewardarraywithbooster);

        // **step 8** : Calculate Crew Level based Reward

        let totalCrewLevel = 0;

        for (const crewItem of crewtokenData) {
            totalCrewLevel += Number(crewItem.level || 0);
        }

        console.log("Total Crew Level:", totalCrewLevel);

        // Example:
        // Total Level = 35
        // Bonus Percentage = 35 / 100 = 0.35 (35%)

        const crewLevelPercentage = totalCrewLevel / 100;

        console.log("Crew Level Percentage:", crewLevelPercentage);

        // Apply Crew Level Bonus on reward after boosters

        const rewardarraywithcrewlevel = rewardarraywithbooster.map((reward) => ({
            ...reward,
            amount:
                reward.amount +
                (reward.amount * crewLevelPercentage),
        }));

        console.log("Reward With Crew Level:", rewardarraywithcrewlevel);

        const payload = {
            userId: userData?._id,
            walletAddress: userData?.WalletAddress,
            missionPlanetId: nearByPlanetId, // nearByPlanetID
            userShipId: userShipId,
            crew: crewnftidarray,
            missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
            startAt: time,
            endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
            mission: missiontype,
            missionReward: rewardarraywithcrewlevel,
        };

        const [missionStats, updateNFTmission, updatetoken, ship] = await Promise.all([
            missionService.createMissionStats(payload),
            nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
            nftService.FindOneAndUpdateTokenService(
                { _id: userShipData.nftId._id },
                { missionAvailability: false, missionType: "social" },
            ),
            gameService.UserShipFindOneAndUpdate(
                { _id: userShipData._id },
                { isAvailableForMission: false, missionType: "social" },
            ),
        ]);



        sendGameResponseEncrpted(res, 201, true, 'Attending Social Event', {
            missionStats: await missionService.findOneMissionStatswithPopulate({
                _id: missionStats._id,
            }),
        });

    } catch (e) {
        console.log("missionSocial_err", e)
        sendGameResponseEncrpted(res, 500, false, e.message);
    }
};



export const travelToExplorePlanet_V3 = async (req, res) => {
    try {
        const {
            body: { explorePlanetId, userShipId, crew, scope, missiontype, fromNftId },
            userData,
        } = req;

        const gameValue = await get_GameValues();

        // it is a exlplore mission so check the user already explored or not

        if (missiontype === 'explore') {
            let exist = missionService.exploredPlanetFindOne({
                nearByPlanetId: explorePlanetId,
                userId: userId,
            });
            if (exist) {
                return sendRes(res, 400, false, 'planet already explored by you !');
            }
        }

        // get user ship data
        const userShipData = await gameService.findOneUserShipById(userShipId);
        // actual ship data
        const shipdata = await userShipData.shipId;

        // check the ship can allow for this mission
        if (userShipData.shipId.allowMission != 'all') {
            if (userShipData.shipId.allowMission != missiontype) {
                return sendRes(res, 400, false, 'you cannot take this ship to this mission');
            }
        }

        if (userShipData.shipId.nftSlots < crew.length) {
            return sendRes(
                res,
                400,
                false,
                `sorry ${userShipData.shipId?.shipName} only ${userShipData.shipId?.nftSlots} slots available`,
            );
        }

        let randomNumber = Math.floor(Math.random() * 50) + 1; // randomly generate the value between 1 to 50

        const missionReward = await missionService.FindOneMissionReward({
            rewardNumber: randomNumber,
        }); // get the mission reward based on the randomly generated value

        const findmin = gameValue.missionReward.find((x) => x.scope === scope); //  find the reward for that scope

        const time = Date.now();
        const crewnftidarray = [];
        const crewforsearch = [];
        const updateNFTMissionStarted = [];

        for (let i = 0; i < crew.length; i++) {
            crewnftidarray.push({ tokenId: crew[i].tokenData._id }); //tokenowners_list ---> tokenData
            crewforsearch.push(crew[i].tokenData._id); //tokenowners_list ---> tokenData
            // nftXpPercent = nftXpPercent + crew[i].tokenowners_list.XpPercent
            updateNFTMissionStarted.push({
                updateOne: {
                    filter: { ContractAddress: crew[i].ContractAddress, NFTId: crew[i].NFTId },
                    update: { missionAvailability: false },
                },
            });
        }

        const crewtokenData = await nftService.findTokenDatawithIds(crewforsearch);
        let nftXpPercent = 0; // variable for add xp in percent

        for (let i = 0; i < crewtokenData.length; i++) {
            nftXpPercent = nftXpPercent + getLevelWithXp(crewtokenData[i].totalXP); // add xp in percent for each crewdata
        }

        const rewardarrary = multiamount(missionReward[missiontype], findmin.rewardTimes); // mutiple the reward for that particular mission scope
        const rewardarraywithnftxp = nftXpPercent
            ? addpercentinReward(rewardarrary, nftXpPercent)
            : rewardarrary;

        await Promise.all([
            nftService.tokenBulkWriteService(updateNFTMissionStarted), // ! service from nft module
            nftService.FindOneAndUpdateTokenService(
                { _id: userShipData.nftId._id },
                { missionAvailability: false },
            ),
            gameService.UserShipFindOneAndUpdate(
                { _id: userShipData._id },
                { isAvailableForMission: false },
            ),
        ]);

        const payload = {
            userId: userData._id,
            missionPlanetId: missionPlanetId,
            userShipId: userShipId,
            crew: crewnftidarray,
            missionTime_in_min: findmin.mission_min, // ! change while move to production findmin.mission_min
            startAt: time,
            endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.mission_min
            mission: missiontype,
            missionReward: rewardarraywithnftxp,
            status: constant.STATUS.INPROGRESS,
        };

        const missionStats = await missionService.createMissionStats(payload);

        const updateexplorePayload = {
            $set: {
                startAt: time,
                endAt: add_minutes(time, findmin.mission_min), // ! change while move to production findmin.m
                missionStatsId: missionStats._id,
                planetResources: getSurveyMissionResource(),
            },
        };
        const explore = await missionService.findOneAndUpdateExplored(
            { _id: explorePlanetId },
            updateexplorePayload,
        );

        sendRes(res, 201, true, 'survey started', explore);
    } catch (e) {
        sendRes(res, 500, false, e.message);
    }
};

export const claimReward_V2 = async (req, res) => {
    try {
        const {
            body: { missionStatsId, fromNftId },
            userData,
        } = req;
        const walletAddress = userData?.WalletAddress;

        if (isEmpty(missionStatsId)) {
            return sendRes(res, 400, false, "Invalid missionStatsId");
        }

        const missionStats = await missionService.FindOneMissionStats({ _id: missionStatsId });
        console.log("missionStats", missionStats, missionStats.missionTime_in_min)
        const gameValue = await get_GameValues();

        if (!missionStats)
            return sendRes(res, 400, false, 'mission stats not found', {
                missionStatsId: 'invalid data passed',
            });

        if (missionStats.rewardClaimed) {
            return sendRes(
                res,
                400,
                false,
                'mission already completed and reward already claimed',
                { missionStatsId: 'reward already claimed' },
            );
        }

        const time = Date.now();
        if (missionStats.endAt > time) {
            return sendRes(res, 400, false, 'mission inprogress!', {
                missionStatsId: 'mission inprogress!',
            });
        }

        const crewIds = missionStats.crew.map((data) => data.tokenId);
        const updateNFTMissionStarted = [];

        const nftIds = [];

        const crewtokenData = await nftService.findTokenDatawithIds(crewIds);
        console.log("🚀 ~ claimReward_V2 ~ crewtokenData:", crewtokenData)


        let getGame = await adminService.getGameValues({})
        console.log("getGame", getGame, getGame?.missionRarityLevel)
        const missionRarityLevel = getGame?.missionRarityLevel;
        const missionMultiplier = getGame?.missionMultiplier;


        let getLevelData = []

        let scope = missionStats.missionTime_in_min;

        const reward = gameValue.missionReward.find(reward => reward.mission_min === scope)
        console.log("reward", reward);


        // take first match
        // const reward = getReward;

        if (!reward) {
            return sendRes(res, 400, false, "No reward found for this scope");
        }


        for (let i = 0; i < crewtokenData.length; i++) {
            // let id = crewIds[i];
            let crewItem = crewtokenData[i]
            console.log("🚀 ~ claimReward_V2 ~ crewItem:", crewItem)
            const crewData = await nftService.findCrewData({ name: crewItem?.NFTName })
            crewtokenData[i].rarity = crewData.rarity
            console.log("crewData_rarity", crewData)


            //* the bonus values are added before the game start
            let xpval = getRandomInt(reward?.xpmin, reward?.xpmax);

            console.log('Total XP percent:', xpval);
            nftIds.push(crewItem._id);
            // crewtokenData[i].totalXP += xpval;
            console.log("crewtokenData_before_level_calculation", crewtokenData[i])
            let levelData = getLevelWithXp(crewtokenData[i].level, crewtokenData[i].totalXP, crewtokenData[i].totalXP + xpval, crewtokenData[i].rarity, missionRarityLevel, missionMultiplier)

            // let levelData = getLevelWithXp(crewtokenData[i].level, crewtokenData[i].totalXP, xpval, crewtokenData[i].rarity, missionRarityLevel, missionMultiplier)
            console.log("levelData", levelData)
            updateNFTMissionStarted.push({
                updateOne: {
                    filter: { _id: crewItem._id },
                    update: { missionAvailability: true, $inc: { totalXP: xpval }, level: levelData?.currentLevel },
                },
            });
            getLevelData.push({
                crewId: crewItem._id,
                ...levelData
            });
            console.log("crewtokenData_after_level_calculation", crewtokenData[i], getLevelData)

        }

        const updateMissionstats = {
            isProgress: false,
            rewardClaimed: true,
            // startAt: null,
            // endAt: null,
        };
        const updateonexplore = {
            status: constant.STATUS.COMPLETED,
            isSurveyed: true,
            // startAt: null,
            // endAt: null,
        };
        const userShipData = await gameService.findOneUserShipById(missionStats.userShipId);
        const [updateTokens, shipUpdateTokens, usershipup, mission, exploredUserPlanet] =
            await Promise.all([
                nftService.tokenBulkWriteService(updateNFTMissionStarted),
                nftService.FindOneAndUpdateTokenService(
                    { _id: userShipData.nftId },
                    { missionAvailability: true, missionType: "" },
                ),
                gameService.UserShipFindOneAndUpdate(
                    { _id: userShipData._id },
                    { isAvailableForMission: true, missionType: "" },
                ),
                missionService.findOneAndUpdateMissionStats(
                    { _id: missionStatsId },
                    updateMissionstats,
                ),
                missionService.findOneAndUpdateExplored(
                    // { _id: missionStats.exploredId, fromNftId: fromNftId },
                    { _id: missionStats.exploredId },
                    updateonexplore,
                ),
            ]);

        const rewarwithrefferalreward = [];
        const updateReward = [];
        const refferalreward = [];
        const refrewarfmaount = [];

        for (let i = 0; i < missionStats.missionReward.length; i++) {
            const data = missionStats.missionReward[i];
            updateReward.push({
                updateOne: {
                    filter: { label: data.label, walletAddress: walletAddress },
                    update: { $inc: { balance: data.amount } },
                },
            });
            console.log("userData_refferedBy", userData)
            //!refferal for refferal user
            const isValidRefferal = await userService.isValidReferredBy(
                userData?.WalletAddress,
                userData?.refferedBy?.WalletAddress,
            );
            console.log("isValidRefferal", isValidRefferal, data, gameValue.refferal_Percent)
            if (isValidRefferal) {
                rewarwithrefferalreward.push({
                    label: data.label,
                    amount:
                        calculateRewardforRefferedUser(data.amount, gameValue.refferal_Percent) +
                        data.amount,
                });
                refrewarfmaount.push({
                    label: data.label,
                    amount: calculateRewardforRefferedUser(data.amount, gameValue.refferal_Percent),
                });

                refferalreward.push({
                    updateOne: {
                        filter: {
                            label: data.label,
                            walletAddress: userData?.refferedBy?.WalletAddress,
                        },
                        update: {
                            $inc: {
                                balance: calculateRewardforRefferedUser(
                                    data.amount,
                                    gameValue.refferal_Percent,
                                ),
                            },
                        },
                    },
                });
            }
        }

        //!refferal
        // entry in transcation db  both missionreward and one percent of refferal reward

        const isValidRefferal = await userService.isValidReferredBy(
            userData?.WalletAddress,
            userData.refferedBy?.WalletAddress,
        );
        if (isValidRefferal) {
            // promise all is used run the function in parallel at same time
            const [a, b, c, d, e] = await Promise.all([
                userService.bulkwriteuserCurrency_service(refferalreward), // refferal reward added in game wallet

                exchangeService.TranscationService({
                    from: walletAddress,
                    to: userData.refferedBy.WalletAddress,
                    price: refrewarfmaount,
                    userassetId: userData.refferedBy._id,
                    action: CONSTANTS.TRANSACTION_TYPE.REFFERAL_REWARD,
                }),

                addpriceCurrencyinCirculate_service(rewarwithrefferalreward), // add curculate amount for both reward  claim and reffral

                userService.bulkwriteuserCurrency_service(updateReward), // claim reward added in game wallet

                exchangeService.TranscationService({
                    from: '',
                    to: walletAddress,
                    price: missionStats.missionReward,
                    userassetId: userData._id,
                    action: CONSTANTS.TRANSACTION_TYPE.MISSION_REWARD,
                }),
            ]);
        } else {
            await Promise.all([
                userService.bulkwriteuserCurrency_service(updateReward), // claim reward added in game wallet
                exchangeService.TranscationService({
                    from: '',
                    to: walletAddress,
                    price: missionStats.missionReward,
                    userassetId: userData._id,
                    action: CONSTANTS.TRANSACTION_TYPE.MISSION_REWARD,
                }),
                addpriceCurrencyinCirculate_service(missionStats.missionReward), // add curculate amount for claim
            ]);
        }

        const exmissionStats = await missionService.FindOneMissionStats({ _id: missionStatsId });

        let result = {
            missionStats: {
                ...exmissionStats,
                crew: (exmissionStats?.crew || []).map(c => c.tokenId || c),
            },
            levelData: getLevelData
        }
        return sendRes(res, 201, true, 'Reward claimed', result);
    } catch (e) {
        console.log("claimReward_v2", e)
        return sendRes(res, 500, false, e.message);
    }
};

export const claimReward_V3 = async (req, res) => {
    try {
        const {
            body: { missionStatsId, fromNftId },
            userData,
        } = req;
        const walletAddress = userData?.WalletAddress;
        const missionStats = await missionService.FindOneMissionStats({ _id: missionStatsId });
        const gameValue = await get_GameValues();

        if (!missionStats)
            return sendRes(res, 400, false, 'mission stats not found', {
                missionStatsId: 'invalid data passed',
            });

        if (missionStats.rewardClaimed) {
            return sendRes(
                res,
                400,
                false,
                'mission already completed and reward already claimed',
                { missionStatsId: 'reward already claimed' },
            );
        }

        const time = Date.now();
        if (missionStats.endAt > time) {
            return sendRes(res, 400, false, 'mission inprogress!', {
                missionStatsId: 'mission inprogress!',
            });
        }

        const crewIds = missionStats.crew.map((data) => data.tokenId);
        const updateNFTMissionStarted = [];

        const nftIds = [];
        for (let i = 0; i < crewIds.length; i++) {
            let id = crewIds[i];
            //* the bonus values are added before the game start
            let xpval = getRandomInt(1, 5);
            nftIds.push(id);
            updateNFTMissionStarted.push({
                updateOne: {
                    filter: { _id: id },
                    update: { missionAvailability: true, $inc: { totalXP: xpval } },
                },
            });
        }

        const updateMissionstats = {
            isProgress: false,
            rewardClaimed: true,
            startAt: null,
            endAt: null,
        };
        const updateonexplore = {
            status: constant.STATUS.COMPLETED,
            isSurveyed: true,
            startAt: null,
            endAt: null,
        };
        const userShipData = await gameService.findOneUserShipById(missionStats.userShipId);
        const [updateTokens, shipUpdateTokens, usershipup, mission, exploredUserPlanet] =
            await Promise.all([
                nftService.tokenBulkWriteService(updateNFTMissionStarted),
                nftService.FindOneAndUpdateTokenService(
                    { _id: userShipData.nftId },
                    { missionAvailability: true },
                ),
                gameService.UserShipFindOneAndUpdate(
                    { _id: userShipData._id },
                    { isAvailableForMission: true },
                ),
                missionService.findOneAndUpdateMissionStats(
                    { _id: missionStatsId },
                    updateMissionstats,
                ),
                missionService.findOneAndUpdateExplored(
                    { _id: missionStats.exploredId, fromNftId: fromNftId },
                    updateonexplore,
                ),
            ]);

        const rewarwithrefferalreward = [];
        const updateReward = [];
        const refferalreward = [];
        const refrewarfmaount = [];

        for (let i = 0; i < missionStats.missionReward.length; i++) {
            const data = missionStats.missionReward[i];
            updateReward.push({
                updateOne: {
                    filter: { label: data.label, walletAddress: walletAddress },
                    update: { $inc: { balance: data.amount } },
                },
            });

            //!refferal for refferal user
            const isValidRefferal = await userService.isValidReferredBy(
                userData?.WalletAddress,
                userData?.refferedBy?.WalletAddress,
            );
            if (isValidRefferal) {
                rewarwithrefferalreward.push({
                    label: data.label,
                    amount:
                        calculateRewardforRefferedUser(data.amount, gameValue.refferal_Percent) +
                        data.amount,
                });
                refrewarfmaount.push({
                    label: data.label,
                    amount: calculateRewardforRefferedUser(data.amount, gameValue.refferal_Percent),
                });

                refferalreward.push({
                    updateOne: {
                        filter: {
                            label: data.label,
                            walletAddress: userData?.refferedBy?.WalletAddress,
                        },
                        update: {
                            $inc: {
                                balance: calculateRewardforRefferedUser(
                                    data.amount,
                                    gameValue.refferal_Percent,
                                ),
                            },
                        },
                    },
                });
            }
        }

        //!refferal
        // entry in transcation db  both missionreward and one percent of refferal reward

        const isValidRefferal = await userService.isValidReferredBy(
            userData?.WalletAddress,
            userData.refferedBy?.WalletAddress,
        );
        if (isValidRefferal) {
            // promise all is used run the function in parallel at same time
            const [a, b, c, d, e] = await Promise.all([
                userService.bulkwriteuserCurrency_service(refferalreward), // refferal reward added in game wallet

                exchangeService.TranscationService({
                    from: walletAddress,
                    to: userData.refferedBy.WalletAddress,
                    price: refrewarfmaount,
                    userassetId: userData.refferedBy._id,
                    action: CONSTANTS.TRANSACTION_TYPE.REFFERAL_REWARD,
                }),

                addpriceCurrencyinCirculate_service(rewarwithrefferalreward), // add curculate amount for both reward  claim and reffral

                userService.bulkwriteuserCurrency_service(updateReward), // claim reward added in game wallet

                exchangeService.TranscationService({
                    from: '',
                    to: walletAddress,
                    price: missionStats.missionReward,
                    userassetId: userData._id,
                    action: CONSTANTS.TRANSACTION_TYPE.MISSION_REWARD,
                }),
            ]);
        } else {
            await Promise.all([
                userService.bulkwriteuserCurrency_service(updateReward), // claim reward added in game wallet
                exchangeService.TranscationService({
                    from: '',
                    to: walletAddress,
                    price: missionStats.missionReward,
                    userassetId: userData._id,
                    action: CONSTANTS.TRANSACTION_TYPE.MISSION_REWARD,
                }),
                addpriceCurrencyinCirculate_service(missionStats.missionReward), // add curculate amount for claim
            ]);
        }

        const exmissionStats = await missionService.FindOneMissionStats({ _id: missionStatsId });
        return sendRes(res, 201, true, 'reward claimed', exmissionStats);
    } catch (e) {
        return sendRes(res, 500, false, e.message);
    }
};

// get the nearby planet of the parentPlanet ( userPlanetId (not nft _id ))
export const getNearByPlanets = async (req, res) => {
    try {
        const {
            params: { userplanetId },
            userData,
        } = req;

        if (!userplanetId) {
            return sendRes(res, httpStatus.NOT_FOUND, false, 'failed', {
                userplanetId: 'userplanetId is not found on param ',
            });
        }
        // get near by planet
        const nearByPlanet = await nearByPlanetFind({ parentPlanetId: userplanetId });
        if (nearByPlanet.length) {
            // separate the ids
            const nearByPlanetIds = nearByPlanet.map((e) => e._id);

            // get the near by planet is explore by this user
            const explored = await explorePlanetFind({
                userId: userData._id,
                nearByPlanetId: { $in: nearByPlanetIds },
            });

            const hashMap = {};

            explored.map((e) => {
                hashMap[e.nearByPlanetId.toString()] = true;
            });

            nearByPlanet.forEach(
                (e) => (e.isExploredByUser = hashMap[e._id.toString()] ? true : false),
            );

            sendRes(res, httpStatus.OK, true, 'fetched', nearByPlanet);
            return;
        }
        const userPlanet = await gameService.userPlanetFindOne({ _id: userplanetId });
        sendRes(res, httpStatus.OK, true, 'not found', nearByPlanet);

        // ! roll back mechanize to create new nearBy planets
    } catch (error) {
        sendRes(res, httpStatus.INTERNAL_SERVER_ERROR, false, error.message);
    }
};

// export const getHexPlanets = async (req, res) => {
//     let {
//         userData,
//         query: { hexnumber },
//         param: { },
//     } = req;
//     try {
//         const planets = await nearByPlanetFind({ hexId: Number(hexnumber) ?? 0 });

//         const planetsIds = planets.map((e) => e?._id);

//         // get the near by planet is explore by this user
//         const explored = await explorePlanetFind({
//             userId: userData._id,
//             nearByPlanetId: { $in: planetsIds },
//         });

//         const find = {
//             userId: userData._id,
//             missionPlanetId: { $in: planetsIds },
//             rewardClaimed: false,
//             // endAt: { $gt: new Date() },
//         };

//         const missionstats = await missionService.missionStatsFind(find);

//         const pending = {};

//         missionstats.map((e) => {
//             pending[e.missionPlanetId.toString()] = e;
//         });

//         const hashMap = {};

//         explored.map((e) => {
//             hashMap[e.nearByPlanetId.toString()] = true;
//         });

//         planets.forEach((e) => (e.isExploredByUser = hashMap[e._id.toString()] ? true : false));
//         planets.forEach((e) => (e.isPendingMission = pending[e._id.toString()] ? true : false));
//         planets.forEach(
//             (e) =>
//             (e.pendingMissionStats = pending[e._id.toString()]
//                 ? pending[e._id.toString()]
//                 : null),
//         );

//         // const aggrigatequery = [
//         //     { $match: { hexId: Number(hexnumber) } },
//         //     {
//         //         $lookup: {
//         //             from: 'tokenowner',
//         //             // localField: 'NFTId',
//         //             // foreignField: 'NFTId',
//         //             let: { nftId: '$NFTId' },
//         //             pipeline: [
//         //                 {
//         //                     $match: {
//         //                         $expr: {
//         //                             $and: [
//         //                                 { $eq: ['$NFTId', '$$nftId'] },
//         //                                 { $eq: ['$NFTBalance', '1'] },
//         //                             ],
//         //                         },
//         //                     },
//         //                 },
//         //             ],
//         //         },
//         //     },
//         // ];

//         const aggrigatequery = [
//             {
//                 $match: { hexId: Number(hexnumber) },
//             },
//             {
//                 $lookup: {
//                     from: 'tokenowners', // collection to join
//                     let: { nftId: '$NFTId' }, // pass NFTId from outer document
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ['$NFTId', '$$nftId'] },
//                                         { $eq: ['$NFTBalance', '1'] },
//                                     ],
//                                 },
//                             },
//                         },
//                     ],
//                     as: 'ownerDetails', // name for joined results
//                 },
//             },
//         ];

//         const dataArg = await nftService.tokenAggregate(aggrigatequery);
//         console.log("🚀 ~ getHexPlanets ~ dataArg:", dataArg)
//         logger.info('dataArg', dataArg);
//         const ownerAddress = dataArg[0]?.ownerDetails[0]?.NFTOwner;
//         console.log("🚀 ~ getHexPlanets ~ ownerAddress:", ownerAddress)
//         logger.info('ownerAddress', ownerAddress);

//         const data = {
//             type: dataArg.length ? 'nft_hex' : 'hex',
//             data: {
//                 nft: dataArg,
//                 nearbyplanets: planets,
//                 hexNftOwner: ownerAddress
//                     ? await userService.Findgameuser(
//                         { WalletAddress: ownerAddress },
//                         { DisplayName: 1, profile_url: 1, Profile: 1, WalletAddress: 1 },
//                     )
//                     : null,
//             },
//         };
//         sendRes(res, httpStatus.OK, true, 'fetched', data);
//     } catch (e) {
//         return sendRes(res, 500, false, e.message);
//     }
// };



export const getHexPlanets = async (req, res) => {
    let {
        userData,
        query: { hexnumber },
        param: { },
    } = req;
    try {
        const planets = await nearByPlanetFind({ hexId: Number(hexnumber) ?? 0 });

        const planetsIds = planets.map((e) => e?._id);

        // get the near by planet is explore by this user
        const explored = await explorePlanetFind({
            userId: userData._id,
            nearByPlanetId: { $in: planetsIds },
        });

        const find = {
            userId: userData._id,
            missionPlanetId: { $in: planetsIds },
            rewardClaimed: false,
            // endAt: { $gt: new Date() },
        };

        const missionstats = await missionService.missionStatsFind(find);

        const pending = {};

        missionstats.map((e) => {
            pending[e.missionPlanetId.toString()] = e;
        });

        const hashMap = {};

        explored.map((e) => {
            hashMap[e.nearByPlanetId.toString()] = true;
        });

        planets.forEach((e) => (e.isExploredByUser = hashMap[e._id.toString()] ? true : false));
        planets.forEach((e) => (e.isPendingMission = pending[e._id.toString()] ? true : false));
        // planets.forEach(
        //     (e) =>
        //     (e.pendingMissionStats = pending[e._id.toString()]
        //         ? pending[e._id.toString()]
        //         : null),
        // );

        const aggrigatequery = [
            {
                $match: { hexId: Number(hexnumber) },
            },
            {
                $lookup: {
                    from: 'tokenowners', // collection to join
                    let: { nftId: '$NFTId' }, // pass NFTId from outer document
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$NFTId', '$$nftId'] },
                                        { $eq: ['$NFTBalance', '1'] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'ownerDetails', // name for joined results
                },
            },
        ];

        const dataArg = await nftService.tokenAggregate(aggrigatequery);
        console.log("🚀 ~ getHexPlanets ~ dataArg:", dataArg)
        logger.info('dataArg', dataArg);
        const ownerAddress = dataArg[0]?.ownerDetails[0]?.NFTOwner;
        console.log("🚀 ~ getHexPlanets ~ ownerAddress:", ownerAddress)
        logger.info('ownerAddress', ownerAddress);


        const nft = dataArg.length
            ? {
                _id: dataArg[0]._id,
                NFTName: dataArg[0].NFTName,
                image_url: signature_imageURL(dataArg[0].image_url)
            }
            : null;

        const nearbyplanets = planets.map((planet) => ({
            _id: planet._id,
            name: planet.name,
            image_url: signature_imageURL(planet.image_url),
            isExploredByUser: planet.isExploredByUser,
            isPendingMission: planet.isPendingMission,
            planetResources: planet.planetResources
        }));


        const data = {
            type: dataArg.length ? 'nft_hex' : 'hex',
            hexId: Number(hexnumber),
            nft: nft,
            nearbyplanets: nearbyplanets,
            hexNftOwner: ownerAddress
                ? await userService.Findgameuser(
                    { WalletAddress: ownerAddress.toLowerCase() },
                    { DisplayName: 1, profile_url: 1, Profile: 1, WalletAddress: 1 },
                )
                : null,
        };
        sendRes(res, httpStatus.OK, true, 'fetched', data);
    } catch (e) {
        return sendRes(res, 500, false, e.message);
    }
};

export const shipJump = async (req, res) => {
    try {
        const {
            userData,
            body: { userShipId, nftId, hexToJump },
        } = req;

        // need a function to check the user is valid to jump or not
        // chech the nftid is users
        if (!(userShipId && nftId && hexToJump)) {
            sendGameResponseEncrpted(res, 400, false, 'invalid data passed', {
                userShipId: 'userShipId is required',
                nftId: 'nftId is required',
                hexToJump: 'hexToJump is required',
            });
            return;
        }
        const gameValue = await get_GameValues();
        const find = { nftId: nftId, _id: userShipId };
        const update = {
            isInGarage: false,
            currentHexId: hexToJump,
            startTime: Date.now(),
            endTime: add_minutes(Date.now(), gameValue.hex_jump_time_in_min),
        };
        const ship = await gameService.UserShipFindOneAndUpdate(find, update);

        sendGameResponseEncrpted(res, 200, true, 'jumping...', ship);
    } catch (e) {
        return sendGameResponseEncrpted(res, 500, false, e.message);
    }
};

export const getMission = async (req, res) => {
    try {
        const { page = 1, limit = 10, id } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);

        const query = id ? { _id: id } : {};

        const getMissionData = await missionService.getMissionStatus(query, pageNum, limitNum);
        sendRes(res, 200, true, 'Mission status available', getMissionData);
    } catch (e) {
        return sendRes(res, 500, false, e.message);
    }
};

export const getGameValues = async (req, res) => {
    try {
        // get only scope field
        const data = await gameSettingsSchema.findOne({}, { missionReward: 1, _id: 0 });

        if (!data) {
            return sendRes(res, 404, false, "Game settings not found");
        }

        return sendRes(res, 200, true, "Mission reward fetched", data.missionReward);
    }
    catch (e) {
        console.log("getGameValues_e", e)
        return sendRes(res, 500, false, e.message);
    }
}




// {
//     "nearByPlanetId": "6936a1016e00e8b966798ce2",
//         "userShipId": "69ca49f46fc98ae4706c8b3d",
//             "crew": [
//                 {
//                     "NFTId": "422",
//                     "ContractAddress": "0xf1bf05ffdefd578518647109e2f40080d384d829",
//                     "tokenId": "69ca4afd6fc98ae4706c8bf6",
//                 },
//                 {
//                     "NFTId": "421",
//                     "ContractAddress": "0xf1bf05ffdefd578518647109e2f40080d384d829",
//                     "tokenId": "69ca4acc6fc98ae4706c8bdc",

//                 },
//                 {
//                     "NFTId": "420",
//                     "ContractAddress": "0xf1bf05ffdefd578518647109e2f40080d384d829",
//                     "tokenId": "69ca4a846fc98ae4706c8bc1",
//                 }
//             ],
//                 "scope": 1,
//                     "missiontype": "explore"
// }

export const getMissionBonusReward = async (req, res) => {
    try {
        const data = await missionService.findMissionBonusReward({ isActive: true });
        console.log("getMissionBonusReward_data : ", data);

        if (!data) {
            return sendRes(res, 404, false, "Mission bonus reward not found");
        }
        return sendRes(res, 200, true, "Mission bonus reward fetched", data);
    } catch (e) {
        console.log("getMissionBonusReward_e", e)
        return sendRes(res, 500, false, e.message);
    }
}

export const updateMissionBonusReward = async (req, res) => {
    try {
        const updateData = req.body;
        console.log("updateMissionBonusReward_updateData", updateData);
        const updatedReward = await missionService.findOneAndUpdateMissionBonusReward(
            { _id: updateData._id },
            {
                miningBonusReward: updateData.miningBonusReward,
                exploreBonusReward: updateData.exploreBonusReward,
                socialBonusReward: updateData.socialBonusReward,
                combatBonusReward: updateData.combatBonusReward,
                rollOnReward: updateData.rollOnReward,
                boostReward: updateData.boostReward,
                isActive: updateData.isActive,
            },
        );
        console.log("updateMissionBonusReward_updatedReward", updatedReward);
        if (!updatedReward) {
            return sendRes(res, 404, false, "Mission bonus reward not found");
        }
        return sendRes(res, 200, true, "Mission bonus reward updated", updatedReward);
    } catch (e) {
        console.log("updateMissionBonusReward_e", e)
        return sendRes(res, 500, false, e.message);
    }
}


export const getNearbyplanetStatus = async (req, res) => {
    try {
        const {
            userData,
            query: { nearbyPlanetId },
        } = req;

        const mission = await missionService.findOneMissionStatswithPopulate({
            userId: userData._id,
            missionPlanetId: nearbyPlanetId,
            rewardClaimed: false,
        });

        if (!mission) {
            return sendRes(res, 200, true, "Fetched", {
                isPendingMission: false,
                mission: null,
            });
        }

        return sendRes(res, 200, true, "Fetched", {
            isPendingMission: true,
            mission: mission


            // {
            //     _id: mission._id,
            //     userId: mission.userId,
            //     missionPlanetId: mission.missionPlanetId,
            //     missionPlanetName: mission.name,
            //     mission: mission.mission,
            //     startAt: mission.startAt,
            //     endAt: mission.endAt,
            //     userShipId: mission.userShipId,
            //     crew: (mission.crew || []).map((c) => c.tokenId),
            //     missionTime_in_min: mission.missionTime_in_min,
            //     missionReward: mission.missionReward,
            // },
        });

    } catch (err) {
        console.log("🚀 ~ nearbyPlanetStatusApi ~ err:", err)
        return sendRes(res, 500, false, err.message);
    }
};