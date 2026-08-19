const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let planetcms = new Schema({
	Number: {
		type: Number
	},
	heading: {
		type: String
	},
	description: {
		type: String,
		required: true,
	},
	galaxy: {
		type: String,
		required: true,
		index: true,
	},
	sideheading: {
		type: String,
		required: true,
	},
	sidedescription: {
		type: String,
		required: true,
	},
	carbs: {
		type: String,
		required: true,
	},
	protein: {
		type: String,
		required: true,
	},
	fats: {
		type: String,
		required: true,
	},


});
module.exports = mongoose.model('planetcms', planetcms, 'planetcms');
