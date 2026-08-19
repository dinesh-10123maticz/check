const winston = require('winston');

// Create a logger
const logger = winston.createLogger({
    level: 'info', // Log at 'info' level and higher
    format: winston.format.combine(
        winston.format.colorize(), // Adds colors for better readability
        winston.format.simple(), // Simple format for development
    ),
    transports: [
        new winston.transports.Console(), // Logs to the console
    ],
});

module.exports = logger;
