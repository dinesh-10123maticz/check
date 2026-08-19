import mongoose from 'mongoose';
import constants from '../../../shared/constant.js';

const nearByPlanet = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        image_url: { type: String },
        parentPlanetId: { type: mongoose.Schema.Types.ObjectId, ref: constants.USERPLANET_DB },
        acquiredBy: { type: mongoose.Schema.Types.ObjectId, ref: constants.USER_DB },
        // acquired_status : { type: String, default: 'not_acquired' , enum : ["acquired" , "process" , 'not_acquired'] }, // acquired , not_acquired
        hexId: { type: Number, default: 0 }, // store the hex of the planet
        planetResources: [],
    },
    { timestamps: true },
);

// module.exports = mongoose.model(constants.nearByPlanet_DB, nearByPlanet);

export default mongoose.model(constants.nearByPlanet_DB, nearByPlanet);
