const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let roadmap = new Schema({
    step:{
		type:Number
	},
	question:{
		type:String
	},
	answer:{
		type:String,
		required:true,
	},

});
module.exports = mongoose.model('roadmap',roadmap,'roadmap');
