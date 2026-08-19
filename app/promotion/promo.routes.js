import { Router } from 'express';
import * as promoControllers from './controller/promo.controller';
import * as publish from './controller/publish.controller';

import { Authendicateadmin } from '../admin/adminlogin/admin.service';

const promoRoutes = Router();

promoRoutes.route('/blog/:id').get(promoControllers.GetBlog);
promoRoutes.route('/news/:id').get(promoControllers.GetNews);

promoRoutes.route('/createnews').post(Authendicateadmin, promoControllers.createNews);
promoRoutes.route('/updatenews').put(Authendicateadmin, promoControllers.updateNews);
promoRoutes.route('/newslist').get(promoControllers.NewsList);
promoRoutes.route('/adminnewslist').get(promoControllers.adminNewsList);
promoRoutes.route('/adminbloglist').get(promoControllers.adminblogList);

promoRoutes.route('/news').delete(Authendicateadmin, promoControllers.NewsDelete);
promoRoutes.route('/blog').delete(Authendicateadmin, promoControllers.BlogDelete);

promoRoutes.route('/newsstatus').put(promoControllers.NewsStatusChange);
promoRoutes.route('/createblog').post(Authendicateadmin, promoControllers.createBlog);
promoRoutes.route('/updateblog').put(Authendicateadmin, promoControllers.updateBlog);
promoRoutes.route('/bloglist').get(promoControllers.blogList);
promoRoutes.route('/blogstatus').put(promoControllers.BlogStatusChange);

promoRoutes.route('/bloglists').get(promoControllers.blogListForSite);
promoRoutes.route('/partnerlist').get(promoControllers.partnerList);
promoRoutes.route('/partner').delete(Authendicateadmin, promoControllers.partnerDelete);
promoRoutes.route('/partner').post(Authendicateadmin, promoControllers.partnerCreate);
promoRoutes.route('/promocms').get(promoControllers.PromoCMS);

promoRoutes.route('/promobuild').get(promoControllers.PromoBuildingList);
promoRoutes.route('/promobuild').delete(Authendicateadmin, promoControllers.PromoBuildingDelete);
promoRoutes.route('/promobuild').post(Authendicateadmin, promoControllers.PromoBuildingCreate);
promoRoutes.route('/promobuild').put(Authendicateadmin, promoControllers.PromoBuildingUpdate);
// publish routes
promoRoutes.route('/publish').post(Authendicateadmin, publish.PublishCreate);
promoRoutes.route('/publish').put(Authendicateadmin, publish.PublishUpdate);
promoRoutes.route('/publish').get(publish.PublishList);
promoRoutes.route('/publish').delete(Authendicateadmin, publish.PublishDelete);

module.exports = promoRoutes;
