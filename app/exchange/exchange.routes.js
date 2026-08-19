import { Router } from 'express';
import { DecryptDatas, verifyToken, verifyTokenforgame } from '../../shared/credentialsetup';
import * as Ctrl from './exchange.controller';
import { UpdateTokenPoolVal, createTokenPoolVal, stackToken } from './exchnage.validation';
import { yupvalidate } from '../../shared/commonFunction';
import { Authendicateadmin } from '../admin/adminlogin/admin.service';
import { decryptGameRequest } from '../../shared/commonFunction';

// import * as validation  from './exchnage.validation';
const exchange = Router();

// exchange.post('/add' , Ctrl.createBuild)

exchange.post('/stack', verifyTokenforgame, Ctrl.stackToken);
exchange.get('/tokenpoollist', Ctrl.tokenPoolList);
exchange.get('/admin/tokenpoollist', Ctrl.tokenPoolList_admin);

exchange.post('/admin/tokenpoolstatus', Authendicateadmin, Ctrl.changeTokenPoolStatus);
exchange.post(
    '/admin/createtokenpool',
    Authendicateadmin,
    yupvalidate(createTokenPoolVal),
    Ctrl.createTokenPool,
);
exchange.post(
    '/admin/updatetokenpool',
    Authendicateadmin,
    yupvalidate(UpdateTokenPoolVal),
    Ctrl.updateTokenPool,
);
exchange.post('/stacktoken', yupvalidate(stackToken), verifyTokenforgame, Ctrl.stackToken);
exchange.post('/claimstackedtoken', verifyTokenforgame, Ctrl.claimStackedToken);
exchange.get('/stakedtokendetails', verifyTokenforgame, Ctrl.stackedTokenDetails);
exchange.post('/getclaim', verifyTokenforgame, decryptGameRequest, Ctrl.getClaimable);
exchange.post('/withdraw', verifyTokenforgame, decryptGameRequest, Ctrl.WithdrawBalance);
exchange.get('/admin/transcation', Ctrl.WithdrawBalance);
exchange.post('/convert/price', Ctrl.convertPrice);

// development
exchange.post('/dev/updatemoney', Ctrl.devUpdateUserBalance);

export default exchange;
