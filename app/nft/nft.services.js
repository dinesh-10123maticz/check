import tokenSchema from './schema/token.schema';
import tokenowner from './schema/tokenowner.schema';
import {
    Aggregate,
    FindDocument,
    FindOneandupdate,
    SaveDocument,
} from '../../shared/mongoosehelper';
import collectionschema from './schema/collection.schema';
import activityschema from '../user/schema/activity.schema';
import bidschema from './schema/bid.schema';
import crewSchema from '../game/schema/crew.schema'
import CryptoPrice, { collection } from './schema/cryptoprice.schema';
import { generateRandomAlphabets, isEmpty } from '../../shared/commonFunction';
import { RedisGet, RedisSet } from '../../services/redisclient';
import logger from '../../utils/logger';
import config from '../../config/config';
const userdb = require('../user/schema/user.schema');
export const tokenAggregate = async (query) => {
    return await tokenSchema.aggregate(query);
};
export const tokenBulkWriteService = async (data) => {
    return await tokenSchema.bulkWrite(data);
};
export const tokenFindOne = async (data) => {
    return await tokenSchema.findOne(data);
};

export const updateManyToken = async (find, update) => {
    return await tokenSchema.updateMany(find, update);
};
export const userdb_findOneAndUpdate = async (find, update) => {
    await userdb.findOneAndUpdate(find, update);
};

export const tokenownerBulkWrite = async (data) => {
    return await tokenowner.bulkWrite(data);
};
export const activityBulkWrite = async (data) => {
    return await activityschema.bulkWrite(data);
};
export const FindToken = async (data) => {
    return await FindDocument(tokenSchema, data);
};

export const SaveToken = async (data) => {
    return await SaveDocument(tokenSchema, data);
};
export const FindOneBid = async (data) => {
    return await FindDocument(bidschema, data);
};

export const SaveBid = async (data) => {
    return await SaveDocument(bidschema, data);
};

export const FindOneBidandUpdata = async (find, update, save) => {
    return await FindOneandupdate(bidschema, find, update, save);
};

export const FindTokenOwners = async (find, select) => {
    return await FindDocument(tokenowner, find, select);
};
export const FindTokenownerandUpdate = async (find, update, save) => {
    return await FindOneandupdate(tokenowner, find, update, save);
};

export const tokenOwnerFindOne = async (data) => {
    return await tokenowner.findOne(data);
};
export const FindTokenandUpdate = async (find, update) => {
    return await FindOneandupdate(tokenSchema, find, update);
};
export const SaveTokenOwners = async (data) => {
    return await SaveDocument(tokenowner, data);
};
export const collectionget = async (data) => {
    return await collectionschema.find();
};

export const collectionstatus = async (id) => {
    const data = await collectionschema.findOne({ _id: id });
    return await collectionschema.findByIdAndUpdate(id, { isActive: data.isActive ? false : true });
};
export const FindCollectionandUpdate = async (find, update) => {
    return await FindOneandupdate(collectionschema, find, update);
};

export const FindCollection = async (find, select) => {
    return await FindDocument(collectionschema, find, select);
};
export const SaveCollection = async (data) => {
    return await SaveDocument(collectionschema, data);
};

export const findCrewData = async (data) => {
    return await crewSchema.findOne(data).select({ rarity: 1 }).lean()
};

export const collectionAggregate = async (data) => {
    const query = [
        {
            $match: data.Collection,
        },

        {
            $lookup: {
                from: 'tokens',
                // localField: "CollectionSymbol",
                // foreignField: "CollectionSymbol",
                let: { symbol: '$CollectionSymbol' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$CollectionSymbol', '$$symbol'] },
                        },
                    },
                    { $limit: 3 },
                    { $sort: { updatedAt: -1 } },
                    {
                        $lookup: {
                            from: 'tokenowners',
                            let: { tid: '$NFTId' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$$tid', '$NFTId'] } } },
                                { $sort: { updatedAt: -1 } },
                                { $limit: 1 },
                                {
                                    $project: {
                                        NFTOwner: 1,
                                        _id: 0,
                                    },
                                },
                            ],
                            as: 'TokenOwner',
                        },
                    },
                    { $unwind: '$TokenOwner' },
                    {
                        $project: {
                            NFTName: 1,
                            NFTOrginalImage: 1,
                            NFTThumpImage: 1,
                            CompressedFile: 1,
                            CompressedThumbFile: 1,
                            NFTId: 1,
                            NFTOwner: '$TokenOwner.NFTOwner',
                            Link: {
                                $concat: [
                                    '/info/',
                                    '$CollectionNetwork',
                                    '/',
                                    '$ContractAddress',
                                    '/',
                                    '$TokenOwner.NFTOwner',
                                    '/',
                                    '$NFTId',
                                ],
                            },
                        },
                    },
                ],
                as: 'field',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'CollectionCreator',
                foreignField: 'WalletAddress',
                as: 'userfield',
            },
        },
    ];
    return await Aggregate({ Query: query, DBName: collectionschema });
};

// tokenList
export const TokenList = async (data) => {
    const {
        ProfileUrl,
        limit,
        skip,
        tokenOwnerMatch,
        sort,
        TokenMatch,
        from,
        Tokens,
        TabName,
        filter,
    } = data;

    try {
        const Query = [
            {
                $match: TokenMatch,
            },
            {
                $lookup: {
                    from: 'users',
                    let: { proName: '$NFTCreator' },
                    pipeline: [{ $match: { $expr: { $eq: ['$WalletAddress', '$$proName'] } } }],
                    as: 'tokenCreator',
                },
            },
            {
                $unwind: {
                    path: '$tokenCreator',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'tokenowners',
                    let: { tId: '$NFTId' },
                    pipeline: [
                        { $match: tokenOwnerMatch },

                        {
                            $lookup: {
                                from: 'users',
                                let: { proName: '$NFTOwner' },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ['$WalletAddress', '$$proName'] } },
                                    },
                                ],
                                as: 'tokenowners_user',
                            },
                        },
                        {
                            $unwind: {
                                path: '$tokenowners_user',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: 'tokenowners_list',
                },
            },
            {
                $lookup: {
                    from: 'bids',
                    let: { id: '$NFTId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$NFTId', '$$id'] },
                                        { $ne: ['$PutOnSaleType', 'FixedPrice'] },
                                    ],
                                },
                            },
                        },
                        { $sort: { TokenBidAmt: -1 } },
                        { $limit: 1 },
                    ],
                    as: 'highbid',
                },
            },
            {
                $unwind: {
                    path: '$highbid',
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $unwind: '$tokenowners_list' },
            {
                $addFields: {
                    NFTPrice: {
                        $toDouble: {
                            $cond: {
                                if: { $eq: ['$tokenowners_list.NFTPrice', ''] },
                                then: '0',
                                else: '$tokenowners_list.NFTPrice',
                            },
                        },
                    },
                },
            },

            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    NFTId: 1,
                    NFTName: 1,
                    image_url: 1,
                    image_thumb_url: 1,
                    NFTOrginalImage: 1,
                    NFTThumpImage: 1,
                    CompressedFile: 1,
                    CompressedThumbFile: 1,
                    ContractAddress: 1,
                    ContractType: 1,
                    ContractName: 1,
                    NFTCreator: 1,
                    NFTRoyalty: 1,
                    updatedAt: 1,
                    LazyStatus: 1,
                    RandomName: 1,
                    NonceHash: 1,
                    SignatureHash: 1,
                    CollectionNetwork: 1,
                    NFTOwner: '$tokenowners_list.NFTOwner',
                    HashValue: '$tokenowners_list.HashValue',
                    PutOnSale: '$tokenowners_list.PutOnSale',
                    PutOnSaleType: '$tokenowners_list.PutOnSaleType',
                    NFTPrice: '$tokenowners_list.NFTPrice',
                    CoinName: '$tokenowners_list.CoinName',
                    NFTQuantity: '$tokenowners_list.NFTQuantity',
                    NFTBalance: '$tokenowners_list.NFTBalance',
                    ClockTime: '$tokenowners_list.ClockTime',
                    EndClockTime: '$tokenowners_list.EndClockTime',
                    LazyStatus: '$tokenowners_list.LazyStatus',
                    RandomName: '$tokenowners_list.RandomName',
                    NonceHash: '$tokenowners_list.NonceHash',
                    SignatureHash: '$tokenowners_list.SignatureHash',

                    DisplayName: {
                        $cond: {
                            if: { $ne: ['$tokenowners_list.tokenowners_user.DisplayName', ''] },
                            then: '$tokenowners_list.tokenowners_user.DisplayName',
                            else: {
                                $concat: [
                                    {
                                        $substr: [
                                            '$tokenowners_list.tokenowners_user.WalletAddress',
                                            0,
                                            3,
                                        ],
                                    },
                                    '...',
                                    {
                                        $substr: [
                                            '$tokenowners_list.tokenowners_user.WalletAddress',
                                            39,
                                            -1,
                                        ],
                                    },
                                ],
                            },
                        },
                    },

                    // DisplayName: "$tokenowners_list.tokenowners_user.DisplayName",
                    CustomUrl: '$tokenowners_list.tokenowners_user.CustomUrl',
                    WalletAddress: '$tokenowners_list.tokenowners_user.WalletAddress',
                    // Profile: "$tokenowners_list.tokenowners_user.Profile",
                    Cover: '$tokenowners_list.tokenowners_user.Cover',
                    Creator_DisplayName: {
                        $cond: {
                            if: { $ne: ['$tokenCreator.DisplayName', ''] },
                            then: '$tokenCreator.DisplayName',
                            else: {
                                $concat: [
                                    { $substr: ['$tokenCreator.WalletAddress', 0, 3] },
                                    '...',
                                    { $substr: ['$tokenCreator.WalletAddress', 39, -1] },
                                ],
                            },
                        },
                    },

                    Creator_DisplayName: '$tokenCreator.DisplayName',
                    Creator_CustomUrl: '$tokenCreator.CustomUrl',
                    Creator_WalletAddress: '$tokenCreator.WalletAddress',
                    Creator_Profile: '$tokenCreator.Profile',
                    Creator_Cover: '$tokenCreator.Cover',
                    TokenOwner_Name: '$tokenowners_list.TokenOwner_Name',
                    highbidamount: '$highbid.TokenBidAmt',
                    highbidcoin: '$highbid.CoinName',
                    bannerpromotion: '$tokenowners_list.bannerpromotion',
                },
            },
        ];

        return await tokenSchema.aggregate(Query);
    } catch (e) {
        logger.error(e);
        return false;
    }
};

export const exploreservice = async (TabName, limit, CustomUrl, page, from, filter) => {
    //  const {TabName, limit, CustomUrl, page, from , filter , pricerange} = data

    let SendDta = {};
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.CustomUrl = CustomUrl;
    SendDta.from = from;

    // const ownermatch =  !isEmpty(pricerange) ? [
    //   { $ne: ["$NFTBalance", "0"] },
    //   { $eq: ["$HideShow", "visible"] },
    //   { $eq: ["$NFTId", "$$tId"] },
    //   { $gte: ["$priceField", min] }, // Corrected syntax for $gte
    //   { $lte: ["$priceField", max] }  // Corrected syntax for $lte
    // ] : [
    //   { $ne: ["$NFTBalance", "0"] },
    //   { $eq: ["$HideShow", "visible"] },
    //   { $eq: ["$NFTId", "$$tId"] },
    // ]

    SendDta.tokenOwnerMatch = {
        $expr: {
            $and: [
                { $ne: ['$NFTBalance', '0'] },
                { $eq: ['$HideShow', 'visible'] },
                { $eq: ['$NFTId', '$$tId'] },
            ],
        },
    };
    let TabNames =
        TabName == 'All' ||
            TabName == 'LatestDrops' ||
            TabName == 'PriceLowToHigh' ||
            TabName == 'PriceHighToLow'
            ? ''
            : TabName;

    SendDta.TokenMatch = {
        Category: TabNames ? TabNames : { $ne: '' },
        reported: { $eq: false },
    };
    SendDta.sort = { 'tokenowners_list.updatedAt': -1 };
    if (filter === 'PriceLowToHigh') {
        SendDta.TokenMatch = {
            Category: TabNames ? TabNames : { $ne: '' },
            reported: { $eq: false },
        };
        SendDta.sort = { NFTPrice: 1 };
    }
    if (filter === 'PriceHighToLow') {
        SendDta.TokenMatch = {
            Category: TabNames ? TabNames : { $ne: '' },
            reported: { $eq: false },
        };
        SendDta.sort = { NFTPrice: -1 };
    }
    if (filter === 'oldest') {
        SendDta.sort = { 'tokenowners_list.updatedAt': 1 };
        SendDta.TokenMatch = { Category: TabNames ? TabNames : { $ne: '' } };
    }
    // this is for show the recently putonsale
    //   if (filter == "recentlisted") {
    //     SendDta.tokenOwnerMatch = {
    //       $expr: {
    //         $and: [
    //           { $ne: ["$NFTBalance", "0"] },

    //           { $eq: ["$HideShow", "visible"] },
    //           { $eq: ["$NFTId", "$$tId"] },
    //         ],
    //       },
    //     };
    //     SendDta.Activitymatch = {
    //       Category: TabNames ? TabNames : { $ne: "" },
    //       Type: { $ne: "Not For Sale" }
    //     }
    //   }
    if (filter == 'recentcreated') {
        SendDta.tokenOwnerMatch = {
            $expr: {
                $and: [
                    { $ne: ['$NFTBalance', '0'] },
                    { $eq: ['$HideShow', 'visible'] },
                    { $eq: ['$NFTId', '$$tId'] },
                ],
            },
        };
        SendDta.Activitymatch = {
            Category: TabNames ? TabNames : { $ne: '' },
            Activity: 'Mint',
        };
    }
    if (filter == 'recentsold') {
        SendDta.tokenOwnerMatch = {
            $expr: {
                $and: [
                    { $ne: ['$NFTBalance', '0'] },
                    { $eq: ['$HideShow', 'visible'] },
                    { $eq: ['$NFTId', '$$tId'] },
                ],
            },
        };
        SendDta.Activitymatch = {
            Category: TabNames ? TabNames : { $ne: '' },
            Activity: 'Buy',
        };
    }
    SendDta.filter = filter;
    if (SendDta.Activitymatch) {
        return await ExplorewithActivity(SendDta);
    } else {
        return await TokenList(SendDta);
    }
};

// export const exploretokenservice = async (data) => {

//   const { TabName, limit, CustomUrl, page, from, filter, collectionaddress, keywords, pricerange, type, category } = data
//   console.log("exploretokenservice", exploretokenservice)
//   let SendDta = {};
//   SendDta.limit = parseInt(limit) ?? 1;
//   SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
//   SendDta.CustomUrl = CustomUrl;
//   SendDta.from = from;
//   const prices = await CryptoPrice.find()

//   const bnbmin = Number(pricerange?.min) / prices[0]?.bnbPriceUSD
//   const bnbmax = Number(pricerange?.max) / prices[0]?.bnbPriceUSD

//   const maticmin = Number(pricerange?.min) / prices[0]?.maticPriceUSD
//   const maticmax = Number(pricerange?.max) / prices[0]?.maticPriceUSD

//   const ownermatch = (pricerange && !isNaN(maticmin)) ? [
//     { $ne: ["$NFTBalance", "0"] },
//     { $eq: ["$HideShow", "visible"] },
//     { $eq: ["$NFTId", "$$tId"] },
//     {
//       $or: [
//         { $and: [{ $eq: ["$CoinName", "ETH"] }, { $gte: [{ $toDouble: "$NFTPrice" }, bnbmin] }, { $lte: [{ $toDouble: "$NFTPrice" }, bnbmax] }] },
//         { $and: [{ $eq: ["$CoinName", "MATIC"] }, { $gte: [{ $toDouble: "$NFTPrice" }, maticmin] }, { $lte: [{ $toDouble: "$NFTPrice" }, maticmax] }] }
//       ]
//     }
//   ] : [
//     { $ne: ["$NFTBalance", "0"] },
//     { $eq: ["$HideShow", "visible"] },
//     { $eq: ["$NFTId", "$$tId"] },
//   ]

//   console.log("ownermatch", JSON.stringify(ownermatch), bnbmin, bnbmax)
//   SendDta.tokenOwnerMatch = {
//     $expr: {
//       $and:
//         ownermatch
//       // [
//       //   { $ne: ["$NFTBalance", "0"] },
//       //   { $eq: ["$HideShow", "visible"] },
//       //   { $eq: ["$NFTId", "$$tId"] },
//       // ]
//       ,
//     },
//   };
//   let TabNames =
//     TabName == "All" ||
//       TabName == "LatestDrops" ||
//       TabName == "PriceLowToHigh" ||
//       TabName == "PriceHighToLow"
//       ? ""
//       : TabName;

//   if (keywords) {

//     SendDta.TokenMatch = {
//       CollectionSymbol: collectionaddress,
//       Category: TabNames ? TabNames : { $ne: "" },
//       reported: { $eq: false },
//       NFTProperties: {
//         $elemMatch: { $or: keywords }
//       }
//     };

//   } else {

//     SendDta.TokenMatch = {
//       CollectionSymbol: collectionaddress,
//       Category: TabNames ? TabNames : { $ne: "" },
//       reported: { $eq: false },

//     };
//   }

//   SendDta.sort = { "tokenowners_list.updatedAt": -1 };
//   if (filter == "PriceLowToHigh") {
//     SendDta.TokenMatch = {
//       CollectionSymbol: collectionaddress,
//       Category: TabNames ? TabNames : { $ne: "" },
//       reported: { $eq: false }
//     };
//     SendDta.sort = { "NFTPrice": 1 };
//   }
//   if (filter == "PriceHighToLow") {
//     SendDta.TokenMatch = {
//       CollectionSymbol: collectionaddress,
//       Category: TabNames ? TabNames : { $ne: "" },
//       reported: { $eq: false }
//     };
//     SendDta.sort = { "NFTPrice": -1 };
//   }
//   if (filter == "oldest") {

//     SendDta.sort = { "tokenowners_list.updatedAt": 1 };
//     SendDta.TokenMatch = {
//       CollectionSymbol: collectionaddress,
//       Category: TabNames ? TabNames : { $ne: "" },
//     };
//   }
//   // this is for show the recently putonsale
//   //   if (filter == "recentlisted") {
//   //     SendDta.tokenOwnerMatch = {
//   //       $expr: {
//   //         $and: [
//   //           { $ne: ["$NFTBalance", "0"] },

//   //           { $eq: ["$HideShow", "visible"] },
//   //           { $eq: ["$NFTId", "$$tId"] },
//   //         ],
//   //       },
//   //     };
//   //     SendDta.Activitymatch = {
//   //       Category: TabNames ? TabNames : { $ne: "" },
//   //       Type: { $ne: "Not For Sale" }
//   //     }
//   //   }

//   //  if (filter == "recentcreated") {
//   //   SendDta.tokenOwnerMatch = {
//   //     $expr: {
//   //       $and: [
//   //         { $ne: ["$NFTBalance", "0"] },
//   //         { $eq: ["$HideShow", "visible"] },
//   //         { $eq: ["$NFTId", "$$tId"] },
//   //       ],
//   //     },
//   //   };
//   //   SendDta.Activitymatch = {
//   //     Category: TabNames ? TabNames : { $ne: "" },
//   //     Activity: "Mint"
//   //   };
//   // }
//   //  if (filter == "recentsold") {
//   //   SendDta.tokenOwnerMatch = {
//   //     $expr: {
//   //       $and: [
//   //         { $ne: ["$NFTBalance", "0"] },
//   //         { $eq: ["$HideShow", "visible"] },
//   //         { $eq: ["$NFTId", "$$tId"] },
//   //       ],
//   //     },
//   //   };
//   //   SendDta.Activitymatch = {
//   //     Category: TabNames ? TabNames : { $ne: "" },
//   //     Activity: "Buy"
//   //   };
//   // }
//   SendDta.filter = filter
//   if (SendDta.Activitymatch) {
//     return await ExplorewithActivity(SendDta)

//   } else {
//     return await TokenList(SendDta);
//   }

// }

export const exploretokenservice = async (data) => {
    const {
        TabName,
        limit,
        CustomUrl,
        page,
        from,
        filter,
        collectionaddress,
        keywords,
        pricerange,
        type,
        category,
    } = data;

    // Initialize SendDta object
    let SendDta = {
        limit: parseInt(limit) ?? 1,
        skip: ((page ? parseInt(page) : 1) - 1) * limit,
        CustomUrl,
        from,
    };

    // Fetch Crypto Prices
    const prices = await CryptoPrice.find();
    const bnbPrice = prices[0]?.bnbPriceUSD || 1;
    const maticPrice = prices[0]?.maticPriceUSD || 1;

    // Calculate price ranges in BNB and MATIC
    const bnbMin = Number(pricerange?.min) / bnbPrice;
    const bnbMax = Number(pricerange?.max) / bnbPrice;
    const maticMin = Number(pricerange?.min) / maticPrice;
    const maticMax = Number(pricerange?.max) / maticPrice;

    // Define Owner Match Conditions
    const ownerMatchBase = [
        { $ne: ['$NFTBalance', '0'] },
        { $eq: ['$HideShow', 'visible'] },
        { $eq: ['$NFTId', '$$tId'] },
    ];

    // const priceMatch = [
    //   {
    //     $and: [
    //       { $eq: ["$CoinName", "ETH"] },
    //       { $gte: [{ $toDouble: "$NFTPrice" }, bnbMin] },
    //       { $lte: [{ $toDouble: "$NFTPrice" }, bnbMax] }
    //     ]
    //   },
    //   {
    //     $and: [
    //       { $eq: ["$CoinName", "MATIC"] },
    //       { $gte: [{ $toDouble: "$NFTPrice" }, maticMin] },
    //       { $lte: [{ $toDouble: "$NFTPrice" }, maticMax] }
    //     ]
    //   }
    // ];

    SendDta.tokenOwnerMatch = {
        $expr: {
            // $and: pricerange && !isNaN(maticMin) ? [...ownerMatchBase, { $or: priceMatch }] : ownerMatchBase,
            $and: ownerMatchBase,
        },
    };

    // Define TabNames
    const TabNames = ['All', 'LatestDrops', 'PriceLowToHigh', 'PriceHighToLow'].includes(TabName)
        ? ''
        : TabName;

    // Define Token Match Conditions
    SendDta.TokenMatch = {
        CollectionSymbol: collectionaddress,
        Category: TabNames || { $ne: '' },
        reported: false,
        ...(type?.length > 0 && { crewGender: { $in: type } }),
        ...(category?.length > 0 && { nftCategory: { $in: category } }),
    };

    if (keywords) {
        SendDta.TokenMatch.NFTProperties = { $elemMatch: { $or: keywords } };
    }

    // Sorting Logic
    SendDta.sort = { 'tokenowners_list.updatedAt': -1 };

    if (filter === 'PriceLowToHigh') {
        SendDta.sort = { NFTPrice: 1 };
    } else if (filter === 'PriceHighToLow') {
        SendDta.sort = { NFTPrice: -1 };
    } else if (filter === 'oldest') {
        SendDta.sort = { 'tokenowners_list.updatedAt': 1 };
    }

    SendDta.filter = filter;

    // Determine API call based on Activity Match
    return SendDta.Activitymatch ? await ExplorewithActivity(SendDta) : await TokenList(SendDta);
};

export const ExplorewithActivity = async (data) => {
    const { Activitymatch, tokenOwnerMatch, skip, limit } = data;

    try {
        const Query = [
            {
                $match: Activitymatch,
            },
            {
                $group: {
                    _id: '$NFTId',
                    NFTId: { $last: '$NFTId' },
                    updatedAt: { $last: '$updatedAt' },
                },
            },
            {
                $lookup: {
                    from: 'tokens',
                    let: { nftid: '$NFTId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$$nftid', '$NFTId'] },
                                        { $eq: ['$reported', false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'NFT',
                },
            },
            { $unwind: '$NFT' },
            {
                $lookup: {
                    from: 'users',
                    let: { proName: '$NFT.NFTCreator' },
                    pipeline: [{ $match: { $expr: { $eq: ['$WalletAddress', '$$proName'] } } }],
                    as: 'tokenCreator',
                },
            },
            {
                $unwind: {
                    path: '$tokenCreator',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'tokenowners',
                    let: { tId: '$NFT.NFTId' },
                    pipeline: [{ $match: tokenOwnerMatch }],
                    as: 'tokenowners_list',
                },
            },
            {
                $unwind: '$tokenowners_list',
            },
            {
                $lookup: {
                    from: 'users',
                    let: { proName: '$tokenowners_list.NFTOwner' },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ['$WalletAddress', '$$proName'] } },
                        },
                    ],
                    as: 'tokenowners_user',
                },
            },
            {
                $unwind: {
                    path: '$tokenowners_user',
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $sort: { 'tokenowners_list.updatedAt': -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: '$NFT._id',
                    NFTId: '$NFT.NFTId',
                    NFTName: '$NFT.NFTName',
                    image_url: '$NFT.image_url',
                    image_thumb_url: '$NFT.image_thumb_url',
                    NFTOrginalImage: '$NFT.NFTOrginalImage',
                    NFTThumpImage: '$NFT.NFTThumpImage',
                    CompressedFile: '$NFT.CompressedFile',
                    CompressedThumbFile: '$NFT.CompressedThumbFile',
                    ContractAddress: '$NFT.ContractAddress',
                    ContractType: '$NFT.ContractType',
                    ContractName: '$NFT.ContractName',
                    NFTCreator: '$NFT.NFTCreator',
                    NFTRoyalty: '$NFT.NFTRoyalty',
                    updatedAt: '$NFT.updatedAt',
                    CollectionNetwork: '$NFT.CollectionNetwork',
                    NFTOwner: '$tokenowners_list.NFTOwner',
                    HashValue: '$tokenowners_list.HashValue',
                    PutOnSale: '$tokenowners_list.PutOnSale',
                    PutOnSaleType: '$tokenowners_list.PutOnSaleType',
                    NFTPrice: '$tokenowners_list.NFTPrice',
                    CoinName: '$tokenowners_list.CoinName',
                    NFTQuantity: '$tokenowners_list.NFTQuantity',
                    NFTBalance: '$tokenowners_list.NFTBalance',
                    ClockTime: '$tokenowners_list.ClockTime',
                    EndClockTime: '$tokenowners_list.EndClockTime',
                    DisplayName: {
                        $cond: {
                            if: { $ne: ['$tokenowners_list.tokenowners_user.DisplayName', ''] },
                            then: '$tokenowners_list.tokenowners_user.DisplayName',
                            else: {
                                $concat: [
                                    {
                                        $substr: [
                                            '$tokenowners_list.tokenowners_user.WalletAddress',
                                            0,
                                            3,
                                        ],
                                    },
                                    '...',
                                    {
                                        $substr: [
                                            '$tokenowners_list.tokenowners_user.WalletAddress',
                                            39,
                                            -1,
                                        ],
                                    },
                                ],
                            },
                        },
                    },

                    // DisplayName: "$tokenowners_list.tokenowners_user.DisplayName",
                    CustomUrl: '$tokenowners_list.tokenowners_user.CustomUrl',
                    WalletAddress: '$tokenowners_list.tokenowners_user.WalletAddress',
                    // Profile: "$tokenowners_list.tokenowners_user.Profile",
                    Cover: '$tokenowners_list.tokenowners_user.Cover',
                    Creator_DisplayName: {
                        $cond: {
                            if: { $ne: ['$tokenCreator.DisplayName', ''] },
                            then: '$tokenCreator.DisplayName',
                            else: {
                                $concat: [
                                    { $substr: ['$tokenCreator.WalletAddress', 0, 3] },
                                    '...',
                                    { $substr: ['$tokenCreator.WalletAddress', 39, -1] },
                                ],
                            },
                        },
                    },

                    Creator_DisplayName: '$tokenCreator.DisplayName',
                    Creator_CustomUrl: '$tokenCreator.CustomUrl',
                    Creator_WalletAddress: '$tokenCreator.WalletAddress',
                    Creator_Profile: '$tokenCreator.Profile',
                    Creator_Cover: '$tokenCreator.Cover',
                    TokenOwner_Name: '$tokenowners_list.TokenOwner_Name',
                    highbidamount: '$highbid.TokenBidAmt',
                    highbidcoin: '$highbid.CoinName',
                    cur_owner_DisplayName: '$tokenowners_user.DisplayName',
                    cur_owner_Profile: '$tokenowners_user.Profile',
                    cur_owner_CustomUrl: '$tokenowners_user.CustomUrl',
                    // Counts: { $cond: { if: { $isArray: "$TokenOwnerDetails" }, then: { $size: "$TokenOwnerDetails" }, else: 0} }
                },
            },
        ];

        const data = await Aggregate({ Query: Query, DBName: activityschema });

        return data;
    } catch (e) {
        logger.error(e);
        return false;
    }
};

export const explorecollectionservice = async (TabName, limit, CustomUrl, page, from, filter) => {
    let SendDta = {};
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.CustomUrl = CustomUrl;
    SendDta.from = from;

    SendDta.tokenOwnerMatch = {
        $expr: {
            $and: [
                { $ne: ['$NFTBalance', '0'] },
                // { '$eq':['$Status', 'list' ]},
                { $eq: ['$HideShow', 'visible'] },
                { $eq: ['$NFTId', '$$tId'] },
            ],
        },
    };
    if (TabName == 'LTH') {
        SendDta.TokenMatch = {
            reported: { $eq: false },
            CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { NFTPrice: 1 };
    } else if (TabName == 'HTL') {
        SendDta.TokenMatch = {
            reported: { $eq: false },
            CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { NFTPrice: -1 };
    } else if (TabName == 'OLD') {
        SendDta.TokenMatch = {
            reported: { $eq: false },
            CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { 'tokenowners_list.upadatedAt': 1 };
    } else if (TabName == 'NOW') {
        SendDta.TokenMatch = {
            reported: { $eq: false },
            CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { 'tokenowners_list.upadatedAt': -1 };
    } else if (TabName == 'new') {
        SendDta.TokenMatch = {
            reported: { $eq: false },
            CollectionSymbol: { $eq: CollectionSymbol },
        };
    } else {
        var TabNames =
            TabName == 'All' ||
                TabName == 'LatestDrops' ||
                TabName == 'PriceLowToHigh' ||
                TabName == 'PriceHighToLow'
                ? ''
                : TabName;
        SendDta.TokenMatch = {
            Category: TabNames ? TabNames : { $ne: '' },
            reported: { $eq: false },
            CollectionSymbol: { $eq: CollectionSymbol },
        };
        SendDta.sort = { 'tokenowners_list.updatedAt': -1 };
    }

    return await TokenList(SendDta);
};

export const exploreauctionService = async (data) => {
    const { TabName, limit, CustomUrl, page, from, CollectionSymbol, filter } = data;
    var SendDta = {};
    SendDta.limit = parseInt(limit) ?? 1;
    SendDta.skip = ((page ? parseInt(page) : 1) - 1) * limit;
    SendDta.CustomUrl = CustomUrl;
    SendDta.from = from;
    SendDta.tokenOwnerMatch = {
        $expr: {
            $and: [
                { $ne: ['$NFTBalance', '0'] },
                { $eq: ['$HideShow', 'visible'] },
                { $eq: ['$NFTId', '$$tId'] },
                { $eq: ['$PutOnSaleType', 'TimedAuction'] },
                { $gt: ['$EndClockTime', new Date()] },
                { $lt: ['$ClockTime', new Date()] },
                {
                    $and: [
                        { $lt: ['$updatedAt', new Date()] },
                        {
                            $gt: [
                                '$updatedAt',
                                new Date(new Date().setDate(new Date().getDate() - 30)),
                            ],
                        },
                    ],
                },
            ],
        },
    };
    // var TabNames = TabName == "All" ? "" : TabName
    const TabNames =
        TabName == 'All' ||
            TabName == 'LatestDrops' ||
            TabName == 'PriceLowToHigh' ||
            TabName == 'PriceHighToLow'
            ? ''
            : TabName;
    SendDta.TokenMatch = {
        Category: TabNames ? TabNames : { $ne: '' },
        reported: { $eq: false },
    };
    // SendDta.sort = { "tokenowners_list.updatedAt": -1 };
    if (filter == 'BLTH') {
        SendDta.sort = { NFTPrice: 1 };
    } else if (filter == 'BHTL') {
        SendDta.sort = { NFTPrice: -1 };
    } else if (filter == 'OLD') {
        SendDta.sort = { 'tokenowners_list.updatedAt': 1 };
    } else if (filter == 'Recent') {
        SendDta.sort = { 'tokenowners_list.updatedAt': -1 };
    }
    if (!SendDta?.sort) {
        SendDta.sort = { 'tokenowners_list.updatedAt': -1 };
    }

    return await TokenList(SendDta);
};

export const TokenInfo = async (data) => {
    const {
        ProfileUrl,
        limit,
        skip,
        tokenOwnerMatch,
        sort,
        TokenMatch,
        from,
        NFTOwner,
        Id,
        myowner,
    } = data;

    try {
        let Query = [
            {
                $match: TokenMatch,
            },
            {
                $lookup: {
                    from: 'tokenowners',
                    let: { tId: '$NFTId' },
                    pipeline: [
                        { $match: myowner },

                        {
                            $lookup: {
                                from: 'users',
                                let: { proName: '$NFTOwner' },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ['$WalletAddress', '$$proName'] } },
                                    },
                                ],
                                as: 'tokenowners_users',
                            },
                        },
                        {
                            $unwind: {
                                path: '$tokenowners_users',
                                preserveNullAndEmptyArrays: true,
                            },
                        },

                        {
                            $project: {
                                _id: 0,
                                NFTId: 1,
                                NFTOwner: 1,
                                HashValue: 1,
                                PutOnSale: 1,
                                PutOnSaleType: 1,
                                NFTPrice: 1,
                                CoinName: 1,
                                NFTQuantity: 1,
                                NFTBalance: 1,
                                ClockTime: 1,
                                EndClockTime: 1,
                                LazyStatus: 1,
                                RandomName: 1,
                                NonceHash: 1,
                                SignatureHash: 1,
                                updatedAt: 1,
                                // { $cond: { if: { $isArray: "$NFTOwnerDetails" }, then: { $size: "$TokenOwnerDetails" }, else: 0} }
                                DisplayName: {
                                    $cond: {
                                        if: { $ne: ['$tokenowners_users.DisplayName', ''] },
                                        then: '$tokenowners_users.DisplayName',
                                        else: {
                                            $concat: [
                                                {
                                                    $substr: [
                                                        '$tokenowners_users.WalletAddress',
                                                        0,
                                                        3,
                                                    ],
                                                },
                                                '...',
                                                {
                                                    $substr: [
                                                        '$tokenowners_users.WalletAddress',
                                                        3,
                                                        -1,
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                                CustomUrl: '$tokenowners_users.CustomUrl',
                                WalletAddress: '$tokenowners_users.WalletAddress',
                                Profile: '$tokenowners_users.Profile',
                                Cover: '$tokenowners_users.Cover',
                            },
                        },
                    ],
                    as: 'myowner',
                },
            },
            {
                $lookup: {
                    from: 'tokenowners',
                    let: { tId: '$NFTId' },
                    pipeline: [
                        { $match: tokenOwnerMatch },
                        {
                            $lookup: {
                                from: 'users',
                                let: { proName: '$NFTOwner' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$WalletAddress', '$$proName'] },
                                        },
                                    },
                                ],
                                as: 'tokenowners_user',
                            },
                        },
                        {
                            $unwind: {
                                path: '$tokenowners_user',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'activities',
                                let: { tId: '$NFTId', owner: '$tokenowners_user.WalletAddress' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$NFTId', '$$tId'] },
                                                    { $eq: ['$To', '$$owner'] },
                                                    // {$ne: ["$From","NullAddress"]},
                                                    { $ne: ['$NFTPrice', ''] },
                                                    {
                                                        $or: [
                                                            { $eq: ['$Activity', 'Accept'] },
                                                            { $eq: ['$Activity', 'Buy'] },
                                                            { $eq: ['$Activity', 'Mint'] },
                                                        ],
                                                    },
                                                    // Activity
                                                ],
                                            },
                                        },
                                    },
                                    { $limit: 1 },
                                    { $sort: { updatedAt: -1 } },
                                    {
                                        $project: {
                                            _id: 0,
                                            NFTPrice: 1,
                                            CoinName: 1,
                                        },
                                    },
                                ],
                                as: 'buyprice',
                            },
                        },
                        {
                            $unwind: {
                                path: '$buyprice',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                NFTId: 1,
                                NFTOwner: 1,
                                HashValue: 1,
                                PutOnSale: 1,
                                PutOnSaleType: 1,
                                NFTPrice: 1,
                                CoinName: 1,
                                NFTQuantity: 1,
                                NFTBalance: 1,
                                ClockTime: 1,
                                EndClockTime: 1,
                                updatedAt: 1,
                                LazyStatus: 1,
                                RandomName: 1,
                                NonceHash: 1,
                                SignatureHash: 1,
                                DisplayName: '$tokenowners_user.DisplayName',
                                CustomUrl: '$tokenowners_user.CustomUrl',
                                WalletAddress: '$tokenowners_user.WalletAddress',
                                Profile: '$tokenowners_user.Profile',
                                Cover: '$tokenowners_user.Cover',
                                EmailId: '$tokenowners_user.EmailId',
                                buyprice: '$buyprice',
                            },
                        },
                    ],
                    as: 'tokenowners_list',
                },
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    foreignField: 'WalletAddress',
                    localField: 'NFTCreator',
                    as: 'tokenCreator',
                },
            },
            {
                $unwind: {
                    path: '$tokenCreator',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    NFTId: 1,
                    NFTName: 1,
                    NFTOrginalImage: 1,
                    image_url: 1,
                    image_thumb_url: 1,
                    likecount: 1,
                    viewcount: 1,
                    LazyStatus: 1,
                    RandomName: 1,
                    NonceHash: 1,
                    SignatureHash: 1,
                    NFTThumpImage: 1,
                    CompressedFile: 1,
                    NFTRoyalty: 1,
                    CompressedThumbFile: 1,
                    ContractAddress: 1,
                    ContractType: 1,
                    Category: 1,
                    ContractName: 1,
                    myowner: 1,
                    NFTCreator: 1,
                    MetaData: 1,
                    NFTQuantity: 1,
                    NFTOrginalImageIpfs: 1,
                    NFTDescription: 1,
                    updatedAt: 1,
                    NFTOwnerDetails: 1,
                    CollectionNetwork: 1,
                    tokenowners_list: 1,
                    Creator_DisplayName: {
                        $cond: {
                            if: { $ne: ['$tokenCreator.DisplayName', ''] },
                            then: '$tokenCreator.DisplayName',
                            else: {
                                $concat: [
                                    { $substr: ['$tokenCreator.WalletAddress', 0, 3] },
                                    '...',
                                    { $substr: ['$tokenCreator.WalletAddress', 39, -1] },
                                ],
                            },
                        },
                    },
                    Creator_DisplayName: '$tokenCreator.DisplayName',
                    Creator_CustomUrl: '$tokenCreator.CustomUrl',
                    Creator_WalletAddress: '$tokenCreator.WalletAddress',
                    Creator_Profile: '$tokenCreator.Profile',
                    Creator_Cover: '$tokenCreator.Cover',
                    Current_Owner: {
                        $filter: {
                            input: '$tokenowners_list',
                            as: 'item',
                            cond: { $and: [{ $eq: ['$$item.NFTOwner', NFTOwner] }] },
                        },
                    },
                    NFTProperties: 1,
                    CollectionName: 1,
                },
            },
        ];

        const Agg = await Aggregate({ Query: Query, DBName: tokenSchema });
        Agg.from = from;
        return Agg;
    } catch (e) {
        console.error(e);
        return false;
    }
};

// mongoosehelper Explore changed to Exploreservice
export const Exploreservice = async (data) => {
    const { match, myaddress } = data;

    try {
        const Query = [
            {
                $match: match,
            },
            { $limit: 4 },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'tokens',
                    let: { tId: '$NFTId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$NFTId', '$$tId'] } } },
                        {
                            $lookup: {
                                from: 'users',
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ['$WalletAddress', myaddress] } },
                                    },
                                ],
                                as: 'tokenowners_users',
                            },
                        },
                        {
                            $unwind: '$tokenowners_users',
                        },
                        {
                            $lookup: {
                                from: 'users',
                                foreignField: 'WalletAddress',
                                localField: 'NFTCreator',
                                as: 'tokenCreator',
                            },
                        },
                        {
                            $unwind: {
                                path: '$tokenCreator',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: 'Tokens',
                },
            },
            { $unwind: '$Tokens' },
            {
                $project: {
                    _id: 0,
                    NFTId: '$Tokens.NFTId',
                    NFTName: '$Tokens.NFTName',
                    NFTOrginalImage: '$Tokens.NFTOrginalImage',
                    image_url: '$Tokens.image_url',
                    image_thumb_url: '$Tokens.image_thumb_url',
                    NFTThumpImage: '$Tokens.NFTThumpImage',
                    CompressedFile: '$Tokens.CompressedFile',
                    CompressedThumbFile: '$Tokens.CompressedThumbFile',
                    ContractAddress: '$Tokens.ContractAddress',
                    ContractType: '$Tokens.ContractType',
                    ContractName: '$Tokens.ContractName',
                    NFTCreator: '$Tokens.NFTCreator',
                    NFTRoyalty: '$Tokens.NFTRoyalty',
                    updatedAt: '$Tokens.updatedAt',
                    CollectionNetwork: '$Tokens.CollectionNetwork',
                    NFTOwner: 1,
                    HashValue: 1,
                    PutOnSale: 1,
                    PutOnSaleType: 1,
                    NFTPrice: 1,
                    CoinName: 1,
                    NFTQuantity: 1,
                    NFTBalance: 1,
                    ClockTime: 1,
                    EndClockTime: 1,
                    DisplayName: {
                        $cond: {
                            if: {
                                $ne: ['$Tokens.tokenowners_list.tokenowners_user.DisplayName', ''],
                            },
                            then: '$Tokens.tokenowners_list.tokenowners_user.DisplayName',
                            else: {
                                $concat: [
                                    {
                                        $substr: [
                                            '$Tokens.tokenowners_list.tokenowners_user.WalletAddress',
                                            0,
                                            3,
                                        ],
                                    },
                                    '...',
                                    {
                                        $substr: [
                                            '$Tokens.tokenowners_list.tokenowners_user.WalletAddress',
                                            39,
                                            -1,
                                        ],
                                    },
                                ],
                            },
                        },
                    },

                    DisplayName: '$Tokens.tokenowners_list.tokenowners_user.DisplayName',
                    CustomUrl: '$Tokens.tokenowners_list.tokenowners_user.CustomUrl',
                    WalletAddress: '$Tokens.tokenowners_list.tokenowners_user.WalletAddress',
                    Profile: '$Tokens.tokenowners_list.tokenowners_user.Profile',
                    Cover: '$tokenowners_list.tokenowners_user.Cover',
                    Creator_DisplayName: {
                        $cond: {
                            if: { $ne: ['$Tokens.tokenCreator.DisplayName', ''] },
                            then: '$Tokens.tokenCreator.DisplayName',
                            else: {
                                $concat: [
                                    { $substr: ['$Tokens.tokenCreator.WalletAddress', 0, 3] },
                                    '...',
                                    { $substr: ['$Tokens.tokenCreator.WalletAddress', 39, -1] },
                                ],
                            },
                        },
                    },
                    Creator_DisplayName: '$Tokens.tokenCreator.DisplayName',
                    Creator_CustomUrl: '$Tokens.tokenCreator.CustomUrl',
                    Creator_WalletAddress: '$Tokens.tokenCreator.WalletAddress',
                    Creator_Profile: '$Tokens.tokenCreator.Profile',
                    Creator_Cover: '$Tokens.tokenCreator.Cover',
                    TokenOwner_Name: 1,
                },
            },
        ];
        const Agg = await Aggregate({ Query: Query, DBName: tokenowner });
        Agg.from = 'info-explore';
        return Agg;
    } catch (e) {
        logger.error(e);
        return false;
    }
};

// MongooseHelper.ActivityList
export const ActivityList = async (data) => {
    const {
        limit,
        skip,
        sort,
        from,
        // Tokens,
        TokenMatch,
    } = data;

    try {
        const Query = [
            {
                $match: TokenMatch,
            },

            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    let: { from: '$From' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $ne: ['$WalletAddress', ''],
                                        },
                                        {
                                            $eq: ['$WalletAddress', '$$from'],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'FromUsers',
                },
            },
            {
                $unwind: {
                    path: '$FromUsers',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { to: '$To' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $ne: ['$WalletAddress', ''],
                                        },
                                        {
                                            $eq: ['$WalletAddress', '$$to'],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'ToUsers',
                },
            },
            {
                $unwind: {
                    path: '$ToUsers',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'tokens',
                    let: {
                        tokenId: '$NFTId',
                        contractAddress: '$ContractAddress',
                        collectionNetwork: '$CollectionNetwork',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$NFTId', '$$tokenId'] },
                                        { $eq: ['$CollectionNetwork', '$$collectionNetwork'] },
                                        { $eq: ['$ContractAddress', '$$contractAddress'] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                NFTName: 1,
                                Category: 1,
                                NFTOrginalImage: 1,
                                image_url: 1,
                                image_thumb_url: 1,
                                NFTThumpImage: 1,
                                NFTOrginalImageIpfs: 1,
                                NFTThumpImageIpfs: 1,
                                NFTCreator: 1,
                                CompressedFile: 1,
                                CompressedThumbFile: 1,
                            },
                        },
                    ],
                    as: 'Tokens',
                },
            },
            { $unwind: { path: '$Tokens', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    _id: 0,
                    TokenId: '$NFTId',
                    TokenName: '$Tokens.NFTName',
                    Category: 1,
                    OriginalFile: '$Tokens.OriginalFile',
                    OriginalThumbFile: '$Tokens.OriginalThumbFile',
                    CompressedFile: '$Tokens.CompressedFile',
                    CompressedThumbFile: '$Tokens.CompressedThumbFile',
                    ContractAddress: 1,
                    ContractType: 1,
                    ContractName: 1,
                    CollectionNetwork: 1,
                    updatedAt: 1,
                    usd: 1,
                    Activity: 1,
                    Creator: '$Tokens.NFTCreator',
                    NFTPrice: 1,
                    CoinName: 1,
                    NFTQuantity: 1,
                    HashValue: 1,
                    Type: 1,
                    From: 1,
                    From_Name: 1,
                    From_Profile: '$FromUsers.Profile',
                    From_CustomUrl: '$FromUsers.CustomUrl',
                    From_DisplayName: {
                        $cond: {
                            if: { $ne: ['$FromUsers.DisplayName', ''] },
                            then: '$FromUsers.DisplayName',
                            else: {
                                $concat: [
                                    { $substr: ['$FromUsers.WalletAddress', 0, 3] },
                                    '...',
                                    { $substr: ['$FromUsers.WalletAddress', 39, -1] },
                                ],
                            },
                        },
                    },

                    // From_DisplayName: "$FromUsers.DisplayName",
                    To: 1,
                    To_Name: 1,
                    To_Profile: '$ToUsers.Profile',
                    To_CustomUrl: '$ToUsers.CustomUrl',
                    To_DisplayName: {
                        $cond: {
                            if: { $ne: ['$ToUsers.DisplayName', ''] },
                            then: '$ToUsers.DisplayName',
                            else: {
                                $concat: [
                                    { $substr: ['$ToUsers.WalletAddress', 0, 3] },
                                    '...',
                                    { $substr: ['$ToUsers.WalletAddress', 39, -1] },
                                ],
                            },
                        },
                    },
                },
            },
        ];
        const Agg = await Aggregate({ Query: Query, DBName: activityschema });

        Agg.from = from;
        return Agg;
    } catch (e) {
        console.error(e);
        return false;
    }
};

// mongoosehelper Activity
export const Activity = async (data) => {
    return await SaveDocument(activityschema, data);
};

export const BidInfo = async (data, LimSkip) => {
    const { BidMatch, sort } = data;

    const { limit, skip } = LimSkip;
    let Query = [
        {
            $match: BidMatch,
        },
        {
            $sort: sort,
        },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: 'TokenBidderAddress',
                foreignField: 'WalletAddress',
                as: 'BidUsers',
            },
        },
        {
            $unwind: '$BidUsers',
        },
        {
            $project: {
                _id: 0,
                TokenBidAmt: 1,
                TokenBidderAddress: 1,
                NFTId: 1,
                status: 1,
                ContractAddress: 1,
                ContractType: 1,
                HashValue: 1,
                CoinName: 1,
                NFTQuantity: 1,
                Completed: 1,
                Pending: 1,
                updatedAt: 1,
                DisplayName: {
                    $cond: {
                        if: { $ne: ['$BidUsers.DisplayName', ''] },
                        then: '$BidUsers.DisplayName',
                        else: {
                            $concat: [
                                { $substr: ['$BidUsers.WalletAddress', 0, 3] },
                                '...',
                                { $substr: ['$BidUsers.WalletAddress', 39, -1] },
                            ],
                        },
                    },
                },
                // DisplayName: "$BidUsers.DisplayName",
                EmailId: '$BidUsers.EmailId',
                // CustomUrl: "$BidUsers.CustomUrl",
                Profile: '$BidUsers.Profile',
                Cover: '$BidUsers.Cover',
                WalletAddress: '$BidUsers.WalletAddress',
                CustomUrl: '$BidUsers.CustomUrl',
            },
        },
    ];
    const Agg = await Aggregate({ Query: Query, DBName: bidschema });

    // Agg.from = "Bid";
    return Agg;
};

export const CollectionList = async (data, SendDta) => {
    const { Follow_Initial_Match, unwind, from, fromTable } = data;
    const { limit, skip } = SendDta;
    try {
        const Query = [
            {
                $match: Follow_Initial_Match,
            },
            { $sort: { updatedAt: -1 } },
            // { $unwind: unwind },
            { $skip: skip },
            { $limit: limit },

            {
                $lookup: {
                    from: 'tokens',
                    let: {
                        collectionurl: '$CollectionSymbol',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$CollectionSymbol', '$$collectionurl'],
                                        },
                                    ],
                                },
                            },
                        },
                        { $skip: skip },
                        { $limit: limit },

                        {
                            $lookup: {
                                from: 'tokenowners',
                                let: {
                                    nftid: '$NFTId',
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $ne: ['$NFTBalance', '0'] },
                                                    { $eq: ['$HideShow', 'visible'] },
                                                    { $eq: ['$NFTId', '$$nftid'] },
                                                ],
                                            },
                                        },
                                    },
                                ],
                                as: 'Owners',
                            },
                        },
                        { $unwind: '$Owners' },
                    ],
                    as: 'NFTs',
                },
            },

            {
                $project: {
                    _id: 0,
                    DisplayName: '$CollectionName',
                    CollectionSymbol: 1,
                    Category: 1,
                    CollectionProfileImage: 1,
                    CollectionNetwork: 1,
                    CollectionContractAddress: 1,
                    updatedAt: 1,
                    CollectionName: 1,
                    Collectionsnft: 1,
                    Collectionsnft: 1,
                    Owners: '$Owners',
                    NFTS: '$NFTs',
                },
            },
        ];
        const Agg = await Aggregate({ Query: Query, DBName: collectionschema });
        Agg.from = from;

        return Agg;
    } catch (e) {
        return false;
    }
};

export const UserCollection = async (data, Array) => {
    try {
        let Arr = Array ?? [];
        const NFTs = await Moralis.EvmApi.nft.getWalletNFTs(data);
        let getd = [...Arr, ...NFTs.result?.filter((item) => !isEmpty(item._data.metadata))];

        if (
            Number(getd.length) >= 8 ||
            NFTs.result.length == 0 ||
            NFTs.jsonResponse.cursor == null
        ) {
            const resdata = await getUri(getd);

            return {
                status: Number(resdata.length) > 0 ? true : false,
                message: 'OK',
                data: resdata,
                cursor: NFTs.jsonResponse.cursor,
            };
        } else {
            return await UserCollection(
                {
                    chain: data.chain,
                    address: data.address,
                    limit: 20,
                    cursor: NFTs.jsonResponse.cursor,
                },
                getd,
            );
        }
    } catch (e) {
        return false;
    }
};

export const Created = async (data) => {
    const { fromMatch, refMatch, refTable, sort, skip, limit } = data;
    try {
        var Query = [
            { $match: fromMatch },
            { $unwind: '$NFTOwnerDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'NFTCreator',
                    foreignField: 'WalletAddress',

                    as: 'tokencreator_list',
                },
            },
            { $unwind: '$tokencreator_list' },
            {
                $lookup: {
                    from: refTable,
                    let: { tId: '$NFTId' },
                    pipeline: [{ $match: refMatch }],
                    as: 'tokenowners_list',
                },
            },
            { $unwind: '$tokenowners_list' },

            {
                $lookup: {
                    from: 'users',
                    localField: 'tokenowners_list.NFTOwner',
                    foreignField: 'WalletAddress',
                    as: 'tokenowner_detail',
                },
            },
            {
                $unwind: {
                    path: '$tokenowner_detail',
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    NFTId: 1,
                    NFTOwner: '$tokenowner_detail.WalletAddress',
                    HashValue: '$tokenowners_list.HashValue',
                    PutOnSale: '$tokenowners_list.PutOnSale',
                    PutOnSaleType: '$tokenowners_list.PutOnSaleType',
                    NFTPrice: '$tokenowners_list.NFTPrice',
                    CoinName: '$tokenowners_list.CoinName',
                    NFTQuantity: '$tokenowners_list.NFTQuantity',
                    NFTBalance: '$tokenowners_list.NFTBalance',
                    ClockTime: '$tokenowners_list.ClockTime',
                    EndClockTime: '$tokenowners_list.EndClockTime',
                    updatedAt: '$tokenowners_list.updatedAt',
                    Creator_DisplayName: '$tokencreator_list.DisplayName',
                    Creator_CustomUrl: '$tokencreator_list.CustomUrl',
                    Creator_WalletAddress: '$tokencreator_list.WalletAddress',
                    Creator_Cover: '$tokencreator_list.Cover',
                    Creator_Profile: '$tokencreator_list.Profile',
                    NFTName: 1,
                    tokenowners_list: '$tokenowner_detail',
                    tokencreator_list: '$tokencreator_list',
                    NFTOrginalImage: 1,
                    image_url: 1,
                    image_thumb_url: 1,
                    NFTThumpImage: 1,
                    CompressedFile: 1,
                    CompressedThumbFile: 1,
                    ContractAddress: 1,
                    ContractType: 1,
                    ContractName: 1,
                    NFTCreator: 1,
                    CollectionNetwork: 1,
                    // Counts: { $cond: { if: { $isArray: "$NFTOwnerDetails" }, then: { $size: "$NFTOwnerDetails" }, else: 0} }
                    DisplayName: {
                        $cond: {
                            if: { $ne: ['$tokenowner_detail.DisplayName', ''] },
                            then: '$tokenowners_user.DisplayName',
                            else: {
                                $concat: [
                                    { $substr: ['$tokenowner_detail.WalletAddress', 0, 3] },
                                    '...',
                                    { $substr: ['$tokenowner_detail.WalletAddress', 39, -1] },
                                ],
                            },
                        },
                    },
                    // DisplayName: "$tokenowners_user.DisplayName",
                    CustomUrl: '$tokenowner_detail.CustomUrl',
                    WalletAddress: '$tokenowner_detail.WalletAddress',
                    Profile: '$tokenowner_detail.Profile',
                    Cover: '$tokenowner_detail.Cover',
                },
            },
        ];

        // var Agg = await Aggregate({ Query: Query, DBName: tokenSchema });
        let Agg = await tokenSchema.aggregate(Query);
        let countQuery = [
            { $match: fromMatch },
            { $unwind: '$NFTOwnerDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'NFTCreator',
                    foreignField: 'WalletAddress',

                    as: 'tokencreator_list',
                },
            },
            { $unwind: '$tokencreator_list' },
            {
                $lookup: {
                    from: refTable,
                    let: { tId: '$NFTId' },
                    pipeline: [{ $match: refMatch }],
                    as: 'tokenowners_list',
                },
            },
            {
                $unwind: {
                    path: '$highbid',
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $unwind: '$tokenowners_list' },
        ];
        // var countagg = await Aggregate({ Query: countQuery, DBName: tokenSchema });
        // var countagg = await Aggregate({ Query: countQuery, DBName:  tokenSchema});
        var countagg = await tokenSchema.aggregate(countQuery);
        Agg.count = countagg?.data?.[0]?.count ? countagg?.data?.[0]?.count : 0;
        // Agg.from = from;

        return Agg;
    } catch (err) {
        logger.error('err in creted tab', err);
    }
};

export const MyItemList = async (data) => {
    const {
        ProfileUrl,
        limit,
        skip,
        fromMatch,
        sort,
        refMatch,
        from,
        fromTable,
        refTable,
        Activitymatch,
    } = data;
    try {
        const Query = [
            {
                $match: fromMatch,
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    let: { proName: '$NFTOwner' },
                    pipeline: [{ $match: { $expr: { $eq: ['$WalletAddress', '$$proName'] } } }],
                    as: 'tokenowners_user',
                },
            },
            {
                $unwind: {
                    path: '$tokenowners_user',
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $lookup: {
                    from: refTable,
                    let: { tId: '$NFTId' },
                    pipeline: [{ $match: refMatch }],
                    as: 'tokenowners_list',
                },
            },
            { $unwind: '$tokenowners_list' },

            {
                $lookup: {
                    from: 'users',
                    localField: 'tokenowners_list.NFTCreator',
                    foreignField: 'WalletAddress',
                    as: 'tokencreator_list',
                },
            },
            { $unwind: '$tokencreator_list' },

            {
                $project: {
                    _id: 1,
                    NFTId: 1,
                    NFTOwner: 1,
                    HashValue: 1,
                    PutOnSale: 1,
                    PutOnSaleType: 1,
                    NFTPrice: 1,
                    CoinName: 1,
                    NFTQuantity: 1,
                    NFTBalance: 1,
                    ClockTime: 1,
                    EndClockTime: 1,
                    updatedAt: 1,
                    Creator_DisplayName: '$tokencreator_list.DisplayName',
                    Creator_CustomUrl: '$tokencreator_list',
                    Creator_WalletAddress: '$tokencreator_list',
                    Creator_Cover: '$tokencreator_list',
                    Creator_Profile: '$tokencreator_list.Profile',
                    NFTName: '$tokenowners_list.NFTName',
                    tokenowners_list: '$tokenowners_list',
                    tokencreator_list: '$tokencreator_list',
                    NFTOrginalImage: '$tokenowners_list.NFTOrginalImage',
                    image_thumb_url: '$tokenowners_list.image_thumb_url',
                    image_url: '$tokenowners_list.image_url',
                    NFTThumpImage: '$tokenowners_list.NFTThumpImage',
                    CompressedFile: '$tokenowners_list.CompressedFile',
                    CompressedThumbFile: '$tokenowners_list.CompressedThumbFile',
                    ContractAddress: '$tokenowners_list.ContractAddress',
                    ContractType: '$tokenowners_list.ContractType',
                    ContractName: '$tokenowners_list.ContractName',
                    NFTCreator: '$tokenowners_list.NFTCreator',
                    CollectionNetwork: '$tokenowners_list.CollectionNetwork',
                    DisplayName: {
                        $cond: {
                            if: { $ne: ['$tokenowners_user.DisplayName', ''] },
                            then: '$tokenowners_user.DisplayName',
                            else: {
                                $concat: [
                                    { $substr: ['$tokenowners_user.WalletAddress', 0, 3] },
                                    '...',
                                    { $substr: ['$tokenowners_user.WalletAddress', 39, -1] },
                                ],
                            },
                        },
                    },
                    CustomUrl: '$tokenowners_user.CustomUrl',
                    WalletAddress: '$tokenowners_user.WalletAddress',
                    Profile: '$tokenowners_user.Profile',
                    Cover: '$tokenowners_user.Cover',
                },
            },
        ];

        const Agg = await Aggregate({ Query: Query, DBName: tokenowner });

        // Agg.from = from;

        return Agg;
    } catch (e) {
        return false;
    }
};

export const HomeCollectionFunc = async (data) => {
    const { sort, match, CollLimit, limit, tokenMatch, tab, filter, skip } = data;
    const Query = [
        { $match: match },
        {
            $lookup: {
                from: 'tokens',
                let: { symbol: '$CollectionSymbol' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$CollectionSymbol', '$$symbol'] } } },
                    { $limit: 3 },
                    { $count: 'token' },
                    { $project: { token: 1 } },
                ],
                as: 'ValidCollection',
            },
        },
        { $unwind: '$ValidCollection' },
        { $match: { $expr: { $gte: ['$ValidCollection.token', 3] } } },
        { $limit: CollLimit },
        { $skip: skip },
        { $sort: { updatedAt: filter == 'old' ? 1 : -1 } },
        {
            $lookup: {
                from: 'users',
                let: { create: '$CollectionCreator' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$WalletAddress', '$$create'] } } },
                    { $limit: 1 },
                    {
                        $project: {
                            DisplayName: 1,
                            CustomUrl: 1,
                        },
                    },
                ],
                as: 'User',
            },
        },
        { $unwind: '$User' },
        {
            $lookup: {
                from: 'tokens',
                let: { symbol: '$CollectionSymbol' },
                pipeline: [
                    { $match: tokenMatch },
                    { $limit: limit },
                    { $sort: sort },
                    {
                        $lookup: {
                            from: 'tokenowners',
                            let: { tid: '$NFTId' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$$tid', '$NFTId'] } } },
                                { $sort: { updatedAt: -1 } },
                                { $limit: 1 },
                                {
                                    $project: {
                                        NFTOwner: 1,
                                        _id: 0,
                                    },
                                },
                            ],
                            as: 'TokenOwner',
                        },
                    },
                    { $unwind: '$TokenOwner' },
                    {
                        $project: {
                            NFTName: 1,
                            NFTOrginalImage: 1,
                            image_url: 1,
                            NFTThumpImage: 1,
                            CompressedFile: 1,
                            CompressedThumbFile: 1,
                            // TokenOwner:1,
                            Link: {
                                $concat: [
                                    '/info/',
                                    '$CollectionNetwork',
                                    '/',
                                    '$ContractAddress',
                                    '/',
                                    '$TokenOwner.NFTOwner',
                                    '/',
                                    '$NFTId',
                                ],
                            },
                        },
                    },
                ],
                as: 'Tokens',
            },
        },
        {
            $project: {
                CollectionName: 1,
                CollectionProfileImage: 1,
                CollectionSymbol: 1,
                CollectionType: 1,
                Category: 1,
                CollectionNetwork: 1,
                CollectionCreator: 1,
                DisplayName: '$User.DisplayName',
                CustomUrl: '$User.CustomUrl',
                CollectionCount: {
                    $cond: { if: { $isArray: '$Tokens' }, then: { $size: '$Tokens' }, else: 0 },
                },
                Tokens: {
                    $cond: {
                        if: {
                            $and: [{ $isArray: '$Tokens' }, { $gte: [{ $size: '$Tokens' }, 3] }],
                        },
                        then: '$Tokens',
                        else: [],
                    },
                },
            },
        },
    ];
    const Agg = await Aggregate({ Query: Query, DBName: collectionschema });

    Agg.from = 'Top Creator';
    return Agg;
};

export const CollectionListHome = async (SendDta) => {
    const {
        CollcetionsMatch,
        Categoryname,
        limit,
        skip,
        filter,
        pricesort,
        from,
        statussort,
        sort,
    } = SendDta;

    try {
        const Query = [
            {
                $match: CollcetionsMatch,
            },

            // statussort ? statussort : { $sort: { updatedAt: -1 } },

            // { $sort: { updatedAt: 1 } },
            // { $unwind: unwind },

            from !== 'collctiondetails' ? { $skip: skip } : { $skip: 0 },
            from !== 'collctiondetails' ? { $limit: limit } : { $skip: 0 },

            // { $skip: skip },
            // { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    let: { create: '$CollectionCreator' },
                    pipeline: [{ $match: { $expr: { $eq: ['$WalletAddress', '$$create'] } } }],
                    as: 'User',
                },
            },
            {
                $lookup: {
                    from: 'tokens',
                    let: {
                        collectionurl: '$CollectionSymbol',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$CollectionSymbol', '$$collectionurl'],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'tokenowners',
                                let: {
                                    nftid: '$NFTId',
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $ne: ['$NFTBalance', '0'] },
                                                    { $eq: ['$HideShow', 'visible'] },
                                                    { $eq: ['$NFTId', '$$nftid'] },
                                                ],
                                            },
                                        },
                                    },
                                ],
                                as: 'Owners',
                            },
                        },
                        { $unwind: '$Owners' },
                        {
                            $group: {
                                _id: '$Owners.NFTOwner',
                                floorprice: { $min: '$Owners.NFTPrice' },
                                totalnft: { $sum: 1 },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: 'Tokens',
                },
            },
            from !== 'collctiondetails'
                ? {
                    $unwind: { path: '$Tokens', preserveNullAndEmptyArrays: true },
                }
                : {
                    $skip: 0,
                },
            {
                $lookup: {
                    from: 'tokens',
                    let: {
                        collectionurl: '$CollectionSymbol',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$CollectionSymbol', '$$collectionurl'],
                                        },
                                    ],
                                },
                            },
                        },
                        { $skip: skip },
                        { $limit: limit },

                        {
                            $lookup: {
                                from: 'tokenowners',
                                let: {
                                    nftid: '$NFTId',
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $ne: ['$NFTBalance', '0'] },
                                                    { $eq: ['$HideShow', 'visible'] },
                                                    { $eq: ['$NFTId', '$$nftid'] },
                                                ],
                                            },
                                        },
                                    },
                                ],
                                as: 'Owners',
                            },
                        },
                        { $unwind: '$Owners' },

                        {
                            $lookup: {
                                from: 'activities',
                                let: {
                                    nftid: '$NFTId',
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$NFTId', '$$nftid'],
                                            },
                                        },
                                    },
                                    {
                                        $facet: {
                                            putOnSale: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ['$Activity', 'PutOnSale'],
                                                        },
                                                    },
                                                },
                                                {
                                                    $sort: { createdAt: -1 },
                                                },
                                                {
                                                    $limit: 1,
                                                },
                                            ],
                                            buy: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ['$Activity', 'Buy'],
                                                        },
                                                    },
                                                },
                                                {
                                                    $sort: { createdAt: -1 },
                                                },
                                                {
                                                    $limit: 1,
                                                },
                                            ],
                                        },
                                    },
                                ],
                                as: 'activity',
                            },
                        },
                    ],
                    as: 'NFTs',
                },
            },

            {
                $project: {
                    _id: 0,
                    DisplayName: '$CollectionName',
                    CollectionSymbol: 1,
                    CollectionProfileImage: 1,
                    CollectionNetwork: 1,
                    CollectionContractAddress: 1,
                    CollectionCreator: 1,
                    CollectionBio: 1,
                    updatedAt: 1,
                    value: '$CollectionName',
                    label: '$CollectionName',
                    CollectionType: 1,
                    Category: 1,
                    CreatorProfile: '$User.Profile',
                    CreatorName: '$User.DisplayName',
                    Creatoraddress: '$User.WalletAddress',
                    CustomUrl: '$User.CustomUrl',
                    CollectionDiscribtion: 1,
                    CollectionName: 1,
                    CollectionCoverImage: 1,
                    Tokensdata: '$Tokens',
                    Owners: '$Owners',
                    NFTS: '$NFTs',
                    activity: '$actaaivity',
                },
            },

            from !== 'collctiondetails' ? (pricesort ?? { $skip: 0 }) : { $skip: 0 },
        ];
        const Agg = await Aggregate({ Query: Query, DBName: collectionschema });
        return Agg;
    } catch (e) {
        logger.error(e);
        return false;
    }
};

export const forcollection = async (SendDta) => {
    const {
        CollcetionsMatch,
        Categoryname,
        limit,
        skip,
        filter,
        pricesort,
        from,
        statussort,
        sort,
    } = SendDta;

    try {
        const Query = [
            {
                $match: CollcetionsMatch,
            },

            // statussort ? statussort : { $sort: { updatedAt: -1 } },

            // { $sort: { updatedAt: 1 } },
            // { $unwind: unwind },

            from !== 'collctiondetails' ? { $skip: skip } : { $skip: 0 },
            from !== 'collctiondetails' ? { $limit: limit } : { $skip: 0 },

            {
                $lookup: {
                    from: 'users',
                    let: { create: '$CollectionCreator' },
                    pipeline: [{ $match: { $expr: { $eq: ['$WalletAddress', '$$create'] } } }],
                    as: 'User',
                },
            },
            {
                $lookup: {
                    from: 'tokens',
                    let: {
                        collectionurl: '$CollectionSymbol',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$CollectionSymbol', '$$collectionurl'],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'tokenowners',
                                let: {
                                    nftid: '$NFTId',
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $ne: ['$NFTBalance', '0'] },
                                                    { $eq: ['$HideShow', 'visible'] },
                                                    { $eq: ['$NFTId', '$$nftid'] },
                                                ],
                                            },
                                        },
                                    },
                                ],
                                as: 'Owners',
                            },
                        },
                        { $unwind: '$Owners' },
                        {
                            $group: {
                                _id: '$Owners.NFTOwner',
                                floorprice: { $min: '$Owners.NFTPrice' },
                                totalnft: { $sum: 1 },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: 'Tokens',
                },
            },
            from !== 'collctiondetails'
                ? {
                    $unwind: { path: '$Tokens', preserveNullAndEmptyArrays: true },
                }
                : {
                    $skip: 0,
                },
            // ...(from === "collctionpage" ? {} : )

            {
                $project: {
                    _id: 0,
                    DisplayName: '$CollectionName',
                    CollectionSymbol: 1,
                    CollectionProfileImage: 1,
                    CollectionNetwork: 1,
                    CollectionContractAddress: 1,
                    CollectionCreator: 1,
                    CollectionBio: 1,
                    image_url: 1,
                    total_supply: 1,
                    updatedAt: 1,
                    value: '$CollectionName',
                    label: '$CollectionName',
                    CollectionType: 1,
                    Category: 1,
                    CreatorProfile: '$User.Profile',
                    CreatorName: '$User.DisplayName',
                    Creatoraddress: '$User.WalletAddress',
                    CustomUrl: '$User.CustomUrl',
                    CollectionDiscribtion: 1,
                    CollectionName: 1,
                    CollectionCoverImage: 1,
                    Tokensdata: '$Tokens',
                    Owners: '$Owners',

                    activity: '$actaaivity',
                },
            },

            from !== 'collctiondetails' ? (pricesort ?? { $skip: 0 }) : { $skip: 0 },
        ];
        const Agg = await Aggregate({ Query: Query, DBName: collectionschema });
        return Agg;
    } catch (e) {
        logger.error(e);
        return false;
    }
};

export const CreateCollectionFunc = async (data) => {
    const { sort, match, CollLimit, limit, tokenMatch, tab, filter, skip } = data;
    const Query = [
        { $match: match },
        { $limit: CollLimit },
        // {$skip:skip},
        { $sort: { updatedAt: filter == 'old' ? 1 : -1 } },
        {
            $lookup: {
                from: 'users',
                let: { create: '$CollectionCreator' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$WalletAddress', '$$create'] } } },
                    { $limit: 1 },
                    {
                        $project: {
                            DisplayName: 1,
                            CustomUrl: 1,
                        },
                    },
                ],
                as: 'User',
            },
        },
        { $unwind: '$User' },
        {
            $lookup: {
                from: 'tokens',
                let: { symbol: '$CollectionSymbol' },
                pipeline: [
                    { $match: tokenMatch },
                    { $limit: limit },
                    { $sort: sort },
                    {
                        $lookup: {
                            from: 'tokenowners',
                            let: { tid: '$NFTId' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$$tid', '$NFTId'] } } },
                                { $sort: { updatedAt: -1 } },
                                { $limit: 1 },
                                {
                                    $project: {
                                        NFTOwner: 1,
                                        _id: 0,
                                    },
                                },
                            ],
                            as: 'TokenOwner',
                        },
                    },
                    { $unwind: '$TokenOwner' },
                    {
                        $project: {
                            NFTName: 1,
                            NFTOrginalImage: 1,
                            NFTThumpImage: 1,
                            CompressedFile: 1,
                            CompressedThumbFile: 1,
                            nftprice: 1,
                            NFTPrice: 1,
                            PutOnSaleType: 1,
                            CoinName: 1,
                            // TokenOwner:1,
                            Link: {
                                $concat: [
                                    '/info/',
                                    '$CollectionNetwork',
                                    '/',
                                    '$ContractAddress',
                                    '/',
                                    '$TokenOwner.NFTOwner',
                                    '/',
                                    '$NFTId',
                                ],
                            },
                        },
                    },
                ],
                as: 'Tokens',
            },
        },
        {
            $project: {
                CollectionName: 1,
                CollectionProfileImage: 1,
                CollectionSymbol: 1,
                CollectionType: 1,
                Category: 1,
                CollectionNetwork: 1,
                CollectionCreator: 1,
                // Tokens  : '$Tokens',
                DisplayName: '$User.DisplayName',
                CustomUrl: '$User.CustomUrl',
                CollectionCount: {
                    $cond: { if: { $isArray: '$Tokens' }, then: { $size: '$Tokens' }, else: 0 },
                },
                Tokens: {
                    $cond: {
                        if: {
                            $and: [{ $isArray: '$Tokens' }, { $gte: [{ $size: '$Tokens' }, 3] }],
                        },
                        then: '$Tokens',
                        else: [],
                    },
                },
            },
        },
    ];
    const Agg = await Aggregate({ Query: Query, DName: collectionschema });

    Agg.from = 'Top Creator';
    return Agg;
};

export const collectionfind = async (data) => {
    return await collectionschema.findOne(data);
};

export const findBYCollectionID = async (data) => {
    return await collectionschema.findById(data).populate('type', {});
};

export const game_MyItems = async (data) => {
    const {
        ProfileUrl,
        limit,
        skip,
        fromMatch,
        sort,
        refMatch,
        from,
        fromTable,
        refTable,
        Activitymatch,
    } = data;

    const Query = [
        {
            $match: fromMatch,
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                let: { proName: '$NFTOwner' },
                pipeline: [{ $match: { $expr: { $eq: ['$WalletAddress', '$$proName'] } } }],
                as: 'tokenowners_user',
            },
        },
        {
            $unwind: {
                path: '$tokenowners_user',
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: refTable,
                let: { tId: '$NFTId' },
                pipeline: [{ $match: refMatch }],
                as: 'tokenowners_list',
            },
        },
        { $unwind: '$tokenowners_list' },

        {
            $lookup: {
                from: 'users',
                localField: 'tokenowners_list.NFTCreator',
                foreignField: 'WalletAddress',
                as: 'tokencreator_list',
            },
        },
        { $unwind: '$tokencreator_list' },

        {
            $project: {
                _id: 1,
                NFTId: 1,
                NFTOwner: 1,
                HashValue: 1,
                PutOnSale: 1,
                PutOnSaleType: 1,
                NFTPrice: 1,
                CoinName: 1,
                NFTQuantity: 1,
                NFTBalance: 1,
                ClockTime: 1,
                EndClockTime: 1,
                updatedAt: 1,
                Creator_DisplayName: '$tokencreator_list.DisplayName',
                CreatorDetails: '$tokencreator_list',
                Creator_Profile: '$tokencreator_list.Profile',
                NFTName: '$tokenowners_list.NFTName',
                tokenowners_list: '$tokenowners_list',
                tokencreator_list: '$tokencreator_list',
                NFTOrginalImage: '$tokenowners_list.NFTOrginalImage',
                image_thumb_url: '$tokenowners_list.image_thumb_url',
                image_url: '$tokenowners_list.image_url',
                NFTThumpImage: '$tokenowners_list.NFTThumpImage',
                CompressedFile: '$tokenowners_list.CompressedFile',
                CompressedThumbFile: '$tokenowners_list.CompressedThumbFile',
                ContractAddress: '$tokenowners_list.ContractAddress',
                ContractType: '$tokenowners_list.ContractType',
                ContractName: '$tokenowners_list.ContractName',
                NFTCreator: '$tokenowners_list.NFTCreator',
                CollectionNetwork: '$tokenowners_list.CollectionNetwork',
                DisplayName: {
                    $cond: {
                        if: { $ne: ['$tokenowners_user.DisplayName', ''] },
                        then: '$tokenowners_user.DisplayName',
                        else: {
                            $concat: [
                                { $substr: ['$tokenowners_user.WalletAddress', 0, 3] },
                                '...',
                                { $substr: ['$tokenowners_user.WalletAddress', 39, -1] },
                            ],
                        },
                    },
                },
                CustomUrl: '$tokenowners_user.CustomUrl',
                WalletAddress: '$tokenowners_user.WalletAddress',
                Profile: '$tokenowners_user.Profile',
                Cover: '$tokenowners_user.Cover',
            },
        },
    ];

    const result = await Aggregate({ Query: Query, DBName: tokenowner });
    return result;
};

export const gameStore_Service = async (data) => {
    const { collectionSymbol, collectionTypeID, skip, limit } = data;

    let matcharray = [];
    if (collectionSymbol && collectionTypeID) {
        matcharray = [
            { $eq: ['$NFTId', '$$nftid'] },
            { $eq: ['$collectionTypeId', collectionTypeID] },
            { $eq: ['$CollectionSymbol', collectionSymbol] },
        ];
    } else if (collectionSymbol && !collectionTypeID) {
        matcharray = [
            { $eq: ['$CollectionSymbol', collectionSymbol] },
            { $ne: ['$collectionTypeId', ''] },
            { $eq: ['$CollectionSymbol', collectionSymbol] },
        ];
    } else {
        matcharray = [
            { $eq: ['$NFTId', '$$nftid'] },
            { $ne: ['$collectionTypeId', ''] },
            { $ne: ['$CollectionSymbol', ''] },
        ];
    }
    const query = [
        {
            $match: {
                PutOnSale: 'false',
                NFTBalance: { $ne: '0' },
                CollectionName: collectionSymbol ? { $eq: collectionSymbol } : { $ne: '' },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'NFTOwner',
                foreignField: 'WalletAddress',
                as: 'nftownerDetails',
            },
        },
        {
            $lookup: {
                from: 'tokens',
                let: { nftid: '$NFTId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: matcharray, // array declare adove
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'NFTCreator',
                            foreignField: 'WalletAddress',
                            as: 'nftCreatorDetails',
                        },
                    },
                ],
                as: 'tokenDetails',
            },
        },
        { $skip: skip }, // Adding the $skip stage
        { $limit: limit }, // Adding the $limit stage
    ];

    const result = await tokenowner.aggregate(query);
    return result;
};

export const findCollections = async (data) => {
    return await collectionschema.find(data).populate('type', {});
};

export const getCollections = async () => {
    return await collectionschema.find().populate('type', {});
};

export const findAndUpdateManyTokenService = async (find, update) => {
    return await tokenSchema.updateMany(find, update);
};

export const findOneCollection = async (data) => {
    return await collectionschema.findOne(data).populate('type', {});
};

export const FindOneAndUpdateTokenService = async (find, update) => {
    return await tokenSchema.findOneAndUpdate(find, update);
};

export const findTokenDatawithIds = async (ids) => {
    return await tokenSchema.find({ _id: { $in: ids } }).lean();
};

export const FindTokens = async (find) => {
    return await tokenSchema.find(find);
};

export async function getPlanetSyncData(nftIDs) {
    const query = [
        {
            $match: {
                NFTId: { $in: nftIDs },
            },
        },
        {
            $lookup: {
                from: 'userplanets',
                localField: '_id',
                foreignField: 'nftId',
                as: 'userPlanetData',
            },
        },
        {
            $unwind: {
                path: '$userPlanetData',
                preserveNullAndEmptyArrays: false,
            },
        },
        {
            $lookup: {
                from: 'planets',
                localField: 'userPlanetData.planetId',
                foreignField: '_id',
                as: 'planetData',
            },
        },
        {
            $unwind: {
                path: '$planetData',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                NFTId: 1,
                NFTName: 1,
                NFTDescription: 1,
                NFTOrginalImageIpfs: 1,
                MetaData: 1,
                level: 1,
                totalXP: 1,

                userPlanetId: '$userPlanetData._id',

                planetType: '$planetData.type',
                planetRarity: '$planetData.rarity',
                planetHexId: '$planetData.hexId',
            },
        },
    ];

    return await tokenSchema.aggregate(query);
}


export async function getTokenDetailes(walletAddress) {
    const query = [
        {
            $match: { NFTOwner: walletAddress, NFTBalance: { $ne: '0' } },
        },
        {
            $lookup: {
                from: 'tokens',
                localField: 'NFTId',
                foreignField: 'NFTId',
                as: 'tokenData',
            },
        },
        {
            $unwind: '$tokenData', // Deconstruct the "tokenData" array
        },
    ];

    const result = await tokenowner.aggregate(query);
    return result;
}

export async function getTokenDetailesWithContractAddress(walletAddress, contractAddressArray) {
    const query = [
        {
            $match: {
                NFTOwner: walletAddress,
                NFTBalance: { $ne: '0' },
                ContractAddress: { $in: contractAddressArray },
            },
        },
        {
            $lookup: {
                from: 'tokens',
                localField: 'NFTId',
                foreignField: 'NFTId',
                as: 'tokenData',
            },
        },
        {
            $unwind: '$tokenData', // Deconstruct the "tokenData" array
        },
    ];

    console.log("getTokenDetailesWithContractAddress", JSON.stringify(query));
    const result = await tokenowner.aggregate(query);
    return result;
}

export async function getTokenNFTIDSWithContractAddress(walletAddress, contractAddressArray) {
    const query = [
        {
            $match: {
                NFTOwner: walletAddress,
                NFTBalance: { $ne: '0' },
                ContractAddress: { $in: contractAddressArray },
            },
        },
        {
            $lookup: {
                from: 'tokens',
                let: { 'nftId': '$NFTId' },
                "pipeline": [
                    {
                        $match: {
                            $expr: { $eq: ['$NFTId', '$$nftId'] }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            NFTId: 1
                        }
                    }
                ],
                as: 'tokenData',
            },
        },
        {
            $unwind: '$tokenData', // Deconstruct the "tokenData" array
        }
    ];

    console.log(JSON.stringify(query));
    const result = await tokenowner.aggregate(query);
    return result;
}


export const findCollection_service = async (data) => {
    return await collectionschema.find(data);
};

// export async function getTokenDetailesWithCollectionArray(walletAddress, Collection, skip, limit) {
//     const collectionfind = Collection.length ? { $in: Collection } : { $ne: null };
//     // const query =[ {
//     //      $match: {NFTOwner : walletAddress , NFTBalance : { $ne :  "0"} , ContractAddress :  collectionfind }
//     //     },
//     //     {
//     //       $lookup: {
//     //         from: "tokens",
//     //         localField: "NFTId",
//     //         foreignField: "NFTId",
//     //         as: "tokenData",
//     //       }
//     //     },
//     //     {
//     //       $unwind: "$tokenData"        // Deconstruct the "tokenData" array
//     //     },
//     //     {
//     //       $skip: skip  // Skip the first 10 documents (adjust as needed)
//     //     },
//     //     {
//     //       $limit: limit  // Limit to 5 documents (adjust as needed)
//     //     }

//     //     ]

//     const query = [
//         {
//             $match: {
//                 NFTOwner: walletAddress,
//                 NFTBalance: { $ne: '0' },
//                 ContractAddress: collectionfind,
//             },
//         },
//         {
//             $lookup: {
//                 from: 'tokens',
//                 localField: 'NFTId',
//                 foreignField: 'NFTId',
//                 as: 'tokenData',
//             },
//         },
//         {
//             $unwind: '$tokenData',
//         },
//         {
//             $facet: {
//                 totalCount: [
//                     { $count: 'count' }, // This will count the total number of matching documents
//                 ],
//                 results: [
//                     { $skip: skip }, // Pagination logic
//                     { $limit: limit }, // Limit the number of documents
//                 ],
//             },
//         },
//     ];

//     return await tokenowner.aggregate(query);
// }

export async function getTokenDetailesWithCollectionArray(walletAddress, Collection, skip, limit, crewType, key) {
    const collectionfind = Collection.length ? { $in: Collection } : { $ne: null };
    let query
    console.log("crewType", crewType)

    if (crewType == "crew") {
        query = [
            {
                $match: {
                    NFTOwner: walletAddress,
                    NFTBalance: { $ne: '0' },
                    ContractAddress: collectionfind,
                },
            },
            {
                $lookup: {
                    from: 'tokens',
                    let: { nftId: "$NFTId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        { $toString: "$NFTId" },
                                        { $toString: "$$nftId" }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'tokenData',
                },
            },
            {
                $unwind: {
                    path: '$tokenData',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    NFTId: 1,
                    NFTName: 1,
                    NFTOwner: 1,
                    NFTtype: 1,
                    Category: 1,
                    ContractAddress: 1,
                    nftCategory: 1,
                    // from tokenData
                    tokenId: "$tokenData._id",
                    crewType: "$tokenData.crewType",
                    crewGender: "$tokenData.crewGender",
                    totalXP: "$tokenData.totalXP",
                    level: "$tokenData.level",
                    image_url: "$tokenData.image_url",
                    missionAvailability: "$tokenData.missionAvailability"
                },
            },

            {
                $facet: {
                    totalCount: [
                        { $count: 'count' }, // This will count the total number of matching documents
                    ],
                    results: [
                        { $skip: skip }, // Pagination logic
                        { $limit: limit }, // Limit the number of documents
                    ],
                },
            },
        ];
    }
    else if (crewType == "specialcrew") {

        query = [
            {
                $match: {
                    NFTOwner: walletAddress,
                    NFTBalance: { $ne: '0' },
                    ContractAddress: collectionfind,
                },
            },
            {
                $lookup: {
                    from: 'tokens',
                    let: { nftId: "$NFTId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        { $toString: "$NFTId" },
                                        { $toString: "$$nftId" }
                                    ]
                                }
                            }
                        },
                        ...(key && key.trim() !== ""
                            ? [{
                                $match: {
                                    crewType: key   // exact match only
                                }
                            }]
                            : [])
                    ],
                    as: 'tokenData',
                },
            },
            {
                $unwind: {
                    path: '$tokenData',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $lookup: {
                    from: "professions",
                    let: { crewType: "$tokenData.crewType" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        "$key",
                                        { $toUpper: "$$crewType" }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "professionData"
                }
            },
            {
                $unwind: {
                    path: "$professionData",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    _id: 1,
                    NFTId: 1,
                    NFTName: 1,
                    NFTOwner: 1,
                    NFTtype: 1,
                    Category: 1,
                    ContractAddress: 1,
                    nftCategory: 1,

                    // from tokenData
                    tokenId: "$tokenData._id",
                    crewType: "$tokenData.crewType",
                    crewGender: "$tokenData.crewGender",
                    totalXP: "$tokenData.totalXP",
                    level: "$tokenData.level",
                    image_url: "$tokenData.image_url",
                    missionAvailability: "$tokenData.missionAvailability",
                    // nftCategory: "$tokenData.nftCategory",

                    //from profession
                    profession: "$professionData.key",
                    baseContribution: "$professionData.baseContribution",
                    conditionalContribution: "$professionData.conditionalContribution",
                    rewardModifiers: "$professionData.rewardModifiers",
                    assignmentEffects: "$professionData.assignmentEffects",
                    nftCost: "$professionData.nftCost"
                },
            },

            {
                $facet: {
                    totalCount: [
                        { $count: 'count' }, // This will count the total number of matching documents
                    ],
                    results: [
                        { $skip: skip }, // Pagination logic
                        { $limit: limit }, // Limit the number of documents
                    ],
                },
            },
        ];
    }
    console.log(JSON.stringify(query), "getTokenDetailesWithCollectionArray")
    return await tokenowner.aggregate(query);
}

export async function getTokenDetailesWithMatch(match, skip, limit) {
    const query = [
        {
            $match: match,
        },
        {
            $lookup: {
                from: 'tokens',
                localField: 'NFTId',
                foreignField: 'NFTId',
                as: 'tokenData',
            },
        },
        {
            $unwind: '$tokenData',
        },
        {
            $facet: {
                totalCount: [
                    { $count: 'count' }, // This will count the total number of matching documents
                ],
                results: [
                    { $skip: skip }, // Pagination logic
                    { $limit: limit }, // Limit the number of documents
                ],
            },
        },
    ];

    return await tokenowner.aggregate(query);
}

export async function TokenOwnerAggregate_service(query) {
    return await tokenowner.aggregate(query);
}

export async function TokenDetailesSearchWithCollectionArray(word, Collection, skip, limit) {
    const collectionfind = Collection.length
        ? { $in: ['$ContractAddress', Collection] } // Correct $in format with field reference
        : { $ne: ['$ContractAddress', null] }; // Correct $ne format with field reference and value

    const query = [
        {
            $match: { NFTBalance: { $ne: '0' } },
        },
        {
            $lookup: {
                from: 'tokens',
                localField: 'NFTId',
                foreignField: 'NFTId',
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $regexMatch: {
                                            input: '$NFTName',
                                            regex: word,
                                            options: 'i', // Optional: to make the search case-insensitive
                                        },
                                    },

                                    collectionfind, // above is query
                                ],
                            },
                        },
                    },
                ],
                as: 'tokenData',
            },
        },
        {
            $unwind: '$tokenData', // Deconstruct the "tokenData" array
        },
        {
            $skip: skip, // Skip the first 10 documents (adjust as needed)
        },
        {
            $limit: limit, // Limit to 5 documents (adjust as needed)
        },
    ];

    // console.log(JSON.stringify(query, -1));
    return await tokenowner.aggregate(query);
}

export const getNextName = async (name) => {
    return `${name} #${Date.now()})`;
    // try {
    //   // Get all NFTs with the given prefix
    //   const data = await tokenSchema.find({ NFTName: { $regex: name, $options: 'i' } });
    //   // If no existing NFTs, return the first in the series
    //   if (data.length === 0) {
    //     const newName = `${name}-1`;
    //     await RedisSet(newName, 1, 120); // Cache the name in Redis for 120 seconds
    //     return newName;
    //   }
    //   // Generate the next name based on the current count
    //   let newName = `${name}-${data.length + 1}`;
    //   // Check if the generated name exists in Redis or MongoDB
    //   let isCached = await RedisGet(newName);
    //   let tokenNameExist = await tokenSchema.findOne({ NFTName: newName });
    //   // If the name already exists, find the highest number and increment
    //   while (isCached || tokenNameExist) {
    //     const lastToken = await tokenSchema
    //       .find({ NFTName: { $regex: name, $options: 'i' } })
    //       .sort({ createdAt: -1 }) // Sort by creation time
    //       .limit(1);
    //     const lastNumber = Number(lastToken[0].NFTName.split('-').pop()) || 0;
    //     newName = `${name}-${lastNumber + 1}`;
    //     isCached = await RedisGet(newName);
    //     tokenNameExist = await tokenSchema.findOne({ NFTName: newName });
    //   }
    //   // Cache the new name in Redis for 120 seconds
    //   await RedisSet(newName, 1, 120);
    //   return newName;
    // } catch (error) {
    //   console.error('Error generating next name:', error);
    //   return `${name}-${generateRandomAlphabets(6)}`
    // }
};

export const findOneToken = async (query) => {
    return await tokenSchema.findOne(query);
};

export const getUserPlanetAndAstroidHexIds = async (walletAddress) => {
    const tokenDatas = await getTokenDetailesWithContractAddress(walletAddress, [
        config.COLLECTION_CONTRACT_DETAILS.planet.address,
        config.COLLECTION_CONTRACT_DETAILS.astroid.address,
    ]);
    const hexids = [];
    tokenDatas.forEach((token) => {
        hexids.push(token.tokenData.hexId);
    });
    return hexids;
};

export async function getShipTokenDetailesWithContractAddress(walletAddress, contractAddressArray) {
    const query = [
        {
            $match: {
                NFTOwner: walletAddress,
                NFTBalance: { $ne: "0" },
                ContractAddress: { $in: contractAddressArray },
            },
        },
        {
            $lookup: {
                from: "tokens",
                localField: "NFTId",
                foreignField: "NFTId",
                as: "tokenData",
            },
        },
        {
            $unwind: "$tokenData",
        },
        {
            $lookup: {
                from: "userships",
                localField: "tokenData._id",
                foreignField: "nftId",
                as: "shipData",
            },
        },
        {
            $unwind: {
                path: "$shipData",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                tokenData: 1,
                shipHexId: "$shipData.currentHexId",
            },
        },
    ];

    return await tokenowner.aggregate(query);
}



export const getUserShipHexIds = async (walletAddress) => {
    console.log("getUserShipHexIds", config.COLLECTION_CONTRACT_DETAILS.ship?.address);
    const tokenDatas = await getShipTokenDetailesWithContractAddress(walletAddress, [
        config.COLLECTION_CONTRACT_DETAILS.ship.address
    ]);
    console.log("🚀 ~ getUserShipHexIds ~ tokenDatas:", tokenDatas)
    const hexids = [];

    tokenDatas.forEach(token => {
        hexids.push(token.shipHexId);
    });
    return hexids;
};