import { createClient } from 'redis';
import logger from '../utils/logger';

// Create Redis client instance
const client = createClient();

// Redis event listeners
client.on('error', (err) => logger.error('Redis Client Error:', err));
client.on('connect', () => logger.info('Connecting to Redis...'));
client.on('ready', () => logger.info('Redis connection established successfully!'));
client.on('end', () => logger.error('Redis connection closed.'));
client.on('reconnecting', () => logger.info('Reconnecting to Redis...'));

// Utility function to connect to Redis
const redisConnect = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
            logger.info('Connected to Redis');
        }
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error; // Re-throw to handle it elsewhere if needed
    }
};

// Call redisConnect during initialization
redisConnect();

// Utility functions for Redis operations

/**
 * Set a key-value pair in Redis with an optional expiration time.
 * @param {string} key - The key to set.
 * @param {string | object} value - The value to set (can be a string or an object).
 * @param {number} [expiry] - Optional expiration time in seconds.
 */
const RedisSet = async (key, value, expiry) => {
    try {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        if (expiry) {
            await client.set(key, stringValue, { EX: expiry });
        } else {
            await client.set(key, stringValue);
        }
        logger.info(`Key "${key}" set successfully.`);
    } catch (error) {
        logger.error(`Failed to set key "${key}":`, error);
        throw error;
    }
};

/**
 * Get the value of a key from Redis.
 * @param {string} key - The key to retrieve.
 * @returns {Promise<string | object | null>} - The value of the key, parsed as JSON if applicable.
 */
const RedisGet = async (key) => {
    try {
        const value = await client.get(key);
        if (value) {
            try {
                return JSON.parse(value); // Parse JSON if value is a valid JSON string
            } catch {
                return value; // Return as string if not JSON
            }
        }
        return null; // Return null if key does not exist
    } catch (error) {
        logger.error(`Failed to get key "${key}":`, error);
        throw error;
    }
};

const RedisExpire = async (key, expiry) => {
    try {

        await client.expire(key, expiry);

        logger.info(`Expiry set for key "${key}"`);

    } catch (error) {

        logger.error(`Failed to expire key "${key}":`, error);

        throw error;
    }
};


const RedisIncrement = async (key) => {
    try {
        const value = await client.incr(key);

        logger.info(`Key "${key}" incremented successfully.`);

        return value;
    } catch (error) {
        logger.error(`Failed to increment key "${key}":`, error);
        throw error;
    }
};

// Export Redis client and utility functions
export { client, redisConnect, RedisSet, RedisGet, RedisExpire, RedisIncrement };
