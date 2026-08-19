import userSchema from './schema/user.schema';
import { FindDocument, SaveDocument, FindOneandupdate } from '../../shared/mongoosehelper';
import subscribe from './schema/subcriber.schema';
import activityschema from './schema/activity.schema';
import usercurrencydb from './schema/usercurrency.schema';
import config from '../../config/config';
import { TranscationService } from '../exchange/exchange.service';
export const Finduser = async (data, select) => {
    return await FindDocument(userSchema, data, select);
};

export const BulkWriteUser_Service = async (data) => {
    await userSchema.bulkWrite(data);
};
export const Findgameuser = async (data, select) => {
    // return await userSchema.findOne(data).select(select).populate("planets" , { } , "planetId" , {  })
    return await userSchema.findOne(data).select(select).lean();
};
export const FinduserById = async (data) => {
    return await userSchema.findById(data).populate('refferedBy', {});
};
export const FindOne_user_service = async (data) => {
    return await userSchema.findOne(data);
};
// export const FindUserWithWalletAddress = async (walletAddress) => {
//     return await userSchema.findOne({ WalletAddress: walletAddress });
// };

export const FindUserWithWalletAddress = async (walletAddress) => {
    return await userSchema.findOne({
        WalletAddress: { $regex: `^${walletAddress}$`, $options: 'i' },
    });
};

export const create_user_service = async (data) => {
    return await userSchema.create(data);
};

export const createUserWithWalletAddress = async (walletAddress) => {
    const payload = {
        DisplayName: walletAddress,
        WalletAddress: walletAddress.toLowerCase(),
        CustomUrl: walletAddress.toLowerCase(),
    };
    return await userSchema.create(payload);
};
export const SaveUser = async (data) => {
    return await SaveDocument(userSchema, data);
};

export const getdisplaynameandcustomurl = async (userid, userdisplayname, userurl) => {
    return await userSchema.findOne({
        $or: [
            { _id: { $ne: userid }, DisplayName: userdisplayname },
            { _id: { $ne: userid }, CustomUrl: userurl },
        ],
    });
};

export const SaveNewsletter = async (data) => {
    return await SaveDocument(subscribe, data);
};

export const FindNewsletter = async (data, select) => {
    return await FindDocument(subscribe, data, select);
};
export const FindAllNewsletter = async () => {
    return await subscribe.find();
};

export const FindUserandUpdate = async (find, update) => {
    return FindOneandupdate(userSchema, find, update, { new: true });
};

export const FindNotification = async (address, skip) => {
    const query = [
        {
            $match: {
                $expr: {
                    $or: [{ $eq: ['$To', address] }, { $eq: ['$From', address] }],
                },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $match: {
                $expr: {
                    $or: [
                        {
                            $and: [{ $eq: ['$From', address] }, { $eq: ['$Activity', 'Buy'] }],
                        },
                        {
                            $and: [
                                { $eq: ['$To', address] },
                                { $in: ['$Activity', ['EditBid', 'Bid', 'Accept', 'Transfer']] },
                            ],
                        },
                    ],
                },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'To',
                foreignField: 'WalletAddress',
                as: 'tousers',
            },
        },
        {
            $unwind: '$tousers',
        },
        {
            $lookup: {
                from: 'users',
                localField: 'From',
                foreignField: 'WalletAddress',
                as: 'fromusers',
            },
        },
        {
            $unwind: '$fromusers',
        },
        {
            $lookup: {
                from: 'tokens',
                localField: 'NFTId',
                foreignField: 'NFTId',
                as: 'tokendetails',
            },
        },
        {
            $unwind: '$tokendetails',
        },
        {
            $skip: ((skip ? parseInt(skip) : 1) - 1) * 10, // Replace with the number of documents to skip
        },
        {
            $limit: 10, // Replace with the number of documents to return
        },
    ];

    return await activity.aggregate(query);
};

export const SaveActivity = async (data) => {
    const { Activity, From, To } = data;
    if (
        Activity === 'Follow' ||
        Activity === 'UnFollow' ||
        Activity === 'Like' ||
        Activity === 'DisLike'
    ) {
        let finddata = { From: From, To: To };
        let update = { $set: data };
        let save = { new: true };
        await activityschema.FindOneandupdate(finddata, update, save);
    } else {
        const { Data } = data;
        let saveData = new activityschema(Data);
        let FinOnUData = await saveData.save();
        // activityschema.
        // var SenVal = { DBName: ActivitySchema, Data: data };
        // var chk = await Save(SenVal);
    }
};

// services for userseach in nft controller

export const userseachservice = async (data) => {
    const { finddata, selectdata, limit, skip } = data;
    let result = '';
    if (limit) {
        result = await userSchema.find(finddata, selectdata).skip(skip).limit(limit);
    } else {
        result = await userSchema.find(finddata, selectdata);
    }
    return { status: result ? true : false, data: result ? result : null };
};
export const userban = async (_id, status) => {
    return await userSchema.findOneAndUpdate({ _id: _id }, { delete: status });
};
export const userFindOneAndUpdate = async (find, update) => {
    return await userSchema.findOneAndUpdate(find, update);
};
export const userfindby = async (id) => {
    return await userSchema.findById(id);
};
// export const getBalance = async(address)=>{
// const bal = await usercurrencydb.find({walletAddress : address}).populate("currencyId", {})
// return bal
// }
export const addbalace = async (data) => {
    const created = await usercurrencydb.create(data);
    return created;
};
export const creteMultipleusercurrency = async (data) => {
    const created = await usercurrencydb.create(data);
    return created;
};

export const findinuserCurrency = async (data) => {
    console.log("findinuserCurrency", data)
    const find = await usercurrencydb
        .find(data)
        .populate({
            path: 'currencyId',
            match: { isActive: true }, // ✅ filter populated docs
            select: {
                address: 1,
                decimal: 1,
                valueofGalfi: 1,
                isWithdraw: 1,
                isDeposit: 1,
                value: 1,
                // currencyId: 1
            },
        })
        .lean();
    console.log("find", find, find.filter((item) => item.currencyId))

    return find.filter((item) => item.currencyId !== null);
};
export const updateuserbalance = async (find, update) => {
    const data = await usercurrencydb.findOneAndUpdate(find, update);
    return data;
};
export const findUserbalance = async (find) => {
    const data = await usercurrencydb.findOne(find);
    return data;
};

export const bulkwriteuserCurrency_service = async (payload) => {
    return await usercurrencydb.bulkWrite(payload);
};

export const addpriceinadminCurrency_service = async (payload) => {
    const admin = config.adminAddress;
    let cost = payload;
    let dataforbulkwirte = [];
    for (let i = 0; i < cost.length; i++) {
        let data = cost[i];
        let a = {
            updateOne: {
                filter: {
                    $or: [{ label: data.label }, { name: data.label }],
                    walletAddress: admin,
                },
                update: { $inc: { balance: data?.amount } },
            },
        };
        dataforbulkwirte.push(a);
    }
    return await bulkwriteuserCurrency_service(dataforbulkwirte);
};

export const deductPriceFromuserCurrencyAndUpdateAdminCurrency = async (
    pricePayload,
    userwalletAddress,
    action = 'default',
) => {
    try {
        const tranreward = [];

        let trans = {
            from: userwalletAddress,
            to: config.ADMIN_WALLETADDRRESS,
            price: pricePayload,
            userassetId: null,
            action: action,
        };

        // const admin = config.ADMIN_WALLETADDRRESS;
        // let cost = pricePayload;
        // let dataforbulkwirte = [];
        // for (let i = 0; i < cost.length; i++) {
        //     let data = cost[i];
        //     let a = {
        //         updateOne: {
        //             filter: {
        //                 $or: [{ label: data.label }, { name: data.label }],
        //                 walletAddress: admin,
        //             },
        //             update: { $inc: { balance: data?.amount } },
        //         },
        //     };
        //     dataforbulkwirte.push(a);
        // }
        // const adminupdated = await bulkwriteuserCurrency_service(dataforbulkwirte);


        let dataforbulkwirte = [];
        userwalletAddress = userwalletAddress.toLowerCase();

        for (let i = 0; i < cost.length; i++) {
            let data = cost[i];
            let a = {
                updateOne: {
                    filter: {
                        $or: [{ label: data.label }, { name: data.label }],
                        walletAddress: userwalletAddress,
                    },
                    update: { $inc: { balance: -data?.amount } },
                },
            };
            dataforbulkwirte.push(a);
        }
        const userupdated = await bulkwriteuserCurrency_service(dataforbulkwirte);
        await TranscationService(trans);

        return true;
    } catch (e) {
        return false;
    }
};
export const deletall = async (walletAddress) => {
    await usercurrencydb.deleteMany({ walletAddress: walletAddress });
    await userSchema.deleteMany({ WalletAddress: walletAddress });
};

export const findOneUser = async (find) => {
    return await userSchema.findOne(find).lean();
};

export const alluserService = async () => {
    return await userSchema.find().lean();
};

export const updateManyUser = async (data) => {
    return await userSchema.updateMany(data);
};

export const checkforenounghbalance = async (consuption, walletAddress) => {
    try {
        if (consuption.length == 0) {
            return true;
        }

        const userbalance = await findinuserCurrency({ walletAddress: walletAddress });

        for (let i = 0; i < consuption.length; i++) {
            const consumptionItem = consuption[i];

            for (let j = 0; j < userbalance.length; j++) {
                let balanceItem = userbalance[j];

                if (
                    consumptionItem.label === balanceItem.label ||
                    consumptionItem.label.toLowerCase() === balanceItem.name.toLowerCase()
                ) {
                    console.log(
                        'balanceItem',
                        balanceItem,
                        userbalance[j],
                        Number(consumptionItem.amount),
                        Number(balanceItem.balance),
                    );

                    if (Number(consumptionItem.amount) > Number(balanceItem.balance)) {
                        return false;
                    }
                }
            }
        }

        return true;
    } catch (err) {
        return false;
    }
};

export const isValidReferredBy = async (walletAddress, referredByWalletAddress) => {
    // no referrer → invalid
    if (!referredByWalletAddress) return false;

    // referrer cannot refer themselves
    if (walletAddress === referredByWalletAddress) return false;

    // fetch referrer profile
    const referrer = await userSchema.findOne({
        WalletAddress: referredByWalletAddress,
    });

    if (!referrer) return false;

    // check referrer account age (must be less than 1 year old)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return referrer.createdAt > oneYearAgo;
};
