import dotenv from 'dotenv';
// require('dotenv').config();

// import ERC20 from './ABI/erc20.json';
// import TRADEABI from './ABI/trade.abi.json';
// import web3Client from '../shared/web3Instance';
const ERC20 = require('./ABI/erc20.json');
const TRADEABI = require('./ABI/trade.abi.json');
const web3Client = require('../shared/web3Instance').default;
// import Web3 from 'web3';
// import { x64 } from 'crypto-js';
//! hide -- on production
//! check for above key word

dotenv.config({ path: `./env/.env.${process.env.NODE_ENV}` });

export const CURRENT_NETWORK = 'sepolia';

const Envname = 'demo';
let COLLECTION_CONTRACT_DETAILS = {};

const origins = {
    local: [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:5500',
        'http://localhost:5501',
        'http://192.168.0.175:5500',
        'http://192.168.0.175:5501',
        'https://piehost.com',
    ],
    demo: [
        'https://galfi-nftmarktplace-frontend.pages.dev',
        'https://d3nhmhr3rydqgb.cloudfront.net',
        'https://galfi-game-adminpanel.pages.dev',
        'https://galfi-swap.pages.dev',
        'https://demo-game-galfi.maticz.in',
    ],
    staging: [
        'https://nft-stage.galfi.io',
        'https://game-stage.galfi.io',
        'https://admin-stage.galfi.io',
        'https://swap-stage.galfi.io',
    ],
    production: ['https://galfi.io'],
};

const NEAR_BY_PLANT_COUNT = {
    planet: {
        rare: 6,
        uncommon: 6,
        common: 5,
    },
    asteroid: {
        rare: 5,
        common: 4,
        uncommon: 4,
    },
    lowest: 4,
};

const PLANET_ASTROID_OFFSET = [
    {
        type: 'planet',
        rarities: [
            { name: 'common', count: 2500 },
            { name: 'uncommon', count: 1500 },
            { name: 'rare', count: 1000 },
        ],
    },
    {
        type: 'asteroid',
        rarities: [
            { name: 'common', count: 2500 },
            { name: 'uncommon', count: 1500 },
            { name: 'rare', count: 1000 },
        ],
    },

    //? FOR SCALING
    //   { name: "COMMON_V2", count: 100 },
    //   { name: "UNCOMMON_V2", count: 50 },
    //   { name: "RARE_V2", count: 100 },
];

let Key = {
    ORIGIN: Object.values(origins).flat(),
    ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY,
    ADMIN_PRIVATE_KEY_FOR_REWARD: process.env.ADMIN_PRIVATE_KEY_FOR_REWARD, //withdraw
    ADMIN_WALLETADDRRESS: process.env.ADMIN_WALLET_ADDRESS.toLowerCase(),
    AWS_Bucket: process.env.AWS_Bucket,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_CDN_URL: process.env.AWS_CDN_URL,
    IPFS_S3: {
        AWS_Bucket: process.env.AWS_IPFS_Bucket,
        AWS_ACCESS_KEY_ID: process.env.AWS_IPFS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_IPFS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_IPFS_REGION,
    },
    IPFS: {
        API_SECRET: process.env.pinata_ipfs_secret,
        API_KEY: process.env.pinata_api_key,
    },
    currencyNotforGamePlatform: ['ETH', 'MATIC'],
    currencyforNftPlatform: ['USDT', 'GALFI', 'ETH'], //['USDT', 'ETH', 'MATIC'],// ['USDT', 'GALFI', 'ETH', 'MATIC'],
    IPFS_IMG: 'https://gateway.pinata.cloud/ipfs/',
    SECRET_KEY: process.env.SECRET_KEY,
    salt: process.env.SALT,
    NFT_Token: ERC20,
    PORT: process.env.PORT,
    MONGOURI: process.env.MONGOURI,
    SECRET_KEY: process.env.SECRET_KEY,
    Encrypt_key: process.env.Decryptkey,
    DEFAULT_ROYALTY: 5,
    NEAR_BY_PLANT_COUNT: NEAR_BY_PLANT_COUNT,
    ZEROTH_ADDRESS: process.env.ZEROTH_ADDRESS,
    ROUTER_ADDRESS: process.env.ROUTER_ADDRESS,
    FACTORY_ADDRESS: process.env.FACTORY_ADDRESS,
    MULTICALL_ADDRESS: process.env.MULTICALL_ADDRESS,
    IMAGE_URL: process.env.ImgUrl,
    PRICING_API_KEY: process.env.PRICING_API_KEY,
};

//! dont change THE VALUE TYPE AND HANDLE

// ['0xA347d4C65cbBc05Ba574c937Bf96e8a1156De3E9','0x89a86bB78e128fC59efFD0417F5bCeE62627a9BD','0x1ab9C51dB5B5B15295C2eF138586dc774235C909','0xc9Cf4A8EC505C9FC3F00b989B0d5c5f61d5abe5e','0x665b8A0467A8F78dc78eA4E88b8592Df5F3984Ca']

if (Envname === 'local') {
    COLLECTION_CONTRACT_DETAILS = {
        ship: {
            displayName: 'Galfi Ship',
            address: '0x71411d7fee6941a8cb051985eda43262616faa2e',
            symbol: 'GALFISHIP',
            handle: 'SHIP',
            type: 'ship',
            collectionID: '667e91c21ea449904060390a',
        },
        planet: {
            displayName: 'Galfi Planet',
            address: '0x5e6f4ba923921bcafbebb8d15dff35952c7d1811', // old '0xc008e38663044bcd63f823bc0dbf609ff9ff3c79',
            symbol: 'GALFIPLANET', //PlanetCollection721
            handle: 'PLANET',
            type: 'planet',
            collectionID: '667e91d91ea449904060390f',
        },
        specialcrew: {
            displayName: 'Galfi Special Crew',
            address: '0xf1bf05ffdefd578518647109e2f40080d384d829',
            symbol: 'GALFISPECIALCREW',
            handle: 'SPECIALCREW',
            type: 'crew',
            collectionID: '69299745627f311dcb47bb39',
        },
        astroid: {
            displayName: 'Galfi Asteroid',
            address: '0x793308709e833317f8fc3489e85c86e20db46067',
            symbol: 'GALFIASTEROID',
            handle: 'ASTEROID',
            type: 'asteroid',
            collectionID: '6929971d627f311dcb47bb37',
        },
        crew: {
            displayName: 'Galfi Crew',
            address: '0xe4c26a714d72592c6eb307296dbdf0c411f3ee30',
            symbol: 'GALFICREW',
            handle: 'CREW',
            type: 'crew',
            collectionID: '6683e6aabdadba956a039102',
        },
    };

    Key = {
        //! chain one gona be matic another one is ethereum -- > pord
        //! must check the rpc in web3instance.js file
        ...Key,
        CHAIN_DETAILS: {
            sepolia: {
                name: 'sepolia',
                rpc_wss: 'wss://sepolia.infura.io/ws/v3/6bcc2d2f4a6e45de849563164d80ca26',
                rpc_http: 'https://eth-sepolia-testnet.api.pocket.network', //'https://sepolia.infura.io/v3/6bcc2d2f4a6e45de849563164d80ca26',
                chainId: 11155111,
                symbol: 'ETH',
                block_explorer: 'https://sepolia.etherscan.io/',
                web3Instance: web3Client.web3Instance,
                web3WsInstance: web3Client.web3WsInstance,
                reward: '0x924ebbcbd7483F2765F9E10f65247109f9fa4415', //staging // '0x736763EbA3C210D1dBEdAdBbFeEf86Ca8a066DdC', //demo
                trade: '0xb7765862A5ce4fc48AABBCcd2d0660D6330a6216', //staging //0x54677298c49d19a2335aEf2B32ae3d643f9ccf1B'//demo
                BRIDGE_TOKEN: '0x11Bfe96D08C5048975f6bd60Da59354ea1e85Add'.toLowerCase(), // GALFI
                USDT_TOKEN: '0xcAC08FB0C62b750B43732881f7660B30D5a11A83'.toLowerCase(), // USDT,
                coin: {
                    id: 'ethereum', // Use ETH price for Sepolia ETH
                    symbol: 'ETH',
                    decimals: 18,
                    testnet: true,
                    isToken: false,
                },
                token: {
                    id: 'tether', // Mocked / bridged USDT
                    symbol: 'USDT',
                    decimals: 6,
                    testnet: true,
                    isToken: true,
                },
            },
            polygon: {
                name: 'polygon',
                rpc_http: 'https://polygon-mainnet.infura.io/v3/6bcc2d2f4a6e45de849563164d80ca26', // Reliable public RPC
                rpc_wss: 'wss://polygon-mainnet.infura.io/ws/v3/6bcc2d2f4a6e45de849563164d80ca26',
                chainId: 137, // Polygon Mainnet
                symbol: 'MATIC',
                block_explorer: 'https://polygonscan.com/',
                web3Instance: web3Client.web3Instance,
                web3WsInstance: web3Client.web3WsInstance,
                reward: '0x8C0bd87F2A140C7887dAE8a345572E9b12F46675'.toLowerCase(), // Update these contract addresses for Polygon
                trade: '0x54677298c49d19a2335aEf2B32ae3d643f9ccf1B'.toLowerCase(),
                BRIDGE_TOKEN: '0x11Bfe96D08C5048975f6bd60Da59354ea1e85Add'.toLowerCase(), // Deploy & update GALFI contract
                USDT_TOKEN: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'.toLowerCase(), // Polygon USDT (WMATIC/USDT pair)
                coin: {
                    id: 'polygon', // Use MATIC price
                    symbol: 'MATIC',
                    decimals: 18,
                    testnet: false, // Mainnet
                },
                token: {
                    id: 'tether',
                    symbol: 'USDT',
                    decimals: 6,
                    testnet: false, // Mainnet
                },
            },
        },

        ABI: {
            TRADE: TRADEABI,
        },
        GALFISHIP: COLLECTION_CONTRACT_DETAILS.ship.symbol,
        GALFIPLANET: COLLECTION_CONTRACT_DETAILS.planet.symbol,
        GALFISPECIALCREW: COLLECTION_CONTRACT_DETAILS.specialcrew.symbol,
        GALFICREW: COLLECTION_CONTRACT_DETAILS.crew.symbol,
        GALFIASTEROID: COLLECTION_CONTRACT_DETAILS.astroid.symbol,
        COLLECTION_CONTRACT_DETAILS: COLLECTION_CONTRACT_DETAILS,
        PLANET_ASTROID_OFFSET: PLANET_ASTROID_OFFSET,
        adminmail: process.env.adminmail,
        keyEnvBased: {
            emailGateway: {
                fromMail: process.env.user,
                nodemailer: {
                    host: 'smtp.zeptomail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.user,
                        pass: process.env.pass,
                    },
                },
            },
        },
    };
}
if (Envname === 'demo') {
    COLLECTION_CONTRACT_DETAILS = {
        ship: {
            displayName: 'Galfi Ship',
            address: '0x95758302d4442af210b8eb6c1d956f149194e5c0', //'0x71411d7fee6941a8cb051985eda43262616faa2e',
            symbol: 'GALFISHIP',
            handle: 'SHIP',
            type: 'ship',
            collectionID: '667e91c21ea449904060390a',
        },
        planet: {
            displayName: 'Galfi Planet',
            address: '0xcb2f2950cd5c1386ddf41468970631b5a7ce84c9', //'0x5e6f4ba923921bcafbebb8d15dff35952c7d1811',
            symbol: 'GALFIPLANET', //PlanetCollection721
            handle: 'PLANET',
            type: 'planet',
            collectionID: '667e91d91ea449904060390f',
        },
        specialcrew: {
            displayName: 'Galfi Special Crew',
            address: '0x4ed381d26d4399fde7b63cf976a267be0843ee27', //'0xf1bf05ffdefd578518647109e2f40080d384d829',
            symbol: 'GALFISPECIALCREW',
            handle: 'SPECIALCREW',
            type: 'crew',
            collectionID: '69299745627f311dcb47bb39',
        },
        astroid: {
            displayName: 'Galfi Asteroid',
            address: '0xbfd9d09628c25a91abe21f280cc203f7694f5c32', //'0x793308709e833317f8fc3489e85c86e20db46067',
            symbol: 'GALFIASTEROID',
            handle: 'ASTEROID',
            type: 'asteroid',
            collectionID: '6929971d627f311dcb47bb37',
        },
        crew: {
            displayName: 'Galfi Crew',
            address: '0xc44afbaca29508d32b7f827575a143d115562af6', //'0xe4c26a714d72592c6eb307296dbdf0c411f3ee30',
            symbol: 'GALFICREW',
            handle: 'CREW',
            type: 'crew',
            collectionID: '6683e6aabdadba956a039102',
        },
    };

    Key = {
        ...Key,
        CHAIN_DETAILS: {
            sepolia: {
                name: 'sepolia',
                rpc_wss: 'wss://sepolia.infura.io/ws/v3/6bcc2d2f4a6e45de849563164d80ca26',
                rpc_http: 'https://eth-sepolia-testnet.api.pocket.network', //'https://sepolia.infura.io/v3/6bcc2d2f4a6e45de849563164d80ca26',
                chainId: 11155111,
                symbol: 'ETH',
                block_explorer: 'https://sepolia.etherscan.io/',
                web3Instance: web3Client.web3Instance,
                web3WsInstance: web3Client.web3WsInstance,
                reward: '0xB0f3995926c122d69ed83080A9D8Fc6eEA4df8F4', //'0x736763EbA3C210D1dBEdAdBbFeEf86Ca8a066DdC', //demo
                trade: '0x2d31f5fD55cF8C8c21c99B63d65aD75f0366D12E', //'0x54677298c49d19a2335aEf2B32ae3d643f9ccf1B',//demo
                BRIDGE_TOKEN: '0x11Bfe96D08C5048975f6bd60Da59354ea1e85Add'.toLowerCase(), // GALFI
                USDT_TOKEN: '0x44C0d623CB77b9053DBF321d475936E94F78610b'.toLowerCase(), // USDT,
                coin: {
                    id: 'ethereum', // Use ETH price for Sepolia ETH
                    symbol: 'ETH',
                    decimals: 18,
                    testnet: true,
                    isToken: false,
                },
                token: {
                    id: 'tether', // Mocked / bridged USDT
                    symbol: 'USDT',
                    decimals: 6,
                    testnet: true,
                    isToken: true,
                },
            },
            polygon: {
                name: 'polygon',
                rpc_http: 'https://polygon-mainnet.infura.io/v3/6bcc2d2f4a6e45de849563164d80ca26', // Reliable public RPC
                rpc_wss: 'wss://polygon-mainnet.infura.io/ws/v3/6bcc2d2f4a6e45de849563164d80ca26',
                chainId: 137, // Polygon Mainnet
                symbol: 'MATIC',
                block_explorer: 'https://polygonscan.com/',
                web3Instance: web3Client.web3Instance,
                web3WsInstance: web3Client.web3WsInstance,
                reward: '0x8C0bd87F2A140C7887dAE8a345572E9b12F46675'.toLowerCase(), // Update these contract addresses for Polygon
                trade: '0x54677298c49d19a2335aEf2B32ae3d643f9ccf1B'.toLowerCase(),
                BRIDGE_TOKEN: '0x11Bfe96D08C5048975f6bd60Da59354ea1e85Add'.toLowerCase(), // Deploy & update GALFI contract
                USDT_TOKEN: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'.toLowerCase(), // Polygon USDT (WMATIC/USDT pair)
                coin: {
                    id: 'polygon', // Use MATIC price
                    symbol: 'MATIC',
                    decimals: 18,
                    testnet: false, // Mainnet
                },
                token: {
                    id: 'tether',
                    symbol: 'USDT',
                    decimals: 6,
                    testnet: false, // Mainnet
                },
            },
        },

        ABI: {
            TRADE: TRADEABI,
        },
        GALFISHIP: COLLECTION_CONTRACT_DETAILS.ship.symbol,
        GALFIPLANET: COLLECTION_CONTRACT_DETAILS.planet.symbol,
        GALFISPECIALCREW: COLLECTION_CONTRACT_DETAILS.specialcrew.symbol,
        GALFICREW: COLLECTION_CONTRACT_DETAILS.crew.symbol,
        GALFIASTEROID: COLLECTION_CONTRACT_DETAILS.astroid.symbol,
        COLLECTION_CONTRACT_DETAILS: COLLECTION_CONTRACT_DETAILS,
        PLANET_ASTROID_OFFSET: PLANET_ASTROID_OFFSET,
        adminmail: process.env.adminmail,
        keyEnvBased: {
            emailGateway: {
                fromMail: process.env.user,
                nodemailer: {
                    host: 'smtp.zeptomail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.user,
                        pass: process.env.pass,
                    },
                },
            },
        },
    };
}

if (Envname === 'stage') {
    console.log('Envname', Envname);
    COLLECTION_CONTRACT_DETAILS = {
        ship: {
            displayName: 'Galfi Ship',
            address: '0xa347d4c65cbbc05ba574c937bf96e8a1156de3e9',
            symbol: 'GALFISHIP',
            handle: 'SHIP',
            type: 'ship',
            collectionID: '667e91c21ea449904060390a',
        },
        planet: {
            displayName: 'Galfi Planet',
            address: '0x89a86bb78e128fc59effd0417f5bcee62627a9bd', // old '0xc008e38663044bcd63f823bc0dbf609ff9ff3c79',
            symbol: 'GALFIPLANET', //PlanetCollection721
            handle: 'PLANET',
            type: 'planet',
            collectionID: '667e91d91ea449904060390f',
        },
        specialcrew: {
            displayName: 'Galfi Special Crew',
            address: '0x1ab9c51db5b5b15295c2ef138586dc774235c909',
            symbol: 'GALFISPECIALCREW',
            handle: 'SPECIALCREW',
            type: 'crew',
            collectionID: '69299745627f311dcb47bb39',
        },
        astroid: {
            displayName: 'Galfi Asteroid',
            address: '0xc9cf4a8ec505c9fc3f00b989b0d5c5f61d5abe5e',
            symbol: 'GALFIASTEROID',
            handle: 'ASTEROID',
            type: 'asteroid',
            collectionID: '6929971d627f311dcb47bb37',
        },
        crew: {
            displayName: 'Galfi Crew',
            address: '0x665b8a0467a8f78dc78ea4e88b8592df5f3984ca',
            symbol: 'GALFICREW',
            handle: 'CREW',
            type: 'crew',
            collectionID: '6683e6aabdadba956a039102',
        },
    };
    Key = {
        ...Key,
        CHAIN_DETAILS: {
            sepolia: {
                name: 'sepolia',
                rpc_wss: 'wss://sepolia.infura.io/ws/v3/6bcc2d2f4a6e45de849563164d80ca26',
                rpc_http: 'https://eth-sepolia-testnet.api.pocket.network', //'https://sepolia.infura.io/v3/6bcc2d2f4a6e45de849563164d80ca26',
                chainId: 11155111,
                symbol: 'ETH',
                block_explorer: 'https://sepolia.etherscan.io/',
                web3Instance: web3Client.web3Instance,
                web3WsInstance: web3Client.web3WsInstance,
                reward: '0x924ebbcbd7483F2765F9E10f65247109f9fa4415', //staging // '0x736763EbA3C210D1dBEdAdBbFeEf86Ca8a066DdC', //demo
                trade: '0xb7765862A5ce4fc48AABBCcd2d0660D6330a6216', //staging //0x54677298c49d19a2335aEf2B32ae3d643f9ccf1B'//demo
                BRIDGE_TOKEN: '0xF6d1C081E149123288d8b483da0058B631f9483c'.toLowerCase(), // GALFI
                USDT_TOKEN: '0xb16F1aE28d10db0433B079C757a14930715cE245'.toLowerCase(), // USDT,
                coin: {
                    id: 'ethereum', // Use ETH price for Sepolia ETH
                    symbol: 'ETH',
                    decimals: 18,
                    testnet: true,
                    isToken: false,
                },
                token: {
                    id: 'tether', // Mocked / bridged USDT
                    symbol: 'USDT',
                    decimals: 6,
                    testnet: true,
                    isToken: true,
                },
            },
            polygon: {
                name: 'polygon',
                rpc_http: 'https://polygon-mainnet.infura.io/v3/6bcc2d2f4a6e45de849563164d80ca26', // Reliable public RPC
                rpc_wss: 'wss://polygon-mainnet.infura.io/ws/v3/6bcc2d2f4a6e45de849563164d80ca26',
                chainId: 137, // Polygon Mainnet
                symbol: 'MATIC',
                block_explorer: 'https://polygonscan.com/',
                web3Instance: web3Client.web3Instance,
                web3WsInstance: web3Client.web3WsInstance,
                reward: '0x8C0bd87F2A140C7887dAE8a345572E9b12F46675'.toLowerCase(), // Update these contract addresses for Polygon
                trade: '0x54677298c49d19a2335aEf2B32ae3d643f9ccf1B'.toLowerCase(),
                BRIDGE_TOKEN: '0xF6d1C081E149123288d8b483da0058B631f9483c'.toLowerCase(), // Deploy & update GALFI contract
                USDT_TOKEN: '0xb16F1aE28d10db0433B079C757a14930715cE245'.toLowerCase(), // Polygon USDT (WMATIC/USDT pair)
                coin: {
                    id: 'polygon', // Use MATIC price
                    symbol: 'MATIC',
                    decimals: 18,
                    testnet: false, // Mainnet
                },
                token: {
                    id: 'tether',
                    symbol: 'USDT',
                    decimals: 6,
                    testnet: false, // Mainnet
                },
            },
        },

        ABI: {
            TRADE: TRADEABI,
        },
        GALFISHIP: COLLECTION_CONTRACT_DETAILS.ship.symbol,
        GALFIPLANET: COLLECTION_CONTRACT_DETAILS.planet.symbol,
        GALFISPECIALCREW: COLLECTION_CONTRACT_DETAILS.specialcrew.symbol,
        GALFICREW: COLLECTION_CONTRACT_DETAILS.crew.symbol,
        GALFIASTEROID: COLLECTION_CONTRACT_DETAILS.astroid.symbol,
        COLLECTION_CONTRACT_DETAILS: COLLECTION_CONTRACT_DETAILS,
        PLANET_ASTROID_OFFSET: PLANET_ASTROID_OFFSET,
        adminmail: process.env.adminmail,
        keyEnvBased: {
            emailGateway: {
                fromMail: process.env.user,
                nodemailer: {
                    host: 'smtp.zeptomail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.user,
                        pass: process.env.pass,
                    },
                },
            },
        },
    };
}

export default Key;
