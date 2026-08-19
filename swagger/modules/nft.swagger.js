/**
 * @swagger
 * tags:
 *   - name: NFT Marketplace
 *     description: Explore, search, buy, sell & bid on NFTs (/v1/nft)
 *   - name: Collections
 *     description: NFT collections management (/v1/nft)
 */

/**
 * @swagger
 * /v1/nft/validatetokenname:
 *   post:
 *     summary: Check NFT name availability
 *     tags: [NFT Marketplace]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [NFTName]
 *             properties:
 *               NFTName: { type: string }
 *     responses:
 *       '200':
 *         description: Name is available
 *       '400':
 *         description: Name missing or already exists
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/createnft:
 *   post:
 *     summary: Create / mint a new NFT
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               CollectionNetwork: { type: string }
 *               CollectionName: { type: string }
 *               CollectionSymbol: { type: string }
 *               NFTId: { type: string }
 *               NFTName: { type: string }
 *               Category: { type: string }
 *               NFTDescription: { type: string }
 *               UnlockContent: { type: string }
 *               ContractAddress: { type: string }
 *               ContractType: { type: string }
 *               NFTRoyalty: { type: string }
 *               NFTProperties: { type: string, description: "JSON string" }
 *               NFTOrginalImage: { type: string, format: binary }
 *               NFTThumpImage: { type: string, format: binary }
 *               CompressedFile: { type: string, format: binary }
 *               CompressedThumbFile: { type: string, format: binary }
 *     responses:
 *       '201':
 *         description: NFT created
 */

/**
 * @swagger
 * /v1/nft/Tokenlistfunexplore:
 *   get:
 *     summary: Explore NFTs
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: query
 *         name: TabName
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: CustomUrl
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: filter
 *         schema: { type: string }
 *       - in: query
 *         name: pricerange
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: NFTs fetched
 */

/**
 * @swagger
 * /v1/nft/Tokenlistfuncollection:
 *   get:
 *     summary: Explore collection NFTs
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: query
 *         name: TabName
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: CustomUrl
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: filter
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Collection NFTs fetched
 */

/**
 * @swagger
 * /v1/nft/Tokenlistfunacution:
 *   get:
 *     summary: Explore auction NFTs
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: query
 *         name: TabName
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Auction NFTs fetched
 */

/**
 * @swagger
 * /v1/nft/SearchAction:
 *   get:
 *     summary: Search NFTs
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: Search keyword
 *       - in: query
 *         name: Classid
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Search results
 */

/**
 * @swagger
 * /v1/nft/findupdatebalance:
 *   post:
 *     summary: Update NFT owner balance after transfer
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NFTId: { type: string }
 *               NFTBalance: { type: number }
 *               NFTOwner: { type: string }
 *               Currentowner: { type: string }
 *               type: { type: string, description: "e.g. 721" }
 *               collectionAddress: { type: string }
 *     responses:
 *       '200':
 *         description: Balance updated
 */

/**
 * @swagger
 * /v1/nft/findOwners:
 *   get:
 *     summary: Find owners of an NFT
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: query
 *         name: NFTId
 *         schema: { type: string }
 *       - in: query
 *         name: ContractAddress
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Owners fetched
 */

/**
 * @swagger
 * /v1/nft/info:
 *   get:
 *     summary: Get NFT detail info
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: query
 *         name: Contract
 *         schema: { type: string }
 *       - in: query
 *         name: Owner
 *         schema: { type: string }
 *       - in: query
 *         name: Id
 *         schema: { type: string }
 *       - in: query
 *         name: TabName
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: MyAdd
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: NFT info fetched
 */

/**
 * @swagger
 * /v1/nft/myitemlist:
 *   post:
 *     summary: List user's NFT items
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TabName: { type: string }
 *               limit: { type: integer }
 *               page: { type: integer }
 *               CustomUrl: { type: string }
 *               WalletAddress: { type: string }
 *               NFTOwner: { type: string }
 *               from: { type: string }
 *               cursor: { type: string }
 *               filter: { type: string }
 *               CollectionSymbol: { type: string }
 *               Categoryname: { type: string }
 *               Type: { type: string }
 *               status: { type: string }
 *     responses:
 *       '200':
 *         description: Items fetched
 */

/**
 * @swagger
 * /v1/nft/CreateOrder:
 *   post:
 *     summary: Create a sell order for an NFT
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               click: { type: object }
 *               CollectionNetwork: { type: string }
 *               CollectionName: { type: string }
 *               CollectionSymbol: { type: string }
 *               NFTId: { type: string }
 *               NFTName: { type: string }
 *               Category: { type: string }
 *               NFTDescription: { type: string }
 *               ContractAddress: { type: string }
 *               ContractType: { type: string }
 *               NFTRoyalty: { type: string }
 *               NFTProperties: { type: array, items: { type: object } }
 *               NFTCreator: { type: string }
 *               NFTQuantity: { type: string }
 *               PutOnSale: { type: string }
 *               NFTOrginalImageIpfs: { type: string }
 *               NFTThumpImageIpfs: { type: string }
 *               MetaData: { type: string }
 *     responses:
 *       '200':
 *         description: Order created
 */

/**
 * @swagger
 * /v1/nft/BuyAccept:
 *   post:
 *     summary: Accept a buy offer
 *     tags: [NFT Marketplace]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item: { type: object }
 *               newOwner: { type: object }
 *     responses:
 *       '200':
 *         description: Buy accepted
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/BidAction:
 *   post:
 *     summary: Place a bid on an NFT
 *     tags: [NFT Marketplace]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity: { type: string }
 *               EmailId: { type: string }
 *               Category: { type: string }
 *               TokenBidderAddress: { type: string }
 *               CollectionNetwork: { type: string }
 *               TokenBidderAddress_Name: { type: string }
 *               HashValue: { type: string }
 *               TokenBidAmt: { type: number }
 *               ContractType: { type: string }
 *               ContractAddress: { type: string }
 *               NFTId: { type: string }
 *               from: { type: string }
 *               NFTOwner: { type: string }
 *               CoinName: { type: string }
 *               click: { type: object }
 *               NFTQuantity: { type: number }
 *     responses:
 *       '200':
 *         description: Bid placed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/CreateCollection:
 *   post:
 *     summary: Create an NFT collection
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               CollectionName: { type: string }
 *               CollectionSymbol: { type: string }
 *               CollectionBio: { type: string }
 *               Category: { type: string }
 *               CollectionType: { type: string }
 *               CollectionNetwork: { type: string }
 *               CollectionCreator: { type: string }
 *               CollectionContractAddress: { type: string }
 *               CollectionProfileImage: { type: string, format: binary }
 *               CollectionCoverImage: { type: string, format: binary }
 *     responses:
 *       '201':
 *         description: Collection created
 *       '409':
 *         description: Symbol already exists
 */

/**
 * @swagger
 * /v1/nft/CollectionByCreator:
 *   post:
 *     summary: List collections by creator
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Creator: { type: string }
 *               Type: { type: string }
 *               tab: { type: string }
 *               filter: { type: string }
 *               limit: { type: integer }
 *               page: { type: integer }
 *               from: { type: string }
 *               single: { type: string }
 *               symbol: { type: string }
 *               Categoryname: { type: string }
 *               type: { type: string }
 *               category: { type: string }
 *     responses:
 *       '200':
 *         description: Collections fetched
 */

/**
 * @swagger
 * /v1/nft/activity:
 *   get:
 *     summary: Get NFT activity feed
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: query
 *         name: TabName
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: CustomUrl
 *         schema: { type: string }
 *       - in: query
 *         name: WalletAddress
 *         schema: { type: string }
 *       - in: query
 *         name: NFTOwner
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: NFTid
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Activity fetched
 */

/**
 * @swagger
 * /v1/nft/Collectionlist:
 *   get:
 *     summary: List all collections
 *     tags: [Collections]
 *     responses:
 *       '200':
 *         description: Collections fetched
 */

/**
 * @swagger
 * /v1/nft/CollectionBySymbol:
 *   get:
 *     summary: Get collection by symbol
 *     tags: [Collections]
 *     parameters:
 *       - in: query
 *         name: CollectionSymbol
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Collection fetched
 */

/**
 * @swagger
 * /v1/nft/Collectionstatus:
 *   put:
 *     summary: Change collection status
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Status changed
 */

/**
 * @swagger
 * /v1/nft/editcollectionbycreator:
 *   post:
 *     summary: Edit collection by creator
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Collection updated
 */

/**
 * @swagger
 * /v1/nft/listcollectionnft:
 *   post:
 *     summary: List NFTs within a collection
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CollectionSymbol: { type: string }
 *               ContractAddress: { type: string }
 *               limit: { type: integer }
 *               page: { type: integer }
 *     responses:
 *       '200':
 *         description: NFTs fetched
 */

/**
 * @swagger
 * /v1/nft/nft_asset_info:
 *   post:
 *     summary: Get NFT asset info (crew / planet / ship)
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tokenId]
 *             properties:
 *               tokenId: { type: string }
 *     responses:
 *       '200':
 *         description: Asset info fetched
 *       '404':
 *         description: tokenId not found
 */

/**
 * @swagger
 * /v1/nft/createplanetnft:
 *   post:
 *     summary: Create planet NFT (game airdrop)
 *     tags: [NFT Marketplace]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planetId: { type: string }
 *               transactionHash: { type: string }
 *               collectionId: { type: string }
 *               mintType: { type: string }
 *               otherDatas: { type: object }
 *     responses:
 *       '200':
 *         description: Planet NFT created
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/createshipnft:
 *   post:
 *     summary: Create ship NFT (game airdrop)
 *     tags: [NFT Marketplace]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Ship NFT created
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/createcrewnft:
 *   post:
 *     summary: Create crew NFT (game airdrop)
 *     tags: [NFT Marketplace]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Crew NFT created
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/gamestorenft:
 *   post:
 *     summary: List NFTs in the game store
 *     tags: [NFT Marketplace]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collectionSymbol: { type: string }
 *               collectionType: { type: string }
 *               page: { type: integer }
 *               limit: { type: integer }
 *     responses:
 *       '200':
 *         description: Store NFTs fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/ownednfts:
 *   post:
 *     summary: List owned crew NFTs
 *     tags: [NFT Marketplace]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit: { type: integer }
 *               page: { type: integer }
 *               Categoryname: { type: string }
 *               type: { type: string }
 *     responses:
 *       '200':
 *         description: Owned NFTs fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/gamecollections:
 *   post:
 *     summary: List game collections by type
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string }
 *     responses:
 *       '200':
 *         description: Collections fetched
 */

/**
 * @swagger
 * /v1/nft/gamecrewnft:
 *   post:
 *     summary: Get crew NFT marketplace data
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress: { type: string }
 *               collectionAddress: { type: array, items: { type: string } }
 *               tab: { type: string }
 *               page: { type: integer }
 *               crewType: { type: array, items: { type: string } }
 *               limit: { type: integer }
 *     responses:
 *       '200':
 *         description: Crew NFT data fetched
 */

/**
 * @swagger
 * /v1/nft/sync:
 *   post:
 *     summary: Create metadata for user collection
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress: { type: string }
 *               collectionAddress: { type: array, items: { type: string } }
 *               collectionSymbol: { type: string }
 *     responses:
 *       '200':
 *         description: Metadata created
 *   put:
 *     summary: Update metadata for user collection
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Metadata updated
 */

/**
 * @swagger
 * /v1/nft/contract/sign:
 *   post:
 *     summary: Generate a contract signature (mint)
 *     tags: [NFT Marketplace]
 *     description: Body is wrapped in an encrypted `token` field (decryptGameRequest). Response is encrypted.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "Encrypted payload { walletAddress, message, nonce, mintType, assetId, tokenLabel, amount, collectionContractAddress }" }
 *     responses:
 *       '200':
 *         description: Signature generated
 */

/**
 * @swagger
 * /v1/nft/contract/sign_v2:
 *   post:
 *     summary: Generate a contract signature v2
 *     tags: [NFT Marketplace]
 *     description: Body is wrapped in an encrypted `token` field (decryptGameRequest). Response is encrypted.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "Encrypted payload { walletAddress, amount, message, nonce }" }
 *     responses:
 *       '200':
 *         description: Signature generated
 */
