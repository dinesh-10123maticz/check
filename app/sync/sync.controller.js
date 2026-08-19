import { uploadOrUpdateIpfsToS3 } from '../../services/aws';
import { getSymbolsWithTypes, sendRes } from '../../shared/commonFunction';
import { collectiontypefind } from '../admin/cms/cms.service';
import { UserAssetList_service, userPlanetFindOneWithPopulate } from '../game/game.service';
import { FindTokenandUpdate, tokenFindOne } from '../nft/nft.services';

import * as nftservice from '../nft/nft.services';
import config from '../../config/config.js';
import constant from '../../shared/constant';
import { collectiontypefindContract } from '../shop/shop.controller';



export const syncPlanets = async (req, res) => {
    const {
        body: { nft_Id },
    } = req;
    try {
        const nftTokenData = await tokenFindOne({ _id: nft_Id });
        const userPlanetdata = await userPlanetFindOneWithPopulate({ nftId: nftTokenData._id });
        const existipfsurl = nftTokenData?.MetaData;
        const lastSync = new Date(nftTokenData.lastSync);
        const now = new Date();

        const diffMs = now - lastSync;
        const is24HoursPassed = diffMs >= 24 * 60 * 60 * 1000;

        if (!is24HoursPassed) {
            return res.status(400).json({
                status: false,
                message: 'You can sync only once every 24 hours',
            });
        }

        const find_data = {
            userPlanetId: userPlanetdata._id,
        };

        // it return the planet asset ( building )
        const userAsset = await UserAssetList_service(find_data);

        const buildingAttribute = userAsset.map((e) => ({
            trait_type: e.levelId.asset_Name,
            value: `Level ${e.levelId.level}`,
        }));
        const base = [
            {
                trait_type: 'type',
                value: userPlanetdata.planetId.type,
            },
            {
                trait_type: 'rarity',
                value: userPlanetdata.planetId.rarity,
            },
            {
                trait_type: 'hexId',
                value: userPlanetdata.planetId.hexId,
            },
        ];

        const newMeta = {
            names: nftTokenData.NFTName,
            description: nftTokenData?.NFTDescription,
            image: config.IPFS_IMG + nftTokenData.NFTOrginalImageIpfs,
            attributes: [...base, ...buildingAttribute],
            gameAssets: buildingAttribute,
        };
        const updatedTokendata = await FindTokenandUpdate(
            {
                _id: nftTokenData._id,
            },
            {
                NFTProperties: [...base, ...buildingAttribute],
                lastSync: Date.now(),
            },
        );

        const senddata = JSON.stringify(newMeta);
        const savedins = await uploadOrUpdateIpfsToS3(existipfsurl, senddata, 'text/plain');

        res.send({
            status: true,
            message: 'Planets synchronized successfully',
            data: savedins,
        });
    } catch (e) {
        res.status(500).send({
            status: false,
            message: 'An error occurred during synchronization',
            error: e.message,
        });
    }
};

export const syncAsteroids = async (req, res) => {
    const {
        body: { nft_Id },
    } = req;
    try {
        const nftTokenData = await tokenFindOne({ _id: nft_Id });
        const userPlanetdata = await userPlanetFindOneWithPopulate({ nftId: nftTokenData._id });
        const existipfsurl = nftTokenData?.MetaData;
        const lastSync = new Date(nftTokenData.lastSync);
        const now = new Date();

        const diffMs = now - lastSync;
        const is24HoursPassed = diffMs >= 24 * 60 * 60 * 1000;

        if (!is24HoursPassed) {
            return res.status(400).json({
                status: false,
                message: 'You can sync only once every 24 hours',
            });
        }

        const find_data = {
            userPlanetId: userPlanetdata._id,
        };

        const userAsset = await UserAssetList_service(find_data);

        const buildingAttribute = userAsset.map((e) => ({
            trait_type: e.levelId.asset_Name,
            value: `Level ${e.levelId.level}`,
        }));
        const base = [
            {
                trait_type: 'type',
                value: userPlanetdata.planetId.type,
            },
            {
                trait_type: 'rarity',
                value: userPlanetdata.planetId.rarity,
            },
            {
                trait_type: 'hexId',
                value: userPlanetdata.planetId.hexId,
            },
        ];

        const newMeta = {
            names: nftTokenData.NFTName,
            description: nftTokenData?.NFTDescription,
            image: config.IPFS_IMG + nftTokenData.NFTOrginalImageIpfs,
            attributes: [...base, ...buildingAttribute],
            gameAssets: buildingAttribute,
        };
        const updatedTokendata = await FindTokenandUpdate(
            {
                _id: nftTokenData._id,
            },
            {
                NFTProperties: [...base, ...buildingAttribute],
                lastSync: Date.now(),
            },
        );

        const senddata = JSON.stringify(newMeta);
        const savedins = await uploadOrUpdateIpfsToS3(existipfsurl, senddata, 'text/plain');

        res.send({
            status: true,
            message: 'Asteroid synchronized successfully',
            data: savedins,
        });
    } catch (e) {
        res.status(500).send({
            status: false,
            message: 'An error occurred during synchronization',
            error: e.message,
        });
    }
};

export const syncShips = (req, res) => {
    // Logic for syncing ships
    res.send('Ships synchronized successfully');
};

export const syncCrews = (req, res) => {
    // Logic for syncing crews
    res.send('Crews synchronized successfully');
};


export const syncPlanetswithMetadata = async (req, res) => {
    try {

        const { body: { walletAddress } } = req;

        let contractAddressArray = await collectiontypefindContract(constant.PLANET_DB);

        const tokenDatas = await nftservice.getTokenNFTIDSWithContractAddress(
            walletAddress,
            contractAddressArray,
        );
        console.log("tokenDatas", tokenDatas)
        const nftIDs = [];

        for (let i = 0; i < tokenDatas.length; i++) {
            nftIDs.push(tokenDatas[i]?.tokenData?.NFTId);
        }
        console.log("nftIDs", nftIDs)

        // const find = { NFTId: { $in: nftIDs } };
        // const NftTokenData = await nftservice.FindTokens(find);
        // console.log("NftTokenData", NftTokenData)

        // if (!NftTokenData?.length) {
        //     return res.status(404).send({
        //         status: false,
        //         message: 'No NFT tokens found',
        //     });
        // }


        // const existipfsurl = NftTokenData?.MetaData;
        // const userPlanetdata = await userPlanetFindOneWithPopulate({ nftId: NftTokenData._id });
        // const find_data = {
        //     userPlanetId: userPlanetdata._id,
        // };


        const nftDataList = await nftservice.getPlanetSyncData(nftIDs);
        const syncedData = [];

        for (const NftTokenData of nftDataList) {

            const userAsset = await UserAssetList_service({ userPlanetId: NftTokenData.userPlanetId });

            const buildingAttribute = userAsset.map((e) => ({
                trait_type: e.levelId.asset_Name,
                value: `Level ${e.levelId.level}`,
            }));

            const base = [
                {
                    trait_type: 'type',
                    value: NftTokenData.planetType,
                },
                {
                    trait_type: 'rarity',
                    value: NftTokenData.planetRarity,
                },
                {
                    trait_type: 'hexId',
                    value: NftTokenData.planetHexId,
                },
                {
                    trait_type: 'level',
                    value: NftTokenData.level,
                },
                {
                    trait_type: 'totalXp',
                    value: NftTokenData.totalXP,
                },

            ];

            const newMeta = {
                name: NftTokenData.NFTName,
                description: NftTokenData?.NFTDescription,
                image: config.IPFS_IMG + NftTokenData.NFTOrginalImageIpfs,
                attributes: [...base, ...buildingAttribute],
                gameAssets: buildingAttribute,
            };
            const updatedTokendata = await FindTokenandUpdate(
                {
                    _id: NftTokenData._id,
                },
                {
                    NFTProperties: [...base, ...buildingAttribute],
                    lastSync: Date.now(),
                },
            );

            const senddata = JSON.stringify(newMeta);
            const savedins = await uploadOrUpdateIpfsToS3(NftTokenData.MetaData, senddata, 'text/plain');
            syncedData.push(savedins);

        }

        return sendRes(res, 200, true, 'Planets synchronized successfully', syncedData);
    }
    catch (e) {
        sendRes(res, 500, false, e.message);
    }
}

// export const syncPlanetswithMetadata = async (req, res) => {
//     try {
//         const {
//             body: { walletAddress },
//         } = req;

//         const contractAddressArray =
//             await collectiontypefindContract(
//                 constant.PLANET_DB,
//             );

//         const tokenDatas =
//             await nftservice.getTokenNFTIDSWithContractAddress(
//                 walletAddress,
//                 contractAddressArray,
//             );

//         const nftIDs = tokenDatas.map(
//             (e) => e?.tokenData?.NFTId,
//         );

//         const find = {
//             nftId: { $in: nftIDs },
//         };

//         // Assuming this returns array
//         const nftTokenList = await nftservice.FindTokens(find);

//         if (!nftTokenList?.length) {
//             return res.status(404).send({
//                 status: false,
//                 message: 'No NFT tokens found',
//             });
//         }

//         // Loop through all NFTs
//         for (const NftTokenData of nftTokenList) {
//             const existipfsurl = NftTokenData?.MetaData;

//             const userPlanetdata =
//                 await userPlanetFindOneWithPopulate({
//                     nftId: NftTokenData._id,
//                 });

//             if (!userPlanetdata) continue;

//             const userAsset = await UserAssetList_service({
//                 userPlanetId: userPlanetdata._id,
//             });

//             const buildingAttribute = userAsset.map((e) => ({
//                 trait_type: e.levelId.asset_Name,
//                 value: `Level ${e.levelId.level}`,
//             }));

//             const base = [
//                 {
//                     trait_type: 'type',
//                     value: userPlanetdata.planetId.type,
//                 },
//                 {
//                     trait_type: 'rarity',
//                     value: userPlanetdata.planetId.rarity,
//                 },
//                 {
//                     trait_type: 'hexId',
//                     value: userPlanetdata.planetId.hexId,
//                 },
//                 {
//                     trait_type: 'level',
//                     value: NftTokenData.level || 1,
//                 },
//                 {
//                     trait_type: 'totalXp',
//                     value: NftTokenData.totalXP || 0,
//                 },
//             ];

//             const newMeta = {
//                 name: NftTokenData.NFTName,
//                 description: NftTokenData?.NFTDescription,
//                 image:
//                     config.IPFS_IMG +
//                     NftTokenData.NFTOrginalImageIpfs,
//                 attributes: [
//                     ...base,
//                     ...buildingAttribute,
//                 ],
//                 gameAssets: buildingAttribute,
//             };

//             await FindTokenandUpdate(
//                 {
//                     _id: NftTokenData._id,
//                 },
//                 {
//                     NFTProperties: [
//                         ...base,
//                         ...buildingAttribute,
//                     ],
//                     lastSync: Date.now(),
//                 },
//             );

//             const senddata = JSON.stringify(newMeta);

//             await uploadOrUpdateIpfsToS3(
//                 existipfsurl,
//                 senddata,
//                 'text/plain',
//             );
//         }

//         res.send({
//             status: true,
//             message: 'Planets synchronized successfully',
//         });
//     } catch (e) {
//         res.status(500).send({
//             status: false,
//             message:
//                 'An error occurred during synchronization',
//             error: e.message,
//         });
//     }
// };