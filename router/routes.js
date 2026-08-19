import { Router } from 'express';
import nftrouters from '../app/nft/nft.routes';
import userrouters from '../app/user/user.routes';
import adminroutes from '../app/admin/adminlogin/admin.routes';
import cmsroutes from '../app/admin/cms/cms.routes';
import catroutes from '../app/category/category.routes';
import gamerouters from '../app/game/game.routes';
import exchange from '../app/exchange/exchange.routes';
import promotion from '../app/promotion/promo.routes';
import mission from '../app/missions/mission.routes';
import shop from '../app/shop/shop.routes';
import scripts from '../app/scripts/scripts.routes';
import amountConvertionRoute from '../app/amountConvertion/amountConvertion.routes';
import profession from "../app/profession/profession.routes"
import syncrouters from '../app/sync/sync.routes';

const routers = Router();

routers.use('/user', userrouters);
routers.use('/nft', nftrouters);
routers.use('/nft', syncrouters);
routers.use('/admin', adminroutes);
routers.use('/cms', cmsroutes);
routers.use('/category', catroutes);
routers.use('/game', gamerouters);
routers.use('/exchange', exchange);
routers.use('/profession', profession);

routers.use('/mission', mission);
routers.use('/shop', shop);
routers.use('/promo', promotion);
routers.use('/conversion', amountConvertionRoute);

//! just for developers purpose restrictProduction this protect from production
routers.use('/script', scripts);

export default routers;
