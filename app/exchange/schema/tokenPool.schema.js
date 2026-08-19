import constant from '../../../shared/constant'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let pool = new Schema({
	name :{
		type: String ,
		default : null
	},
	lockedPeriod :{ // in days
		type: Number ,
		default : 1
	},
    rewardPercent : { // percent
		type: Number ,
		default : 1
	},
	stakeCurrencyId : { type: Schema.Types.ObjectId, ref: constant.CURRENCY_DB } ,
	rewardCurrencyId : { type: Schema.Types.ObjectId, ref: constant.CURRENCY_DB } ,
    isActive : {type: Boolean,default:true},
    imageUrl : {type: String , default:null }

},{timestamps:true});
module.exports = mongoose.model(constant.TOKENPOOL_DB  ,pool);
