# Project Handover Document – Galfi Backend

**Document Type:** Project Handover
**Project:** Galfi Backend (galfi-staging-backend)
**Prepared By:** Kamesh / Maticz
**Date:** 2026-02-25
**Status:** Staging / Pre-Production

---

## 1. Project Summary

Galfi is a **GameFi / NFT platform** built on blockchain technology. The backend is a Node.js/Express application that powers:

- An NFT marketplace for game assets (planets, ships, crew, asteroids)
- An in-game economy (token swap, staking, rewards, missions)
- An admin panel for platform management
- Real-time features (chat via Socket.IO)
- Blockchain integration (Ethereum/Polygon via Web3.js)

---

## 2. Repository Access

| Item           | Detail                               |
| -------------- | ------------------------------------ |
| Repository     | `maticz-admin/galfi-staging-backend` |
| Primary Branch | `main`                               |
| Language       | JavaScript (ES modules via Babel)    |
| Node Version   | v20+ (mandatory)                     |

---

## 3. Infrastructure & Services

### 3.1 Cloud Services

| Service        | Provider                 | Purpose                                       |
| -------------- | ------------------------ | --------------------------------------------- |
| Object Storage | AWS S3                   | Game assets, compressed images, IPFS metadata |
| CDN            | AWS CloudFront           | Asset delivery to frontend/game               |
| IPFS           | Pinata                   | NFT image IPFS pinning                        |
| Database       | MongoDB                  | Primary application database                  |
| Cache          | Redis                    | Session and data caching                      |
| Email          | ZeptoMail (SMTP)         | Transactional emails                          |
| Blockchain     | Infura (Sepolia/Polygon) | RPC and WSS node provider                     |

### 3.2 AWS Resources to Hand Over

| Resource                | Description                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| S3 Bucket (Assets)      | Contains all game images (`original/` and `compress/` prefixes)              |
| S3 Bucket (IPFS)        | Contains NFT metadata JSON files                                             |
| CloudFront Distribution | CDN serving S3 assets                                                        |
| IAM User/Keys           | `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (two sets — assets and IPFS) |

### 3.3 Blockchain Credentials to Hand Over

| Item                    | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| Admin Private Key       | Controls reward signing and contract admin functions |
| Admin Wallet Address    | On-chain admin address                               |
| Infura Project ID       | Used in RPC URLs in `config.js`                      |
| Pinata API Key + Secret | For IPFS image uploads                               |

### 3.4 Application Credentials to Hand Over

| Item                  | Description                         |
| --------------------- | ----------------------------------- |
| MongoDB URI           | Connection string for production DB |
| Redis URL/Password    | Cache connection                    |
| JWT Secret Key        | JWT signing key                     |
| AES Decryption Key    | Payload encryption key              |
| ZeptoMail Credentials | SMTP username and password          |

---

## 4. Smart Contracts

All smart contracts must be handed over with:

- Contract **source code** (Solidity)
- Deployment **addresses** (per network)
- Contract **ABIs** (JSON) — current ABIs are in `config/ABI/`
- **Owner/admin** private keys for each contract
- **Deployment scripts** (if any)

### 4.1 Contracts Summary

| Contract                | Type    | Network                           | Notes                                                          |
| ----------------------- | ------- | --------------------------------- | -------------------------------------------------------------- |
| Trade Contract          | Core    | Sepolia (staging), Polygon (prod) | Central marketplace; must whitelist collections and tokens     |
| Reward Contract         | Core    | Sepolia (staging), Polygon (prod) | Admin signs reward claims; add to Trade contract               |
| Planet Collection       | ERC-721 | Both                              | Owner must be Trade contract                                   |
| Asteroid Collection     | ERC-721 | Both                              | Owner must be Trade contract                                   |
| Ship Collection         | ERC-721 | Both                              | Owner must be Trade contract                                   |
| Crew Collection         | ERC-721 | Both                              | Owner must be Trade contract                                   |
| Special Crew Collection | ERC-721 | Both                              | Owner must be Trade contract                                   |
| Token Contracts (×16)   | ERC-20  | Both                              | GALFI, GFORCE, GFMNR, USDT, etc.; must be whitelisted on Trade |

### 4.2 Post-Deployment Contract Checklist

- [ ] Whitelist all 16 token contracts on the Trade contract
- [ ] Whitelist all 5 collection contracts on the Trade contract
- [ ] Set the Reward contract address on the Trade contract
- [ ] Set the correct admin wallet address on all contracts
- [ ] Verify collection contract owner is the Trade contract
- [ ] Update addresses in `config/config.js` and redeploy backend

---

## 5. Assets and Media

### 5.1 Game Assets

All game asset images are stored in S3. The full set should be migrated/backed up before handover:

- Planet images (common, uncommon, rare) — `original/` and `compress/`
- Ship images — `original/` and `compress/`
- Crew images — `original/` and `compress/`
- Asteroid images — `original/` and `compress/`
- Building images

A **hard drive backup** of all original assets should be provided alongside S3 access.

### 5.2 Asset Generation Scripts

Located in `refference/` and the developer's local machine:

- **Rename script** – renames numbered assets sequentially
- **Generate script** – generates assets in batches (e.g., 25–2500)
- **Compress script** – walks all asset folders, compresses to WebP, outputs to separate folder
- **Label script** – overlays rarity labels (common/uncommon/rare) on base vector images

These scripts should be transferred with the project.

---

## 6. Environment Configuration

### 6.1 Environments

| Environment | File             | Purpose                       |
| ----------- | ---------------- | ----------------------------- |
| Local       | `env/.env.local` | Developer local machine       |
| Staging     | `env/.env.stage` | Staging server (current)      |
| Demo        | `env/.env.demo`  | Demo environment              |
| Production  | `env/.env.prod`  | Production (to be configured) |

### 6.2 Handover of Secrets

Secrets must be transferred **out-of-band** (NOT via the repository). Recommended methods:

- Password manager (1Password, Bitwarden)
- Encrypted email
- Secure vault (AWS Secrets Manager, HashiCorp Vault)

The following must be provided to the receiving team:

- [ ] MongoDB connection strings (staging and production)
- [ ] Redis connection string
- [ ] JWT secret key
- [ ] AES encryption key
- [ ] Admin blockchain private key + wallet address
- [ ] AWS IAM access keys (assets and IPFS)
- [ ] Pinata API key and secret
- [ ] ZeptoMail SMTP credentials
- [ ] Infura project ID/API keys

---

## 7. Server / Hosting

| Item                 | To Be Provided                                  |
| -------------------- | ----------------------------------------------- |
| Server IP / Hostname | Staging and production server details           |
| SSH Access           | SSH key or credentials for server login         |
| Process Manager      | PM2 configuration / ecosystem file              |
| Reverse Proxy        | Nginx/Apache config (if applicable)             |
| SSL Certificate      | Cert details or Let's Encrypt config            |
| Firewall Rules       | Open ports: HTTP (80), HTTPS (443), Node (4000) |

---

## 8. Known Issues & Technical Debt

| Issue                                      | Location                         | Priority | Notes                                            |
| ------------------------------------------ | -------------------------------- | -------- | ------------------------------------------------ |
| Hardcoded Infura keys                      | `config/config.js`               | High     | Move to environment variables before production  |
| `console.log` debug statements             | `server.js`, various controllers | Medium   | Remove `//! check and remove this console` items |
| `cron.jobs.js` broken imports              | `services/cron.jobs.js`          | High     | Import paths use `./app/…` instead of `../app/…` |
| `CURRENT_NETWORK` is `sepolia`             | `config/config.js`               | Critical | Must be changed to `polygon` for production      |
| `SITE_URL` not defined in env example      | `config/config.js`               | Low      | Add to `.env` example                            |
| Referral reward cron runs on every startup | `cron.jobs.js`                   | Medium   | Review if this should be scheduled instead       |

---

## 9. Pending Work / Roadmap Items

| Feature                     | Status      | Notes                                   |
| --------------------------- | ----------- | --------------------------------------- |
| Launchpad                   | Coming Soon | Not yet implemented in backend          |
| Production deployment       | Pending     | Awaiting contract deployment to Polygon |
| Original image upload to S3 | Pending     | `GetOriginalImage` has a TODO comment   |
| Test suite                  | Not started | No automated tests currently            |
| API documentation           | Not started | Recommend Swagger/OpenAPI               |

---

## 10. Handover Checklist

### Technical Handover

- [ ] Repository access granted to receiving team
- [ ] All environment files (`.env.*`) provided securely
- [ ] MongoDB access (connection strings + credentials) transferred
- [ ] Redis access transferred
- [ ] AWS IAM credentials transferred (S3 assets + IPFS buckets)
- [ ] CloudFront distribution details transferred
- [ ] Pinata account access or API keys transferred
- [ ] ZeptoMail account access or SMTP credentials transferred
- [ ] Infura project access transferred
- [ ] Admin blockchain wallet (private key + address) transferred securely
- [ ] All 23 smart contract source files transferred
- [ ] Smart contract deployment details (addresses, networks) documented
- [ ] Smart contract ABIs in `config/ABI/` are up to date
- [ ] Server SSH access transferred
- [ ] PM2 configuration transferred
- [ ] Nginx/reverse proxy config transferred (if applicable)
- [ ] SSL certificate transferred or Let's Encrypt renewed

### Asset Handover

- [ ] Hard drive backup of all game assets provided
- [ ] S3 bucket access confirmed (assets + IPFS)
- [ ] Asset generation scripts transferred
- [ ] Compress and label scripts transferred

### Knowledge Transfer

- [ ] KT sessions completed with receiving team
- [ ] KT Document reviewed and acknowledged
- [ ] Workflow Document reviewed
- [ ] Technical Document reviewed
- [ ] Architecture Document reviewed
- [ ] Production checklist walkthrough completed
- [ ] Smart contract deployment and configuration walkthrough completed
- [ ] Cron job behaviour explained
- [ ] Web3 event listener explained
- [ ] Encryption/decryption mechanism explained

---

## 11. Support Period

After handover, a **support period** should be agreed upon during which the outgoing team is available for:

- Bug fixes related to pre-existing code
- Clarification on architecture/design decisions
- Emergency support during initial production deployment

**Recommended duration:** 2–4 weeks post-handover

---

## 12. Contacts

| Role                     | Name   | Contact           |
| ------------------------ | ------ | ----------------- |
| Developer / Project Lead | Kamesh | —                 |
| Organisation             | Maticz | support@maticz.in |
