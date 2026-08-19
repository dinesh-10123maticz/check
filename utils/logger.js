const winston = require('winston');

// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.combine(
//         winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//         winston.format.colorize({ all: true }),
//         winston.format.printf(({ timestamp, level, message }) => {
//             return `${timestamp} ${level}: ${message}`;
//         }),
//     ),
//     transports: [new winston.transports.Console()],
// });

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(), // <-- use json instead of printf
    ),
    transports: [new winston.transports.Console()],
});

module.exports = logger;

// DD_API_KEY=e723c7518b6df6983102a4b19f23acec DD_SITE="us5.datadoghq.com" bash -c "$(curl -L https://install.datadoghq.com/scripts/install_script_agent7.sh)"
