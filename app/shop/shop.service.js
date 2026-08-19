import * as gameService from '../game/game.service';
import * as nftservice from '../nft/nft.services';
export const getTokenDetailesWithCollectionArray_service = async (
    walletAddress,
    collection,
    skip,
    limit,
) => {
    //  const collectionfind = collection.length ? {$in : collection }  : {$ne : null  }
    const collectionfind = collection;

    const query = [
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

    return await nftservice.TokenOwnerAggregate_service(query);
};

export const crewFind = async (find, pageno, limit) => {
    return await gameService.crewFind(find, pageno, limit);
};

export const tokensearch = async (find, pageno, limit) => {
    const query = [
        {
            $match: { NFTBalance: { $ne: '0' } },
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
        {
            $skip: skip, // Skip the first 10 documents (adjust as needed)
        },
        {
            $limit: limit, // Limit to 5 documents (adjust as needed)
        },
    ];

    return await nftservice.TokenOwnerAggregate_service(query);
};
