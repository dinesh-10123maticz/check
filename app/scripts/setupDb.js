const dotenv = require('dotenv');
dotenv.config({ path: `./env/.env.${process.env.NODE_ENV}` });
const mongoose = require('mongoose');
const planetSchema = require('../game/schema/planet.schema');
const nearByPlanet = require('../game/schema/nearByPlanet.schema');
const crew = require('../game/schema/crew.schema');
const userAssets = require('../game/schema/userAssets.schema');
const userplanet = require('../game/schema/userplanet.schema');
const chat = require('../chat/schema/chat.schema');
const transcation = require('../exchange/schema/transcation.schema');
const user = require('../user/schema/user.schema');
const activity = require('../user/schema/activity.schema');
const subcriber = require('../user/schema/subcriber.schema');
const usercurrency = require('../user/schema/usercurrency.schema');
const bid = require('../nft/schema/bid.schema');
const tokenowner = require('../nft/schema/tokenowner.schema');
const collectionlike = require('../nft/schema/collectionlike.schema');
const token = require('../nft/schema/token.schema');
const battlestats = require('../missions/schema/battlestats.schema');
const explored = require('../missions/schema/explored.schema');
const missionreward = require('../missions/schema/missionreward.schema');
const exploredPlanets = require('../missions/schema/exploredPlanets.schema');
const missionStatus = require('../missions/schema/missionStatus.schema');
const currencySchema = require('../exchange/schema/currency.schema');
const userShip = require("../game/schema/ship.schema")

/* -------------------------------------------------- */
/* Mongo Connection */
/* -------------------------------------------------- */

const clearMission = () => {
    return Promise.all([
        battlestats.default.deleteMany({}),
        explored.default.deleteMany({}),
        exploredPlanets.default.deleteMany({}),
        missionStatus.default.deleteMany({}),
        nearByPlanet.default.updateMany({}, { $set: { parentPlanetId: null } }),
    ]);
};
async function connectDB() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGOURI);

        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}

/* -------------------------------------------------- */
/* Insert Logic */
/* -------------------------------------------------- */

const clearNfts = () => {
    return Promise.all([
        bid.deleteMany({}),
        tokenowner.deleteMany({}),
        collectionlike.deleteMany({}),
        token.deleteMany({}),
        activity.deleteMany({}),
        crew.updateMany({}, { $set: { isLocked: false, isActive: true } }),
    ]);
};
const userdatas = () => {
    return Promise.all([
        user.deleteMany({}),
        userAssets.default.deleteMany({}),
        userplanet.deleteMany({}),
        userShip.deleteMany({}),
        usercurrency.default.deleteMany({}),
        subcriber.deleteMany({}),
        chat.deleteMany({}),
        transcation.deleteMany({}),
        currencySchema.updateMany({}, { $set: { circulateCurrency: 0 } }),
    ]);
};
async function clearDb() {
    await Promise.all([clearMission(), userdatas(), clearNfts()]);
    await planetSchema.updateMany({}, { $set: { isLocked: false, isActive: true } });
}

/* -------------------------------------------------- */
/* Runner */
/* -------------------------------------------------- */

async function run() {
    try {
        await connectDB();

        console.log('🌱 Inserting profession data...\n');

        await clearDb();

        console.log('\n🎉 Profession data sync completed');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Insert script failed:', error);
        process.exit(1);
    }
}

run();
