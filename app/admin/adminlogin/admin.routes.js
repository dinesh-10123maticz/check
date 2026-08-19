import { Router } from 'express';
import * as admincontroller from './admin.controller';
import { Authendicateadmin } from './admin.service';
import { DecryptDatas } from '../../../shared/credentialsetup';
import * as professionController from "../../profession/profession.controller"

const adminroutes = Router();
adminroutes.route('/adminlogin').post(DecryptDatas, admincontroller.loginAdmin);

adminroutes.route('/getForgotPasswordOTP')
    .post(DecryptDatas, admincontroller.getForgotPasswordOTP)
    .put(DecryptDatas, admincontroller.updateForgotPassword);
adminroutes.route('/userlist').get(Authendicateadmin, admincontroller.userlist);
adminroutes.route('/updateuserstatus').post(Authendicateadmin, DecryptDatas, admincontroller.updateuserstatus);

adminroutes.route('/userdetail').post(Authendicateadmin, admincontroller.userdetail);
adminroutes.route('/banuser').put(Authendicateadmin, admincontroller.Banuser);

adminroutes.route('/gamevalue').put(Authendicateadmin, admincontroller.gamevalue);
adminroutes.route('/gamevalue').get(Authendicateadmin, admincontroller.getGamevalue);
adminroutes.route('/buildings').get(admincontroller.buildings);
adminroutes.put('/build_time', admincontroller.editBuildTimeForBuildings); //both buildTime and levelLimit

adminroutes.route('/creategamevalue').post(admincontroller.creategamevalue);

adminroutes
    .route('/missionplanet-limit')
    .put(Authendicateadmin, admincontroller.UpdateMissionPlanetLimit);

adminroutes
    .route('/gamesetting-mission-time')
    .put(Authendicateadmin, admincontroller.UpdateGameSettingMissionTime);

adminroutes.route('/gamesetting').put(Authendicateadmin, admincontroller.gamesetting);
adminroutes.route('/updategamesetting').put(Authendicateadmin, admincontroller.UpdateGameSetting);
adminroutes
    .route('/addMissionRewards')
    .put(Authendicateadmin, admincontroller.addMissionRewardOnGameSettings);
adminroutes
    .route('/deleteMissionRewards')
    .delete(Authendicateadmin, admincontroller.deleteMissionRewardOnGameSettings);
adminroutes
    .route('/getMissionRewards')
    .get(Authendicateadmin, admincontroller.getMissionRewardOnGameSettings);

//!removed
adminroutes
    .route('/changeairdropnft')
    .put((req, res) => res.status(410).json({ status: true, message: 'no more' }));

adminroutes.get('/getairdropnft');

adminroutes.route('/updateCrewCost').put(Authendicateadmin, professionController.updateNFTCost);
adminroutes.route('/getDashboardData').get(Authendicateadmin, admincontroller.getDashboardData);

module.exports = adminroutes;
