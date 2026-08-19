# Technical Document – Galfi Backend

## 1. Introduction

This document provides a detailed technical reference for the Galfi Backend application — a Node.js/Express REST API and real-time WebSocket server powering the Galfi GameFi / NFT platform.

---

## 2. System Architecture Overview

The backend follows a **modular MVC pattern** with the following layers:

```
┌───────────────────────────────────────────────────────┐
│                    CLIENT LAYER                        │
│  Frontend (React) / Game Client / Admin Panel          │
└──────────────────────┬────────────────────────────────┘
                       │  HTTP REST / WebSocket
┌──────────────────────▼────────────────────────────────┐
│                  EXPRESS SERVER                        │
│  CORS → Middleware → Router → Controller → Service     │
└──────────┬────────────────────────┬───────────────────┘
           │                        │
┌──────────▼──────────┐  ┌──────────▼──────────────────┐
│      MongoDB         │  │    External Services         │
│   (Mongoose ORM)    │  │  AWS S3 / CloudFront / IPFS  │
└─────────────────────┘  │  Pinata / ZeptoMail           │
                          │  CryptoCompare API            │
┌─────────────────────┐  └─────────────────────────────┘
│      Redis           │
│   (Cache / Session)  │  ┌─────────────────────────────┐
└─────────────────────┘  │   Blockchain (Web3 / WSS)    │
                          │   Sepolia / Polygon           │
                          └─────────────────────────────┘
```

---

## 3. Module Architecture

Each feature module under `app/` follows this structure:

```
<module>/
├── <module>.routes.js       # Express router – maps HTTP methods + paths to controllers
├── <module>.controller.js   # Controller – handles req/res, calls service layer
├── <module>.service.js      # Service – business logic, DB queries
├── <module>.validation.js   # Yup validation schemas
└── schema/
    └── <entity>.schema.js   # Mongoose schema/model definitions
```

---

## 4. Core Dependencies

| Package        | Version   | Purpose                               |
| -------------- | --------- | ------------------------------------- |
| `express`      | ^4.19.2   | HTTP server framework                 |
| `mongoose`     | ^8.3.0    | MongoDB ODM                           |
| `redis`        | ^5.8.2    | In-memory cache client                |
| `socket.io`    | ^4.7.2    | Real-time bidirectional communication |
| `web3`         | ^1.4.0    | Ethereum blockchain interaction       |
| `jsonwebtoken` | ^9.0.2    | JWT authentication tokens             |
| `bcrypt`       | ^5.1.1    | Password hashing                      |
| `crypto-js`    | ^4.2.0    | AES encryption for payloads           |
| `aws-sdk`      | ^2.1643.0 | AWS S3 file storage                   |
| `nodemailer`   | ^6.9.13   | Email (ZeptoMail SMTP)                |
| `node-cron`    | ^3.0.3    | Scheduled tasks                       |
| `helmet`       | ^7.1.0    | HTTP security headers                 |
| `compression`  | ^1.7.4    | Response gzip compression             |
| `cors`         | ^2.8.5    | Cross-Origin Resource Sharing         |
| `morgan`       | ^1.10.0   | HTTP request logging                  |
| `sharp`        | ^0.33.3   | Image processing/conversion           |
| `yup`          | ^1.4.0    | Request body validation               |
| `axios`        | ^1.6.8    | HTTP client (external API calls)      |
| `winston`      | ^3.17.0   | Structured logging                    |
| `@babel/core`  | ^7.24.4   | ES module transpilation               |
| `dotenv`       | ^16.4.5   | Environment variable loading          |

---

## 5. Server Initialisation Sequence

```
babel_hook.js
    └─► server.js
            1. Load dotenv (env/.env.<NODE_ENV>)
            2. Connect to MongoDB (mongoose.connect)
            3. Initialise Redis client (services/redisclient)
            4. Register cron jobs (services/cron)
            5. Start Web3 WSS event listener (Trade contract Create event)
            6. Create HTTP server
            7. Initialise Socket.IO (initSocket)
            8. Start HTTP server on PORT
```

---

## 6. Security Architecture

### 6.1 CORS

- Strict origin whitelist maintained in `server.js` (`rawWhitelist` array).
- Credentials (`cookies`) are allowed.
- Non-whitelisted origins receive a `403` CORS error.

### 6.2 Helmet

Helmet sets the following security headers:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Strict-Transport-Security`
- `X-XSS-Protection`
- `Content-Security-Policy`

`crossOriginResourcePolicy` is set to `false` to allow asset serving from CDN.

### 6.3 Authentication

- Wallet-based auth: users sign a nonce with their Ethereum wallet.
- JWT tokens are issued on successful authentication.
- All protected routes validate the JWT via auth middleware.

### 6.4 Payload Encryption

- All game API payloads are AES-encrypted using `crypto-js`.
- `decryptRequest` middleware decrypts incoming request bodies.
- `sendResponse` encrypts outgoing responses.
- Plain responses (`sendRes`) are used for non-game endpoints.

### 6.5 Environment Secrets

- Private keys, database URIs, and API keys are stored exclusively in `.env` files under `env/`.
- `.env` files are excluded from version control via `.gitignore`.

---

## 7. Database Design

### 7.1 Mongoose Configuration

- Strict mode enabled (default).
- Timestamps enabled on most schemas (`{ timestamps: true }`).
- All schemas use MongoDB ObjectId as the primary key.

### 7.2 Key Schema Relationships

```
User
 ├──► UserCurrency (1:many)
 ├──► Activity (1:many)
 └──► UserPlanet (1:many)

Token (NFT)
 ├──► TokenOwner (1:many)
 ├──► Bid (1:many)
 └──► Collection (many:1)

GamePlanet
 ├──► UserPlanet (1:many)
 ├──► NearByPlanet (1:many)
 └──► ExploredPlanet (1:many)

Ship
 └──► UserShip (1:many)

Crew
 └──► UserAsset (1:many)

Mission
 └──► MissionStatus (1:many)
 └──► MissionReward (1:many)
```

### 7.3 Indexing Recommendations

Indexes are defined within each schema. Key fields that should be indexed:

- `walletAddress` (User, TokenOwner)
- `collectionAddress` (Token, TokenOwner)
- `tokenId` (Token, TokenOwner)
- `status` (Token, Mission)
- `createdAt` (Activity, Transaction)

---

## 8. Blockchain Integration

### 8.1 Web3 Instance (`shared/web3Instance.js`)

Two Web3 instances are created:

- `web3Instance` – HTTP provider for sending transactions and queries.
- `web3WsInstance` – WebSocket provider for subscribing to contract events.

### 8.2 Supported Networks

| Network | Chain ID | Type            | Status             |
| ------- | -------- | --------------- | ------------------ |
| Sepolia | 11155111 | Testnet (ETH)   | Active (staging)   |
| Polygon | 137      | Mainnet (MATIC) | Ready (production) |

### 8.3 Contract Interaction Pattern

```javascript
// Reading from contract
const contract = new web3.eth.Contract(ABI, contractAddress);
const result = await contract.methods.methodName(params).call();

// Writing to contract (signed by admin)
const tx = contract.methods.methodName(params);
const gas = await tx.estimateGas({ from: adminWallet });
const signed = await web3.eth.accounts.signTransaction({...}, adminPrivateKey);
const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
```

### 8.4 Event Subscription

The server subscribes to the `Create` event on the Trade contract:

```javascript
contract.events
    .Create({ fromBlock: 'pending' })
    .on('data', async (event) => {
        /* handler */
    })
    .on('error', (err) => {
        /* error handler */
    });
```

---

## 9. AWS S3 Integration (`services/aws.js`)

### 9.1 Buckets

| Bucket Purpose        | Config Key        |
| --------------------- | ----------------- |
| Game assets (images)  | `AWS_Bucket`      |
| IPFS metadata storage | `AWS_IPFS_Bucket` |

### 9.2 S3 Key Conventions

| Path Pattern                     | Description                 |
| -------------------------------- | --------------------------- |
| `<category>/original/<filename>` | Original uncompressed asset |
| `<category>/compress/<filename>` | Compressed WebP asset       |

### 9.3 CloudFront CDN

All S3 URLs are served through AWS CloudFront. The CDN base URL is configured via `AWS_CDN_URL`. Use `signature_imageURL(key)` helper to generate CDN URLs.

---

## 10. IPFS Integration

### 10.1 Pinata (Image IPFS)

- Images are pinned to Pinata IPFS via API.
- Gateway: `https://gateway.pinata.cloud/ipfs/<CID>`
- Keys: `pinata_api_key`, `pinata_ipfs_secret`

### 10.2 S3-based IPFS (Metadata)

- NFT metadata JSON files are stored in the IPFS S3 bucket.
- This acts as a custom IPFS gateway for metadata retrieval.

---

## 11. Email Service

- Provider: ZeptoMail (SMTP)
- Host: `smtp.zeptomail.com`, Port: `465` (SSL)
- Sender: configured via `user` and `pass` env variables
- The `Node_Mailer` helper in `shared/commonFunction.js` handles all email sending.

---

## 12. Redis Cache

- Redis client is initialised in `services/redisclient.js`.
- Used for session data and caching frequently accessed data.
- Redis version: v5.x

---

## 13. Logging

Logging is handled by **Winston** (`utils/logger.js` and `services/logger.js`):

- Log levels: `error`, `warn`, `info`, `debug`
- HTTP request logs: Morgan middleware (method, URL, status, response time, body)
- Application logs: Winston (errors, startup events, blockchain events, cron events)

---

## 14. Validation Layer

All API inputs are validated using **Yup** schemas. The `yupvalidate` middleware wrapper is used as Express middleware:

```javascript
router.post('/endpoint', yupvalidate(validationSchema), controller);
```

---

## 15. Image Processing

Sharp is used for server-side image processing:

- Convert uploaded images to WebP format (`quality: 80`)
- Supports animated images
- Output saved locally before S3 upload

---

## 16. Babel Transpilation

The project uses ES module syntax (`import`/`export`) transpiled at runtime via Babel:

- Entry point: `babel_hook.js` (registers `@babel/register`)
- Presets: `@babel/preset-env`
- Plugin: `@babel/plugin-transform-runtime`

---

## 17. Error Handling Conventions

| Helper                                       | When to Use                                  |
| -------------------------------------------- | -------------------------------------------- |
| `sendResponse(res, status, bool, msg, data)` | Encrypted response (NFT/game endpoints)      |
| `sendRes(res, status, bool, msg, data)`      | Plain JSON response (admin/public endpoints) |
| `sendGameResponseEncrpted(...)`              | Game-specific encrypted response             |
| `catchresponse(res, error)`                  | Catch-all error handler in try/catch         |
| `ValidationResponse(res, ...)`               | Yup validation failure response              |

All `500` errors are logged via `logger.error` before sending the response.

---

## 18. Utility Functions (`shared/commonFunction.js`)

| Function                              | Description                                 |
| ------------------------------------- | ------------------------------------------- |
| `isEmpty(value)`                      | Checks for null/undefined/empty/zero values |
| `add_minutes(dt, minutes)`            | Adds minutes to a Date object               |
| `generateReferralCode(data)`          | Generates a GALFI referral code             |
| `calculatePecentagevalue(pct, total)` | Percentage calculation                      |
| `getAddresswithTypes(types, config)`  | Gets contract addresses by NFT type         |
| `getSymbolsWithTypes(types, config)`  | Gets contract symbols by NFT type           |
| `multiamount(array, time)`            | Multiplies amounts in array by time factor  |
| `toFixedNumber(x)`                    | Handles scientific notation in numbers      |
| `restrictProduction(req, res, next)`  | Blocks route in production environment      |
| `compress_file_upload(files)`         | Handles file compression pipeline           |
| `ipfs_add_for_meta(path)`             | Uploads S3 file to Pinata IPFS              |
| `saveIpfsData(url, path)`             | Fetches IPFS data and saves to S3           |
| `signature_imageURL(key)`             | Generates CloudFront CDN URL                |
