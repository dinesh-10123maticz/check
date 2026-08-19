import { getSymbolsWithTypes, sendRes, signature_imageURL } from '../../shared/commonFunction';
import { collectiontypefind, collectiontypeFindOne } from '../admin/cms/cms.service';
import * as gameservice from '../game/game.service';
import * as nftservice from '../nft/nft.services';
import * as shopservice from './shop.service';
import constant from '../../shared/constant';
import config from '../../config/config';
import shipdb from "../game/schema/ship.schema"
import { RedisGet } from '../../services/redisclient';
import { getPairFromStore } from '../amountConvertion/amountConvert';
import { get_GameValues, getGameValues } from '../admin/adminlogin/admin.service';



export const gamemarketcollections = async (req, res) => {
    try {
        const colType = await collectiontypeFindOne({ type: 'crew' });

        const [otherThanGalfiCrew, onlyGalfiCrew] = await Promise.all([
            nftservice.findCollections({
                type: colType._id,
                CollectionSymbol: {
                    $nin: getSymbolsWithTypes(
                        ['ship', 'planet', 'astroid', 'asteroid'],
                        config.COLLECTION_CONTRACT_DETAILS,
                    ),
                    // constant.GALFI_TYPE_OTHER_THAN_CREW_SYMBOL
                },
            }),

            nftservice.findCollections({
                type: colType._id,
                CollectionSymbol: {
                    $in: getSymbolsWithTypes(
                        ['crew', 'specialcrew'],
                        config.COLLECTION_CONTRACT_DETAILS,
                    ),
                },
            }),
        ]);

        const payload = {
            mint: {
                GALFI_CREW: onlyGalfiCrew,
                OTHER_CREW: otherThanGalfiCrew,
            },
            contract: config.COLLECTION_CONTRACT_DETAILS,
            nomint: {
                GALFI_CREW_TYPE: constant.PROFESSIONS,
                GALFI_SPECIAL_CREW_TYPE: constant.PROFESSIONS,
                SHIP_TYPE: constant.SHIP_TYPE,
                MISSION_TYPE: constant.MISSION_TYPE,
                PLANET_TYPE: constant.PLANET_TYPE,
                RARITY_TYPE: constant.RARITY,
                // GALFI_CREW_TYPE : constant.GALFI_CREW_TYPE
            },
        };
        sendRes(res, 200, 'gamemarketcollections', payload);
    } catch (e) {
        sendRes(res, 500, 'please try again later', e.message);
    }
};

export const planetAstroidShop = async (req, res) => {
    try {
        const {
            body: { type, tabName, rarity, page, limit },
            userData,
        } = req;
        const pageno = (page - 1) * limit;
        const raritydata = rarity.length ? { $in: rarity } : { $ne: null };

        if (!tabName) {
            sendRes(res, 400, false, 'tabName is missing in body ');
        }
        if (tabName === constant.BUY) {
            const find = { type: type, rarity: raritydata, isActive: true };

            if (!type) {
                sendRes(res, 400, false, 'for TabName buy need type , type is missing in body  ');
            }

            const [shopdata, totalCount] = await Promise.all([
                gameservice.planetAstroid_Shop_service(find, pageno, limit),
                gameservice.planetShopCounts(find),
            ]);
            shopdata.forEach((element) => {
                element.image_url = signature_imageURL(element?.image);
            });
            const responsePayload = {
                totalCount: totalCount,
                result: shopdata,
                currentPage: page,
            };
            return sendRes(res, 200, true, `buy`, responsePayload);
        }

        if (tabName === constant.OWNED) {
            const contractArray = await collectiontypefindContract(constant.PLANET_DB);
            const tokenDatas = await nftservice.getTokenDetailesWithContractAddress(
                userData.WalletAddress,
                contractArray,
            );
            const nftIDs = [];

            for (let i = 0; i < tokenDatas.length; i++) {
                nftIDs.push(tokenDatas[i].tokenData._id);
            }
            let typeQuery = type.length ? { type: type } : { type: { $ne: null } };
            const find = { nftId: { $in: nftIDs }, ...typeQuery, rarity: raritydata };
            let [userPlanets, totalCount] = await Promise.all([
                gameservice.UsersplanetAstroid_Shop_service(find, pageno, limit),
                gameservice.UserPlantCount(find),
            ]);

            for (let j = 0; j < userPlanets.length; j++) {
                if (userPlanets[j].planetId) {
                    userPlanets[j].planetId.image_url = signature_imageURL(
                        userPlanets[j].planetId?.image,
                    );
                }
            }

            const responsePayload = {
                totalCount: totalCount,
                result: userPlanets,
                currentPage: page,
            };

            return sendRes(res, 200, true, `owned`, responsePayload);
        }
    } catch (e) {
        console.log("planetAstroidShop_err", e)
        sendRes(res, 500, false, e.message);
    }
};

export const shipMarketShop = async (req, res) => {
    try {
        const {
            body: { allowMission, tabName, page, limit },
            userData,
        } = req;
        const pageno = (page - 1) * limit;

        let shiptypedata = { $ne: null };

        if (allowMission.length) {
            shiptypedata = { $in: [...allowMission, 'all'] };
        }

        if (tabName === constant.BUY) {
            const find = { allowMission: shiptypedata };

            const [totCount, shopdata] = await Promise.all([
                gameservice.shipShopCounts(find),
                gameservice.ship_Shop_service(find, pageno, limit),
            ]);
            shopdata.forEach((element) => {
                element.image_url = signature_imageURL(element?.image);
            });

            const resPayload = {
                result: shopdata,
                totalCount: totCount,
                currentPage: page,
            };
            return sendRes(res, 200, true, constant.BUY, resPayload);
        }

        if (tabName === constant.OWNED) {
            let contractAddressArray = await collectiontypefindContract(constant.SHIP_DB);

            const tokenDatas = await nftservice.getTokenDetailesWithContractAddress(
                userData.WalletAddress,
                contractAddressArray,
            );

            const nftIDs = [];

            for (let i = 0; i < tokenDatas.length; i++) {
                nftIDs.push(tokenDatas[i].tokenData._id);
            }

            const find = { nftId: { $in: nftIDs } };
            const allow = { allowMission: shiptypedata };

            let [usership, totCount] = await Promise.all([
                gameservice.UserShip_Shop_service(find, allow, pageno, limit),
                gameservice.userShipCounts(find),
            ]);

            for (let j = 0; j < usership.length; j++) {
                if (usership[j].shipId) {
                    usership[j].shipId.image_url = signature_imageURL(usership[j].shipId?.image);
                }
            }

            const resposePaylaod = {
                totalCount: totCount,
                result: usership,
                currentPage: page,
            };
            return sendRes(res, 200, true, constant.OWNED, resposePaylaod);
        }
    } catch (e) {
        sendRes(res, 500, false, e.message);
    }
};

/*
tabname = buy (non minted galficrew user can get the data and mint it)
tabname = owned (minted galficrew user can get the nft data)
*/
export const GalfiCrewMarket = async (req, res) => {
    try {
        const {
            body: {
                tabName,
                page,
                limit,
                collectionSymbol,
                CollectionContractAddress,
                crewTypes,
                gender,
            },
            userData,
        } = req;

        const walletAddress = userData.WalletAddress;
        if (!tabName) {
            sendRes(res, 400, false, 'tabName is missing in body ');
        }
        let allCrewContracAddressArray = await collectiontypefindContract(constant.GALFICREW);
        const pageno = (page - 1) * limit;
        const collection = CollectionContractAddress?.length
            ? CollectionContractAddress
            : allCrewContracAddressArray;

        const CollectionContractAddressquery = CollectionContractAddress.length
            ? { CollectionContractAddress: { $in: CollectionContractAddress } }
            : { CollectionContractAddress: { $in: allCrewContracAddressArray } };
        const CREWs = crewTypes?.length
            ? { profession: { $in: crewTypes } }
            : { profession: { $ne: null } };

        const crewGender = gender?.length ? { gender: { $in: gender } } : { gender: { $ne: null } };

        if (tabName === 'buy') {
            const collectionData = await nftservice.findCollection_service({
                CollectionContractAddress: { $in: CollectionContractAddress },
            });
            const collectionIds = collectionData.map((e) => e._id);
            const crewtype = crewTypes.length
                ? { profession: { $in: crewTypes } }
                : { profession: { $ne: null } };

            const find = { ...crewtype, collection: { $in: collectionIds }, isActive: true };

            const shopdataforCrew = await gameservice.crewFindWithpagination(find, pageno, limit);

            const totalCount = await gameservice.crewCount(find);
            return sendRes(res, 200, true, `buy`, {
                totalCount: totalCount,
                result: shopdataforCrew,
                currentPage: page,
            });
        }

        if (tabName === 'owned') {
            // const ownedData = await shopservice.getTokenDetailesWithCollectionArray_service(
            //     walletAddress,
            //     CollectionContractAddressquery,
            //     pageno,
            //     limit,
            // );
            // const totalCount = ownedData[0].totalCount[0]?.count ?? 0;
            // const tokenData = ownedData[0].results;
            // for (let j = 0; j < tokenData.length; j++) {
            //     if (tokenData[j].tokenData) {
            //         tokenData[j].tokenData.image_url = signature_imageURL(
            //             tokenData[j].tokenData?.image_url,
            //         );
            //     }
            // }

            // return sendRes(res, 200, true, `owned`, { totalCount: totalCount, result: tokenData });
            const crewType = "crew"
            const ownedData = await nftservice.getTokenDetailesWithCollectionArray(
                walletAddress,
                collection,
                pageno,
                limit,
                crewType
            );
            const tokenData = ownedData[0].results;
            const totCount = ownedData[0].totalCount[0]?.count ?? 0;

            for (let j = 0; j < tokenData.length; j++) {
                if (tokenData[j].tokenData) {
                    tokenData[j].tokenData.image_url = signature_imageURL(
                        tokenData[j].tokenData?.image_url,
                    );
                }
            }

            const resPayload = {
                totalCount: totCount,
                result: tokenData,
                currentPage: page,
            };
            return sendRes(res, 200, true, `owned`, resPayload);
        }
    } catch (e) {
        sendRes(res, 500, false, e.message);
    }
};

// minted
export const CrewMarket = async (req, res) => {
    try {
        const {
            body: { tabName, page, limit, CollectionContractAddress },
            userData,
        } = req;
        const walletAddress = userData.WalletAddress;
        if (!tabName) {
            sendRes(res, 400, false, 'tabName is missing in body ');
        }

        let allCrewContracAddressArray = await collectiontypefindContract(constant.CREW);
        const collection = CollectionContractAddress.length
            ? CollectionContractAddress
            : allCrewContracAddressArray;
        const pageno = (page - 1) * limit;
        const collectionfind = CollectionContractAddress.length
            ? { $in: CollectionContractAddress }
            : { $in: allCrewContracAddressArray };

        if (tabName === 'buy') {
            const match = {
                NFTOwner: { $ne: walletAddress },
                NFTBalance: { $ne: '0' },
                ContractAddress: collectionfind,
                PutOnSale: 'false',
            };
            const ownedData = await nftservice.getTokenDetailesWithMatch(match, pageno, limit);
            const tokenData = ownedData[0].results;
            const totCount = ownedData[0].totalCount[0]?.count ?? 0;
            for (let j = 0; j < tokenData.length; j++) {
                if (tokenData[j].tokenData) {
                    tokenData[j].tokenData.image_url = signature_imageURL(
                        tokenData[j].tokenData?.image_url,
                    );
                }
            }
            const resPayload = {
                totalCount: totCount,
                result: tokenData,
                currentPage: page,
            };
            return sendRes(res, 200, true, `buy`, resPayload);
        }
        const crewType = "specialcrew"

        if (tabName === 'owned') {
            const ownedData = await nftservice.getTokenDetailesWithCollectionArray(
                walletAddress,
                collection,
                pageno,
                limit,
                crewType
            );
            const tokenData = ownedData[0].results;
            const totCount = ownedData[0].totalCount[0]?.count ?? 0;

            for (let j = 0; j < tokenData.length; j++) {
                if (tokenData[j].tokenData) {
                    tokenData[j].tokenData.image_url = signature_imageURL(
                        tokenData[j].tokenData?.image_url,
                    );
                }
            }

            const resPayload = {
                totalCount: totCount,
                result: tokenData,
                currentPage: page,
            };
            return sendRes(res, 200, true, `owned`, resPayload);
        }
    } catch (e) {
        sendRes(res, 500, false, e.message);
    }
};

export const ShopSearchAction = async (req, res) => {
    try {
        const {
            body: { tabName },
        } = req;

        switch (tabName) {
            case constant.CREW: // crew
                return await handleCrewSearch(req, res);
            case constant.PLANET_TYPE[0]: // astroid
                return await handlePlanetSearch(req, res);
            case constant.PLANET_TYPE[1]: // planet
                return await handlePlanetSearch(req, res);
            case constant.SHIP_DB: //ship
                return await handleShipSearch(req, res);
            case constant.GALFICREW: //galficrew
                return await handleGalfiCrewSearch(req, res);
            default:
                return sendRes(res, 400, false, 'tabName not found', []);
        }
    } catch (e) {
        sendRes(res, 500, false, e.message);
    }
};

/*
this is normal search

*/
export const handleCrewSearch = async (req, res) => {
    try {
        const {
            body: { tabName, page, limit, searchWord, CollectionContractAddress },
            userData,
        } = req;
        const walletAddress = userData.WalletAddress;
        const pageno = (page - 1) * limit;

        let allContracAddress;
        if (CollectionContractAddress.length === 0) {
            allContracAddress = await collectiontypefindContract(constant.CREW);
        }

        const [owned, buy] = await Promise.all([
            shopservice.crewFind({ name: { $regex: searchWord, $options: 'i' } }, pageno, limit),

            nftservice.TokenDetailesSearchWithCollectionArray(
                searchWord,
                CollectionContractAddress.length ? CollectionContractAddress : allContracAddress,
                pageno,
                limit,
            ),
        ]);
        const payload = {
            owned: owned,
            buy: buy,
        };

        sendRes(res, 200, true, 'fetched', payload);
    } catch (e) {
        sendRes(res, 500, false, e.message);
    }
};

export const handleGalfiCrewSearch = async (req, res) => {
    try {
        const {
            body: { tabName, page, limit, searchWord, CollectionContractAddress },
            userData,
        } = req;
        const walletAddress = userData.WalletAddress;
        const pageno = (page - 1) * limit;

        let allContracAddress = [];
        if (CollectionContractAddress.length === 0) {
            allContracAddress = await collectiontypefindContract(constant.GALFICREW);
        }

        const [owned, buy] = await Promise.all([
            shopservice.crewFind({ name: { $regex: searchWord, $options: 'i' } }, pageno, limit),

            nftservice.TokenDetailesSearchWithCollectionArray(
                searchWord,
                CollectionContractAddress.length ? CollectionContractAddress : allContracAddress,
                pageno,
                limit,
            ),
        ]);
        const payload = {
            owned: owned,
            buy: buy,
        };

        sendRes(res, 200, true, 'fetched', payload);
    } catch (e) {
        sendRes(res, 500, false, e.message);
    }
};
export const handlePlanetSearch = async (req, res) => {
    const {
        body: { tabName, page, limit, searchWord, CollectionContractAddress },
        userData,
    } = req;
    const walletAddress = userData.WalletAddress;
    const pageno = (page - 1) * limit;
    let allContracAddress;
    if (CollectionContractAddress.length === 0) {
        allContracAddress = await collectiontypefindContract(constant.PLANET_DB);
    }

    const [owned, buy] = await Promise.all([
        gameservice.planetAstroid_Shop_service(
            { name: { $regex: searchWord, $options: 'i' }, type: tabName },
            pageno,
            limit,
        ),

        nftservice.TokenDetailesSearchWithCollectionArray(
            searchWord,
            CollectionContractAddress.length ? CollectionContractAddress : allContracAddress,
            pageno,
            limit,
        ),
    ]);

    const payload = {
        owned: owned,
        buy: buy,
    };
    sendRes(res, 200, true, 'fetched', payload);
};

// planetAstroid_Shop_service

export const handleShipSearch = async (req, res) => {
    const {
        body: { tabName, page, limit, searchWord, CollectionContractAddress },
        userData,
    } = req;
    const walletAddress = userData.WalletAddress;
    const pageno = (page - 1) * limit;

    let allContracAddress;
    if (CollectionContractAddress.length === 0) {
        allContracAddress = await collectiontypefindContract(constant.SHIP_DB);
    }

    const [owned, buy] = await Promise.all([
        gameservice.getShip_Service({ name: { $regex: searchWord, $options: 'i' } }, pageno, limit),

        nftservice.TokenDetailesSearchWithCollectionArray(
            searchWord,
            CollectionContractAddress.length ? CollectionContractAddress : allContracAddress,
            pageno,
            limit,
        ),
    ]);

    const payload = {
        owned: owned,
        buy: buy,
    };
    sendRes(res, 200, true, 'fetched', payload);
};

export const shopCategory = async (req, res) => {
    try {
        const collections = await nftservice.collectionget();
        const collectionType = await collectiontypefind();

        const ship = collectionType.filter((item) => {
            return item.type === constant.SHIP_DB;
        });

        const crew = collectionType.filter((item) => {
            return item.type === constant.CREW;
        });

        const planet = collectionType.filter((item) => {
            return item.type === constant.PLANET_DB;
        });

        const payload = {
            crew: collections.filter((item) => {
                return crew[0]._id?.toString() === item.type?.toString();
            }),
            planet: collections.filter((item) => {
                return planet[0]._id?.toString() === item.type?.toString();
            }),
            ship: collections.filter((item) => {
                return ship[0]._id?.toString() === item.type?.toString();
            }),
        };
        sendRes(res, 200, true, 'fetched', payload);
    } catch (e) {
        sendRes(res, 200, true, 'fetched', e.message);
    }
};

export const collectiontypefindContract = async (type) => {
    console.log("collectiontypefindContract_type", type)
    const [collections, collectionType] = await Promise.all([
        nftservice.collectionget(),
        collectiontypefind(),
    ]);
    const GALFI_CREW_TYPE_SYMBOL = getSymbolsWithTypes('crew', config.COLLECTION_CONTRACT_DETAILS);
    if (type === constant.GALFICREW) {
        const array = collections.filter((item) => {
            return GALFI_CREW_TYPE_SYMBOL.includes(item.CollectionSymbol?.toUpperCase());
        });
        const contractAddress = array.map((item) => item.CollectionContractAddress);
        console.log("contractAddress1", contractAddress)
        return contractAddress;
    } else {
        const typex = collectionType.filter((item) => {
            return item.type === type;
        });

        const array = collections.filter((item) => {
            return typex?.[0]?._id?.toString() === item?.type?.toString();
        });
        const contractAddress = array.map((item) => item.CollectionContractAddress);
        console.log("contractAddress2", contractAddress)
        return contractAddress;
    }
};


export const GalfiSpecialCrewMarket = async (req, res) => {
    try {
        const {
            body: {
                key,
                page,
                limit,
                collectionSymbol,
                CollectionContractAddress
            },
            userData,
        } = req;

        console.log("GalfiSpecialCrewMarket_req", key)
        const walletAddress = userData.WalletAddress;

        let specialCrewContractAddressArray = await collectiontypefindContract(constant.GALFISPECIALCREW);
        const pageno = (page - 1) * limit;
        const collection = CollectionContractAddress?.length
            ? CollectionContractAddress
            : specialCrewContractAddressArray;

        // const CollectionContractAddressquery = CollectionContractAddress.length
        //     ? { CollectionContractAddress: { $in: CollectionContractAddress } }
        //     : { CollectionContractAddress: { $in: allCrewContracAddressArray } };
        // const CREWs = crewTypes?.length
        //     ? { profession: { $in: crewTypes } }
        //     : { profession: { $ne: null } };

        // const crewGender = gender?.length ? { gender: { $in: gender } } : { gender: { $ne: null } };

        // if (tabName === 'buy') {
        //     const collectionData = await nftservice.findCollection_service({
        //         CollectionContractAddress: { $in: CollectionContractAddress },
        //     });
        //     const collectionIds = collectionData.map((e) => e._id);
        //     const crewtype = crewTypes.length
        //         ? { profession: { $in: crewTypes } }
        //         : { profession: { $ne: null } };

        //     const find = { ...crewtype, collection: { $in: collectionIds }, isActive: true };

        //     const shopdataforCrew = await gameservice.crewFindWithpagination(find, pageno, limit);

        //     const totalCount = await gameservice.crewCount(find);
        //     return sendRes(res, 200, true, `buy`, {
        //         totalCount: totalCount,
        //         result: shopdataforCrew,
        //         currentPage: page,
        //     });
        // }

        const crewType = "specialcrew"
        // if (tabName === 'owned') {
        const ownedData = await nftservice.getTokenDetailesWithCollectionArray(
            walletAddress,
            collection,
            pageno,
            limit,
            crewType,
            key
        );
        console.log("ownedData", ownedData)
        const tokenData = ownedData?.[0]?.results || [];
        const totCount = ownedData?.[0]?.totalCount?.[0]?.count || 0;

        for (let j = 0; j < tokenData.length; j++) {
            if (tokenData[j].image_url) {
                tokenData[j].image_url = signature_imageURL(tokenData[j].image_url);
            }
        }

        const resPayload = {
            totalCount: totCount,
            result: tokenData,
            currentPage: page,
        };
        return sendRes(res, 200, true, `owned`, resPayload);
        // }
    } catch (e) {
        console.log("GalfiSpecialCrewMarket_err", e)
        sendRes(res, 500, false, e.message);
    }
};



export const shipMarketAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);

        const find = {};

        const [totCount, shopdata] = await Promise.all([
            gameservice.shipShopCounts(),
            gameservice.ship_Shop_service(find, pageNum, limitNum),
        ]);
        shopdata.forEach((element) => {
            element.image_url = signature_imageURL(element?.image);
        });

        const resPayload = {
            result: shopdata,
            totalCount: totCount,
            currentPage: page,
        };
        return sendRes(res, 200, true, resPayload);

    } catch (e) {
        console.log("shipMarketAdmin_e", e)
        sendRes(res, 500, false, e.message);
    }
};

export const updateShipPriceAdmin = async (req, res) => {
    try {
        const { shipId, price, optionalCost } = req.body;

        if (!shipId) {
            return sendRes(res, 400, false, "shipId is required");
        }

        const updateData = {};

        if (price !== undefined) {
            updateData.price = price; // can be array
        }

        // if (optionalCost !== undefined) {
        //     updateData.optionalCost = optionalCost;
        // }

        if (Object.keys(updateData).length === 0) {
            return sendRes(res, 400, false, "No fields to update");
        }

        const updatedShip = await shipdb.findByIdAndUpdate(
            shipId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedShip) {
            return sendRes(res, 404, false, "Ship not found");
        }

        return sendRes(res, 200, true, updatedShip);

    } catch (error) {
        console.log("updateShipPriceAdmin_error", error);
        return sendRes(res, 500, false, error.message);
    }
};


export const getGalfiPriceForShip = async (req, res) => {
    try {
        const { shipId } = req.body;

        const getShip = await gameservice.findOneShip(shipId)
        console.log("getShip", getShip)
        const price = getShip?.price || [];

        const totalGalfiValue = price.reduce((totalBal, currVal) => {
            const rate = getPairFromStore(`GALFI-${currVal?.label}`);

            // if Redis returns string → parse
            const parsedRate = typeof rate === "string" ? JSON.parse(rate) : rate;

            const tokenPrice = Number(parsedRate?.price) || 1;
            const tokenAmount = Number(currVal?.amount) || 0;
            console.log("rate", tokenAmount, tokenPrice)
            return totalBal += tokenPrice * tokenAmount
        }, 0);
        console.log("totalGalfiValue", totalGalfiValue)

        const finalValue = totalGalfiValue * getShip?.priceMultiplier;
        console.log("finalValue", finalValue)
        let result = {
            optionalCost: finalValue
        }

        return sendRes(res, 200, true, "Optional cost", result);
    }
    catch (error) {
        console.log("getGalfiPriceForShip_error", error);
        return sendRes(res, 500, false, error.message);
    }
}

export const getGalfiPriceForBuilding = async (req, res) => {
    try {
        const { assetId, level } = req.body;

        const getBuilding = await gameservice.findOneleveldb_service({ assetId, level });
        console.log("getBuilding", getBuilding)
        const price = getBuilding?.cost || [];

        const totalGalfiValue = price.reduce((totalBal, currVal) => {
            const rate = getPairFromStore(`GALFI-${currVal?.label}`);

            // if Redis returns string → parse
            const parsedRate = typeof rate === "string" ? JSON.parse(rate) : rate;

            const tokenPrice = Number(parsedRate?.price) || 1;
            const tokenAmount = Number(currVal?.amount) || 0;
            console.log("rate", tokenAmount, tokenPrice)
            return totalBal += tokenPrice * tokenAmount
        }, 0);
        console.log("totalGalfiValue", totalGalfiValue)
        const gameValue = await get_GameValues();
        console.log("gameValue", gameValue)
        const finalValue = totalGalfiValue * gameValue?.optionalCost;
        console.log("finalValue", finalValue)
        let result = {
            optionalCost: finalValue
        }

        return sendRes(res, 200, true, "Optional cost", result);
    }
    catch (error) {
        console.log("getGalfiPriceForBuilding_err", error);
        return sendRes(res, 500, false, error.message);
    }
}