import { Router } from 'express';
const Ctrl = require('./mission.controller');
import { verifyTokenforgame } from '../../shared/credentialsetup';
import * as validation from './mission.validation';
import { Authendicateadmin } from '../admin/adminlogin/admin.service';
import { decryptGameRequest } from '../../shared/commonFunction';

const route = Router();

// admin panel has this api to modify the missionrewards
route.post('/admin/creatmissionreward', Authendicateadmin, Ctrl.creatMissionReward);
route.put('/admin/missionreward', Authendicateadmin, Ctrl.updateMissionReward);
route.delete('/admin/missionreward/:id', Authendicateadmin, Ctrl.missionRewardDelete);
route.get('/admin/missionrewardlist', Ctrl.missionRewardList);

// used to get the crew list for the users
route.post('/missioncrew', verifyTokenforgame, Ctrl.missionCrew);

// get the missions status pending , calimed , not claimed
route.get('/missionstatus', verifyTokenforgame, Ctrl.MissionStatus);

//! need to check it is working fine for v3 missions
route.post('/v2/claim/reward', verifyTokenforgame, Ctrl.claimReward_V2);

//  v3 for mission for new nearbyPlanets
route.get('/v3/missionstatus', verifyTokenforgame, Ctrl.MissionStatusV3); //using type
route.get('/v3/missionhistory', verifyTokenforgame, Ctrl.MissionHistoryV3); //using without type

route.get('/v3/missionstatus/details/:missionStatsId', Ctrl.MissionStatusDetail);

// for jump the plant one hex to another hex it takes time to move
route.post('/ship/jump', verifyTokenforgame, decryptGameRequest, Ctrl.shipJump);
// for exploring a new planet
route.post(
    '/v3/explore/start',
    verifyTokenforgame,
    decryptGameRequest,
    validation.startMissionVal,
    Ctrl.missionExploreStart,
);

// for mining a planet which is already explored
route.post(
    '/v3/mining/start',
    verifyTokenforgame,
    decryptGameRequest,
    validation.startMissionVal,
    Ctrl.missionMiningStart,
);
// for combat a planet which is already explored

route.post(
    '/v3/combat/start',
    verifyTokenforgame,
    decryptGameRequest,
    validation.startMissionVal,
    Ctrl.missionCombatStart,
);
// for social a planet which is already explored

route.post(
    '/v3/social/start',
    verifyTokenforgame,
    decryptGameRequest,
    validation.startMissionVal,
    Ctrl.missionSocialStart,
);
// used to get the planet nearby dummy planets with
route.get('/nearbyPlanets/:userplanetId', verifyTokenforgame, Ctrl.getNearByPlanets);

// for hex id get nearby planets
route.get('/hex', verifyTokenforgame, Ctrl.getHexPlanets);

route.get('/getMissionStats', Ctrl.getMission);

route.get('/missionscope', verifyTokenforgame, Ctrl.getGameValues)

route.get('/admin/missionbonusreward', Authendicateadmin, Ctrl.getMissionBonusReward);
route.put('/admin/missionbonusreward', Authendicateadmin, validation.updateMissionBonusReward, Ctrl.updateMissionBonusReward);

route.get('/nearbyplanetstatus', verifyTokenforgame, Ctrl.getNearbyplanetStatus)

export default route;
