import { Router } from 'express';
import * as Ctrl from './controller/game.controller';
import * as gamevalidation from './game.validation';
import * as buildCtl from './controller/building.controller';
import * as crew from './controller/crew.controller';
import { verifyJWT_Token } from '../user/user.validations';
import * as Training from './controller/training.controller';
import { Authendicateadmin } from '../admin/adminlogin/admin.service';
import { restrictProduction } from '../../shared/commonFunction';
const Pack = require('./controller/pack.controller');

const gamerouters = Router();

// common image upload you can use this for any image upload and get the url
gamerouters.post('/uploadimage', Ctrl.gameAsset_Imageupload);
// -- > IPFS < --
gamerouters.post('/initipfs', verifyJWT_Token, gamevalidation.initipfs_validation, Ctrl.initipfs);

gamerouters.get('/ipfs/planetAsteroidType', verifyJWT_Token, Ctrl.getPlanetAsteroidAssets);

gamerouters.post(
    '/ipfs/planet',
    verifyJWT_Token,
    gamevalidation.initipfs_validationV2,
    Ctrl.ipfsForPlanet,
);
gamerouters.post(
    '/ipfs/asteroid',
    verifyJWT_Token,
    gamevalidation.initipfs_validationV2,
    Ctrl.ipfsForAstroid,
);
gamerouters.post('/ipfs/ship', verifyJWT_Token, Ctrl.initipfsforship_v2);
gamerouters.post('/initipfsforcrew', verifyJWT_Token, Ctrl.initipfsforcrew);
gamerouters.post('/ipfs/crew', verifyJWT_Token, Ctrl.ipfsforcrew);

// -- > IPFS  < --
// used in nftmarket place to get the gameInfo of the nft to show the game info
gamerouters.post('/nft/gameinfo', Ctrl.NftGameInfo);
gamerouters.post('/assetbyplanetid', Ctrl.AssetByPlanetId);
gamerouters.post('/assetshop', Ctrl.assetshop);
gamerouters.post('/createuserasset', gamevalidation.validatecreateUserAsset, Ctrl.createUserAsset); // buy building
gamerouters.get(
    '/userassetlist',
    verifyJWT_Token,
    gamevalidation.userAsset_validation,
    Ctrl.UserAssetList,
);
gamerouters.get('/planetlist', Ctrl.PlanetList);
gamerouters.post('/userassetlevelup', verifyJWT_Token, Ctrl.UserAssetLevelUp);
gamerouters.post(
    '/claimreward',
    verifyJWT_Token,
    gamevalidation.claimrewardvalidatation,
    Ctrl.claimBuildingreward,
);
gamerouters.post(
    '/useconsumable',
    verifyJWT_Token,
    gamevalidation.claimrewardvalidatation,
    Ctrl.useConsumabels,
);
gamerouters.post('/claimallreward', verifyJWT_Token, Ctrl.claimAllBuildingReward);
// -- > Build Rountes Start  < --
//!developement
gamerouters.get(
    '/v3/dev/build/auto/asset/level',
    restrictProduction,
    buildCtl.addAssetAndAutoLevel,
);
gamerouters.get('/build/buildinglist', restrictProduction, buildCtl.buildinglist);
gamerouters.post('/build/addasset', restrictProduction, buildCtl.addAsset);
gamerouters.post(
    '/build/addlevel',
    restrictProduction,
    gamevalidation.addlevel_val,
    buildCtl.addLevel,
);
gamerouters.post(
    '/build/autoaddlevel',
    restrictProduction,
    gamevalidation.autoaddlevel_val,
    buildCtl.autoaddlevel,
);
gamerouters.post('/build/editassetlevel', restrictProduction, buildCtl.EditAssetlevel);
// --> building Rountes End <--

// ships
gamerouters.post('/dev/createship', restrictProduction, Ctrl.createship);
gamerouters.get('/shipshop', verifyJWT_Token, Ctrl.getShip);
gamerouters.get('/shiplist', Ctrl.shipList);
gamerouters.post('/shipformission', verifyJWT_Token, Ctrl.ShipForMission);

gamerouters.put('/ship/admin/update', Authendicateadmin, Ctrl.updateShip);
gamerouters.put('/ship/admin/update/price', Authendicateadmin, Ctrl.updateShipPrice);
// missons

// training -- start
gamerouters.post('/training/add', verifyJWT_Token, Training.createTraining);
gamerouters.post('/training/claim', verifyJWT_Token, Training.claimTrainedCrew);
gamerouters.get('/training', verifyJWT_Token, Training.getTrainningCrew);

// training -- end

// --> pack router start <--
gamerouters.post('/pack', Pack.createPack);
gamerouters.get('/pack', Pack.getPack);
gamerouters.post('/add/pack', Pack.AddPackToAsset);
gamerouters.post('/update/pack/planetassets', Pack.updateThePackForAstroidAndPlanet);
// --> pack router end <--

gamerouters.post('/crew/auto', restrictProduction, crew.autoCrewInsert);
gamerouters.get('crew/crewlist', crew.crewList);
gamerouters.get('/crew/:id', crew.crewData);
gamerouters.post('/crew/addcrew', gamevalidation.createCrew_val, crew.addcrew_NFTASSET);

// inventory :
gamerouters.post('/userinventory', verifyJWT_Token, Ctrl.userInventory);
gamerouters.post('/moveinventory', verifyJWT_Token, Ctrl.moveInventory);

// gamerouters.get('/updatemanyuserassets' , Ctrl.updateManyUserAssets)

gamerouters.put('/isquote', verifyJWT_Token, Ctrl.quoteRead);

// ship equip inventory

gamerouters.post('/equipship', verifyJWT_Token, Ctrl.equipShip);
gamerouters.post('/getbackship', verifyJWT_Token, Ctrl.getBackEquipShip);

//--> for Admin Serice start<--
// update the airdrop nft in gamesetting
gamerouters.post('/admin/assetsforairdrop', Authendicateadmin, Ctrl.fetchAssetforAirdrop);
// update the crew price by admin
// gamerouters.put('/admin/crew/price', Authendicateadmin, Ctrl.CrewPriceUpdate);
gamerouters.put('/v2/admin/crew/price', Authendicateadmin, Ctrl.CrewPriceUpdatev2);

// get the crew price by admin
gamerouters.get('/admin/crew/price', Authendicateadmin, Ctrl.CrewPrice);
//--> for Admin Serice end <--
gamerouters.put('/admin/planet/price', Authendicateadmin, Ctrl.PlanetAsteroidPriceUpdate);
//update the planet ot asteroid price by admin
gamerouters.get('/admin/planet/price', Authendicateadmin, Ctrl.PlanetAsteroidPrice);

gamerouters.post('/deletalluserasset', restrictProduction, Ctrl.deletalluserasset);
gamerouters.post('/deleteassetbyuserplanet', restrictProduction, Ctrl.deleteassetbyuserplanet);
gamerouters.post('/pack/tempchange', restrictProduction, Pack.TEMP_CHANGE);

gamerouters.get(
    '/planetrewards',
    verifyJWT_Token,
    gamevalidation.userAsset_validation,
    Ctrl.getPlanetRewards,
);

// get the planet nearby dummy planets v3
// gamerouters.get('/nearbyPlanets/:userplanetId', verifyJWT_Token, Ctrl.getNearByPlanets);

//Buy flow for special crew
gamerouters.post(
    '/ipfs/specialcrew',
    verifyJWT_Token,
    gamevalidation.specialcrew_validation,
    Ctrl.ipfsForSpecialCrew,
);

gamerouters.get('/buildinglist', verifyJWT_Token, Ctrl.buildinglist);

export default gamerouters;
