import {
    catchresponse,
    formatTheUrlPath,
    GetAdminPrivatekey,
    getAdminWalletAddress,
    GetOriginalImage,
    getRandomNumber,
    ipfs_add_for_meta,
    isEmpty,
    sendGameResponseEncrpted,
    sendRes,
    sendResponse,
    signature_imageURL,
    toFixedNumber,
    uploadAndGenerateUrl,
} from '../../shared/commonFunction';
import { ImageAddFunc } from '../../shared/commonFunction';
import { saveimageurltoS3, uploadImageToS3, uploadOrUpdateIpfsMetaToS3 } from '../../services/aws';
import fs from 'fs';
import Web3 from 'web3';
import {
    createMigrateSign,
    DataOfTranscation,
    decode18Decimal,
    getContractInstance,
    HEXTONUMBER,
} from '../../shared/contract';
import { checkforenounghbalance } from '../game/game.validation';
import { currencyFindOne, TranscationService } from '../exchange/exchange.service';
import { collectiontypeFindOne } from '../admin/cms/cms.service';
import * as nftservice from './nft.services';
import * as userService from '../user/user.services';
import * as gameService from '../game/game.service';
import { getAssetByPlanetId } from '../game/controller/game.controller';
import config, { CURRENT_NETWORK } from '../../config/config';
import { generateMetaStoreFilePath, uploadTxtToPinataParally } from '../../services/ipfs';
import { multiHop } from '../amountConvertion/amountConvert';
import CONSTANTS from '../../shared/constant';
const TokenOwnersDb = require('./schema/tokenowner.schema');
const TokenDb = require('./schema/token.schema');
const userdb = require('../user/schema/user.schema');
// const TokenDb = require('./schema/token.schema')
// const TokenownerDb = require('./schema/tokenowner.schema')
import * as exchangeService from '../exchange/exchange.service';
import constant from '../../shared/constant';
import { ethers } from 'ethers';
import nearByPlanetSchema from '../game/schema/nearByPlanet.schema';
import { getSurveyMissionResource } from '../missions/mission.controller';

const util = require('util');
let movefile = util.promisify(fs.writeFile);
let MkDir = util.promisify(fs.mkdir);

export const Createsignature = async (req, res) => {
    try {
        let {
            body: {
                walletAddress,
                message,
                nonce,
                mintType,
                assetId,
                tokenLabel,
                amount,
                collectionContractAddress,
            },
        } = req;
        collectionContractAddress = collectionContractAddress.toLowerCase();
        amount = mintType === 'online' ? amount : 0;
        if (mintType === 'offline') {
            if (collectionContractAddress === config.COLLECTION_CONTRACT_DETAILS.ship.address) {
                const shipData = await gameService.findOneShip(assetId);
                const status = await checkforenounghbalance(shipData.price, walletAddress);
                if (!status.status) {
                    return sendRes(res, 409, false, status.message);
                }
                amount = 0;
            }

            if (
                collectionContractAddress === config.COLLECTION_CONTRACT_DETAILS.planet.address ||
                collectionContractAddress === config.COLLECTION_CONTRACT_DETAILS.astroid.address
            ) {
                const cur = await currencyFindOne({
                    $or: [{ value: tokenLabel }, { label: tokenLabel }],
                });
                if (!cur) {
                    return sendRes(res, 409, false, 'invalid input');
                }

                const planetData = await gameService.findBYPlanetID(assetId);
                const amountsIn = toFixedNumber(Number(planetData?.price) * 10 ** 18).toFixed(0);
                const val = await multiHop(amountsIn, cur.address.toLowerCase());

                const price = [{ label: tokenLabel, amount: val.amount / 10 ** 18 }];
                const status = await checkforenounghbalance(price, walletAddress);
                if (!status.status) {
                    return sendRes(res, 409, false, status.message);
                }
                amount = 0;
            }

            if (
                collectionContractAddress === config.COLLECTION_CONTRACT_DETAILS.specialcrew.address
            ) {
                const price = [{ label: tokenLabel, amount: amount / 10 ** 18 }];
                const status = await checkforenounghbalance(price, walletAddress);
                if (!status.status) {
                    return sendRes(res, 409, false, status.message);
                }
            }

            if (collectionContractAddress === config.COLLECTION_CONTRACT_DETAILS.crew.address) {
                const price = [{ label: tokenLabel, amount: amount / 10 ** 18 }];
                const status = await checkforenounghbalance(price, walletAddress);
                if (!status.status) {
                    return sendRes(res, 409, false, status.message);
                }
            }
        }

        const adminAddress = await getAdminWalletAddress();
        const Contract = getContractInstance(
            config.ABI.TRADE,
            config.CHAIN_DETAILS[CURRENT_NETWORK].trade,
        );
        const messageHash = await Contract.methods
            .getMessageHash(walletAddress, amount, message, nonce)
            .call();
        const privateKey = await GetAdminPrivatekey();

        const signatures = await createMigrateSign(messageHash, privateKey);
        return sendGameResponseEncrpted(res, 200, true, 'signature done', {
            messageHash: signatures.signature,
        });
    } catch (error) {
        sendGameResponseEncrpted(res, error);
    }
};

// export const Createsignature_V2 = async (req, res) => {
//     try {
//         let {
//             body: { walletAddress, message, nonce, amount },
//         } = req;
//         console.log("Createsignature_V2", walletAddress, message, nonce, amount)
//         const Contract = getContractInstance(
//             config.ABI.TRADE,
//             config.CHAIN_DETAILS[CURRENT_NETWORK].trade,
//         );
//         console.log("Contract", Contract)

//         const messageHash = await Contract.methods
//             .getMessageHash(walletAddress, amount, message, nonce)
//             .call();
//         console.log("messageHash", messageHash)
//         const privateKey = await GetAdminPrivatekey();
//         // console.log("privateKey", privateKey)

//         const signatures = await createMigrateSign(messageHash, privateKey);
//         // console.log("signatures", signatures)

//         return sendGameResponseEncrpted(res, 200, true, 'signature done', {
//             messageHash: signatures.signature,
//         });
//     } catch (error) {
//         console.log(error, "Createsignature_V2__")
//         sendGameResponseEncrpted(res, error);
//     }
// };

export const Createsignature_V2 = async (req, res) => {
    try {
        const {
            body: { walletAddress, amount, message, nonce },
        } = req;

        // const message = config.salt;

        const web3 = new Web3(
            new Web3.providers.HttpProvider(config.CHAIN_DETAILS[CURRENT_NETWORK].rpc_http),
        );

        // // Current timestamp (seconds)
        // const timestamp = Math.floor(Date.now() / 1000);

        // // Convert to 18 decimals
        // const nonce = ethers.parseUnits(timestamp.toString(), 18).toString();

        // Generate the same hash as Solidity
        const hash = web3.utils.soliditySha3(
            { t: 'address', v: walletAddress },
            { t: 'uint256', v: amount },
            { t: 'string', v: message },
            { t: 'uint256', v: nonce },
        );

        const privateKey = await GetAdminPrivatekey();

        // Sign the hash
        const signatureObj = web3.eth.accounts.sign(hash, privateKey);

        return sendGameResponseEncrpted(res, 200, true, 'signature done', {
            amount,
            nonce,
            message,
            signature: signatureObj.signature,
        });
    } catch (error) {
        console.log('Createsignature_V2__', error);
        sendGameResponseEncrpted(res, error);
    }
};

/**
 * Validates the NFT name provided in the request body.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise} Promise representing the validation result
 */
export const validateNFTName = async (req, res) => {
    const { NFTName } = req.body;

    if (!NFTName) {
        return sendResponse(res, 400, false, 'NFTName is required');
    }

    try {
        const existingNFT = await nftservice.FindToken({ NFTName });

        if (existingNFT) {
            return sendResponse(res, 400, false, 'NFTName already exists');
        }

        return sendResponse(res, 200, true, 'NFTName is available');
    } catch (error) {
        catchresponse(res, error);
    }
};

export const createNewNFT = async (req, res) => {
    try {
        const {
            CollectionNetwork,
            CollectionName,
            NFTId,
            NFTName,
            Category,
            NFTDescription,
            NFTOrginalImage,
            NFTThumpImage,
            UnlockContent,
            CollectionSymbol,
            ContractAddress,
            ContractType,
            NFTRoyalty,
            NFTProperties,
            CompressedFile,
            CompressedThumbFile,
            NFTOrginalImageIpfs,
            NFTThumpImageIpfs,
            MetaData,
            MetFile,
            NFTCreator,
            NFTQuantity,
            PutOnSale,
            PutOnSaleType,
            NFTPrice,
            CoinName,
            ClockTime,
            EndClockTime,
            HashValue,
            NFTOwner,
            activity,
            NFTBalance,

            LazyStatus,
            NonceHash,
            RandomName,
            SignatureHash,
        } = req?.body;

        const TokenADd = await TokenOwnerADD(
            {
                CollectionNetwork,
                CollectionName,
                MetFile,
                CollectionSymbol,
                NFTId,
                NFTName,
                Category,
                NFTDescription,
                NFTOrginalImage,
                NFTThumpImage,
                UnlockContent,
                ContractAddress,
                ContractType,
                NFTRoyalty,
                NFTProperties,
                CompressedFile,
                CompressedThumbFile,
                NFTOrginalImageIpfs,
                NFTThumpImageIpfs,
                MetaData,
                NFTCreator,
                NFTQuantity,
                activity,
                LazyStatus,
                NonceHash,
                RandomName,
                SignatureHash,
            },
            {
                PutOnSale,
                PutOnSaleType,
                NFTPrice,
                CoinName,
                ClockTime,
                EndClockTime,
                HashValue,
                NFTOwner,
                NFTBalance,
                LazyStatus,
                NonceHash,
                RandomName,
                SignatureHash,
            },
        );

        await nftservice.Activity({
            From:
                activity === 'Mint' || activity === 'List'
                    ? 'NullAddress'
                    : activity === 'TransfersFiat'
                      ? NFTCreator
                      : NFTOwner,
            To: activity === 'Mint' ? NFTCreator : NFTOwner,
            Activity: activity,
            NFTPrice: NFTPrice,
            Type: PutOnSale ? PutOnSaleType : 'Not For Sale',
            CoinName: CoinName,
            NFTQuantity: NFTQuantity,
            HashValue: HashValue,
            NFTId: NFTId,
            ContractType: ContractType,
            ContractAddress: ContractAddress,
            CollectionNetwork: CollectionNetwork,
            Category: Category,
            CollectionSymbol: CollectionSymbol,
            CollectionName: CollectionName,
        });

        const data = await nftservice.userdb_findOneAndUpdate(
            { _id: req.body.userId },
            { $push: { planets: req.body?.planetId } },
        );
        return sendRes(res, 200, true, data);
    } catch (e) {
        console.error(e);
        catchresponse(res, e);
    }
};

export const createNewpanetNFT = async (req, res) => {
    try {
        const {
            CollectionNetwork,
            CollectionName,
            NFTId,
            NFTName,
            Category,
            NFTDescription,
            NFTOrginalImage,
            NFTThumpImage,
            UnlockContent,
            CollectionSymbol,
            ContractAddress,
            ContractType,
            NFTRoyalty,
            NFTProperties,
            CompressedFile,
            CompressedThumbFile,
            NFTOrginalImageIpfs,
            NFTThumpImageIpfs,
            MetaData,
            MetFile,
            NFTCreator,
            NFTQuantity,
            PutOnSale,
            PutOnSaleType,
            NFTPrice,
            CoinName,
            ClockTime,
            EndClockTime,
            HashValue,
            NFTOwner,
            activity,
            NFTBalance,

            LazyStatus,
            NonceHash,
            RandomName,
            SignatureHash,
        } = req?.body;

        const TokenADd = await TokenOwnerADD(
            {
                CollectionNetwork,
                CollectionName,
                MetFile,
                CollectionSymbol,
                NFTId,
                NFTName,
                Category,
                NFTDescription,
                NFTOrginalImage,
                NFTThumpImage,
                UnlockContent,
                ContractAddress,
                ContractType,
                NFTRoyalty,
                NFTProperties,
                CompressedFile,
                CompressedThumbFile,
                NFTOrginalImageIpfs,
                NFTThumpImageIpfs,
                MetaData,
                NFTCreator,
                NFTQuantity,
                activity,
                LazyStatus,
                NonceHash,
                RandomName,
                SignatureHash,
            },
            {
                PutOnSale,
                PutOnSaleType,
                NFTPrice,
                CoinName,
                ClockTime,
                EndClockTime,
                HashValue,
                NFTOwner,
                NFTBalance,
                LazyStatus,
                NonceHash,
                RandomName,
                SignatureHash,
            },
        );
        // emailservice
        // if (activity == "Mint" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'mint', EmailId: EmailId, Subject: `Minting An ${(CollectionNetwork == 'Polygon') ? "Polygon" : 'MATIC'}${(ContractType == 721 || ContractType == "721") ? '721' : '1155'}`, OTP: '', click: click })
        // if(activity == "TransfersFiat" && TokenADd.success == "success") var Send_Mail   =   await Node_Mailer({Type:'transfer_drop',EmailId:EmailId,Subject:'Tranfer Drop',OTP:'',click:click})
        // if (activity == "PutOnSale" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'putonsale', EmailId: EmailId, Subject: 'Listing An NFT', OTP: '', click: click })
        // if (activity == "CancelOrder" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'cancelorder', EmailId: EmailId, Subject: 'Cancel Price An NFT', OTP: '', click: click })
        // if(activity == "Lower" && TokenADd.success == "success") var Send_Mail   =   await Node_Mailer({Type:'lower',EmailId:EmailId,Subject:'Changing Price An NFT',OTP:'',click:click})
        await nftservice.Activity({
            From:
                activity === 'Mint' || activity === 'List'
                    ? 'NullAddress'
                    : activity === 'TransfersFiat'
                      ? NFTCreator
                      : NFTOwner,
            To: activity === 'Mint' ? NFTCreator : NFTOwner,
            Activity: activity,
            NFTPrice: NFTPrice,
            Type: PutOnSale ? PutOnSaleType : 'Not For Sale',
            CoinName: CoinName,
            NFTQuantity: NFTQuantity,
            HashValue: HashValue,
            NFTId: NFTId,
            ContractType: ContractType ?? '721',
            ContractAddress: ContractAddress,
            CollectionNetwork: CollectionNetwork,
            Category: Category,
            CollectionSymbol: CollectionSymbol,
            CollectionName: CollectionName,
        });

        // service from game/game.service
        const CreateuserPlanedata = await gameService.CreateuserPlanet(
            { _id: req.body.userId, WalletAddress: req.body?.WalletAddress },
            req.body?.planetId,
            req.body.nftId,
        );
        const data = await userdb_findOneAndUpdate(
            { _id: req.body.userId },
            { $push: { planets: CreateuserPlanedata?._id } },
        );
        sendRes(res, 200, true, data);

        // return sendRes(res,200,true,TokenADd);
    } catch (e) {
        console.error(e);
        catchresponse(res, e);
    }
};

export const TokenOwnerADD = async (data, tokenOWN) => {
    tokenOWN.NFTBalance = tokenOWN.NFTBalance
        ? tokenOWN.NFTBalance
        : tokenOWN.NFTQuantity
          ? tokenOWN.NFTQuantity
          : data.NFTQuantity;

    tokenOWN.NFTId = data.NFTId;
    tokenOWN.NFTOwner = tokenOWN.NFTOwner ? tokenOWN.NFTOwner : data.NFTCreator;
    tokenOWN.Status = 'list';
    tokenOWN.tokenowner = data.NFTCreator;
    let add = '';

    let finddata = {
        NFTId: data.NFTId,
        NFTOwner: tokenOWN.NFTOwner ? tokenOWN.NFTOwner : data.NFTCreator,
    };
    let selectdata = { _id: 0, NFTRoyalty: 1, NFTBalance: 1 };

    let data_already_token_list = await nftservice.FindTokenOwners(finddata, selectdata);

    tokenOWN.NFTBalance =
        data.activity === 'TransfersFiat'
            ? data_already_token_list?.NFTBalance
                ? Number(data_already_token_list?.NFTBalance) + Number(tokenOWN.NFTBalance)
                : tokenOWN.NFTBalance
            : tokenOWN.NFTBalance;

    let findata = {
        NFTId: data.NFTId,
        NFTOwner: tokenOWN.NFTOwner ? tokenOWN.NFTOwner : data.NFTCreator,
    };
    let update = { $set: tokenOWN };
    const Finddata = await nftservice.FindTokenownerandUpdate(findata, update, { new: true });
    if (Finddata) {
        if (isEmpty(Finddata.NFTBalance)) {
            add = await TokenADD(data, Finddata._id);
        }
        return Finddata;
    } else {
        tokenOWN.NFTQuantity = tokenOWN.NFTQuantity ? tokenOWN.NFTQuantity : data.NFTQuantity;
        tokenOWN.NFTBalance = tokenOWN.NFTBalance
            ? tokenOWN.NFTBalance
            : tokenOWN.NFTQuantity
              ? tokenOWN.NFTQuantity
              : data.NFTQuantity;

        let Resp = await nftservice.SaveTokenOwners(tokenOWN);
        if (Resp) {
            add = await TokenADD(data, Resp._id);
            return add;
        } else {
            return Resp;
        }
    }
};

export const TokenADD = async (data, _id) => {
    data.NFTOwnerDetails = [_id];
    const newdata = {
        data,
    };
    const FinData = { NFTBalance: '0', _id };
    const List_chk = await nftservice.FindTokenOwners(FinData);
    const update = List_chk
        ? { $pull: { NFTOwnerDetails: _id } }
        : { $push: { NFTOwnerDetails: _id } };
    const findata = { NFTId: data.NFTId, NFTCreator: data.NFTCreator };
    const Find = await nftservice.FindTokenandUpdate(findata, update);
    if (Find) {
        return Find;
    } else {
        return await nftservice.FindToken(newdata.data);
    }
};

export const CreateCollection = async (req, res) => {
    try {
        const {
            CollectionName,
            CollectionSymbol,
            CollectionBio,
            Category,
            CollectionType,
            CollectionNetwork,
            CollectionCreator,
            CollectionContractAddress,
        } = req?.body;
        let SenVal = {};
        const ref = Date.now();
        let FinData = { CollectionSymbol };
        let SelData = { CollectionSymbol: 1 };
        let data_already_token_list = await nftservice.FindCollection(FinData, SelData);
        if (data_already_token_list) {
            return sendResponse(res, 409, false, 'symbol already exits', null);
        } else {
            if (!req?.files) {
                SenVal = {
                    CollectionName,
                    CollectionSymbol,
                    CollectionBio,
                    CollectionType,
                    CollectionNetwork,
                    CollectionCreator,
                    CollectionContractAddress: CollectionContractAddress.toLowerCase(),
                    Category,
                };
            } else {
                const { CollectionProfileImage, CollectionCoverImage } = req?.files;
                const profile = CollectionProfileImage
                    ? await ImageAddFunc([
                          {
                              path: `public/collection/profile/${CollectionSymbol}/`,
                              files: CollectionProfileImage,
                              filename: ref + '.' + 'webp',
                          },
                      ])
                    : '';
                const cover = CollectionCoverImage
                    ? await ImageAddFunc([
                          {
                              path: `public/collection/cover/${CollectionSymbol}/`,
                              files: CollectionCoverImage,
                              filename: ref + '.' + 'webp',
                          },
                      ])
                    : '';
                SenVal = {
                    CollectionName,
                    CollectionSymbol,
                    CollectionBio,
                    CollectionType,
                    CollectionNetwork,
                    CollectionCreator,
                    CollectionProfileImage: profile,
                    CollectionCoverImage: cover,
                    CollectionContractAddress,
                    Category,
                    softStakeReward,
                };
                // let Resp = await MongooseHelper.Save(SenVal);
                const Resp = await nftservice.SaveCollection(SenVal);

                return sendResponse(res, 201, true, 'Collection Created Successfully', Resp);
            }
        }
    } catch (error) {
        catchresponse(res, error);
    }
};

export const SearchAction = async (req, res) => {
    const { limit, page, from } = req.query;
    const { Classid, keyword } = req.query;

    let SendDta = {};
    SendDta.limit = (parseInt(limit) ?? 1) * page;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.from = from;
    SendDta.sort = { updatedAt: -1 };

    SendDta.CustomUrl = '';

    SendDta.tokenOwnerMatch = {
        $expr: {
            $and: [
                { $ne: ['$NFTBalance', '0'] },
                { $eq: ['$Status', 'list'] },
                { $eq: ['$HideShow', 'visible'] },
                { $eq: ['$NFTId', '$$tId'] },
            ],
        },
    };

    SendDta.TokenMatch = {
        NFTName: { $regex: req.query.keyword, $options: 'ix' },

        // NFTProperties:  { $elemMatch: {
        //   $or: [
        //     {
        //       "skin" : "white"
        //   },
        //   {
        //       "body" : "fat"
        //   }
        //   ] ,

        // }},
        reported: false,
    };
    // SendDta.user = {

    //   DisplayName: { "$regex": req.query.keyword, "$options": "ix" }

    // }

    // SendDta.Collection = {

    //   CollectionName: { "$regex": req.query.keyword, "$options": "ix" },

    // }
    // SendDta.Tokens = Tokens

    let Retdata = {};
    Retdata.token = await nftservice.TokenList(SendDta);
    // Retdata.user = await UserSearch(SendDta);
    // Retdata.collection = await collectionsearch(SendDta);
    // Retdata.from = from;

    return res.status(200).json({
        status: true,
        message: 'Success',
        data: Retdata,
    });
    // sendResponse(res, 200, true, "Search Action Success", Retdata)
};

const UserSearch = async (data) => {
    let userdata = {
        findata: data.user,
        selectdata: {},
        limit: data.limit,
        skip: data.skip,
        sort: data.sort,
    };
    let List = await userService.userseachservice(userdata);
    return List?.data;
};

const collectionsearch = async (data) => {
    let List = await collectionAggregate(data);

    return List;
};

export const Tokenlistfunc = async (req, res) => {
    const { TabName, limit, CustomUrl, page, from, CollectionSymbol } = req.query;
    let SendDta = {};
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.CustomUrl = CustomUrl;
    SendDta.from = from;

    if (from == 'Explore') {
        const { filter } = req.query;
        SendDta.tokenOwnerMatch = {
            $expr: {
                $and: [
                    { $ne: ['$NFTBalance', '0'] },
                    // { '$eq':['$Status', 'list' ]},
                    { $eq: ['$HideShow', 'visible'] },
                    { $eq: ['$NFTId', '$$tId'] },
                ],
            },
        };
        var TabNames =
            TabName == 'All' ||
            TabName == 'LatestDrops' ||
            TabName == 'PriceLowToHigh' ||
            TabName == 'PriceHighToLow'
                ? ''
                : TabName;
        SendDta.TokenMatch = {
            Category: TabNames ? TabNames : { $ne: '' },
            reported: { $eq: false },
        };
        SendDta.sort = { 'tokenowners_list.updatedAt': -1 };
        if (filter == 'PriceLowToHigh') {
            SendDta.TokenMatch = {
                Category: TabNames ? TabNames : { $ne: '' },
                reported: { $eq: false },
            };
            SendDta.sort = { NFTPrice: 1 };
        } else if (filter == 'PriceHighToLow') {
            SendDta.TokenMatch = {
                Category: TabNames ? TabNames : { $ne: '' },
                reported: { $eq: false },
            };
            SendDta.sort = { NFTPrice: -1 };
        } else if (filter == 'oldest') {
            SendDta.sort = { 'tokenowners_list.updatedAt': 1 };
            SendDta.TokenMatch = { Category: TabNames ? TabNames : { $ne: '' } };
        }
        // this is for show the recently putonsale

        //   else if (filter == "recentlisted") {
        //     SendDta.tokenOwnerMatch = {
        //       $expr: {
        //         $and: [
        //           { $ne: ["$NFTBalance", "0"] },
        //           // { '$eq':['$Status', 'list' ]},
        //           { $eq: ["$HideShow", "visible"] },
        //           { $eq: ["$NFTId", "$$tId"] },
        //         ],
        //       },
        //     };
        //     SendDta.Activitymatch = {
        //       Category: TabNames ? TabNames : { $ne: "" },
        //       Type: { $ne: "Not For Sale" }
        //     }
        //   }
        else if (filter == 'recentcreated') {
            SendDta.tokenOwnerMatch = {
                $expr: {
                    $and: [
                        { $ne: ['$NFTBalance', '0'] },
                        // { '$eq':['$Status', 'list' ]},
                        { $eq: ['$HideShow', 'visible'] },
                        { $eq: ['$NFTId', '$$tId'] },
                    ],
                },
            };
            SendDta.Activitymatch = {
                Category: TabNames ? TabNames : { $ne: '' },
                Activity: 'Mint',
            };
        } else if (filter == 'recentsold') {
            SendDta.tokenOwnerMatch = {
                $expr: {
                    $and: [
                        { $ne: ['$NFTBalance', '0'] },
                        // { '$eq':['$Status', 'list' ]},
                        { $eq: ['$HideShow', 'visible'] },
                        { $eq: ['$NFTId', '$$tId'] },
                    ],
                },
            };
            SendDta.Activitymatch = {
                Category: TabNames ? TabNames : { $ne: '' },
                Activity: 'Buy',
            };
        }
        SendDta.filter = filter;
    }

    if (from == 'Sale') {
        const { filter } = req.query;
        SendDta.tokenOwnerMatch = {
            $expr: {
                $and: [
                    { $eq: ['$HideShow', 'visible'] },
                    //    { '$eq':['$Status', 'list' ]},

                    { $eq: ['$NFTId', '$$tId'] },
                    { $ne: ['$NFTBalance', '0'] },
                ],
            },
        };
        var TabNames =
            TabName == 'All' ||
            TabName == 'LatestDrops' ||
            TabName == 'PriceLowToHigh' ||
            TabName == 'PriceHighToLow'
                ? ''
                : TabName;
        SendDta.TokenMatch = {
            Category: TabNames ? TabNames : { $ne: '' },
            reported: { $eq: false },
        };
        // SendDta.sort = { "tokenowners_list.updatedAt": -1 };
        if (filter == 'BLTH') {
            SendDta.sort = { NFTPrice: 1 };
            // SendDta.TokenMatch = {};
        } else if (filter == 'BHTL') {
            SendDta.sort = { NFTPrice: -1 };
            // SendDta.TokenMatch = {};
        } else if (filter == 'OLD') {
            SendDta.sort = { 'tokenowners_list.updatedAt': 1 };
            // SendDta.TokenMatch = {};
        } else if (filter == 'LatestDrops') {
            SendDta.sort = { 'tokenowners_list.updatedAt': -1 };
        }
    }

    if (from == 'collection') {
        SendDta.tokenOwnerMatch = {
            $expr: {
                $and: [
                    { $ne: ['$NFTBalance', '0'] },
                    // { '$eq':['$Status', 'list' ]},
                    { $eq: ['$HideShow', 'visible'] },
                    { $eq: ['$NFTId', '$$tId'] },
                ],
            },
        };
        if (TabName == 'LTH') {
            SendDta.TokenMatch = {
                reported: { $eq: false },
                CollectionSymbol: { $eq: CollectionSymbol },
            };
            SendDta.sort = { NFTPrice: 1 };
        } else if (TabName == 'HTL') {
            SendDta.TokenMatch = {
                reported: { $eq: false },
                CollectionSymbol: { $eq: CollectionSymbol },
            };
            SendDta.sort = { NFTPrice: -1 };
        } else if (TabName == 'OLD') {
            SendDta.TokenMatch = {
                reported: { $eq: false },
                CollectionSymbol: { $eq: CollectionSymbol },
            };
            SendDta.sort = { 'tokenowners_list.upadatedAt': 1 };
        } else if (TabName == 'NOW') {
            SendDta.TokenMatch = {
                reported: { $eq: false },
                CollectionSymbol: { $eq: CollectionSymbol },
            };
            SendDta.sort = { 'tokenowners_list.upadatedAt': -1 };
        } else if (TabName == 'new') {
            SendDta.TokenMatch = {
                reported: { $eq: false },
                CollectionSymbol: { $eq: CollectionSymbol },
            };
        } else {
            var TabNames =
                TabName == 'All' ||
                TabName == 'LatestDrops' ||
                TabName == 'PriceLowToHigh' ||
                TabName == 'PriceHighToLow'
                    ? ''
                    : TabName;
            SendDta.TokenMatch = {
                Category: TabNames ? TabNames : { $ne: '' },
                reported: { $eq: false },
                CollectionSymbol: { $eq: CollectionSymbol },
            };
            SendDta.sort = { 'tokenowners_list.updatedAt': -1 };
        }
    }

    SendDta.Tokens = Tokens;

    SendDta.TabName = TabName;
    let RetData;
    if (SendDta.Activitymatch) {
        RetData = await nftservice.ExplorewithActivity(SendDta);
    } else {
        RetData = await nftservice.TokenList(SendDta);
    }

    sendResponse(res, 200, true, 'fetched', RetData);
};

export const Explore = async (req, res) => {
    try {
        const { TabName, limit, CustomUrl, page, from, filter, pricerange } = req.query;

        const result = await nftservice.exploreservice(
            TabName,
            limit,
            CustomUrl,
            page,
            from,
            filter,
        );
        sendResponse(res, 200, result ? true : false, 'fetched', result ? result : []);
    } catch (error) {
        catchresponse(res, error);
    }
};

//  (from == "Auction")
export const exploreauction = async (req, res) => {
    try {
        // const { TabName, limit, CustomUrl, page, from , filter} = req.query;
        const result = await nftservice.exploreauctionService(req.query);
        sendResponse(res, 200, result ? true : false, 'fetched', result);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const ExploreCollection = async (req, res) => {
    try {
        const { TabName, limit, CustomUrl, page, from, filter } = req.query;
        const result = await nftservice.explorecollectionservice(
            TabName,
            limit,
            CustomUrl,
            page,
            from,
            filter,
        );
        sendResponse(res, 200, result ? true : false, 'fetched', result);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const Findupdatebalance = async (req, res) => {
    try {
        let ReqBody = req?.body;
        let NFTId = String(ReqBody?.NFTId); //changed
        let NFTBalance = Number(ReqBody?.NFTBalance);
        let NFTOwner = ReqBody?.NFTOwner.toLowerCase();
        let Currentowner = ReqBody?.Currentowner.toLowerCase();
        let Type = ReqBody?.type;
        const {
            body: { collectionAddress },
        } = req;

        if (Type === '721') {
            let FinData = { WalletAddress: Currentowner };

            // service from user model
            const findalreadyexist = await userService.Finduser(FinData, {});
            // check user is exist or else create
            if (!findalreadyexist) {
                let saveData = {};
                saveData._id = Currentowner;
                saveData.CustomUrl = Currentowner;
                saveData.WalletAddress = Currentowner;
                saveData.DisplayName = Currentowner;
                saveData.refferalCode = generateReferralCode(Currentowner.slice(0, 5));
                const savedata = await SaveUser(saveData);
            }

            // ! checking we already have this account for prevent duplication if we not find

            let findx = await nftservice.FindTokenOwners(
                {
                    NFTId: NFTId,
                    NFTOwner: Currentowner,
                    NFTQuantity: '1',
                    NFTBalance: '1',
                    ContractAddress: collectionAddress,
                },
                {},
            );
            if (findx) {
                return res.status(200).json({ success: true, message: 'no need to update' });
            }
            const findThefakedata = await nftservice.tokenOwnerFindOne({
                NFTOwner: NFTOwner,
                NFTId: NFTId,
                NFTBalance: '1',
                ContractAddress: collectionAddress,
            });

            console.log('findThefakedata', findThefakedata);
            let savedata;

            // if (!findx && checkExistingbalance?.HashValue) {
            if (!findx && findThefakedata && findThefakedata.HashValue) {
                let newdata = {
                    NFTId: NFTId,
                    NFTOwner: Currentowner,
                    NFTName: findThefakedata.NFTName,
                    NFTtype: findThefakedata.NFTtype,
                    HashValue: findThefakedata?.HashValue,
                    PutOnSale: 'false',
                    PutOnSaleType: 'UnlimitedAuction',
                    NFTPrice: '',
                    CoinName: findThefakedata?.CoinName,
                    Status: 'list',
                    NFTQuantity: '1',
                    NFTBalance: '1',
                    ClockTime: null,
                    EndClockTime: null,
                    HideShow: 'visible',
                    deleted: 0,
                    burnToken: 0,
                    Platform: 'our',
                    bannerpromotion: false,
                    ContractAddress: collectionAddress,
                    CollectionName: findThefakedata?.CollectionName,
                    Category: findThefakedata.Category,
                };
                savedata = await nftservice.SaveTokenOwners(newdata);
                console.log('savedatasavedata', savedata);

                let checkExistingbalance = await nftservice.FindTokenownerandUpdate(
                    {
                        NFTOwner: NFTOwner,
                        NFTId: NFTId,
                        NFTBalance: '1',
                        ContractAddress: collectionAddress,
                    },
                    { NFTBalance: '0' },
                );

                // * update in token DB
                let updatetokens = await nftservice.FindTokenandUpdate(
                    { NFTId: NFTId, collectionAddress: collectionAddress },
                    { NFTOwnerDetails: [savedata?.data?._id] },
                );
                console.log('updatetokens', updatetokens);

                return res
                    .status(200)
                    .json({ data: updatetokens, message: 'updated', success: true, type: '721' });
            }

            return res.status(200).json({ success: true, message: 'no need to update' });
        }

        if (Type === '1155') {
            const checkExistingbalance = await nftservice.FindTokenOwners(
                { NFTOwner: NFTOwner, NFTId: NFTId, ContractAddress: collectionAddress },
                { _id: 0, NFTQuantity: 1, NFTBalance: 1 },
            );

            if (checkExistingbalance) {
                if (Number(checkExistingbalance.NFTBalance) != Number(NFTBalance)) {
                    let Updata = {};
                    if (Number(checkExistingbalance.NFTBalance) < Number(NFTBalance)) {
                        Updata = {
                            NFTBalance: Number(NFTBalance),
                        };
                    } else {
                        Updata = {
                            NFTBalance: Number(NFTBalance),
                        };
                    }
                    const updatedData = await nftservice.FindTokenownerandUpdate(
                        { NFTOwner: NFTOwner, NFTId: NFTId, ContractAddress: collectionAddress },
                        Updata,
                    );
                    return res.status(200).json(updatedData);
                }
            }

            return res
                .status(200)
                .json({ message: 'no need to update', success: true, type: '1155' });
        }

        return res.status(200).json({ success: false });
    } catch (error) {
        console.error('errorinbalancecheck', error);
    }
};

export const findOwners = async (req, res) => {
    try {
        console.log('req?.query?.NFTIdfindOwners', req?.query?.NFTId);
        if (!req?.query?.NFTId) {
            return sendRes(res, 200, false, 'required nftId');
        }
        const List = await nftservice.FindToken({ NFTId: req?.query?.NFTId });
        console.log('req?.query?.NFTIdfindOwners', List);

        if (List) {
            // List.forEach(element => {
            //   element.image_url = element.image_url ? signature_imageURL(element.image_url) : null
            //   element.image_thumb_url = element.image_thumb_url ? signature_imageURL(element.image_thumb_url) : null
            // })
            return sendRes(res, 200, true, 'fetched successfully', List);
        }

        return sendRes(res, 404, false, 'data not found', List);
    } catch (error) {
        catchresponse(res, error);
    }
};

/**
 * A description of the entire function.
 *
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @return {Promise<void>} no return value
 */

export const info = async (req, res) => {
    try {
        const { Contract, Owner, Id, TabName, page, MyAdd, limit } = req.query;
        let SendDta = {},
            Bid = {},
            highBid = {},
            myBid = {};
        SendDta.NFTOwner = Owner;
        SendDta.NFTId = Id;
        SendDta.TokenMatch = {
            NFTId: Id,
            ContractAddress: Contract,
            reported: false,
        };
        SendDta.limit = parseInt(limit) ?? 1;
        SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
        SendDta.sort = { 'tokenowners_list.updatedAt': 1 };
        SendDta.tokenOwnerMatch = {
            $expr: {
                $and: [
                    { $ne: ['$NFTBalance', '0'] },
                    { $eq: ['$HideShow', 'visible'] },
                    { $eq: ['$NFTId', '$$tId'] },
                ],
            },
        };
        SendDta.myowner = {
            $expr: {
                $and: [
                    { $ne: ['$NFTBalance', '0'] },
                    { $eq: ['$NFTOwner', MyAdd] },
                    { $eq: ['$HideShow', 'visible'] },
                    { $eq: ['$NFTId', '$$tId'] },
                ],
            },
        };
        myBid.BidMatch = {
            $expr: {
                $and: [
                    { $eq: ['$NFTId', Id] },
                    { $eq: ['$TokenBidderAddress', MyAdd] },
                    { $eq: ['$ContractAddress', Contract] },
                    { $eq: ['$deleted', 1] },
                    {
                        $or: [
                            { $eq: ['$status', 'pending'] },
                            { $eq: ['$status', 'partiallyComplete'] },
                        ],
                    },
                ],
            },
        };
        myBid.sort = { updatedAt: -1 };
        highBid.BidMatch = {
            $expr: {
                $and: [
                    { $eq: ['$NFTId', Id] },
                    { $eq: ['$ContractAddress', Contract] },
                    { $eq: ['$deleted', 1] },
                    {
                        $or: [
                            { $eq: ['$status', 'pending'] },
                            { $eq: ['$status', 'partiallyComplete'] },
                        ],
                    },
                ],
            },
        };
        highBid.sort = { TokenBidAmt: -1 };

        if (TabName != 'owner') {
            SendDta.tokenOwnerMatch['$expr']['$and'].push({
                $eq: ['$NFTOwner', Owner],
            });
        }
        if (TabName == 'bid') {
            Bid.BidMatch = {
                $expr: {
                    $and: [
                        { $eq: ['$NFTId', Id] },
                        { $eq: ['$ContractAddress', Contract] },
                        { $eq: ['$deleted', 1] },
                        {
                            $or: [
                                { $eq: ['$status', 'pending'] },
                                { $eq: ['$status', 'partiallyComplete'] },
                            ],
                        },
                    ],
                },
            };
            Bid.sort = { TokenBidAmt: -1 };
        }

        // SendDta.Tokens = Tokens; // schmea
        SendDta.TabName = TabName;
        let explore = {
            myaddress: MyAdd,
            match: {
                $expr: {
                    $and: [
                        { $ne: ['$NFTBalance', '0'] },
                        { $eq: ['$NFTOwner', Owner] },
                        { $eq: ['$HideShow', 'visible'] },
                    ],
                },
            },
        };
        var RetData = {};
        RetData.token = await nftservice.TokenInfo(SendDta);
        RetData.Explore = await nftservice.Exploreservice(explore);

        RetData.Bid = TabName == 'bid' ? await nftservice.BidInfo(Bid, SendDta) : [];
        RetData.myBid = await nftservice.BidInfo(myBid, SendDta);
        RetData.highBid = await nftservice.BidInfo(highBid, SendDta);
        RetData.UnlockContent = [];

        RetData.token.forEach((item) => {
            item.image_url = item.image_url ? signature_imageURL(item.image_url) : '';
            item.image_thumb_url = item.image_thumb_url
                ? signature_imageURL(item.image_thumb_url)
                : '';

            item.tokenowners_list.forEach((item) => {
                item.Profile_url = item.Profile ? signature_imageURL(item.Profile) : '';
            });
        });
        RetData.Explore.forEach((item) => {
            item.image_url = item.image_url ? signature_imageURL(item.image_url) : '';
            item.image_thumb_url = item.image_thumb_url
                ? signature_imageURL(item.image_thumb_url)
                : '';

            // item.tokenowners_list.forEach(item => {
            //   item.Profile_url = item.Profile ?  signature_imageURL(item.Profile ) : ""
            // })
        });
        res.status(200).json({
            status: true,
            data: RetData,
            message: 'fetched',
        });
        // sendResponse(res , 200 , true , "fetched" , RetData)
    } catch (error) {
        catchresponse(res, error);
    }
};

export const MyItemTokenlistfunc = async (req, res) => {
    const {
        TabName,
        limit,
        CustomUrl,
        WalletAddress,
        NFTOwner,
        page,
        from,
        cursor,
        filter,
        collectionfrom,
        CollectionSymbol,
        Categoryname,
        Type,
        status,
    } = req.body;

    let SendDta = {};
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.CustomUrl = CustomUrl;
    SendDta.from = from;
    let Follow = {};

    let Categorymatch =
        Categoryname == 'All' ? { $ne: ['$Category', ''] } : { $eq: ['$Category', Categoryname] };
    let Statusmatch =
        status == 'All' ? { $ne: ['$PutOnSaleType', ''] } : { $eq: ['$PutOnSaleType', status] };

    if (TabName == 'owned' || TabName == 'onsale' || TabName == 'created') {
        if (filter == 'LatestDrops') {
            SendDta.sort = { updatedAt: -1 };
        } else if (filter == 'OLD') {
            SendDta.sort = { updatedAt: 1 };
        } else if (filter == 'BHTL') {
            SendDta.sort = { NFTPrice: -1 };
        } else if (filter == 'BLTH') {
            SendDta.sort = { NFTPrice: 1 };
        }

        if (TabName == 'owned') {
            SendDta.fromMatch = {
                $expr: {
                    $and: [
                        { $ne: ['$NFTBalance', '0'] },
                        { $eq: ['$HideShow', 'visible'] },
                        { $eq: ['$NFTOwner', NFTOwner] },
                        Statusmatch,
                    ],
                },
            };
            SendDta.refMatch = {
                $expr: {
                    $and: [
                        { $eq: ['$NFTId', '$$tId'] },
                        { $eq: ['$reported', false] },
                        Categorymatch,
                    ],
                },
            };

            SendDta.refTable = 'tokens';
            // SendDta.fromTable = TokenOwners;
        }

        if (TabName === 'onsale') {
            SendDta.fromMatch = {
                $expr: {
                    $and: [
                        { $ne: ['$NFTBalance', '0'] },
                        // { '$eq':['$Status', 'list' ]},
                        { $eq: ['$HideShow', 'visible'] },
                        { $eq: ['$PutOnSale', 'true'] },
                        { $eq: ['$PutOnSaleType', 'FixedPrice'] },
                        { $eq: ['$NFTOwner', NFTOwner] },
                    ],
                },
            };
            SendDta.refMatch = {
                $expr: {
                    $and: [
                        { $eq: ['$NFTId', '$$tId'] },
                        { $eq: ['$reported', false] },
                        Categorymatch,
                    ],
                },
            };
            // SendDta.sort = { updatedAt: -1 };
            SendDta.refTable = 'tokens';
            // SendDta.fromTable = TokenOwners;
        }

        if (TabName === 'created') {
            SendDta.fromMatch = {
                $expr: {
                    $and: [
                        { $ne: ['$NFTQuantity', '0'] },
                        { $eq: ['$NFTCreator', NFTOwner] },
                        Categorymatch,
                    ],
                },
            };

            SendDta.refMatch = {
                $expr: {
                    $and: [
                        { $eq: ['$NFTId', '$$tId'] },
                        // { $eq: ["$PutOnSaleType", Status] }
                    ],
                },
            };

            SendDta.refTable = 'tokenowners';
            // SendDta.fromTable = Tokens;
        }
    }

    if (TabName == 'usercollection') {
        SendDta.UserCollection = {
            chain: EvmChain.ETHEREUM,
            address: NFTOwner.toString().toLowerCase(),
            limit: Number(limit),
            cursor: cursor,
        };
    }

    if (TabName == 'activity') {
        SendDta.sort = { updatedAt: -1 };
        SendDta.Tokens = ActivitySchema;
        SendDta.TabName = TabName;
        SendDta.TokenMatch = {
            $expr: {
                $or: [{ $eq: ['$From', NFTOwner] }, { $eq: ['$To', NFTOwner] }],
            },
        };
    }

    if (TabName == 'collection') {
        if (collectionfrom == 'createpage') {
            Follow.Follow_Initial_Match = {
                $expr: {
                    $and: [
                        { $eq: ['$CollectionCreator', NFTOwner] },
                        { $eq: ['$CollectionType', Type] },
                    ],
                },
            };
        } else if (collectionfrom == 'myitemscollection') {
            Follow.Follow_Initial_Match = {
                $expr: {
                    $and: [{ $eq: ['$CollectionCreator', WalletAddress] }, Categorymatch],
                },
            };
        } else {
            Follow.Follow_Initial_Match = {
                $expr: {
                    $and: [{ $ne: ['$CollectionCreator', ''] }, Categorymatch],
                },
            };
        }

        Follow.unwind = '$Following';
        Follow.from = 'collection';
        Follow.fromTable = Collection;
    }

    const RetData =
        TabName == 'activity'
            ? await nftservice.ActivityList(SendDta)
            : TabName == 'usercollection'
              ? await UserCollection(SendDta.UserCollection, undefined)
              : TabName == 'collection'
                ? await nftservice.CollectionList(Follow, SendDta)
                : TabName == 'created'
                  ? await nftservice.Created(SendDta)
                  : await nftservice.MyItemList(SendDta);

    res.status(200).json({ status: true, message: 'fetched', data: RetData });
    // sendResponse(res,200,true,"fetched",RetData)
};

export const CreateOrder = async (req, res) => {
    try {
        const {
            click,
            CollectionNetwork,
            CollectionName,
            NFTId,
            NFTName,
            Category,
            NFTDescription,
            NFTOrginalImage,
            NFTThumpImage,
            UnlockContent,
            ContractAddress,
            ContractType,
            NFTRoyalty,
            NFTProperties,
            CompressedFile,
            CompressedThumbFile,
            NFTOrginalImageIpfs,
            NFTThumpImageIpfs,
            MetaData,
            NFTCreator,
            NFTQuantity,
            PutOnSale,
            PutOnSaleType,
            NFTPrice,
            CoinName,
            ClockTime,
            EndClockTime,
            HashValue,
            NFTOwner,
            activity,
            NFTBalance,
            EmailId,
        } = req.body;

        let TokenADd = await TokenOwnerADD(
            {
                CollectionNetwork,
                CollectionName,
                NFTId,
                NFTName,
                Category,
                NFTDescription,
                NFTOrginalImage,
                NFTThumpImage,
                UnlockContent,
                ContractAddress,
                ContractType,
                NFTRoyalty,
                NFTProperties,
                CompressedFile,
                CompressedThumbFile,
                NFTOrginalImageIpfs,
                NFTThumpImageIpfs,
                MetaData,
                NFTCreator,
                NFTQuantity,
                activity,
                from: 'MarketPlace',
            },
            {
                PutOnSale,
                PutOnSaleType,
                NFTPrice,
                CoinName,
                ClockTime,
                EndClockTime,
                HashValue,
                NFTOwner,
                NFTBalance,
            },
        );

        // if (activity == "PutOnSale" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'putonsale', EmailId: EmailId, Subject: 'Listing An NFT', OTP: '', click: click })
        // if (activity == "CancelOrder" && TokenADd.success == "success") var Send_Mail = await Node_Mailer({ Type: 'cancelorder', EmailId: EmailId, Subject: 'Cancel Price An NFT', OTP: '', click: click })
        // if(activity == "Lower" && TokenADd.success == "success") var Send_Mail   =   await Node_Mailer({Type:'lower',EmailId:EmailId,Subject:'Changing Price An NFT',OTP:'',click:click})
        await nftservice.Activity({
            From:
                activity === 'Mint'
                    ? 'NullAddress'
                    : activity === 'TransfersFiat'
                      ? NFTCreator
                      : NFTOwner,
            To: activity === 'Mint' ? NFTCreator : NFTOwner,
            Activity: activity,
            NFTPrice: NFTPrice,
            Type: PutOnSale ? PutOnSaleType : 'Not For Sale',
            CoinName: CoinName,
            NFTQuantity: NFTQuantity,
            NFTBalance: NFTBalance,
            HashValue: HashValue,
            NFTId: NFTId,
            ContractType: ContractType ? ContractType : '721',
            ContractAddress: ContractAddress,
            CollectionNetwork: CollectionNetwork,
            Category: Category,
        });

        sendResponse(res, 200, true, 'success', TokenADd);
    } catch (e) {
        catchresponse(res, e);
    }
};

const BUY_ACCEPT_FUNC = async (item, newOwner) => {
    console.log('🚀 ~ BUY_ACCEPT_FUNC ~ item, newOwner:', item, newOwner);
    try {
        const { NFTId, ContractAddress, ContractType, NFTCreator } = item;
        const {
            NFTPrice,
            HashValue,
            NFTQuantity,
            NewTokenOwner,
            PutOnSale,
            PutOnSaleType,
            NFTOwner,
            activity,
        } = newOwner;
        if (NFTOwner) {
            let List = await nftservice.FindTokenOwners({ NFTOwner: NFTOwner, NFTId: NFTId }, {});
            console.log('🚀 ~ BUY_ACCEPT_FUNC ~ List:', List);
            console.log('ssssss', List);
            if (List) {
                let Quantitys = Number(List.NFTBalance) - Number(NFTQuantity);
                console.log('🚀 ~ BUY_ACCEPT_FUNC ~ Quantitys:', Quantitys);
                let TokenADd = await TokenOwnerADD(
                    { NFTId, ContractAddress, ContractType, NFTCreator },
                    {
                        NFTOwner,
                        PutOnSaleType: Quantitys == 0 ? 'NotForSale' : PutOnSaleType,
                        PutOnSale: Quantitys == 0 ? 'false' : 'true',
                        NFTPrice: Quantitys == 0 ? '' : List.NFTPrice,
                        CoinName: Quantitys == 0 ? '' : List.CoinName,
                        NFTBalance: Quantitys.toString(),
                    },
                );
                console.log('🚀 ~ BUY_ACCEPT_FUNC ~ TokenADd:', TokenADd);
                if (TokenADd) {
                    let Lists = await nftservice.FindTokenOwners({
                        NFTOwner: NewTokenOwner,
                        NFTId: NFTId,
                    });
                    console.log('🚀 ~ BUY_ACCEPT_FUNC ~ Lists:', Lists);
                    let TokenADd1 = await TokenOwnerADD(
                        { NFTId, ContractAddress, ContractType, NFTCreator },
                        {
                            NFTOwner: NewTokenOwner,
                            NFTQuantity: String(List?.NFTQuantity),
                            NFTBalance: Lists?.NFTBalance
                                ? String(Number(Lists?.NFTBalance) + Number(NFTQuantity))
                                : NFTQuantity,
                            HashValue,
                        },
                    );
                    console.log('🚀 ~ BUY_ACCEPT_FUNC ~ TokenADd1:', TokenADd1);
                    return TokenADd1;
                } else return TokenADd;
            }
        } else return List;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const BuyAccept = async (req, res) => {
    try {
        let List = await BUY_ACCEPT_FUNC(req.body.item, req.body.newOwner);
        console.log('🚀 ~ BuyAccept ~ List:', List);

        if (req.body.newOwner.activity === 'Buy' && List.success === 'success') {
            // await Node_Mailer({ Type: 'buy_owner', EmailId: req.body.newOwner.New_EmailId, Subject: 'Buying An NFT', OTP: '', click: req.body.newOwner.click })
            // var Send_Mail   =   await Node_Mailer({Type:'sell_owner',EmailId:req.body.newOwner.Old_EmailId,Subject:'Sold Out',OTP:'',click:req.body.newOwner.click})
        }

        if (List) {
            await nftservice.Activity({
                From: req.body.newOwner.NFTOwner,
                To: req.body.newOwner.NewTokenOwner,
                Activity: req.body.newOwner.activity,
                NFTPrice: req.body.newOwner.TP,
                CoinName: req.body.newOwner.CN,
                NFTQuantity: req.body.newOwner.NFTQuantity,
                HashValue: req.body.newOwner.HashValue,
                NFTId: req.body.item.NFTId,
                CollectionNetwork: req.body.item.CollectionNetwork,
                ContractType: req.body.item.ContractType,
                ContractAddress: req.body.item.ContractAddress,
                Category: req.body.item.Category,
            });

            let tokendetail = await nftservice.FindToken({ NFTId: req?.body?.item?.NFTId });
            let collectionget = await nftservice.FindCollection({
                CollectionSymbol: tokendetail?.CollectionSymbol,
            });
            let volumeupdate = await nftservice.FindCollectionandUpdate(
                { CollectionSymbol: tokendetail?.CollectionSymbol },
                { $set: { volume: Number(collectionget?.volume) + Number(req.body.newOwner.USD) } },
            );
        }

        // fuction to change the recri=uite status in token and empty the nftqeuied in userShip
        await clearRecurtedNfts(req.body.item.NFTId);

        return sendResponse(res, 200, List ? true : false, 'fetched', List);
    } catch (error) {
        console.error(error);
        catchresponse(res, error);
    }
};

export const BidAction = async (req, res) => {
    try {
        const {
            activity,
            EmailId,
            Category,
            TokenBidderAddress,
            CollectionNetwork,
            TokenBidderAddress_Name,
            HashValue,
            TokenBidAmt,
            ContractType,
            ContractAddress,
            NFTId,
            from,
            NFTOwner,
            CoinName,
            click,
        } = req.body;
        const NFTQuantity = Number(req.body.NFTQuantity);

        let FinData = {
            TokenBidderAddress: TokenBidderAddress.toLowerCase(),
            NFTId: NFTId,
            ContractAddress: ContractAddress,
            ContractType: ContractType,
            deleted: 1,
            Pending: { $gt: 0 },
        };

        let List = await nftservice.FindOneBid(FinData);
        if (List) {
            let update = req.body;
            if (from == 'Edit') {
                // update.NFTQuantity = NFTQuantity;
                // update.Pending = NFTQuantity - List.msg.Completed;
                update.NFTQuantity = NFTQuantity + List.Completed;
                update.Pending = NFTQuantity;
                update.status = 'pending';
            } else if (from == 'Cancel') {
                update.Pending = List.Pending - NFTQuantity;
                update.Cancel = List.Cancel + NFTQuantity;
                update.status = 'cancelled';
            } else if (from == 'accept') {
                update.Pending = List.Pending - NFTQuantity;
                update.status = List.Pending == NFTQuantity ? 'completed' : 'pending';
                update.Completed =
                    List.Pending == NFTQuantity ? NFTQuantity : List.Completed + NFTQuantity;
            }

            let Find_data = FinData;
            let Updata_data = update;
            var Finds = await nftservice.FindOneBidandUpdata(Find_data, Updata_data, { new: true });
            if (from == 'accept') {
                var tok = await BUY_ACCEPT_FUNC(req.body.item, req.body.newOwner);
                if (req.body.newOwner.activity == 'Accept' && List) {
                    // var Send_Mail = await Node_Mailer({ Type: 'accept', EmailId: req.body.newOwner.New_EmailId, Subject: 'Buying An NFT', click: req.body.newOwner.click })
                    // var Send_Mail   =   await Node_Mailer({Type:'sell_owner',EmailId:req.body.newOwner.Old_EmailId,Subject:'Sold An Nft',click:req.body.newOwner.click})
                }
                await nftservice.Activity({
                    From: req.body.newOwner.NFTOwner,
                    To: req.body.newOwner.NewTokenOwner,
                    Activity: req.body.newOwner.activity,
                    NFTPrice: req.body.newOwner.TP,
                    CoinName: req.body.newOwner.CN,
                    NFTQuantity: req.body.newOwner.NFTQuantity,
                    HashValue: req.body.newOwner.HashValue,
                    NFTId: req.body.item.NFTId,
                    CollectionNetwork: req.body.item.CollectionNetwork,
                    ContractType: req.body.item.ContractType,
                    ContractAddress: req.body.item.ContractAddress,
                    Category: req.body.newOwner.Category,
                });
                sendResponse(res, 200, true, 'success', tok);
            } else {
                if ((from == 'Edit' || from == 'Cancel') && Finds) {
                    // if(activity == "Edit" ) var Send_Mail   =   await Node_Mailer({Type:'edit_bid',EmailId:EmailId,Subject:'Edit Offer For A NFT',OTP:'',click:click})
                    // if(activity == "Cancel" ) var Send_Mail   =   await Node_Mailer({Type:'cancel_bid',EmailId:EmailId,Subject:'Cancel Offer For A NFT',OTP:'',click:click})

                    await nftservice.Activity({
                        From: NFTOwner,
                        To: TokenBidderAddress,
                        Activity: activity,
                        NFTPrice: TokenBidAmt,
                        CoinName: CoinName,
                        NFTQuantity: NFTQuantity,
                        HashValue: HashValue,
                        NFTId: NFTId,
                        ContractType: ContractType,
                        ContractAddress: ContractAddress,
                        CollectionNetwork: CollectionNetwork,
                        Category: Category,
                    });
                }
                sendResponse(res, 200, true, 'success', Finds);
            }
        } else {
            let datas = req.body;

            datas.Pending = NFTQuantity;

            let List = await nftservice.SaveBid(datas);
            if (List) {
                if (activity == 'Bid') {
                    //  await Node_Mailer({ Type: 'bid', EmailId: EmailId, Subject: 'Make Offer For A NFT', OTP: '', click: click })
                }

                await nftservice.Activity({
                    From: NFTOwner,
                    To: TokenBidderAddress,
                    Activity: activity,
                    NFTPrice: TokenBidAmt,
                    CoinName: CoinName,
                    NFTQuantity: NFTQuantity,
                    HashValue: HashValue,
                    NFTId: NFTId,
                    Category: Category,
                    ContractType: ContractType,
                    ContractAddress: ContractAddress,
                    CollectionNetwork: CollectionNetwork,
                });
            }
            sendResponse(res, 200, true, 'success', List);
        }
    } catch (e) {
        catchresponse(res, e);
    }
};

// old Activity
export const Activity_api = async (req, res) => {
    try {
        let {
            TabName,
            limit,
            CustomUrl,
            WalletAddress,
            NFTOwner,
            page,
            from,
            cursor,
            filter,
            NFTid,
        } = req.query;

        let SendDta = {};
        SendDta.limit = parseInt(limit) ?? 1;
        SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
        SendDta.CustomUrl = CustomUrl;
        SendDta.from = from;

        if (from == 'Activity') {
            SendDta.sort = { updatedAt: -1 };
            // SendDta.Tokens = ActivitySchema;
            SendDta.TabName = TabName;
        }

        if (TabName == 'Activity') {
            SendDta.TokenMatch = {
                $expr: {
                    $ne: ['$Activity', ''],
                },
            };
        }
        if (TabName == 'TokenActivity') {
            SendDta.TokenMatch = {
                $expr: {
                    $eq: ['$NFTId', NFTid],
                },
            };
        }

        if (TabName == 'Sales') {
            SendDta.TokenMatch = {
                $expr: {
                    $eq: ['$Activity', 'Buy'],
                },
            };
        }

        if (TabName == 'Listing') {
            SendDta.TokenMatch = {
                $expr: {
                    $eq: ['$Activity', 'Mint'],
                },
            };

            if (TabName == 'Bids') {
                SendDta.TokenMatch = {
                    $expr: {
                        $eq: ['$Activity', 'Bid'],
                    },
                };
            }
        }
        if (TabName == 'Purchase') {
            SendDta.TokenMatch = {
                $expr: {
                    $eq: ['$Activity', 'Buy'],
                },
            };
        }

        const RetData = await nftservice.ActivityList(SendDta);

        sendResponse(
            res,
            200,
            RetData ? true : false,
            RetData ? 'fetched successfully' : 'no data found ',
            RetData,
        );
    } catch (error) {
        catchresponse(res, error);
    }
};

/*
https://backend-galfi.maticz.in/v1/nft/CollectionByCreator?from=collctiondetails&
TabName=All&CustomUrl=Testpd&limit=12&page=1&collectionaddress=planetcollection721&
filter=recentsold&keywords=&pricerange=false
*/

export const CollectionByCreator = async (req, res) => {
    try {
        const {
            Creator,
            Type,
            tab,
            filter,
            limit,
            page,
            from,
            single,
            symbol,
            Categoryname,
            type,
            category,
        } = req?.body;
        let RetData;
        if (from == 'home') {
            var SendData = {
                match: !tab
                    ? {
                          $expr: {
                              $and: [
                                  // { $eq: ["$CollectionType", Type] },
                                  { $eq: ['$CollectionCreator', Creator] },
                              ],
                          },
                      }
                    : tab == 'All'
                      ? {}
                      : { Category: tab },

                limit: !tab ? Number.MAX_SAFE_INTEGER : 3,
                sort: { 'Tokens.updatedAt': tab == 'old' ? 1 : -1 },
                // DBNAME: Collection,
                tokenMatch: { $expr: { $eq: ['$CollectionSymbol', '$$symbol'] } },
                skip: page * limit - limit, //
                CollLimit: page * limit, //page*limit
                tab: tab,
                filter: filter,
            };
            RetData = await nftservice.HomeCollectionFunc(SendData);
        }
        // just for data old collctiondetails
        if (from === 'collctiondetailonly') {
            var SendDta = {};
            SendDta.from = from;

            SendDta.CollcetionsMatch = {
                $expr: {
                    $and: [{ $eq: ['$CollectionSymbol', symbol] }],
                },
            };
            ((SendDta.limit = parseInt(limit)),
                (SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit));

            // RetData = await CollectionListHome(SendDta);
            RetData = await nftservice.forcollection(SendDta);
        }

        if (from == 'collctiondetails') {
            const result = await nftservice.exploretokenservice(req.body);
            result.forEach((element) => {
                element.image_url = signature_imageURL(element.image_url);
            });
            // return res.status(200).json({
            //     statuscode: 200,
            //     status: true,
            //     message: 'fetched',
            //     data: result,
            // });

            return sendRes(res, 200, true, 'fetched', result);
        }
        if (from == 'collctionpage') {
            let SendDta = {};
            SendDta.from = from;
            SendDta.Categoryname = Categoryname;
            if (filter == 'PLTH') {
                SendDta.pricesort = { $sort: { 'Tokens.floorprice': -1 } };
            }
            if (filter == 'PHTL') {
                SendDta.pricesort = { $sort: { 'Tokens.floorprice': 1 } };
            }
            if (filter == 'recentlycreated') {
                SendDta.statussort = { $sort: { updatedAt: -1 } };
            }
            if (filter == 'oldest') {
                SendDta.statussort = { $sort: { updatedAt: 1 } };
            }
            let cat =
                Categoryname === 'All'
                    ? { $ne: ['$Category', ''] }
                    : { $eq: ['$Category', Categoryname] };
            // SendDta.DBName = collection
            // SendDta.Tokens = Tokens // db

            SendDta.CollcetionsMatch = {
                $expr: {
                    $and: [{ $ne: ['$CollectionSymbol', ''] }, cat],
                },
            };

            ((SendDta.limit = parseInt(limit)),
                (SendDta.skip = ((page ? parseInt(page) : 1) - 1) * parseInt(limit)));

            RetData = await nftservice.forcollection(SendDta);
        }
        if (from == 'create') {
            var SendData = {
                match: !tab
                    ? {
                          $expr: {
                              $and: [
                                  { $eq: ['$CollectionType', Type] },
                                  { $eq: ['$CollectionCreator', Creator] },
                              ],
                          },
                      }
                    : tab == 'All'
                      ? {}
                      : { Category: tab },

                limit: !tab ? Number.MAX_SAFE_INTEGER : 3,
                sort: { 'Tokens.updatedAt': tab == 'old' ? 1 : -1 },
                // DBNAME: Collection,
                tokenMatch: { $expr: { $eq: ['$CollectionSymbol', '$$symbol'] } },
                skip: 0, //
                CollLimit: 8, //
                tab: tab,
                filter: filter,
            };
            RetData = await nftservice.CreateCollectionFunc(SendData);
        }
        if (from == 'collection') {
            const SendData = {
                match: !tab
                    ? {
                          $expr: {
                              $and: [
                                  { $eq: ['$CollectionType', Type] },
                                  { $eq: ['$CollectionCreator', Creator] },
                              ],
                          },
                      }
                    : tab == 'All'
                      ? {}
                      : { Category: tab },
                limit: !tab ? Number.MAX_SAFE_INTEGER : 3,
                sort: { 'Tokens.updatedAt': tab == 'old' ? 1 : -1 },
                DBNAME: Collection,
                tokenMatch: { $expr: { $eq: ['$CollectionSymbol', '$$symbol'] } },
                skip: 0, //
                CollLimit: 8,
                tab: tab,
                filter: filter,
            };
            RetData = await nftservice.CreateCollectionFunc(SendData);
            RetData.forEach((element) => {
                element.image_url = signature_imageURL(element.image_url);
            });
            return res.status(200).json({ status: true, message: 'successfully', data: RetData });
        }

        RetData.forEach((element) => {
            element.image_url = signature_imageURL(element.image_url);
        });
        return res.status(200).json({ status: true, message: 'successfully', data: RetData });
        // sendResponse(res , 200 , true , "fetched successfully" , RetData)
    } catch (error) {
        console.log(error);
        catchresponse(res, error);
    }
};
export const EditCollectionByCreator = async (req, res) => {
    try {
        const {
            CollectionName,
            CollectionSymbol,
            CollectionBio,
            Category,
            CollectionType,
            CollectionNetwork,
            CollectionCreator,
            CollectionContractAddress,
            CollectionProfileImage,
            CollectionCoverImage,
        } = req?.body;
        // if(req?.files)
        // {

        const ref = Date.now();
        let data_already_token = {
            DBName: Collection,
            FinData: { CollectionSymbol: CollectionSymbol },
            SelData: { CollectionSymbol: 1 },
        };
        let data_already_token_list = await MongooseHelper.FindOne(data_already_token);
        if (data_already_token_list.success == 'success') {
            if (req?.files) {
                const { CollectionProfileImage, CollectionCoverImage } = req?.files;

                var profile = CollectionProfileImage
                    ? await ImageAddFunc([
                          {
                              path: `public/collection/profile/${CollectionSymbol}/`,
                              files: CollectionProfileImage,
                              filename: ref + '.' + 'webp',
                          },
                      ])
                    : '';

                var cover = CollectionCoverImage
                    ? await ImageAddFunc([
                          {
                              path: `public/collection/cover/${CollectionSymbol}/`,
                              files: CollectionCoverImage,
                              filename: ref + '.' + 'webp',
                          },
                      ])
                    : '';
            }

            const Data = {
                CollectionName,
                CollectionSymbol,
                CollectionBio,
                CollectionType,
                CollectionNetwork,
                CollectionCreator,
                CollectionProfileImage: profile ? profile : CollectionProfileImage,
                CollectionCoverImage: cover ? cover : CollectionCoverImage,
                CollectionContractAddress,
                Category,
            };
            const update = await nftservice.FindCollectionandUpdate(
                { CollectionSymbol: CollectionSymbol },
                Data,
                { new: true },
            );
            sendResponse(res, 200, update ? true : false, 'collection Updated Successfully');
        } else {
            sendResponse(res, 200, false, 'collection not exits');
        }
    } catch (error) {
        catchresponse(res, error);
    }
};

export const CollectionBySymbol = async (req, res) => {
    try {
        const { CollectionSymbol } = req.query;
        let List = await nftservice.FindCollection(CollectionSymbol);
        sendResponse(res, 200, List ? true : false, 'fetched successfully', List);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const ListCollectionNFT = async (req, res) => {
    let saved = {};
    try {
        const {
            click,
            CollectionNetwork,
            CollectionName,
            NFTId,
            NFTName,
            Category,
            NFTDescription,
            NFTOrginalImage,
            NFTThumpImage,
            UnlockContent,
            CollectionSymbol,
            ContractAddress,
            ContractType,
            NFTRoyalty,
            NFTProperties,
            CompressedFile,
            CompressedThumbFile,
            NFTOrginalImageIpfs,
            NFTThumpImageIpfs,
            MetaData,
            MetFile,
            NFTCreator,
            NFTQuantity,
            PutOnSale,
            PutOnSaleType,
            NFTPrice,
            CoinName,
            ClockTime,
            EndClockTime,
            HashValue,
            NFTOwner,
            activity,
            NFTBalance,
            ownBalance,
        } = req.body;
        let tokenownerid = [];
        let promises = NFTOwner.map(async (val, ind) => {
            const already_token_list = await nftservice.FindTokenOwners(
                {
                    NFTId: NFTId,
                    NFTOwner: val,
                },
                { _id: 0, NFTRoyalty: 1, NFTBalance: 1 },
            );

            if (already_token_list?.NFTBalance) {
                return sendResponse(res, 409, false, 'Token Already Listed');
            } else {
                saved = {
                    CollectionNetwork,
                    CollectionName,
                    MetFile,
                    CollectionSymbol,
                    NFTId,
                    NFTName,
                    Category,
                    NFTDescription,
                    NFTOrginalImage,
                    NFTThumpImage,
                    UnlockContent,
                    ContractAddress,
                    ContractType,
                    NFTRoyalty,
                    NFTProperties,
                    CompressedFile,
                    CompressedThumbFile,
                    NFTOrginalImageIpfs,
                    NFTThumpImageIpfs,
                    MetaData,
                    NFTCreator: NFTOwner[0],
                    NFTQuantity: ownBalance[ind],
                    activity,
                    PutOnSale,
                    PutOnSaleType,
                    NFTPrice,
                    CoinName,
                    ClockTime,
                    EndClockTime,
                    HashValue,
                    NFTOwner: val,
                    NFTBalance: ownBalance[ind],
                    Status: 'list',
                };
                let saveowner = await nftservice.SaveTokenOwners(saved);
                await nftservice.Activity({
                    From:
                        activity === 'Mint' || activity === 'List'
                            ? 'NullAddress'
                            : activity === 'TransfersFiat'
                              ? NFTCreator
                              : NFTOwner,
                    To: activity === 'Mint' ? NFTCreator : val,
                    Activity: activity,
                    NFTPrice: NFTPrice,
                    Type: PutOnSale ? PutOnSaleType : 'Not For Sale',
                    CoinName: CoinName,
                    NFTQuantity: ownBalance[ind],
                    HashValue: HashValue,
                    NFTId: NFTId,
                    ContractType: ContractType,
                    ContractAddress: ContractAddress,
                    CollectionNetwork: CollectionNetwork,
                    Category: Category,
                    CollectionSymbol: CollectionSymbol,
                });
                if (saveowner) {
                    tokenownerid.push(saveowner.data._id);
                }
            }
        });
        Promise.all(promises).then(async () => {
            saved = {
                CollectionNetwork,
                CollectionName,
                MetFile,
                CollectionSymbol,
                NFTId,
                NFTName,
                Category,
                NFTDescription,
                NFTOrginalImage,
                NFTThumpImage,
                UnlockContent,
                ContractAddress,
                ContractType,
                NFTRoyalty,
                NFTProperties,
                CompressedFile,
                CompressedThumbFile,
                NFTOrginalImageIpfs,
                NFTThumpImageIpfs,
                MetaData,
                NFTCreator,
                NFTQuantity,
                activity,
                PutOnSale,
                PutOnSaleType,
                NFTPrice,
                CoinName,
                ClockTime,
                EndClockTime,
                HashValue,
                NFTOwner,
                NFTBalance,
                NFTOwnerDetails: tokenownerid,
                Status: 'list',
            };

            const TokenADd = await SaveToken(saved);
            return sendResponse(res, 200, true, 'fetched', TokenADd);
        });
    } catch (err) {
        catchresponse(res, err);
    }
};

export const Collectionlist = async (req, res) => {
    try {
        const data = await nftservice.collectionget();

        sendResponse(res, 200, true, 'fetched successfully', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const CollectionChangeStatus = async (req, res) => {
    try {
        const id = req.body;
        console.log('collectionfindcollectionfind', req.body);
        const data = await nftservice.collectionstatus(id);

        sendResponse(res, 200, true, 'status changed successfully', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const createfromgameplanet = async (req, res) => {
    try {
        let {
            planetId,
            transactionHash,
            collectionId,
            mintType,
            otherDatas,
            ipfs,
            metaData,
            network,
            from,
            type,
            names,
        } = req.body; // names : added [ ]
        const { userData } = req;
        console.log('mintType', network, transactionHash, mintType, otherDatas);
        //@ contract call for get the recept and nftIds
        const transcation = transactionHash;
        const receipt = await DataOfTranscation(transcation);
        console.log('receipt', receipt);

        if (!receipt.status) {
            return sendRes(res, 500, false, receipt.message);
        }
        let nftId = null;
        const walletAddress = userData.WalletAddress;
        const WalletAddress = userData.WalletAddress;

        const [planetdata, collectiondata, userPlanetData] = await Promise.all([
            gameService.findBYPlanetID(planetId),
            nftservice.findBYCollectionID(collectionId),
            gameService.findOneUserPlanetService({ walletAddress: walletAddress }),
        ]);

        const HEXTONUMBERnft = HEXTONUMBER(
            [receipt?.logs[0]?.topics[3]],
            config.CHAIN_DETAILS[CURRENT_NETWORK].rpc_http,
        );

        nftId = HEXTONUMBERnft[0];
        const NFT = {
            NFTId: nftId,
            NFTName: names[0],
            NFTDescription: planetdata?.planetDescription,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            CollectionSymbol: collectiondata?.CollectionSymbol,
            Collection: collectiondata?.CollectionSymbol,
            tokenPrice: 'unlimited',
            NFTProperties: [],
            tokenOwner: walletAddress,
            NFTCreator: walletAddress,
            NFTQuantity: '1',
            // balance: BalanceOfTotalSupply?.balance,
            ContractAddress: collectiondata?.CollectionContractAddress,
            status: true,
            ContractType: collectiondata?.CollectionType,
            animation_url: '',
            NFTThumpImageIpfs: '',
            NFTOrginalImageIpfs: ipfs,
            image_url: planetdata?.image_url,
            image_thumb_url: '',
            NFTOrginalImage: planetdata?.image_url,
            NFTThumpImage: '',
            CompressedFile: planetdata?.image_url,
            CompressedThumbFile: '',
            MetaData: metaData,
            RandomName: '',
            NonceHash: transcation,
            BuyType: network,
            CollectionNetwork: network,
            Owners: walletAddress,
            nftType: type,
            next: '',
            nftCategory: planetdata?.rarity,
            hexId: planetdata.hexId,
        };

        const NewNFT = await TokenDb.create(NFT);
        const NFTOwner = {
            NFTId: nftId,
            NFTName: planetdata?.planetName,
            NFTOwner: walletAddress,
            tokenowner: walletAddress,
            PutOnSale: false,
            NFTPrice: '',
            CoinName: network,
            // deleted: OwnerCheck ? 1 : 0,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            ContractAddress: collectiondata?.CollectionContractAddress,
            NFTBalance: '1',
            NFTQuantity: '1',
            NFTtype: collectiondata?.CollectionType,
            BuyType: network,
            NonceHash: transcation,
            Platform: 'galfi',
            nftCategory: planetdata?.rarity,
        };

        const TokenOwnersFind = await TokenOwnersDb.findOne({
            tokenID: nftId,
            Category: collectiondata?.Category,
        });
        if (!TokenOwnersFind) {
            // const NewNFTOwner = new TokenOwnersDb(NFTOwner);
            const TokenOwnersave = await TokenOwnersDb.create(NFTOwner);

            await nftservice.Activity({
                From: 'NullAddress',
                To: walletAddress,
                Activity: 'Mint',
                NFTPrice: '',
                Type: 'Not For Sale',
                CoinName: '',
                NFTQuantity: 1,
                NFTBalance: 1,
                HashValue: transcation,
                NFTId: nftId,
                NFTName: planetdata?.name,
                ContractType: collectiondata?.CollectionType,
                ContractAddress: collectiondata?.CollectionContractAddress,
                CollectionNetwork: network,
                Category: collectiondata?.Category,
                SignatureHash: '',
            });
            const CreateuserPlanedata = await gameService.CreateuserPlanet(
                { _id: req.body.userId, walletAddress: walletAddress },
                planetdata,
                NewNFT._id,
            );
            const data = await userdb.findOneAndUpdate(
                { _id: req.body.userId },
                { $push: { planets: CreateuserPlanedata?._id } },
            );

            sendRes(res, 200, true, 'success', data);
        }
    } catch (err) {
        console.error(err);
        sendRes(res, 500, false, err.message, err);
    }
    // sendResponse(res,200,true,"success");
};

export const eventcreatefromgameplanet = async (eventData, nftId, transactionHash) => {
    try {
        let { planetId, collectionAddress, ipfs, metaData, network, type, name, walletAddress } =
            eventData;

        //@ contract call for get the recept and nftIds
        const transcation = transactionHash;
        console.log('eventData', eventData);

        console.log('planetId', eventData.planetId);
        console.log('walletAddress', walletAddress);

        const userData = await userService.FindUserWithWalletAddress(walletAddress);
        console.log('userDatauserData', userData);

        const [planetdata, collectiondata, userPlanetData] = await Promise.all([
            gameService.findBYPlanetID(planetId),
            nftservice.collectionfind({ CollectionContractAddress: collectionAddress }),
            gameService.findOneUserPlanetService({ walletAddress: walletAddress }),
        ]);
        if (isEmpty(planetdata)) return console.error('Planetdata not found for id ', planetId);
        if (isEmpty(collectiondata))
            return console.error('collectiondata not found for id ', collectionAddress);

        console.log('eventcreatefromgameplanet:collectiondata', collectiondata);
        console.log('eventcreatefromgameplanet:planetdata', planetdata);

        const NFT = {
            NFTId: nftId,
            NFTName: name,
            NFTDescription: planetdata?.planetDescription,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            CollectionSymbol: collectiondata?.CollectionSymbol,
            Collection: collectiondata?.CollectionSymbol,
            tokenPrice: 'unlimited',
            NFTProperties: [],
            tokenOwner: walletAddress,
            NFTCreator: walletAddress,
            NFTQuantity: '1',
            // balance: BalanceOfTotalSupply?.balance,
            ContractAddress: collectiondata?.CollectionContractAddress,
            status: true,
            ContractType: collectiondata?.CollectionType,
            animation_url: '',
            NFTThumpImageIpfs: '',
            NFTOrginalImageIpfs: ipfs,
            image_url: planetdata?.image_url,
            image_thumb_url: '',
            NFTOrginalImage: planetdata?.image_url,
            NFTThumpImage: '',
            CompressedFile: planetdata?.image_url,
            CompressedThumbFile: '',
            MetaData: metaData,
            RandomName: '',
            NonceHash: transcation,
            BuyType: network,
            CollectionNetwork: network,
            Owners: walletAddress,
            nftType: type,
            next: '',
            nftCategory: planetdata?.rarity,
            hexId: planetdata?.hexId,
        };

        console.log('BEFORE_CREATE_AT_TOKEN', NFT);
        const NewNFT = await TokenDb.create(NFT);
        console.log('NewNFT', NewNFT._id);
        const NFTOwner = {
            NFTId: nftId,
            NFTName: name,
            NFTOwner: walletAddress,
            tokenowner: walletAddress,
            PutOnSale: false,
            NFTPrice: '',
            CoinName: network,
            // deleted: OwnerCheck ? 1 : 0,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            ContractAddress: collectiondata?.CollectionContractAddress,
            NFTBalance: '1',
            NFTQuantity: '1',
            NFTtype: collectiondata?.CollectionType,
            BuyType: network,
            NonceHash: transcation,
            Platform: 'galfi',
            nftCategory: planetdata?.rarity,
        };

        const TokenOwnersFind = await TokenOwnersDb.findOne({
            tokenID: nftId,
            Category: collectiondata?.Category,
        });
        if (!TokenOwnersFind) {
            const TokenOwnersave = await TokenOwnersDb.create(NFTOwner);

            await nftservice.Activity({
                From: 'NullAddress',
                To: walletAddress,
                Activity: 'Mint',
                NFTPrice: '',
                Type: 'Not For Sale',
                CoinName: '',
                NFTQuantity: 1,
                NFTBalance: 1,
                HashValue: transcation,
                NFTId: nftId,
                NFTName: name,
                ContractType: collectiondata?.CollectionType,
                ContractAddress: collectiondata?.CollectionContractAddress,
                CollectionNetwork: network,
                Category: collectiondata?.Category,
                SignatureHash: '',
            });
            const CreateuserPlanedata = await gameService.CreateuserPlanet(
                { _id: userData._id, walletAddress: walletAddress },
                planetdata,
                NewNFT._id,
                '',
                constant.EXTRA_SLOTS.map((slot) => ({ ...slot })),
            );
            console.log('CreateuserPlanedata', CreateuserPlanedata);

            const requiredNearby =
                config.NEAR_BY_PLANT_COUNT[planetdata.type]?.[planetdata.rarity] || 0;
            console.log('🚀 ~ eventcreatefromgameplanet ~ requiredNearby:', requiredNearby);

            const existingNearby = await nearByPlanetSchema.countDocuments({
                hexId: planetdata.hexId,
            });
            console.log(
                '🚀 ~ eventcreatefromgameplanet ~ existingNearby:',
                existingNearby,
                existingNearby < requiredNearby,
            );

            if (existingNearby < requiredNearby) {
                const missing = requiredNearby - existingNearby;

                const payload = [];
                for (let i = 0; i < missing; i++) {
                    const img = getRandomNumber(1, 200);
                    const localIndex = String(existingNearby + i + 1).padStart(2, '0');

                    payload.push({
                        name: `LP-${String(planetdata.hexId).padStart(3, '0')}-${localIndex}`,
                        description: '',
                        image: `galfi_planet/image/original/near_by_planet/${img}.png`,
                        image_url: `galfi_planet/image/original/near_by_planet/${img}.png`,
                        parentPlanetId: null,
                        acquiredBy: null,
                        hexId: planetdata.hexId,
                        planetResources: getSurveyMissionResource(),
                    });
                }

                const createnearbyPlanet = await nearByPlanetSchema.insertMany(payload);
                console.log(
                    '🚀 ~ eventcreatefromgameplanet ~ createnearbyPlanet:',
                    createnearbyPlanet,
                );
            }

            console.log('CREATED PLANET NFT');

            // const data = await userdb.findOneAndUpdate(
            //     { _id: req.body.userId },
            //     { $push: { planets: CreateuserPlanedata?._id } },
            // );
        }
    } catch (err) {
        console.error('eventcreatefromgameplanet', err);
    }
};

export const createforgameShip = async (req, res) => {
    try {
        const {
            body: { shipId, transactionHash, ipfs, metaData, network, type, name },
            userData,
        } = req;
        console.log('userData', userData);
        const walletAddress = userData.WalletAddress;

        // service from contract common module
        const transcation = transactionHash; // ! renamed

        const receipt = await DataOfTranscation(transcation);
        console.log('createforgameShip : receipt ', receipt);
        if (!receipt.status) {
            return sendRes(res, 400, false, 'failed to mint');
        }
        const HEXTONUMBERnft = HEXTONUMBER(
            [receipt.logs[0].topics[3]],
            config.CHAIN_DETAILS[CURRENT_NETWORK].rpc_http,
        );
        const nftId = HEXTONUMBERnft[0];

        const shipdata = await gameService.findOneShip(shipId);

        const status = await checkforenounghbalance(shipdata.price, userData.WalletAddress);
        if (!status.status) {
            return sendRes(res, 409, false, status.message);
        }
        const collectiondata = await nftservice.findBYCollectionID(shipdata.collection._id);
        const NFT = {
            NFTId: nftId,
            NFTName: name,
            NFTDescription: shipdata?.description,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            CollectionSymbol: collectiondata?.CollectionSymbol,
            Collection: collectiondata?.CollectionSymbol,
            tokenPrice: 'unlimited',
            NFTProperties: [],
            tokenOwner: walletAddress,
            NFTCreator: walletAddress,
            NFTQuantity: '1',
            ContractAddress: collectiondata?.CollectionContractAddress,
            status: true,
            ContractType: collectiondata?.CollectionType,
            animation_url: '',
            NFTThumpImageIpfs: '',
            NFTOrginalImageIpfs: ipfs,
            image_url: shipdata?.image_url,
            image_thumb_url: '',
            NFTOrginalImage: shipdata?.image_url,
            NFTThumpImage: '',
            CompressedFile: '',
            CompressedThumbFile: '',
            MetaData: metaData,
            RandomName: '',
            NonceHash: transcation,
            BuyType: network,
            CollectionNetwork: network,
            Owners: walletAddress,
            next: '',
            nftType: type,
            collectionTypeId: collectiondata.type._id,
            nftCategory: shipdata?.shipType,
        };

        // const NewNFT = new TokenDb(NFT);
        // await NewNFT.save()
        const NewNFT = await TokenDb.create(NFT);

        const NFTOwner = {
            NFTId: nftId,
            NFTName: name,
            NFTOwner: walletAddress,
            tokenowner: walletAddress,
            PutOnSale: false,
            NFTPrice: '',
            CoinName: network,
            // deleted: OwnerCheck ? 1 : 0,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            ContractAddress: collectiondata?.CollectionContractAddress,
            NFTBalance: '1',
            NFTQuantity: '1',
            NFTtype: collectiondata?.CollectionType,
            BuyType: network,
            NonceHash: transcation,
            Platform: 'galfi',
            nftCategory: shipdata?.shipType,
        };

        const TokenOwnersFind = await TokenOwnersDb.findOne({
            tokenID: nftId,
            Category: collectiondata?.Category,
        });
        if (!TokenOwnersFind) {
            const NewNFTOwner = new TokenOwnersDb(NFTOwner);
            const TokenOwnersave = await NewNFTOwner.save();

            await nftservice.Activity({
                From: 'NullAddress',
                To: walletAddress,
                Activity: 'Mint',
                NFTPrice: '',
                Type: 'Not For Sale',
                CoinName: '',
                NFTQuantity: 1,
                NFTBalance: 1,
                HashValue: transcation,
                NFTId: nftId,
                NFTName: name,
                ContractType: collectiondata?.CollectionType,
                ContractAddress: collectiondata?.CollectionContractAddress,
                CollectionNetwork: network,
                Category: collectiondata?.Category,
                SignatureHash: '',
            });

            const CreateuserPlanedata = await gameService.createUserShip(
                { _id: userData._id, walletAddress: userData.WalletAddress },
                shipId,
                NewNFT._id,
            );

            const adminCurrency = await userService.addpriceinadminCurrency_service(shipdata.price);

            const consuption = shipdata.price;

            const tranreward = [];
            const dataforbulk = [];
            for (let i = 0; i < consuption.length; i++) {
                let a = {
                    updateOne: {
                        filter: {
                            $or: [{ label: consuption[i].label }, { name: consuption[i].label }],
                            walletAddress: userData?.WalletAddress,
                        },
                        update: { $inc: { balance: -consuption[i].amount } },
                    },
                };
                let trans = { label: consuption[i].label, amount: consuption[i].amount };
                tranreward.push(trans);
                dataforbulk.push(a);
            }

            let trans = {
                from: userData?.WalletAddress,
                to: config.ADMIN_WALLETADDRRESS,
                price: tranreward,
                userassetId: null,
                action: CONSTANTS.TRANSACTION_TYPE.BUY_SHIP,
            };
            await TranscationService(trans);

            const updateusercurrency = await userService.bulkwriteuserCurrency_service(dataforbulk);

            return sendRes(res, 201, true, 'Ship Buyed', CreateuserPlanedata);
        }
    } catch (err) {
        console.log(err);
        return sendRes(res, 500, false, err.message);
    }
};
export const eventcreateforgameShip = async (eventData, nftId, transactionHash) => {
    try {
        const {
            shipId,
            ipfs,
            metaData,
            network,
            type,
            name,
            walletAddress,
            hexId,
            costType,
            optionalCost,
        } = eventData;

        console.log('eventcreateforgameShip', eventData);
        const userData = await userService.FindUserWithWalletAddress(walletAddress);
        // service from contract common module
        const transcation = transactionHash; // ! renamed

        const shipdata = await gameService.findOneShip(shipId);

        // const status = await checkforenounghbalance(shipdata.price, walletAddress);
        // if (!status) {
        //     return sendRes(res, 409, false, 'not enough balance');
        // }
        const collectiondata = await nftservice.findBYCollectionID(shipdata.collection._id);
        const NFT = {
            NFTId: nftId,
            NFTName: name + ' #' + nftId,
            NFTDescription: shipdata?.description,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            CollectionSymbol: collectiondata?.CollectionSymbol,
            Collection: collectiondata?.CollectionSymbol,
            tokenPrice: 'unlimited',
            NFTProperties: [],
            tokenOwner: walletAddress,
            NFTCreator: walletAddress,
            NFTQuantity: '1',
            ContractAddress: collectiondata?.CollectionContractAddress,
            status: true,
            ContractType: collectiondata?.CollectionType,
            animation_url: '',
            NFTThumpImageIpfs: '',
            NFTOrginalImageIpfs: ipfs,
            image_url: shipdata?.image_url,
            image_thumb_url: '',
            NFTOrginalImage: shipdata?.image_url,
            NFTThumpImage: '',
            CompressedFile: '',
            CompressedThumbFile: '',
            MetaData: metaData,
            RandomName: '',
            NonceHash: transcation,
            BuyType: network,
            CollectionNetwork: network,
            Owners: walletAddress,
            next: '',
            nftType: type,
            collectionTypeId: collectiondata.type._id,
            nftCategory: shipdata?.shipType,
        };

        // const NewNFT = new TokenDb(NFT);
        // await NewNFT.save()
        const NewNFT = await TokenDb.create(NFT);

        const NFTOwner = {
            NFTId: nftId,
            NFTName: name,
            NFTOwner: walletAddress,
            tokenowner: walletAddress,
            PutOnSale: false,
            NFTPrice: '',
            CoinName: network,
            // deleted: OwnerCheck ? 1 : 0,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            ContractAddress: collectiondata?.CollectionContractAddress,
            NFTBalance: '1',
            NFTQuantity: '1',
            NFTtype: collectiondata?.CollectionType,
            BuyType: network,
            NonceHash: transcation,
            Platform: 'galfi',
            nftCategory: shipdata?.shipType,
        };

        const TokenOwnersFind = await TokenOwnersDb.findOne({
            tokenID: nftId,
            Category: collectiondata?.Category,
        });
        if (!TokenOwnersFind) {
            const NewNFTOwner = new TokenOwnersDb(NFTOwner);
            const TokenOwnersave = await NewNFTOwner.save();

            await nftservice.Activity({
                From: 'NullAddress',
                To: walletAddress,
                Activity: 'Mint',
                NFTPrice: '',
                Type: 'Not For Sale',
                CoinName: '',
                NFTQuantity: 1,
                NFTBalance: 1,
                HashValue: transcation,
                NFTId: nftId,
                NFTName: name,
                ContractType: collectiondata?.CollectionType,
                ContractAddress: collectiondata?.CollectionContractAddress,
                CollectionNetwork: network,
                Category: collectiondata?.Category,
                SignatureHash: '',
            });

            const CreateuserPlanedata = await gameService.createUserShip(
                { _id: userData._id, walletAddress: walletAddress },
                shipId,
                NewNFT._id,
                hexId,
            );
        }

        await userService.deductPriceFromuserCurrencyAndUpdateAdminCurrency(
            costType == 'optionalCost' ? optionalCost : shipdata.price,
            walletAddress,
            CONSTANTS.TRANSACTION_TYPE.BUY_SHIP,
        );
        console.log('SHIP CREATED');
    } catch (err) {
        console.error('SHIPCREATEDERROR', err);
    }
};

export const createcrewnft = async (req, res) => {
    try {
        const { crewId, transactionHash, walletAddress, ipfs, metaData, network, type, name } =
            req.body;
        const { userData } = req;
        const transcation = transactionHash;
        // service from contract common module
        const receipt = await DataOfTranscation(transcation);
        console.log('transcationdata', receipt.logs[1]);
        if (!receipt.status) {
            return sendRes(res, 400, false, 'failed to mint');
        }
        const HEXTONUMBERnft = HEXTONUMBER(
            [receipt.logs[0].topics[3]],
            config.CHAIN_DETAILS[CURRENT_NETWORK].rpc_http,
        );
        const nftId = HEXTONUMBERnft[0];
        const crewData = await gameService.FindOne_crewAsset({ _id: crewId });
        console.log('createcrewnft:crewData', crewData);
        const status = await checkforenounghbalance(crewData.price, userData.WalletAddress);
        if (!status.status) {
            return sendRes(res, 400, false, status.message);
        }
        const collectiondata = await nftservice.findBYCollectionID(crewData.collection._id);

        const NFT = {
            NFTId: nftId,
            NFTName: name,
            NFTDescription: crewData?.description,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            CollectionSymbol: collectiondata?.CollectionSymbol,
            Collection: collectiondata?.CollectionSymbol,
            tokenPrice: 'unlimited',
            NFTProperties: [],
            tokenOwner: walletAddress,
            NFTCreator: walletAddress,
            NFTQuantity: '1',
            ContractAddress: collectiondata?.CollectionContractAddress,
            status: true,
            ContractType: collectiondata?.CollectionType ?? '721',
            animation_url: '',
            NFTThumpImageIpfs: '',
            NFTOrginalImageIpfs: ipfs,
            image_url: crewData?.image_url,
            image_thumb_url: '',
            NFTOrginalImage: crewData?.image_url,
            NFTThumpImage: '',
            CompressedFile: '',
            CompressedThumbFile: '',
            MetaData: metaData,
            RandomName: '',
            NonceHash: transcation,
            BuyType: network,
            CollectionNetwork: network,
            Owners: walletAddress,
            next: '',
            nftType: collectiondata.type.type,
            crewType: crewData.crewType,
            crewGender: crewData.gender,
            collectionTypeId: collectiondata.type._id,
            collectionType: collectiondata.type.type, // this is for the nft is crew , planet or ship
            nftCategory: crewData?.rarity,
        };

        const NewNFT = await TokenDb.create(NFT);

        const NFTOwner = {
            NFTId: nftId,
            NFTName: name,
            NFTOwner: walletAddress,
            tokenowner: walletAddress,
            PutOnSale: false,
            NFTPrice: '',
            CoinName: network,
            // deleted: OwnerCheck ? 1 : 0,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            ContractAddress: collectiondata?.CollectionContractAddress,
            NFTBalance: '1',
            NFTQuantity: '1',
            NFTtype: collectiondata?.CollectionType,
            BuyType: network,
            NonceHash: transcation,
            Platform: 'galfi',
            nftCategory: crewData?.profession,
        };

        const TokenOwnersFind = await TokenOwnersDb.findOne({
            tokenID: nftId,
            Category: collectiondata?.Category,
        });
        if (!TokenOwnersFind) {
            const NewNFTOwner = new TokenOwnersDb(NFTOwner);
            const TokenOwnersave = await NewNFTOwner.save();

            await nftservice.Activity({
                From: 'NullAddress',
                To: walletAddress,
                Activity: 'Mint',
                NFTPrice: '',
                Type: 'Not For Sale',
                CoinName: '',
                NFTQuantity: 1,
                NFTBalance: 1,
                HashValue: transcation,
                NFTId: nftId,
                NFTName: name,
                ContractType: collectiondata?.CollectionType ?? '721',
                ContractAddress: collectiondata?.CollectionContractAddress,
                CollectionNetwork: network,
                Category: collectiondata?.Category,
                SignatureHash: '',
            });

            // const CreateuserPlanedata = await createUserShip({_id : userData._id , walletAddress : userData.WalletAddress} , shipId , NewNFT._id   )

            const adminCurrency = await userService.addpriceinadminCurrency_service(crewData.price);

            const consuption = crewData.price;

            const tranreward = [];
            const dataforbulk = [];
            for (let i = 0; i < consuption.length; i++) {
                let a = {
                    updateOne: {
                        filter: {
                            $or: [{ label: consuption[i].label }, { name: consuption[i].label }],
                            walletAddress: userData?.WalletAddress,
                        },
                        update: { $inc: { balance: -consuption[i].amount } },
                    },
                };
                let trans = { label: consuption[i].label, amount: consuption[i].amount };
                tranreward.push(trans);
                dataforbulk.push(a);
            }

            let trans = {
                from: userData?.WalletAddress,
                to: config.adminAddress,
                price: tranreward,
                userassetId: null,
                action: CONSTANTS.TRANSACTION_TYPE.BUY_CREW,
            };
            await TranscationService(trans);

            const updateusercurrency = await userService.bulkwriteuserCurrency_service(dataforbulk);

            return sendRes(res, 201, true, 'crew nft  Buyed', TokenOwnersave);
        }
    } catch (err) {
        sendRes(res, 500, false, err.message, err);
    }
};

export const eventcreatecrewnft = async (eventData, nftId, transactionHash) => {
    try {
        const { crewId, ipfs, metaData, network, type, name, signaturePayload } = eventData;

        const {
            walletAddress,
            message,
            nonce,
            mintType,
            assetId,
            tokenLabel,
            amount,
            collectionContractAddress,
        } = signaturePayload;

        const userData = await userService.FindUserWithWalletAddress(walletAddress);

        const transcation = transactionHash;
        const crewData = await gameService.FindOne_crewAsset({ _id: crewId });
        // const status = await checkforenounghbalance(crewData.price, userData.WalletAddress);
        // if (!status) {
        //     return sendRes(res, 400, false, 'not enough balance');
        // }
        if (mintType === 'offline') {
            // deduct the amount from user wallet
            const price = [
                {
                    label: tokenLabel,
                    amount: decode18Decimal(amount),
                    contractAddress: collectionContractAddress,
                },
            ];
            const updateamount =
                await userService.deductPriceFromuserCurrencyAndUpdateAdminCurrency(
                    price,
                    walletAddress,
                    CONSTANTS.TRANSACTION_TYPE.BUY_CREW,
                );
            //! need roll back
            console.log('deductPriceFromuserCurrencyAndUpdateAdminCurrency', updateamount);
        }

        const collectiondata = await nftservice.findBYCollectionID(crewData.collection._id);

        const NFT = {
            NFTId: nftId,
            NFTName: name,
            NFTDescription: crewData?.description,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            CollectionSymbol: collectiondata?.CollectionSymbol,
            Collection: collectiondata?.CollectionSymbol,
            tokenPrice: 'unlimited',
            NFTProperties: [],
            tokenOwner: walletAddress,
            NFTCreator: walletAddress,
            NFTQuantity: '1',
            ContractAddress: collectiondata?.CollectionContractAddress,
            status: true,
            ContractType: collectiondata?.CollectionType ?? '721',
            animation_url: '',
            NFTThumpImageIpfs: '',
            NFTOrginalImageIpfs: ipfs,
            image_url: crewData?.image_url,
            image_thumb_url: '',
            NFTOrginalImage: crewData?.image_url,
            NFTThumpImage: '',
            CompressedFile: '',
            CompressedThumbFile: '',
            MetaData: metaData,
            RandomName: '',
            NonceHash: transcation,
            BuyType: network,
            CollectionNetwork: network,
            Owners: walletAddress,
            next: '',
            nftType: collectiondata.type.type,
            crewType: crewData.crewType,
            crewGender: crewData.gender,
            collectionTypeId: collectiondata.type._id,
            collectionType: collectiondata.type.type, // this is for the nft is crew , planet or ship
            nftCategory: crewData?.profession,
        };

        const NewNFT = await TokenDb.create(NFT);

        const NFTOwner = {
            NFTId: nftId,
            NFTName: name,
            NFTOwner: walletAddress,
            tokenowner: walletAddress,
            PutOnSale: false,
            NFTPrice: '',
            CoinName: network,
            // deleted: OwnerCheck ? 1 : 0,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            ContractAddress: collectiondata?.CollectionContractAddress,
            NFTBalance: '1',
            NFTQuantity: '1',
            NFTtype: collectiondata?.CollectionType,
            BuyType: network,
            NonceHash: transcation,
            Platform: 'galfi',
            nftCategory: crewData?.profession,
        };

        const TokenOwnersFind = await TokenOwnersDb.findOne({
            tokenID: nftId,
            Category: collectiondata?.Category,
        });
        if (!TokenOwnersFind) {
            const NewNFTOwner = new TokenOwnersDb(NFTOwner);
            const TokenOwnersave = await NewNFTOwner.save();

            await nftservice.Activity({
                From: 'NullAddress',
                To: walletAddress,
                Activity: 'Mint',
                NFTPrice: '',
                Type: 'Not For Sale',
                CoinName: '',
                NFTQuantity: 1,
                NFTBalance: 1,
                HashValue: transcation,
                NFTId: nftId,
                NFTName: name,
                ContractType: collectiondata?.CollectionType ?? '721',
                ContractAddress: collectiondata?.CollectionContractAddress,
                CollectionNetwork: network,
                Category: collectiondata?.Category,
                SignatureHash: '',
                SignatureHash: '',
                SignatureHash: '',
                SignatureHash: '',
                SignatureHash: '',
            });

            // const CreateuserPlanedata = await createUserShip({_id : userData._id , walletAddress : userData.WalletAddress} , shipId , NewNFT._id   )
        }

        await gameService.deActiveCrew(crewId);
        console.log('CREW CREATED');
    } catch (err) {
        console.error('CreateuserPlanedata', err);
    }
};

export const eventcreatecrewnft_v2 = async (
    eventData,
    nftId,
    collectionAddrsess,
    transactionHash,
) => {
    try {
        const { crewId, ipfs, metaData, network, name, signaturePayload, walletAddress } =
            eventData;

        const userData = await userService.FindUserWithWalletAddress(walletAddress);

        const transcation = transactionHash;
        const crewData = await gameService.FindOne_crewAsset({ _id: crewId });
        console.log('crewData', crewData);
        if (isEmpty(crewData)) return console.error('crewData not found for id ', crewId);
        // const status = await checkforenounghbalance(crewData.price, userData.WalletAddress);
        // if (!status) {
        //     return sendRes(res, 400, false, 'not enough balance');
        // }

        const collectiondataIDDA = await nftservice.collectionfind({
            CollectionContractAddress: collectionAddrsess,
        });

        const collectiondata = await nftservice.findBYCollectionID(collectiondataIDDA._id);
        if (isEmpty(collectiondata))
            return console.error('collectiondata not found for id ', collectiondataIDDA._id);

        const NFT = {
            NFTId: nftId,
            NFTName: name,
            NFTDescription: crewData?.description,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            CollectionSymbol: collectiondata?.CollectionSymbol,
            Collection: collectiondata?.CollectionSymbol,
            tokenPrice: 'unlimited',
            NFTProperties: [],
            tokenOwner: walletAddress,
            NFTCreator: walletAddress,
            NFTQuantity: '1',
            ContractAddress: collectiondata?.CollectionContractAddress,
            status: true,
            ContractType: collectiondata?.CollectionType ?? '721',
            animation_url: '',
            NFTThumpImageIpfs: '',
            NFTOrginalImageIpfs: ipfs,
            image_url: crewData?.image_url,
            image_thumb_url: '',
            NFTOrginalImage: crewData?.image_url,
            NFTThumpImage: '',
            CompressedFile: '',
            CompressedThumbFile: '',
            MetaData: metaData,
            RandomName: '',
            NonceHash: transcation,
            BuyType: network,
            CollectionNetwork: network,
            Owners: walletAddress,
            next: '',
            nftType: '721',
            crewType: crewData.crewType,
            crewGender: crewData.gender,
            collectionTypeId: collectiondata.type._id,
            collectionType: collectiondata.type.type, // this is for the nft is crew , planet or ship
            nftCategory: crewData?.rarity,
            level: 1,
        };

        const NewNFT = await TokenDb.create(NFT);

        const NFTOwner = {
            NFTId: nftId,
            NFTName: name,
            NFTOwner: walletAddress,
            tokenowner: walletAddress,
            PutOnSale: false,
            NFTPrice: '',
            CoinName: network,
            // deleted: OwnerCheck ? 1 : 0,
            Category: collectiondata?.Category,
            CollectionName: collectiondata?.CollectionSymbol,
            ContractAddress: collectiondata?.CollectionContractAddress,
            NFTBalance: '1',
            NFTQuantity: '1',
            NFTtype: collectiondata?.CollectionType,
            BuyType: network,
            NonceHash: transcation,
            Platform: 'galfi',
            nftCategory: crewData?.profession,
        };

        const TokenOwnersFind = await TokenOwnersDb.findOne({
            tokenID: nftId,
            Category: collectiondata?.Category,
        });
        if (!TokenOwnersFind) {
            const NewNFTOwner = new TokenOwnersDb(NFTOwner);
            const TokenOwnersave = await NewNFTOwner.save();

            await nftservice.Activity({
                From: 'NullAddress',
                To: walletAddress,
                Activity: 'Mint',
                NFTPrice: '',
                Type: 'Not For Sale',
                CoinName: '',
                NFTQuantity: 1,
                NFTBalance: 1,
                HashValue: transcation,
                NFTId: nftId,
                NFTName: name,
                ContractType: collectiondata?.CollectionType ?? '721',
                ContractAddress: collectiondata?.CollectionContractAddress,
                CollectionNetwork: network,
                Category: collectiondata?.Category,
                SignatureHash: '',
            });

            // const CreateuserPlanedata = await createUserShip({_id : userData._id , walletAddress : userData.WalletAddress} , shipId , NewNFT._id   )
        }

        await gameService.deActiveCrew(crewId);
        console.log('CREW CREATED');
    } catch (err) {
        console.error('CreateuserPlanedata', err);
    }
};
/**
 * Retrieves the game items owned by a specific wallet address.
 *
 * @param {Object} req - The request object containing the following properties:
 *   - {number} limit - The maximum number of items to retrieve.
 *   - {string} CustomUrl - The custom URL for the items.
 *   - {string} walletAddress - The wallet address of the owner.
 *   - {number} page - The page number of the items to retrieve.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - If an error occurs during the retrieval process.
 */
export const Mycrewnft = async (req, res) => {
    try {
        const {
            limit,
            page,
            Categoryname, // all , crew , catname ,
            type,
        } = req.body;
        const { userData } = req;
        // let  element = {}
        let colType = {};
        let collectionaddressarray = [];
        if (type != 'all') {
            colType = await collectiontypeFindOne({ type: type });
            // element  = await nftservice.findCollections({type : colType._id})
            // element.forEach(item => collectionaddressarray.push(item.CollectionContractAddress))
        }
        console.log('colType', 'colType', colType, 'elementelement');

        let NFTOwner = userData?.WalletAddress;
        let walletAddress = userData?.WalletAddress;
        let CustomUrl = userData?.CustomUrl;
        // for future
        // let Categoryname =  "All"
        let status = 'All';
        const otherthat = ['galficrew', 'galfiplanet', 'planetcollection721'];

        let Categorymatch =
            type === 'all'
                ? { $ne: ['$collectionTypeId', ''] }
                : { $eq: ['$collectionTypeId', colType._id] };
        console.log('diasgdugasuigda', Categorymatch);
        // let Categorymatch = type == "all" ? { $ne: ["$collectionTypeId", ""] } : { "collectionTypeId" :   {$in : collectionaddressarray } } ;
        // let Categorymatch = Categoryname == "all" ? { $ne: ["$Category", ""] } : Categoryname == "crew" ? { $eq: ["$nftType", Categoryname] } : { $eq: ["$Category", Categoryname] };
        //     let Categoryname =  "All"
        //     let status = "All"
        //     const otherthat = ["galficrew", "galfiplanet" , "planetcollection721"]
        //     let Categorymatch = Categoryname == "All" ? { "Category" :   {$nin : otherthat  } } : { $eq: ["$Category", Categoryname] };

        let Statusmatch =
            status == 'All' ? { $ne: ['$PutOnSaleType', ''] } : { $eq: ['$PutOnSaleType', status] };
        //  const existcontract = {  "$ContractAddress" :  {$nin : con }}

        let SendDta = {};
        SendDta.sort = { updatedAt: -1 };

        SendDta.limit = parseInt(limit) ?? 1;
        SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
        SendDta.CustomUrl = CustomUrl;
        SendDta.fromMatch = {
            $expr: {
                $and: [
                    { $ne: ['$NFTBalance', '0'] },
                    { $eq: ['$HideShow', 'visible'] },
                    { $eq: ['$NFTOwner', NFTOwner] },
                    Statusmatch,
                ],
            },
        };
        SendDta.refTable = 'tokens';
        SendDta.refMatch = {
            $expr: {
                $and: [{ $eq: ['$NFTId', '$$tId'] }, { $eq: ['$reported', false] }, Categorymatch],
            },
        };

        const quer = await nftservice.game_MyItems(SendDta);

        quer.forEach((item) => {
            item.image_url = signature_imageURL(item.image_url);
            item.image_thumb_url = item.image_thumb_url
                ? signature_imageURL(item.image_thumb_url)
                : '';
            item.tokencreator_list.profile_url = item.tokencreator_list.profile_url
                ? signature_imageURL(item.tokencreator_list.profile_url)
                : '';
            item.tokenowners_list.image_url = item.tokenowners_list.image_url
                ? signature_imageURL(item.tokenowners_list.image_url)
                : '';
            item.tokenowners_list.image_thumb_url = item.tokenowners_list.image_thumb_url
                ? signature_imageURL(item.tokenowners_list.image_thumb_url)
                : '';
            item.CreatorDetails.Profile = item.CreatorDetails.Profile
                ? signature_imageURL(item.CreatorDetails.Profile)
                : '';
        });

        sendRes(res, 200, true, 'success', quer);
    } catch (err) {
        console.log(err);
        return sendRes(res, 500, false, err.message);
    }
};

export const gamestorenft = async (req, res) => {
    try {
        const { collectionSymbol, collectionType, page, limit } = req.body;
        let Type;
        let data;

        // admin cms module

        Type = await collectiontypeFindOne({ type: collectionType });

        data = {
            collectionTypeID: Type ? Type._id : Type,
            collectionType: collectionType,
            collectionSymbol: collectionSymbol ? collectionSymbol : '',
            skip: page ? (page - 1) * 10 : 0,
            limit: limit ? limit : 10,
        };
        // ! service from game module
        const lazy = await gameService.find_crewAsset(
            page ? (page - 1) * 10 : 0,
            limit ? limit : 10,
        );
        lazy.forEach((item) => {
            item.image_url = signature_imageURL(item.image);
        });
        const result = await nftservice.gameStore_Service(data);
        result.forEach((item) => {
            console.log(item);
            // if(item?.nftCreatorDetails[0].profile_url){
            //   item.nftCreatorDetails[0].profile_url=  signature_imageURL(item.nftCreatorDetails[0].Profile)
            // }
            if (item?.nftownerDetails[0].Profile) {
                item.nftownerDetails[0].profile_url = signature_imageURL(
                    item.nftownerDetails[0].Profile,
                );
            }

            if (item.tokenDetails[0].image_url) {
                item.tokenDetails[0].image_url = signature_imageURL(item.tokenDetails[0].image_url);
            }
            if (item.tokenDetails[0].image_thumb_url) {
                item.tokenDetails[0].image_thumb_url = signature_imageURL(
                    item.tokenDetails[0].image_thumb_url,
                );
            }
        });

        const response = {
            result: result,
            lazyGalfiCrew: lazy,
        };

        return sendRes(res, 200, true, 'fetched', response);
    } catch (err) {
        console.log(err);
        return sendRes(res, 500, false, err.message);
    }
};

export const gamecollections = async (req, res) => {
    try {
        const { type } = req.body;
        const colType = await collectiontypeFindOne({ type: type });
        const element = await nftservice.findCollections({ type: colType._id });

        element.forEach((result) => {
            result.image_url = result?.image_url
                ? signature_imageURL(result.image_url)
                : (result.banner_url = result?.banner_url
                      ? signature_imageURL(result.banner_url)
                      : '');
            result.type.image_url = result?.type?.image_url
                ? signature_imageURL(result.type.image_url)
                : '';
        });

        sendRes(res, 200, true, `fetched ${type} collections`, element);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

const clearRecurtedNfts = async (nftID) => {
    const tokedetails = await nftservice.FindTokenandUpdate(
        { nftId: nftID },
        { isRecruite: true, missionAvailability: true },
    );
    if (tokedetails?._id) {
        const data = await gameService.UserShipFindOne({ nftId: tokedetails?._id });

        if (data.nfts.length === 0) {
            return true;
        }
        const bulkwiteintokendb = [];
        for (let i = 0; i < data.nfts.length; i++) {
            const element = data.nfts[i];
            updateBuikwrite.push({
                updateOne: {
                    filter: { _id: element.nftId },
                    update: { isRecruite: true }, // back to original form
                },
            });
        }

        await nftservice.tokenBulkWriteService(bulkwiteintokendb);
        await gameService.UserShipFindOneAndUpdate(
            { nftId: tokedetails?._id },
            { nfts: [], isAvailableForMission: true },
        );
    }
};

export const SettingCrewMetaData = async (data) => {
    const { crewData, walletAddress, userData, network, type } = data;
    const collectiondata = await nftservice.findBYCollectionID(crewData.collection._id);
    const URL = GetOriginalImage(crewData?.image);
    const NFTIpfs = await uploadAndGenerateUrl({ item: 'img', path: URL });

    const JSOnpat = 'ipfs/' + walletAddress;
    const newName = await nftservice.getNextName(crewData?.name);
    const payload = {
        name: newName,
        description: crewData?.description,
        image: config.IPFS_IMG + NFTIpfs,
        attributes: crewData.NFTProperties ? crewData.NFTProperties : [],
        xp: 0,
    };
    const key = formatTheUrlPath(`${JSOnpat}/${Date.now()}.txt`);
    const senddata = JSON.stringify(payload);
    const savedins = await uploadImageToS3(key, senddata, 'text/plain');
    let MetaData = '';

    if (savedins.status) {
        MetaData = await ipfs_add_for_meta(savedins.key);
    }
    // return MetaData

    return {
        ipfs: config.IPFS_IMG + NFTIpfs,
        metadata: MetaData,
        collection: collectiondata.CollectionContractAddress,
        name: newName,
    };
};

export const SettingShipMetaData = async (data) => {
    const { shipId, walletAddress, network, userData, type } = data;
    const shipdata = await gameService.findOneShip(shipId);
    const URL = GetOriginalImage(shipdata?.image);
    const NFTIpfs = await uploadAndGenerateUrl({ item: 'img', path: URL });
    if (!NFTIpfs) {
        return sendRes(res, 400, false, 'Uploaded Failed', {});
    }

    const newName = await nftservice.getNextName(shipdata?.shipName);

    const payload = {
        name: newName,
        description: shipdata?.description,
        image: config.IPFS_IMG + NFTIpfs,
        attributes: [],
    };

    const key = generateMetaStoreFilePath(walletAddress);
    const senddata = JSON.stringify(payload);
    const savedins = await uploadOrUpdateIpfsMetaToS3(key, senddata, 'text/plain');

    return {
        ipfs: config.IPFS_IMG + savedins.key,
        metadata: savedins.key,
        collection: shipdata.collection.CollectionContractAddress,
        name: newName,
    };
};

export const gamecrewnft = async (req, res) => {
    try {
        const {
            body: { walletAddress, collectionAddress, tab, page, crewType, limit },
        } = req;
        if (tab === 'nonmint') {
            const find = {
                collection: collectionAddress.length ? { $in: collectionAddress } : { $ne: '' },
                crewType: crewType.length ? { $in: crewType } : { $ne: '' },
            };
            const pageno = (page - 1) * limit;

            const data = await gameService.crew_MarketPlace_service(find, pageno, limit);
            data.forEach((element) => {
                element.image_url = signature_imageURL(element.image);
            });

            sendRes(res, 200, 'nonmint', data);
        }

        if (tab === 'owned') {
        }

        sendRes(res, 200, 'success', 'success');
    } catch (e) {
        sendRes(res, 500, 'please try again later', e.message);
    }
};

/*
1. get the user planet nfts Ids
2. get the planet nft objectId
3. get the assent of the planet object ID (make id as array of object ID )
4. get the builds with the object IDs [find unsing In [] ]
5.
*/
export const CreateMetadataForUserCollection = async (req, res) => {
    console.log('STARTE');
    try {
        const datax = {
            body: {
                walletAddress: '0x42b2ac5742adfa21840803c091817b3e265b38a6',
                collectionAddress: ['0xc008e38663044bcd63f823bc0dbf609ff9ff3c79'],
                collectionSymbol: 'GALFIPLANET'.toLowerCase(),
            },
        };

        const {
            body: { collectionAddress, walletAddress, collectionSymbol },
        } = datax;

        console.log('daigduag');
        const query = [
            {
                $match: {
                    NFTOwner: walletAddress,
                    NFTBalance: { $ne: '0' },
                    ContractAddress: { $in: collectionAddress },
                },
            },
            {
                $project: {
                    NFTOwner: 1,
                    ContractAddress: 1,
                    NFTBalance: 1,
                    NFTId: 1,
                    NFTQuantity: 1,
                    tokenowner: 1,
                },
            },
            {
                $lookup: {
                    from: 'tokens',
                    localField: 'NFTId',
                    foreignField: 'NFTId',
                    as: 'tokenData',
                },
            },
            {
                $project: {
                    'tokenData._id': 1,
                    'tokenData.NFTId': 1,
                    'tokenData.collectionAddress': 1,
                    'tokenData.NFTProperties': 1,
                    'tokenData.NFTCreator': 1,
                    'tokenData.ContractAddress': 1,
                    'tokenData.crewGender': 1,
                    'tokenData.nftType': 1,
                    'tokenData.NFTName': 1,
                    'tokenData.NFTOrginalImageIpfs': 1,
                    'tokenData.NFTDescription': 1,
                },
            },
        ];

        if (
            collectionSymbol.toLowerCase() === config.GALFIPLANET?.toLowerCase() ||
            collectionSymbol.toLowerCase() === config.GALFIASTEROID?.toLowerCase()
        ) {
            console.log('reqqq', req);

            const nftDatas = await nftservice.TokenOwnerAggregate_service(query);
            const nftSchemaIds = [];

            for (let i = 0; i < nftDatas.length; i++) {
                console.log(nftDatas[i].tokenData);
                let id = nftDatas[i].tokenData[0]._id?.toString();
                console.log('dasdhaida', id);
                nftSchemaIds.push(id);
            }
            const userPlanetData = await gameService.getUserPlanetsService({
                nftId: { $in: nftSchemaIds },
            });
            console.log('userPlanetDatauserPlanetData', userPlanetData);
            const userPlanetIDs = [];
            const tokenIds = [];

            for (let i = 0; i < userPlanetData.length; i++) {
                let id = userPlanetData[i]._id.toString();
                let nftId = userPlanetData[i].nftId;
                userPlanetIDs.push(id);
                tokenIds.push(nftId);
            }

            const buildings = await gameService.userasset_list_service_projection({
                userPlanetId: { $in: userPlanetIDs },
            });

            let buildHashMap = new Map();

            for (let i = 0; i < buildings.length; i++) {
                console.log(buildings[i]);
                let userPlanetID = buildings[i].userPlanetId.toString();
                let asset_Name = buildings[i].assetId.asset_Name;
                let asset_level = buildings[i].levelId.level;
                const prop = {
                    trait_type: asset_Name,
                    value: asset_level,
                };

                if (buildHashMap.has(userPlanetID)) {
                    const mapvalues = buildHashMap.get(userPlanetID);
                    buildHashMap.set(userPlanetID, [...mapvalues, prop]);
                } else {
                    buildHashMap.set(userPlanetID, [prop]);
                }
            }

            const tokensData = await nftservice.FindTokens({ _id: { $in: tokenIds } });

            // loop the data match the _id with planetNftId
            const propData = [];
            for (let i = 0; i < tokensData.length; i++) {
                const tokenId = tokensData[i]._id.toString();
                const NftId = tokensData[i].nftId;

                // these are planets and Astroid Data
                for (let j = 0; j < userPlanetData.length; j++) {
                    let id = userPlanetData[j]._id.toString();
                    let nftId = userPlanetData[j].nftId._id.toString();
                    console.log(tokenId, nftId);

                    if (tokenId === nftId) {
                        const payload = {
                            nftId: userPlanetData[j].nftId.NFTId,
                            name: tokensData[i].NFTName,
                            image: tokensData[i].NFTOrginalImageIpfs,
                            attributes: buildHashMap.get(id) ?? [],
                            description: tokensData[i].NFTDescription,
                        };
                        propData.push(payload);
                    }
                }
            }

            console.log('buildHashMapbuildHashMap', Array.from(buildHashMap));

            // console.log(JSON.stringify(propData))
            // const add = await uploadTxtToPinata(propData)
            const add = await uploadTxtToPinataParally(propData);

            res.send({ status: true, data: add });
        }

        if (collectionSymbol.toLowerCase() === config.GALFICREW?.toLowerCase()) {
            const nftDatas = await nftservice.TokenOwnerAggregate_service(query);
            console.log(nftDatas);
            const payload = [];

            for (let i = 0; i < nftDatas.length; i++) {
                let nft = nftDatas[i].tokenData[0];

                console.log('doadiasida', nft);
                payload.push({
                    nftId: nft.NFTId,
                    name: nft.NFTName,
                    image: nft.NFTOrginalImageIpfs,
                    attributes: [
                        {
                            trait_type: 'totalXP',
                            value: nft?.totalXP,
                        },
                        {
                            trait_type: 'gender',
                            value: nft?.crewGender,
                        },
                        {
                            trait_type: 'crewType',
                            value: nft?.crewType,
                        },
                    ],
                    description: nft.NFTDescription,
                });
                // nftSchemaIds.push(id)
            }

            const add = await uploadTxtToPinataParally(payload);

            console.log('payload', add);

            sendResponse(res, 200, true, 'fetched', add);
        }
    } catch (e) {
        console.error(e);
        res.send({ error: e, status: false });
    }
};

/* {
_id_nft : ""
nftId : ""
planetId : ""
buildingDetails : []
} */

// console.log("tokensData", tokensData)
// proper : [ // new ]

// name :
// properties :
// image 0

/*
this api is for get game info of the NFT
*/
export const nftAssetInfo = async (req, res) => {
    const {
        body: { tokenId },
    } = req;
    try {
        const tokenData = await nftservice.findOneToken({ _id: tokenId });
        if (!tokenData)
            return sendRes(res, 404, false, 'tokenId not found', { tokenId: 'tokenId not found' });

        if (tokenData.CollectionSymbol.toLowerCase().includes('crew')) {
            return sendRes(res, 200, true, {
                type: 'crew',
                token: tokenData,
            });
        }
        console.log(tokenData);

        const userPlanetData = await gameService.findOneUserPlanetService({ nftId: tokenId });
        console.log('userPlanetData', userPlanetData);
        if (userPlanetData) {
            const assetList = await getAssetByPlanetId(userPlanetData._id);

            return sendRes(res, 200, true, {
                type: 'planet or astroid',
                token: tokenData,
                data: assetList,
            });
        }

        const userShipData = await gameService.findOneUserShip({ nftId: tokenId });

        if (userShipData) {
            return sendRes(res, 200, true, { type: 'ship', token: tokenData, data: userShipData });
        }
        return sendRes(res, 200, true, {
            type: 'none',
            token: tokenData,
            data: [],
        });
    } catch (e) {
        catchresponse(res, e);
    }
};

export const UpdateMetadataForUserCollection = async (req, res) => {
    try {
        const {
            body: { data, type },
            userData,
        } = req;

        if (data.length === 0) {
            return sendRes(res, 400, false, 'failed to update', { error: 'no data to update' });
        }
        const bulkwriteQuery = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i]?.nftId) {
                bulkwriteQuery.push({
                    updateOne: {
                        filter: {
                            NFTId: data[i]?.nftId,
                        },
                        update: {
                            $set: { MetaData: data[i].metaData, NFTProperties: data[i].attributes },
                        },
                    },
                });
            }
        }

        const updated = await nftservice.tokenBulkWriteService(bulkwriteQuery);

        let date = new Date();
        if (type === config.COLLECTION_CONTRACT_DETAILS.crew.type) {
            await userService.FindUserandUpdate({ _id: userData._id }, { crewSync: date });
        }

        if (type === config.COLLECTION_CONTRACT_DETAILS.planet.type) {
            await userService.FindUserandUpdate({ _id: userData._id }, { planetSync: date });
        }

        if (type === 'astroid' || type === config.COLLECTION_CONTRACT_DETAILS.astroid.type) {
            await userService.FindUserandUpdate({ _id: userData._id }, { astroidSync: date });
        }

        if (type === 'specialcrew') {
            await userService.FindUserandUpdate({ _id: userData._id }, { specialCrewSync: date });
        }

        if (type === config.COLLECTION_CONTRACT_DETAILS.ship.type) {
            await userService.FindUserandUpdate({ _id: userData._id }, { shipSync: date });
        }

        return sendRes(res, 200, true, 'meta updated succesfully', updated);
    } catch (e) {
        catchresponse(res, e);
    }
};

export const eventWithdrawalDetails = async (data) => {
    try {
        let currencyData = await exchangeService.currencyFindOne({
            address: { $regex: `^${data.tokenAddress}$`, $options: 'i' },
        });
        console.log('currencyData', currencyData, data, data.receiverAddress);
        const transcationEntrydata = {
            walletAddress: data.receiverAddress,
            from: config.CHAIN_DETAILS[CURRENT_NETWORK].reward,
            to: data.receiverAddress,
            action: constant.WITHDRAW,
            tokenName: currencyData.label,
            token: data.amount,
            hash: data.transactionHash,
        };
        const [created, updatedata] = await Promise.all([
            exchangeService.saveTrancationService(transcationEntrydata),
            userService.updateuserbalance(
                {
                    walletAddress: { $regex: `^${data.receiverAddress}$`, $options: 'i' },
                    label: currencyData.label,
                },
                { $inc: { balance: -data.amount / 10 ** 18 } },
            ),
            exchangeService.updateCurrency(
                { label: currencyData.label },
                { $inc: { circulateCurrency: -data.amount / 10 ** 18 } },
            ),
        ]);
        return true;
    } catch (e) {
        console.error('getWithdrawalDetails', e);
    }
};
