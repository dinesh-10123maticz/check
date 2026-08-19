import { Router } from 'express';
import * as nftCtrl from './nft.controlller';
import * as nftValidator from './nft.validation';

import { DecryptDatas, verifyToken } from '../../shared/credentialsetup';
import { verifyJWT_Token } from '../user/user.validations';
import { decryptGameRequest } from '../../shared/commonFunction';
const nftrouters = Router();

nftrouters.route('/validatetokenname').post(verifyToken, nftCtrl.validateNFTName);
nftrouters.route('/createnft').post(nftCtrl.createNewNFT);

nftrouters.route('/Tokenlistfunexplore').get(nftCtrl.Explore);
nftrouters.route('/Tokenlistfuncollection').get(nftCtrl.ExploreCollection);
nftrouters.route('/Tokenlistfunacution').get(nftCtrl.exploreauction);
nftrouters.route('/SearchAction').get(nftCtrl.SearchAction);
nftrouters.route('/findupdatebalance').post(DecryptDatas, nftCtrl.Findupdatebalance);
nftrouters.route('/findOwners').get(nftCtrl.findOwners);
// add bid
nftrouters.route('/info').get(nftCtrl.info);
nftrouters.route('/myitemlist').post(nftCtrl.MyItemTokenlistfunc);
nftrouters.route('/CreateOrder').post(DecryptDatas, nftCtrl.CreateOrder);
nftrouters.route('/BuyAccept').post(DecryptDatas, verifyToken, nftCtrl.BuyAccept);
// BidAction
nftrouters.route('/BidAction').post(DecryptDatas, verifyToken, nftCtrl.BidAction);
nftrouters.route('/CreateCollection').post(nftCtrl.CreateCollection);
// nftrouters.route('/CollectionByCreator').get(nftCtrl.CollectionByCreator)
nftrouters.route('/CollectionByCreator').post(nftCtrl.CollectionByCreator);
// nftrouters.route('/explore').get(nftCtrl.ExploreCollectionPage)
// bid
nftrouters.route('/activity').get(DecryptDatas, nftCtrl.Activity_api);
// -- > collections
nftrouters.route('/Collectionlist').get(nftCtrl.Collectionlist);
nftrouters.route('/CollectionBySymbol').get(nftCtrl.CollectionBySymbol);
nftrouters.route('/Collectionstatus').put(DecryptDatas, nftCtrl.CollectionChangeStatus);
nftrouters.route('/editcollectionbycreator').post(DecryptDatas, nftCtrl.EditCollectionByCreator);
nftrouters.route('/listcollectionnft').post(nftCtrl.ListCollectionNFT);
nftrouters.post('/nft_asset_info', nftValidator.nftAssetInfo, nftCtrl.nftAssetInfo);
//api for  game
//for airdrop
//! need to migrate to event
nftrouters.route('/createplanetnft').post(verifyJWT_Token, nftCtrl.createfromgameplanet);
nftrouters.route('/createshipnft').post(verifyJWT_Token, nftCtrl.createforgameShip);
nftrouters.route('/createcrewnft').post(verifyJWT_Token, nftCtrl.createcrewnft);

nftrouters.route('/gamestorenft').post(verifyJWT_Token, nftCtrl.gamestorenft);

// nftrouters.route('/mycrewnft').post( verifyJWT_Token, nftCtrl.Mycrewnft);
nftrouters.route('/ownednfts').post(verifyJWT_Token, nftCtrl.Mycrewnft);
// to get the collection list based on the type
nftrouters.route('/gamecollections').post(nftCtrl.gamecollections);

// game MarketPlace
nftrouters.route('/gamecrewnft').post(nftCtrl.gamecrewnft);

nftrouters.route('/sync').post(nftCtrl.CreateMetadataForUserCollection);
nftrouters.route('/sync').put(nftCtrl.UpdateMetadataForUserCollection);

nftrouters
    .route('/contract/sign')
    .post(decryptGameRequest, nftValidator.signValidation, nftCtrl.Createsignature);

nftrouters
    .route('/contract/sign_v2')
    .post(decryptGameRequest, nftValidator.signValidation, nftCtrl.Createsignature_V2);

export default nftrouters;
