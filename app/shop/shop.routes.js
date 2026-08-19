import { Router } from 'express';
import * as Ctrl from './shop.controller';
import { verifyJWT_Token } from '../user/user.validations';
import { Authendicateadmin } from '../admin/adminlogin/admin.service';
import * as shopValidation from "./shop.validation"

const router = Router();

router.post('/planetastroid', verifyJWT_Token, Ctrl.planetAstroidShop);
router.get('/types', Ctrl.gamemarketcollections); //ignore
router.post('/ship', verifyJWT_Token, Ctrl.shipMarketShop);
router.post('/galficrew', verifyJWT_Token, Ctrl.GalfiCrewMarket);
router.post('/crew', verifyJWT_Token, Ctrl.CrewMarket);
router.post('/search', verifyJWT_Token, Ctrl.ShopSearchAction);
router.get('/category', Ctrl.shopCategory);
router.post('/galfispecialcrew', verifyJWT_Token, Ctrl.GalfiSpecialCrewMarket);
router.post('/galfipriceforship', verifyJWT_Token, shopValidation.galfiShipPrice_validation, Ctrl.getGalfiPriceForShip);
router.post('/galfipriceforBuilding', verifyJWT_Token, shopValidation.galfiBuildingPrice_validation, Ctrl.getGalfiPriceForBuilding);

//adminpanel api
router.get('/admin/ship', Authendicateadmin, Ctrl.shipMarketAdmin)
router.post('/admin/editshipprice', Authendicateadmin, shopValidation.updateShipPrice_validation, Ctrl.updateShipPriceAdmin)

export default router;
