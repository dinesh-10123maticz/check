import { Router } from 'express';
import {
    autoEntryPlantorAstroid,
    autoInsertShipAssert,
    changeCurrencyContractAddrss,
    createNearByPlanetForAllHex,
    CrewInsert,
    CrewInsert_female,
    insertProfessions,
    mission_reward_db_entry,
    SpecialCrewInsert,
    assignCrewToPlanets
} from './scripts.controller';
import { restrictProduction } from '../../shared/commonFunction';

const scripts = Router();

/**
 * ---------------------------------------------------------------------------
 * SCRIPT ROUTES (ADMIN / DEV ONLY)
 * ---------------------------------------------------------------------------
 *
 * These endpoints are NOT gameplay APIs.
 * They are database seeding & migration utilities used to generate
 * large-scale game data such as planets, crew NFTs, ships, and professions.
 *
 * ⚠️ IMPORTANT:
 * - Should be protected behind admin authentication.
 * - Should NOT be publicly exposed in production.
 * - Most routes are intended to run ONCE per deployment or collection release.
 *
 * Purpose:
 *   - Bootstrap game universe
 *   - Insert NFT collections
 *   - Bulk data generation
 *   - Fix or migrate existing datasets
 *
 * ---------------------------------------------------------------------------
 */

/**
 * Create nearby planets for every hex coordinate in the galaxy.
 *
 * What it does:
 * - Iterates through all hex IDs (0 → 50,000)
 * - Generates nearby exploration planets
 * - Assigns random mission resources
 *
 * Why needed:
 * - Exploration system depends on pre-generated nearby planets.
 * - Prevents runtime generation overhead during gameplay.
 *
 * Safe to run:
 * - ONLY once when initializing a new universe.
 */

scripts.post('/create_nearby_planet', createNearByPlanetForAllHex);
/**
 * Bulk insert planets and asteroids NFT collections.
 *
 * What it does:
 * - Generates full planet + asteroid datasets
 * - Applies rarity tiers (common/uncommon/rare)
 * - Assigns slots, pricing, metadata, and images
 * - Inserts thousands of records using insertMany()
 *
 * Why needed:
 * - Initial NFT collection creation.
 * - Automated world asset generation.
 *
 * ⚠️ WARNING:
 * Running twice may create duplicate assets.
 */
scripts.post('/autoinsertplanetorastroid', autoEntryPlantorAstroid);

/**
 * Bulk insert ship assets into database.
 *
 * What it does:
 * - Loads predefined ship metadata (SHIP_DATA)
 * - Attaches collection ID
 * - Cleans MongoDB internal fields
 * - Inserts ships in bulk
 *
 * Why needed:
 * - Ships are predefined gameplay assets.
 * - Allows fast initialization of ship collection.
 *
 * Safe to run:
 * - Only when ship collection changes or is newly deployed.
 */

scripts.post('/autoinsertshipasset', autoInsertShipAssert);

/**
 * Generate male crew NFT entries.
 *
 * What it does:
 * - Creates ~10,000 crew NFTs
 * - Uses image wrapping (200 images reused cyclically)
 * - Assigns metadata and collection reference
 *
 * Why needed:

 * - Mass NFT generation without storing thousands of images.
 *
 * Note:
 * - Male crew uses odd numbering sequence.
 */

scripts.post('/crewInsert', CrewInsert);

/**
 * Generate female crew NFT entries.
 *
 * What it does:
 * - Creates female crew NFTs
 * - Complements male crew dataset
 * - Uses even numbering sequence
 *
 * Why needed:
 * - Maintain gender-balanced crew collection.
 */

// scripts.post('/createcrew/female', CrewInsert_female);
/**
 * Insert or update profession master data.
 *
 * What it does:
 * - Reads profession seed file
 * - Performs UPSERT operation:
 *      existing → update
 *      missing  → insert
 *
 * Why needed:
 * - Professions control gameplay bonuses, roles, and rewards.
 * - Keeps DB synchronized with configuration files.
 *
 * Safe to run:
 * - Multiple times (idempotent).
 */

scripts.post('/insertProfessions', insertProfessions);

/**
 * Create special crew NFT collections.
 *
 * What it does:
 * - Generates premium/special crew NFTs
 * - Applies rarity distribution
 * - Adds NFT trait metadata
 * - Creates male & female variants
 *
 * Used for:
 * - Event NFTs
 * - Special characters
 * - Limited collections
 */

scripts.post('/createspecialcrew', SpecialCrewInsert);

/**
 * Temporary alias route.
 *
 * Historically used for:
 * - Data fixes
 * - Re-running special crew insertion
 *
 * TODO:
 * - Remove once no longer required.
 */


scripts.post('/mission_reward_db_entry', restrictProduction, mission_reward_db_entry);
scripts.put('/currencycontractchange', changeCurrencyContractAddrss); //need we can use

/**
 * Assign each crew for each planet and asteroid.
 *
 * What it does:
 * - Assigns crew in order wise

 *
 * Used for:
 * - To get one free crew while buy each planet and asteroid
 */

scripts.post('/assignCrewToPlanets', assignCrewToPlanets);


export default scripts;
