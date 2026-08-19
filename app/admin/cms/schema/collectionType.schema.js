const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let collectiontype = new Schema({
	type: {
		type: String,
		index: true
	},
	image: {
		type: String,
		default: null
	},
	image_url: {
		type: String,
		default: null
	},
	isActive: {
		type: Boolean,
		default: true,
	},

}, { timestamps: true });
module.exports = mongoose.model('collectiontype', collectiontype, 'collectiontype');
