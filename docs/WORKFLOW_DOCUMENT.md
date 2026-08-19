# Workflow Document – Galfi Backend

## 1. Development Workflow

### 1.1 Environment Mapping

| Environment       | Branch      | npm Script                                 | .env File                          |
| ----------------- | ----------- | ------------------------------------------ | ---------------------------------- |
| Local development | `feature/*` | `npm start`                                | `env/.env.local`                   |
| Staging / Demo    | `staging`   | `npm run stage` or `npm run demo`          | `env/.env.stage` / `env/.env.demo` |
| Production        | `main`      | `node babel_hook.js` (NODE_ENV=production) | `env/.env.prod`                    |

---

## 2. Request Lifecycle

```
Client (Frontend / Game)
        │
        ▼
   CORS Check (whitelist in server.js)
        │
        ▼
   Express Middleware Stack
   (json, urlencoded, cookieParser, compression, helmet, fileupload, morgan)
        │
        ▼
   Route: /v1/<module>/<endpoint>
        │
        ▼
   Route-specific Middleware
   (JWT auth, decryptRequest, yupvalidate, restrictProduction)
        │
        ▼
   Controller
        │
        ▼
   Service (business logic)
        │
        ├──► MongoDB (via Mongoose)
        ├──► Redis (cache)
        ├──► AWS S3 / CloudFront
        ├──► Blockchain (Web3 / contract calls)
        └──► Pinata IPFS
        │
        ▼
   sendResponse / sendRes (optionally AES-encrypted)
        │
        ▼
   Client
```

---

## 3. API Route Structure

All routes are prefixed with `/v1`. //! this is wrong this version is base versioning need to change ()

| Route Prefix     | Module            | Notes                                          |
| ---------------- | ----------------- | ---------------------------------------------- |
| `/v1/user`       | User module       | Registration, login, profile, referral         |
| `/v1/nft`        | NFT module        | Mint, list, buy, bid, token details            |
| `/v1/admin`      | Admin login       | Admin authentication, game settings            |
| `/v1/cms`        | CMS               | FAQ, roadmap, planet CMS, collections          |
| `/v1/category`   | Category          | NFT category/subcategory CRUD                  |
| `/v1/game`       | Game              | Planet, ship, crew, building, packs, training  |
| `/v1/exchange`   | Exchange          | Token swap, staking, currency pool             |
| `/v1/mission`    | Missions          | Mission status, battle stats, explored planets |
| `/v1/shop`       | Shop              | In-game shop items                             |
| `/v1/promo`      | Promotion         | Blogs, news, partners, publish                 |
| `/v1/conversion` | Amount Conversion | Token price/amount conversions                 |
| `/v1/migration`  | Migration         | Dev/stage only – DB migrations                 |
| `/v1/script`     | Scripts           | Dev/stage only – seed scripts                  |

> **Note:** `/v1/migration` and `/v1/script` are blocked in production by `restrictProduction` middleware.

---

## 4. NFT Minting Workflow

```
1. User initiates mint on the frontend (calls smart contract directly)
        │
        ▼
2. Smart contract emits a `Create` event on the Trade contract
        │
        ▼
3. Backend Web3 WSS listener (server.js) receives the event
        │
        ▼
4. Event data is parsed:
   - tokenId, collection address, wallet address, status JSON
        │
        ▼
5. Route to handler based on collection address:
   ├── Planet / Asteroid  → eventcreatefromgameplanet()
   ├── Ship               → eventcreateforgameShip()
   └── Crew / SpecialCrew → eventcreatecrewnft_v2()
        │
        ▼
6. Handler:
   a. Validates data
   b. Uploads image to Pinata IPFS
   c. Stores metadata JSON to IPFS S3 bucket
   d. Creates NFT token record in MongoDB
        │
        ▼
7. NFT is now queryable via /v1/nft endpoints
```

---

## 5. User Authentication Workflow

```
1. User connects wallet (MetaMask / WalletConnect)
        │
        ▼
2. Frontend requests a nonce from backend
   POST /v1/user/getnonce  { walletAddress }
        │
        ▼
3. Backend generates and stores a nonce in the user record
        │
        ▼
4. Frontend signs the nonce with the user's private key
        │
        ▼
5. Frontend sends signed message to backend
   POST /v1/user/login  { walletAddress, signature }
        │
        ▼
6. Backend verifies signature using Web3 (recover address)
        │
        ▼
7. On success: JWT is issued and returned to client
        │
        ▼
8. Client sends JWT in Authorization header for protected routes
```

---

## 6. Asset Upload Workflow

```
1. Client sends multipart/form-data request with image file
        │
        ▼
2. express-fileupload parses the file (limit: 20 MB)
        │
        ▼
3. Controller calls ImageAddFunc or similar helper
        │
        ▼
4. File is processed by Sharp (WebP conversion, compression)
        │
        ▼
5. Original image uploaded to S3 bucket: /original/<path>
   Compressed image uploaded to S3 bucket: /compress/<path>
        │
        ▼
6. CloudFront CDN URL is returned and stored in MongoDB
        │
        ▼
7. (For NFTs) Image is additionally pinned to Pinata IPFS
   → Returns IPFS CID / gateway URL
```

---

## 7. Cron Job Workflow

Cron jobs are initialised in `services/cron.js` and defined in `services/cron.jobs.js`.

| Job                 | Schedule                      | Description                                                                                        |
| ------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| Crypto Price Update | Every 6 hours (`0 */6 * * *`) | Fetches BNB and MATIC prices from CryptoCompare API and updates the `cryptoprice` MongoDB document |
| Referral Reward     | On startup                    | Processes pending referral rewards via `CRON_REFFERAL()`                                           |

---

## 8. Real-Time Chat Workflow

```
1. Client connects via Socket.IO (WebSocket or polling fallback)
        │
        ▼
2. Server validates origin against CORS whitelist
        │
        ▼
3. Server emits `server_status` event confirming connection
        │
        ▼
4. `chatSocket` handler attaches chat event listeners:
   - Send message
   - Receive message
   - Room join/leave
        │
        ▼
5. Messages are stored in MongoDB (chat.schema)
        │
        ▼
6. Messages are broadcast to room participants in real-time
```

## 10. Database Workflow

### 10.1 MongoDB Collections

| Collection        | Module      | Schema File                 |
| ----------------- | ----------- | --------------------------- |
| `users`           | User        | `user.schema.js`            |
| `tokens`          | NFT         | `token.schema.js`           |
| `tokenowners`     | NFT         | `tokenowner.schema.js`      |
| `bids`            | NFT         | `bid.schema.js`             |
| `collections`     | NFT / Admin | `collection.schema.js`      |
| `planets`         | Game        | `planet.schema.js`          |
| `ships`           | Game        | `ship.schema.js`            |
| `crews`           | Game        | `crew.schema.js`            |
| `assets`          | Game        | `asset.schema.js`           |
| `userplanets`     | Game        | `userplanet.schema.js`      |
| `userships`       | Game        | `userShip.schema.js`        |
| `userassets`      | Game        | `userAssets.schema.js`      |
| `missions`        | Missions    | `missionStatus.schema.js`   |
| `exploredplanets` | Missions    | `exploredPlanets.schema.js` |
| `currencies`      | Exchange    | `currency.schema.js`        |
| `tokenstakes`     | Exchange    | `tokenstake.schema.js`      |
| `transcations`    | Exchange    | `transcation.schema.js`     |
| `cryptoprices`    | NFT         | `cryptoprice.schema.js`     |
| `admins`          | Admin       | `admin.schema.js`           |
| `cms`             | CMS         | `cms.schema.js`             |
| `categories`      | Category    | `category.schema.js`        |
| `chats`           | Chat        | `chat.schema.js`            |
| `blogs`           | Promotion   | `blog.schema.js`            |

### 10.2 Data Migration

Dev-only migration routes are available at `/v1/migration` (blocked in production). Use these to transform or migrate data between environments. Scripts under `app/scripts/` can be run directly via npm scripts for seeding.

---

## 11. Code Review Checklist

Before merging any PR:

- [ ] No `console.log` statements (unless tagged for dev use)
- [ ] No hardcoded secrets or private keys
- [ ] Yup validation added for all new request bodies
- [ ] Responses use `sendResponse` (encrypted) or `sendRes` appropriately
- [ ] New routes registered in `router/routes.js`
- [ ] New schemas added with proper indexes
- [ ] CORS whitelist updated if a new frontend origin is needed
- [ ] `.env` example updated if new environment variables are added
- [ ] Production checklist items verified if contracts changed
