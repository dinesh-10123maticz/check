# Knowledge Transfer (KT) Document – Galfi Backend

## 1. Project Overview

**Project Name:** Galfi Backend
**Repository:** galfi-staging-backend
**Author:** Kamesh (maticz)
**Version:** 1.0.0
**Description:** Node.js/Express REST API server powering the Galfi NFT GameFi platform – a play-to-earn ecosystem with an NFT marketplace, in-game economy, missions, swap, and admin panel.

---

## 2. Platform Modules

| Module            | Description                                                                     |
| ----------------- | ------------------------------------------------------------------------------- |
| NFT Marketplace   | Mint, list, buy, bid, and trade NFTs (planets, ships, crew,sp crew , asteroids) |
| Game              | Planet management, crew system, ship system, building system, missions          |
| Exchange (Swap)   | In-platform token swap, staking, currency pool                                  |
| Promotion         | Blogs, news, partners, publishing management                                    |
| User              | Wallet-based authentication, referrals, activity feed                           |
| Admin             | Admin login, CMS, game settings management                                      |
| Shop              | In-game shop items                                                              |
| Category          | NFT categories and sub-categories                                               |
| Amount Conversion | On-chain price/amount conversion via DEX router                                 |
| Chat              | Real-time chat via Socket.IO                                                    |
| Missions          | Mission system, explored planets, rewards                                       |
| Sync              | Blockchain event sync utilities                                                 |
| Scripts           | Seed data scripts (professions, planets, crews, ships)                          |
| Migration         | Dev-only data migration routes                                                  |

---

## 3. Technology Stack

| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| Runtime      | Node.js v20+                                     |
| Framework    | Express.js v4                                    |
| Database     | MongoDB (via Mongoose v8)                        |
| Cache        | Redis v5                                         |
| Blockchain   | Web3.js v1.4 (Sepolia testnet / Polygon mainnet) |
| Real-time    | Socket.IO v4                                     |
| File Storage | AWS S3 + AWS CloudFront CDN                      |
| IPFS         | Pinata (images) + AWS S3 IPFS bucket (metadata)  |
| Email        | Nodemailer + ZeptoMail SMTP                      |
| Scheduler    | node-cron                                        |
| Auth         | JWT (jsonwebtoken) + bcrypt                      |
| Encryption   | crypto-js (AES) for request/response payloads    |
| Validation   | Yup                                              |
| Transpiler   | Babel (ES modules → CommonJS)                    |
| Logger       | Winston                                          |
| Linter       | ESLint + Prettier                                |

---

## 4. Repository Structure

```
galfi-staging-backend/
├── app/                        # Feature modules
│   ├── admin/                  # Admin login + CMS
│   ├── amountConvertion/       # Price conversion helpers
│   ├── category/               # NFT category management
│   ├── chat/                   # Socket.IO chat
│   ├── exchange/               # Token swap / staking
│   ├── game/                   # Game logic (planet, ship, crew, missions)
│   ├── migration/              # Dev-only DB migration scripts
│   ├── missions/               # Mission system
│   ├── nft/                    # NFT marketplace
│   ├── proffersionReward/      # Profession reward system
│   ├── promotion/              # Blogs, news, partners
│   ├── scripts/                # Seed scripts
│   ├── shop/                   # In-game shop
│   ├── sync/                   # Chain sync utilities
│   └── user/                   # User management
├── config/
│   ├── config.js               # Central config (chains, contracts, keys)
│   └── ABI/                    # Smart contract ABIs
├── env/
│   ├── .env.local              # Local dev environment
│   ├── .env.stage              # Staging environment
│   └── .env.demo               # Demo environment
├── router/
│   └── routes.js               # Express route aggregator
├── services/
│   ├── aws.js                  # S3 upload/download helpers
│   ├── cron.js                 # Cron job runner
│   ├── cron.jobs.js            # Cron job definitions
│   ├── enc.service.js          # AES encrypt/decrypt
│   ├── ipfs.js                 # Pinata IPFS helpers
│   ├── logger.js               # Winston logger setup
│   └── redisclient.js          # Redis client init
├── shared/
│   ├── commonFunction.js       # Shared utilities - api response
│   ├── constant.js             # App-wide constants
│   ├── contract.js             # Smart contract interaction helpers
│   ├── credentialsetup.js      # Encryption helpers
│   ├── mongoosehelper.js       # Mongoose query helpers
│   └── web3Instance.js         # Web3 HTTP + WSS instances
├── utils/
│   ├── httpStatus.js           # HTTP status code constants
│   └── logger.js               # Logger export
├── refference/                 # Reference data and notes
├── backups/                    # ABI backups
├── babel_hook.js               # Babel transpile entry point
├── server.js                   # Application entry point
└── package.json
```

---

## 5. Environment Variables

All environment variables live in the `env/` folder. Copy the correct file for the target environment.

| Variable                     | Description                          |
| ---------------------------- | ------------------------------------ |
| `PORT`                       | HTTP server port (default 4000)      |
| `MONGOURI`                   | MongoDB connection string            |
| `SECRET_KEY`                 | JWT signing secret                   |
| `ADMIN_PRIVATE_KEY`          | Admin blockchain wallet private key  |
| `ADMIN_WALLET_ADDRESS`       | Admin blockchain wallet address      |
| `Decryptkey`                 | AES encryption/decryption key        |
| `AWS_Bucket`                 | S3 bucket name for assets            |
| `AWS_REGION`                 | AWS region                           |
| `AWS_CDN_URL`                | CloudFront CDN base URL              |
| `AWS_ACCESS_KEY_ID`          | AWS IAM access key                   |
| `AWS_SECRET_ACCESS_KEY`      | AWS IAM secret key                   |
| `AWS_IPFS_Bucket`            | S3 bucket name for IPFS metadata     |
| `AWS_IPFS_ACCESS_KEY_ID`     | AWS IAM access key for IPFS bucket   |
| `AWS_IPFS_SECRET_ACCESS_KEY` | AWS IAM secret key for IPFS bucket   |
| `pinata_api_key`             | Pinata API key for IPFS image upload |
| `pinata_ipfs_secret`         | Pinata API secret                    |
| `user`                       | ZeptoMail SMTP username              |
| `pass`                       | ZeptoMail SMTP password              |
| `adminmail`                  | Admin notification email address     |
| `SALT`                       | Salt value used for contract signing |

---

## 6. Smart Contracts

### 6.1 Contract Types

| Type                 | Count | Description                                |
| -------------------- | ----- | ------------------------------------------ |
| Trade contract       | 1     | Central marketplace/trade contract         |
| Collection contracts | 5     | Planet, Asteroid, Crew, Special Crew, Ship |
| Reward contract      | 1     | In-game reward distribution                |
| Token contracts      | 16    | GALFI, GFORCE, GFMNR, USDT, etc.           |

### 6.2 Collection Contract Addresses (Sepolia Testnet)

| Collection   | Symbol           | Address                                      |
| ------------ | ---------------- | -------------------------------------------- |
| Ship         | GALFISHIP        | `0x71411d7fee6941a8cb051985eda43262616faa2e` |
| Planet       | GALFIPLANET      | `0x5e6f4ba923921bcafbebb8d15dff35952c7d1811` |
| Asteroid     | GALFIASTEROID    | `0x793308709e833317f8fc3489e85c86e20db46067` |
| Crew         | GALFICREW        | `0xe4c26a714d72592c6eb307296dbdf0c411f3ee30` |
| Special Crew | GALFISPECIALCREW | `0xf1bf05ffdefd578518647109e2f40080d384d829` |

### 6.3 Key Contract Addresses (Sepolia)

| Contract             | Address                                      |
| -------------------- | -------------------------------------------- |
| Trade                | `0x54677298c49d19a2335aEf2B32ae3d643f9ccf1B` |
| Reward               | `0x8C0bd87F2A140C7887dAE8a345572E9b12F46675` |
| GALFI Token (Bridge) | `0x11Bfe96D08C5048975f6bd60Da59354ea1e85Add` |
| USDT Token           | `0xcAC08FB0C62b750B43732881f7660B30D5a11A83` |

---

## 7. Key Concepts to Know

### 7.1 Request/Response Encryption

All API requests and responses are AES-encrypted using `crypto-js`. The encryption key is set in the `Decryptkey` environment variable.

- Use `decryptRequest` middleware for incoming encrypted payloads.
- Use `sendResponse` (encrypted) or `sendRes` (plain) helpers to send responses.

### 7.2 JWT Authentication

Users authenticate via wallet signature. On successful auth, a JWT is issued. All protected routes verify the JWT via middleware.

### 7.3 IPFS + S3 Workflow

1. Assets (images) are stored in AWS S3 under `/original/` and `/compress/`.
2. Images are uploaded to Pinata IPFS for NFT metadata.
3. NFT metadata JSON is stored in a separate S3 bucket acting as an IPFS endpoint.

### 7.4 Web3 Event Listening

`server.js` subscribes to `Create` events on the Trade contract via WebSocket (WSS). When fired, it routes the event to the appropriate handler (`eventcreatefromgameplanet`, `eventcreateforgameShip`, `eventcreatecrewnft_v2`).

### 7.5 Cron Jobs

- Runs every 6 hours to update crypto prices (BNB, MATIC) from CryptoCompare API.
- Handles referral rewards via `CRON_REFFERAL()`.

### 7.6 CORS Whitelist

The CORS whitelist is defined in `server.js`. Add new frontend origins to `rawWhitelist` before deployment.

### 7.7 Production Restrictions

Routes under `/v1/migration` and `/v1/script` are protected by the `restrictProduction` middleware and will return `403` in a `production` environment.

---

## 8. Running the Project

```bash
# Install dependencies
npm install

# Local development (with nodemon)
npm start              # NODE_ENV=local

# Staging
npm run stage          # NODE_ENV=stage

# Demo
npm run demo           # NODE_ENV=demo

# Seed professions
npm run seed_professions

# Generate nearby planets
npm run createplanet
```

---

## 9. Production Checklist

Before going to production:

1. Update `CURRENT_NETWORK` in `config/config.js` (change from `sepolia` to `polygon` or the target network).
2. Update all collection contract addresses in `COLLECTION_CONTRACT_DETAILS`.
3. Update the trade and reward contract addresses for the production network.
4. Update the admin wallet address.
5. Whitelist all token and collection contracts on the Trade contract.
6. Add the reward contract to the trade contract configuration.
7. Set the correct admin address on the trade contract.
8. Update the CORS `rawWhitelist` in `server.js` with production URLs.
9. Use `.env.prod` (or appropriate production env file) with real secrets.
10. Never commit `.env` files with real secrets.

---

## 10. Asset Management

- All game assets (images) are stored on AWS S3.
- There are two variants: `original/` and `compress/` ( optimised by a Go script).
- A separate S3 bucket is used for IPFS metadata storage.
- Pinata is used for storing NFT images on IPFS.
- A label script is used to generate rarity-based images (common, uncommon, rare) from base vector images.

---

## 11. Known Notes & Gotchas

- The `!hide` comment in `config.js` marks items that must be removed or secured before production.
- `console.log` calls marked `//! check and remove this console` must be cleaned up before production.
- `cron.jobs.js` imports reference incorrect relative paths (`./app/…` instead of `../app/…`) — verify before enabling.
- The `CURRENT_NETWORK` constant is set to `sepolia` by default — must be changed for production.
- `web3Instance.js` RPC URLs must be checked and updated with production-grade providers.
- Default royalty is set to `5%` (`DEFAULT_ROYALTY: 5`) in config.

---

## 12. Contacts & Ownership

| Role               | Name              |
| ------------------ | ----------------- |
| Developer / Author | Kamesh            |
| Organisation       | Maticz            |
| Admin Email        | support@maticz.in |
