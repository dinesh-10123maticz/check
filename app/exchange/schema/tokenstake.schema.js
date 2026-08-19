import { model, Schema } from "mongoose";
import constant from '../../../shared/constant'
const stack = Schema(
    {

        userId : { type: Schema.Types.ObjectId, ref: constant.USER_DB , index : true} ,
        walletAddress: { type: String, default: null , index : true},
        poolId : { type: Schema.Types.ObjectId, ref: constant.TOKENPOOL_DB } ,
        rewardAmount: { type: Number , default: 0 },
        stakedAmount: { type: Number , default: 0 },
        stakeCurrencyId : { type: Schema.Types.ObjectId, ref: constant.CURRENCY_DB } ,
        rewardCurrencyId : { type: Schema.Types.ObjectId, ref: constant.CURRENCY_DB } ,
        lockedOn : { type: Date , default: null },
        expire : { type: Date , default: null },
        claimed : {type : Boolean , default : false  }

    },
    { timestamps: true }
);

module.exports = model(constant.TOKENSTAKE_DB,stack)