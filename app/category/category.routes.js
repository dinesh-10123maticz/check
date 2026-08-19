import * as catcontroller from './category.controller';
import { Router } from 'express';

import { Authendicateadmin } from '../admin/adminlogin/admin.service';
import { DecryptDatas } from '../../shared/credentialsetup';
const catroutes = Router();

catroutes.route('/classlist').get(catcontroller.getClass);
catroutes.route('/addclass').post(Authendicateadmin, DecryptDatas, catcontroller.addClass);
catroutes
    .route('/changeclass')
    .put(Authendicateadmin, DecryptDatas, catcontroller.changeClassstatus);

catroutes.route('/categoryupdate').put(catcontroller.addSubCategory);

catroutes.route('/addsubcategory').post(DecryptDatas, catcontroller.addSubCategory);

catroutes.route('/subcategorylist').post(DecryptDatas, catcontroller.subcategorylist);

catroutes.route('/subcategoryvaluelist').post(DecryptDatas, catcontroller.subcategoryvaluelist);

catroutes.route('/addsubcategoryvalue').post(DecryptDatas, catcontroller.addsubcategoryvalue);
catroutes.route('/categorylist').get(catcontroller.categorylist);

export default catroutes;
