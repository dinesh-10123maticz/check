const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let cms = new Schema({
	heading:{
		type:String ,
		index: true
	},
	description : {
		type : String,
		index: true,
		default : ""
	},
	slug:{
		type:String,
		index: true,
		required:true,
	},
	deleted : {
		type: Boolean,
		default:false,
	},
	image : {
		type : String,
		default :""
	},
	twitter:{
		type:String,
		default : null , 
	},
	medium:{
		type:String,
		default : null , 
	},
	gitbook	:{
		type:String,
		default : null , 
	},
	discord:{
		type:String,
		default : null , 
	},
	telegram:{
		type:String,
		default : null , 

	
	},
	
	
},{timestamps:true});
module.exports = mongoose.model('cms',cms,'cms');
