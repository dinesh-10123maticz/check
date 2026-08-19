const cron = require('node-cron');
const { UpdateManyCrew } = require('../app/game/game.service');
const logger = require('./logger');

// every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    const jobName = 'UNLOCK_CREW_CRON';
    try {
        logger.info(`${jobName} started`);
        // 10 minutes ago timestamp
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const result = await UpdateManyCrew(
            {
                isActive: true,
                isLocked: true,
                updatedAt: { $lte: tenMinutesAgo },
            },
            {
                $set: { isLocked: false },
            },
        );

        logger.info(`${jobName} completed`, {
            unlockedCount: result.modifiedCount,
            matchedCount: result.matchedCount,
            cutoffTime: tenMinutesAgo,
        });
    } catch (error) {
        logger.error(`${jobName} failed`, {
            message: error.message,
            stack: error.stack,
        });
    }
});
