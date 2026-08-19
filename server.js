import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import fileupload from 'express-fileupload';
import cors from 'cors';
import config, { CURRENT_NETWORK } from './config/config';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import routers from './router/routes';
import serveSwagger from './swagger';
import chatSocket from './app/chat/chat.socket';
import TRADEABI from './config/ABI/trade.abi.json';
import withdrawABI from './config/ABI/reward.json';
import {
    eventcreatecrewnft_v2,
    eventcreateforgameShip,
    eventcreatefromgameplanet,
    eventWithdrawalDetails,
} from './app/nft/nft.controlller';
import { isEmpty } from './shared/commonFunction';
import logger from './utils/logger';
import { Server } from 'socket.io';
require('./services/redisclient');
import pair_ABI from './app/amountConvertion/abi/pair_abi.json';
import { getAllPairsFromRedis, getTokens } from './app/amountConvertion/amountConvert';

// import "./app/scripts/setupDb" //delete

const http = require('http');
const app = express();

/* -------------------------------- WHITELIST -------------------------------- */

const whitelist = config.ORIGIN.filter(Boolean).map((o) =>
    o.trim().toLowerCase().replace(/\/$/, ''),
);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const incoming = origin.trim().toLowerCase().replace(/\/$/, '');

        if (whitelist.includes(incoming)) {
            return callback(null, true);
        }

        console.log('❌ Blocked by CORS:', incoming);
        return callback(new Error('Not allowed by CORS')); // ✅ FIXED
    },
    credentials: true,
};

/* -------------------------------- CORE MIDDLEWARE -------------------------------- */

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

app.use(
    fileupload({
        limits: { fileSize: 20 * 1024 * 1024 },
        abortOnLimit: true,
    }),
);

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    }),
);

/* -------------------------------- STATIC -------------------------------- */

app.use(
    '/',
    express.static(path.join(__dirname, 'public'), {
        maxAge: 86400000 * 3,
    }),
);

/* -------------------------------- MORGAN -------------------------------- */

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms :body'));

/* -------------------------------- ROUTES -------------------------------- */

app.get('/', (req, res) => {
    res.send(`hey am still alive`);
});

app.use('/v1', routers);

/* -------------------------------- SWAGGER -------------------------------- */

serveSwagger(app);

/* -------------------------------- SOCKET -------------------------------- */

function initSocket(server, whitelist) {
    const io = new Server(server, {
        cors: {
            origin: (origin, cb) => {
                if (!origin) return cb(null, true);

                const incoming = origin.trim().toLowerCase().replace(/\/$/, '');

                if (whitelist.includes(incoming)) {
                    return cb(null, true);
                }

                logger.warn(`❌ Socket CORS blocked: ${incoming}`);
                return cb(new Error('Not allowed by CORS'));
            },
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingInterval: 25000,
        pingTimeout: 20000,
    });

    io.on('connection', (socket) => {
        logger.info(`✅ Socket connected: ${socket.id}`);

        socket.emit('server_status', {
            statusCode: 201,
            message: 'Server connected',
        });

        chatSocket(socket, io);

        socket.on('ping', () => {
            socket.emit('pong', {
                message: 'pong',
                time: Date.now(),
            });
        });

        socket.on('disconnect', (reason) => {
            logger.info(`❌ Socket disconnected: ${socket.id} | ${reason}`);
        });

        socket.on('error', (error) => {
            logger.error('Socket error:', error);
        });
    });

    logger.info('🚀 Socket.IO initialized');
    return io;
}

/* -------------------------------- WEB3 EVENTS -------------------------------- */

function startWeb3Listener() {
    const web3 = config.CHAIN_DETAILS[CURRENT_NETWORK].web3WsInstance;

    const contract = new web3.eth.Contract(TRADEABI, config.CHAIN_DETAILS[CURRENT_NETWORK].trade);

    logger.info('Listening to Trade Contract Events...');
    console.log('Listening to Trade Contract Events...-->');
    contract.events
        .Create({ fromBlock: 'pending' })
        .on('connected', (id) => logger.info('Subscription:', id))
        .on('data', async (event) => {
            if (event.event !== 'Create') return;

            try {
                const hash = event.transactionHash;
                const data = event.returnValues;
                console.log('CHECK FOR data', data);
                const nftID = data.tokenId;
                const collection = data?._collection?.toLowerCase();
                console.log('CHECK FOR collection', collection);
                const wallet = data?._to?.toLowerCase();
                const StatusMessage = JSON.parse(data.status);
                console.log('CHECK FOR StatusMessage', StatusMessage);
                console.log('COLLECTION_CONTRACT_DETAILS', config.COLLECTION_CONTRACT_DETAILS);

                if (!wallet || !collection || !nftID || isEmpty(StatusMessage)) return;

                if (
                    [
                        config.COLLECTION_CONTRACT_DETAILS.planet.address,
                        config.COLLECTION_CONTRACT_DETAILS.astroid.address,
                    ].includes(collection)
                ) {
                    const planet = StatusMessage.planet;
                    if (!planet) return;

                    await eventcreatefromgameplanet(
                        {
                            planetId: planet.data._id,
                            collectionAddress: collection,
                            ipfs: planet.image_ipfs,
                            metaData: planet.metaKey,
                            network: CURRENT_NETWORK,
                            from: wallet,
                            type: 721,
                            name: planet.name,
                            walletAddress: wallet,
                        },
                        nftID,
                        hash,
                    );
                }

                if (config.COLLECTION_CONTRACT_DETAILS.ship.address === collection) {
                    const ship = StatusMessage.ship;
                    console.log('ship', ship);
                    if (ship?.isType === 'ship') {
                        //!  check and remove this console
                        console.log(ship?.data, 'CHECK FOR HEXID HERE ');
                        await eventcreateforgameShip(
                            {
                                shipId: ship.data._id,
                                ipfs: ship.image_ipfs,
                                metaData: ship.metaKey,
                                network: CURRENT_NETWORK,
                                type: 721,
                                name: ship.data.shipName,
                                walletAddress: wallet,
                                hexId: ship?.data?.hexId ?? 0,
                                costType: ship?.data?.costType,
                                optionalCost: ship?.data?.optionalCost,
                            },
                            nftID,
                            hash,
                        );
                    }
                }

                if (
                    [
                        config.COLLECTION_CONTRACT_DETAILS.crew.address,
                        // config.COLLECTION_CONTRACT_DETAILS.specialcrew.address,
                    ].includes(collection)
                ) {
                    const crew = StatusMessage.crew;
                    if (!crew) return;

                    await eventcreatecrewnft_v2(
                        {
                            crewId: crew.data._id,
                            ipfs: crew.image_ipfs,
                            metaData: crew.metaKey,
                            network: CURRENT_NETWORK,
                            name: crew.data.name,
                            walletAddress: wallet,
                        },
                        nftID,
                        collection,
                        hash,
                    );
                }
                if ([config.COLLECTION_CONTRACT_DETAILS.specialcrew.address].includes(collection)) {
                    const specialcrew = StatusMessage.specialcrew;
                    if (!specialcrew) return;

                    await eventcreatecrewnft_v2(
                        {
                            crewId: specialcrew.data._id,
                            ipfs: specialcrew.image_ipfs,
                            metaData: specialcrew.metaKey,
                            network: CURRENT_NETWORK,
                            name: specialcrew.data.name,
                            walletAddress: wallet,
                        },
                        nftID,
                        collection,
                        hash,
                    );
                }
            } catch (err) {
                logger.error('Event error', err);
            }
        })
        .on('error', (err) => logger.error('Web3 error', err));

    const withdrawContract = new web3.eth.Contract(
        withdrawABI,
        config.CHAIN_DETAILS[CURRENT_NETWORK].reward,
    );

    withdrawContract.events
        .Claim({ fromBlock: 'latest' })
        .on('connected', (id) => logger.info('Subscription for Claim event:', id))
        .on('data', async (event) => {
            if (event.event !== 'Claim') return;
            try {
                const hash = event.transactionHash;
                const data = event.returnValues;
                console.log('CHECK FOR withdrawdata', data);
                await eventWithdrawalDetails({
                    receiverAddress: data.receiver,
                    tokenAddress: data.token,
                    amount: data.amount,
                    transactionHash: hash,
                });
            } catch (err) {
                console.log('Event withdrawerror', err);
                logger.error('Event withdrawerror', err);
            }
        })
        .on('error', (err) => logger.error('Web3 error', err));
}

/* -------------------------------- START -------------------------------- */

async function startServer() {
    try {
        await mongoose.connect(config.MONGOURI);
        logger.info('MongoDB connected');
        require('./services/cron');

        const server = http.createServer(app);
        initSocket(server, whitelist);

        server.listen(config.PORT, () => {
            logger.info(`Server running on ${config.PORT}`);
        });

        // setTimeout(() => {
        //     getTokens()
        // }, 5000)

        getTokens();

        startWeb3Listener();
    } catch (err) {
        logger.error('Startup error', err);
    }
}

startServer();
