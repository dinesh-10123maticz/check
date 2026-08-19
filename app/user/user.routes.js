import { Router } from 'express';
import * as userCtrl from './user.controller';
import { DecryptDatas } from '../../shared/credentialsetup';
import { verifyToken, verifyTokenforgame } from '../../shared/credentialsetup';
import { depositevalidator } from './user.validations';
import { decryptGameRequest } from '../../shared/commonFunction';
const userrouters = Router();

userrouters.route('/create').post(DecryptDatas, userCtrl.UserRegister);
userrouters.route('/edit').post(verifyToken, DecryptDatas, userCtrl.Editprofile);
userrouters.route('/connect').post(DecryptDatas, userCtrl.InitialConnect);
userrouters.route('/FollowUnFollow').post(verifyToken, userCtrl.FollowUnFollow);
// routers.route('/getuserregister').get(userCtrl.getuserregister)
userrouters.route('/getprofile/:CustomUrl').get(userCtrl.getprofile);
userrouters.route('/notification').get(verifyToken, userCtrl.notification);

userrouters.route('/profileimage').put(verifyToken, userCtrl.profileimage);
userrouters.route('/coverimage').put(verifyToken, userCtrl.coverimage);
userrouters.route('/getbalance').get(userCtrl.getbalance);
//!  need listener for addbalance on contract
userrouters.route('/addbalance').post(userCtrl.addbalance);
userrouters.route('/creategameuser').post(userCtrl.CreateGameUser);
userrouters.route('/editgameuser').post(verifyTokenforgame, userCtrl.EditGameUser);

userrouters.route('/isTutorialPlayed').put(verifyTokenforgame, userCtrl.MakeTrueisTutorialPlayed);

userrouters.route('/gameconnect').post(userCtrl.GameConnect);
userrouters.route('/v2/gameconnect').post(decryptGameRequest, userCtrl.GameConnect);

userrouters.route('/gameuserprofile').get(verifyTokenforgame, userCtrl.gameUserprofile);
// userrouters.route('/getusercurrency').get(userCtrl.getCurrencyonOffChain);

userrouters.route('/depositebalance').post(verifyTokenforgame, userCtrl.Depositebalance);

userrouters.route('/claimfreereward').post(verifyTokenforgame, userCtrl.ClaimFreeReward);
userrouters.route('/newsletter').post(DecryptDatas, userCtrl.Newsletter);

// developmet api hide when move to production
userrouters.route('/deletewithwalletaddress').post(userCtrl.deletealluserdata);

export default userrouters;
