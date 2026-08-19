# Architecture Document – Galfi Backend

## 1. Overview

This document describes the high-level and low-level architecture of the Galfi Backend system — a Node.js/Express application serving as the API, real-time, and blockchain integration layer for the Galfi GameFi platform.

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                                   │
│                                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │  NFT Frontend   │  │   Game Client   │  │   Admin Panel       │  │
│  │  (nft-stage.    │  │  (game-stage.   │  │  (galfiadmin.       │  │
│  │   galfi.io)     │  │   galfi.io)     │  │   maticz.in)        │  │
│  └────────┬────────┘  └───────┬─────────┘  └──────────┬──────────┘  │
└───────────┼────────────────────┼────────────────────────┼─────────────┘
            │  HTTP REST / JWT   │  Encrypted Payloads    │
            │◄───────────────────►────────────────────────►
┌───────────▼────────────────────▼────────────────────────▼─────────────┐
│                         APPLICATION TIER                                │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    GALFI BACKEND (Node.js / Express)               │  │
│  │                                                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │                    EXPRESS SERVER (server.js)                  │  │  │
│  │  │  CORS → Helmet → Compression → Morgan → Routes → Controllers  │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │  │
│  │  │  Socket.IO   │  │  Web3 WSS    │  │    Cron Scheduler        │ │  │
│  │  │  (Chat)      │  │  (Events)    │  │    (Price, Referral)     │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
            │               │               │              │
┌───────────▼───┐   ┌───────▼──────┐  ┌────▼──────┐  ┌───▼──────────────┐
│   MongoDB      │   │    Redis     │  │  AWS S3   │  │   Blockchain      │
│  (Primary DB) │   │   (Cache)    │  │  (Assets) │  │  Sepolia/Polygon  │
└───────────────┘   └──────────────┘  └───────────┘  └───────────────────┘
                                            │
                                   ┌────────▼────────┐
                                   │  CloudFront CDN  │
                                   │  (Asset Delivery)│
                                   └─────────────────┘
```

---

## 3. Application Layer Architecture

### 3.1 Module Structure

The application is organised as **vertical slices** — each feature module is self-contained with its own routes, controller, service, validation, and schemas.

```
app/
├── admin/          # Admin authentication + CMS management
├── amountConvertion/  # DEX price/amount conversion
├── category/       # NFT categories
├── chat/           # Real-time chat (Socket.IO)
├── exchange/       # Token swap + staking
├── game/           # Core game logic
│   ├── controller/ # Building, Crew, Game, Pack, Training
│   ├── services/   # Game helpers, NearbyPlanet, Pack, Training services
│   ├── schema/     # Asset, Crew, Level, Planet, Ship, Training, UserAssets…
│   └── validation/ # Pack validation
├── migration/      # Dev-only DB migrations
├── missions/       # Mission system
│   ├── schema/     # BattleStats, Explored, ExploredPlanets, MissionStatus…
│   └── services/   # ExploredPlanet service
├── nft/            # NFT marketplace
├── proffersionReward/ # Profession reward system
├── promotion/      # Blogs, news, partners
├── scripts/        # Seed data scripts
├── shop/           # In-game shop
├── sync/           # Blockchain sync utilities
└── user/           # User management
```

ignore :
old flow : game -> training (nft crew traning to level up ), pack ( mountains )

### 3.2 Layered Architecture per Module

```
HTTP Request
    │
    ▼
routes.js          ← Defines endpoints, applies middleware
    │
    ▼
*.controller.js    ← Parses request, calls service, sends response
    │
    ▼
*.service.js       ← Business logic, DB queries, external service calls
    │
    ▼
*.schema.js        ← Mongoose model definitions (database layer)
```

---

## 4. Data Flow Architecture

### 4.1 REST API Request Flow

```
Client Request (HTTPS)
    │
    ▼
[1] CORS Validation (origin whitelist check)
    │
    ▼
[2] Middleware Pipeline
    ├── express.json()          - Parse JSON body
    ├── express.urlencoded()    - Parse URL-encoded body
    ├── cookieParser()          - Parse cookies
    ├── compression()           - Gzip response
    ├── fileupload()            - Multipart file handling (20MB limit)
    ├── helmet()                - Security headers
    └── morgan()                - Request logging
    │
    ▼
[3] Route Matching (/v1/<module>/<endpoint>) // v1 issue on base path ( need to be in group path )
    │
    ▼
[4] Route Middleware (applied per route)
    ├── JWT auth middleware      - Verify bearer token
    ├── decryptRequest()         - AES decrypt request body
    ├── yupvalidate()            - Validate request body schema
    └── restrictProduction()     - Block in production (dev routes)
    │
    ▼
[5] Controller
    ├── Extract params/body
    ├── Call service layer
    └── Return response
    │
    ▼
[6] Service Layer
    ├── MongoDB queries (Mongoose)
    ├── Redis cache reads/writes
    ├── AWS S3 operations
    ├── Web3 contract calls
    └── External API calls (Pinata, CryptoCompare, etc.)
    │
    ▼
[7] Response
    ├── sendResponse()    - AES-encrypted JSON ( website )
    └── sendRes()         - Plain JSON without encrypt
    └── sendGameResponseEncrpted - for game encrypt response
    └── decryptRequest - decrpty for web request
    └── decryptGameRequest - decrpt for game request

```

### 4.2 WebSocket (Chat) Flow

```
Client ──WebSocket──► Socket.IO Server
                              │
                    [CORS origin validation]
                              │
                    [chatSocket(socket, io)]
                              │
              ┌───────────────┼───────────────┐
              │               │               │
          Send Msg       Join Room        Leave Room
              │               │               │
         Save to DB      Broadcast       Clean up
              │
         Emit to room
```

### 4.3 Blockchain Event Flow

```
Smart Contract (Trade)
        │
        │ `Create` event (WSS)
        ▼
Web3 WsInstance Subscription (server.js)
        │
        │ Parse event data:
        │  - tokenId
        │  - collection address
        │  - wallet address
        │  - status JSON payload
        ▼
Route to Handler:
  Planet/Asteroid   → eventcreatefromgameplanet()
  Ship              → eventcreateforgameShip()
  Crew/SpecialCrew  → eventcreatecrewnft_v2()
        │
        ▼
Handler:
  1. Validate event data
  2. Upload image to Pinata IPFS → get CID
  3. Generate metadata JSON → upload to IPFS S3
  4. Create Token document in MongoDB
  5. Create TokenOwner document in MongoDB
```

---

## 5. Database Architecture

### 5.1 MongoDB – Collections Map

```
galfi-db
├── users                 ← User accounts and profiles
├── usercurrencies        ← Per-user in-game token balances
├── activities            ← User activity/event feed // nft activity
├── tokens                ← All minted NFT tokens / 1
├── tokenowners           ← NFT ownership history / 1 1 new - qualti = 1
├── bids                  ← NFT bid records
├── collections           ← NFT collections metadata / 5 collections
├── collectionlikes       ← User likes on collections // ignore
├── cryptoprices          ← Live crypto price cache (BNB, MATIC) /ignore
├── planets               ← Game planet entities // 5k + 5k = 10k   //assset
├── nearbyplanets         ← Spatial planet relationships (hex grid) 4 * 50k hex = may be increatse rarity
├── ships                 ← Game ship entities // assset
├── crews                 ← Game crew entities //assset
├── assets                ← Game asset entities (buildings, items) // assset
├── userplanets           ← User ↔ Planet ownership
├── userships             ← User ↔ Ship ownership
├── userassets            ← User ↔ Asset ownership
├── levels                ← Ship/crew upgrade levels
├── trainings             ← Crew training records // ignore
├── packs                 ← Game item packs // ignore
├── missions              ← Mission definitions
├── missionstatuses       ← User mission progress
├── missionrewards        ← Mission reward records // 50 reward client sheet
├── battlestats           ← Battle statistics // ignore
├── exploredzones         ← User explored zones // ignore
├── exploredplanets       ← User explored planets
├── currencies            ← Supported token currencies // 16token + 1 currecy (sepolia / polygon ) + (1 usdt  )
├── tokenpools            ← DEX token liquidity pools
├── tokenstakes           ← Token staking records
├── transactions          ← Token exchange transactions
├── admins                ← Admin user accounts
├── gamesettings          ← Admin-configurable game settings
├── cms                   ← CMS content (terms, about, etc.)
├── collectiontypes       ← NFT collection type definitions
├── faqs                  ← FAQ content
├── roadmaps              ← Project roadmap items
├── categories            ← NFT category definitions
├── subcategories         ← NFT sub-categories // ignore
├── chats                 ← Chat messages
├── blogs                 ← Blog posts // cms promotional
├── news                  ← News articles // cms promotional
├── partners              ← Partner/sponsor entries
├── buildingpromotionals  ← Building promotional content // cms promotional
├── publishes             ← Publishing workflow records
└── subscribers           ← Email subscribers // check nft market place
```

### 5.2 Key Entity Relationships

```
User (walletAddress)
 ├──[1:N]── UserCurrency
 ├──[1:N]── Activity
 ├──[1:N]── UserPlanet ──[N:1]── Planet
 ├──[1:N]── UserShip ──[N:1]── Ship
 └──[1:N]── UserAsset ──[N:1]── Asset (Crew/Building)

Token (NFT)
 ├──[N:1]── Collection
 ├──[1:N]── TokenOwner (ownership history)
 └──[1:N]── Bid

Mission
 └──[1:N]── MissionStatus ──[N:1]── User

Exchange
 ├── Currency
 ├── TokenPool
 ├── TokenStake ──[N:1]── User
 └── Transaction ──[N:1]── User
```

---

## 6. Caching Architecture

Redis is used as a caching layer:

```
Request
    │
    ▼
Check Redis Cache
    ├── Cache HIT  → Return cached data
    └── Cache MISS → Query MongoDB → Store in Redis → Return data
```

**Cache invalidation** should occur on data mutation (create/update/delete) for the affected keys.

---

## 7. Security Architecture

```
Internet
    │
    ▼
[HTTPS / TLS termination at reverse proxy (Nginx)]
    │
    ▼
[CORS whitelist enforcement]
    │
    ▼
[Helmet HTTP security headers]
    │
    ▼
[JWT verification (protected routes)]
    │
    ▼
[AES payload decryption (game routes)]
    │
    ▼
[Yup input validation]
    │
    ▼
[Business logic + DB queries]
    │
    ▼
[AES payload encryption (game responses)]
    │
    ▼
[Compressed HTTPS response]
```

---

## 8. Blockchain Architecture

### 8.1 Contract Interaction Architecture

```
Backend (Web3.js)
    │
    ├──[HTTP RPC]──► Infura Node ──► Sepolia/Polygon Network
    │                                      │
    │                              Smart Contracts:
    │                              ├── Trade Contract
    │                              ├── Reward Contract
    │                              ├── 5× Collection ERC-721
    │                              └── 16× Token ERC-20
    │
    └──[WSS RPC]──► Infura Node ──► Event Subscription
                                   └── Trade::Create event
```

### 8.2 Supported Networks

| Network               | Role       | Chain ID | RPC Provider |
| --------------------- | ---------- | -------- | ------------ |
| Sepolia (ETH testnet) | Staging    | 11155111 | Infura       |
| Polygon (mainnet)     | Production | 137      | Infura       |

### 8.3 Contract Type Architecture

```
Trade Contract (Central)
    │
    ├── Whitelisted ERC-721 Collections
    │   ├── Planet Collection
    │   ├── Asteroid Collection
    │   ├── Ship Collection
    │   ├── Crew Collection
    │   └── Special Crew Collection
    │
    ├── Whitelisted ERC-20 Tokens (×16)
    │   ├── GALFI
    │   ├── GFORCE
    │   ├── GFMNR
    │   ├── USDT
    │   └── … (12 more)
    │
    └── Reward Contract
        └── Admin-signed claim verification
```

---

## 9. File Storage Architecture

```
AWS S3 (Assets Bucket)
    │
    ├── planets/
    │   ├── original/<filename>.<ext>
    │   └── compress/<filename>.webp
    ├── ships/
    │   ├── original/<filename>.<ext>
    │   └── compress/<filename>.webp
    ├── crew/
    │   ├── original/<filename>.<ext>
    │   └── compress/<filename>.webp
    └── asteroid/
        ├── original/<filename>.<ext>
        └── compress/<filename>.webp

AWS S3 (IPFS Metadata Bucket)
    └── metadata/<tokenId>.json    ← NFT metadata JSON

Pinata IPFS
    └── <CID>                      ← NFT images (immutable)

AWS CloudFront CDN
    └── https://<CDN_URL>/<s3-key> ← Public asset URLs
```

---

## 10. Deployment Architecture

### 10.1 Recommended Deployment Stack

```
                   [DNS]
                     │
                     ▼
              [SSL Certificate]
                     │
                     ▼
             [Nginx Reverse Proxy]
              (HTTPS → HTTP :4000)
                     │
                     ▼
            [PM2 Process Manager]
                     │
                     ▼
        [Node.js Application :4000]
        (babel_hook.js → server.js)
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       [MongoDB]             [Redis]
   (local or Atlas)    (local or ElastiCache)
```

### 10.2 Environment Topology

```
Development
└── Local machine → env/.env.local → MongoDB local → Redis local

Staging
└── Cloud server → env/.env.stage → MongoDB Atlas (UAT) → Redis

Production
└── Cloud server → env/.env.prod → MongoDB Atlas (PROD) → Redis
```

---

## 11. Scalability Considerations

| Concern            | Current State               | Recommendation                                           |
| ------------------ | --------------------------- | -------------------------------------------------------- |
| Horizontal scaling | Single instance             | Use PM2 cluster mode; add load balancer                  |
| Database           | Single MongoDB              | MongoDB Atlas with replica set                           |
| Cache              | Single Redis                | Redis Cluster or ElastiCache                             |
| WebSocket          | Single Socket.IO            | Add Redis adapter (`socket.io-redis`) for multi-instance |
| File uploads       | Uploaded to server, then S3 | Stream directly to S3 (avoid local disk)                 |
| Blockchain WSS     | Single subscription         | Add reconnection logic and heartbeat                     |
| Logging            | Winston to stdout           | Ship logs to CloudWatch or ELK Stack                     |

---

## 12. Component Dependency Diagram

```
server.js
    ├── config/config.js
    │       ├── shared/web3Instance.js
    │       └── config/ABI/*.json
    ├── router/routes.js
    │       ├── app/*/routes.js (×12 modules)
    │       │       ├── app/*/controller.js
    │       │       │       └── app/*/service.js
    │       │       │               └── app/*/schema/*.schema.js
    │       │       ├── app/*/validation.js
    │       │       └── shared/commonFunction.js
    │       └── shared/commonFunction.js (restrictProduction)
    ├── app/chat/chat.socket.js
    ├── app/nft/nft.controlller.js (event handlers)
    ├── services/redisclient.js
    ├── services/cron.js
    │       └── services/cron.jobs.js
    ├── services/aws.js
    ├── services/ipfs.js
    ├── services/enc.service.js
    └── utils/logger.js
```
