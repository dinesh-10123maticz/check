import mongoose from 'mongoose';
import constant from '../../../shared/constant';

const Schema = mongoose.Schema;

const SubCategorySchema = new Schema(
    {
        Classid: {
            type: Schema.Types.ObjectId,
            ref: constant.CATEGORY,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        key: {
            type: String,
            default: true,
        },

        value: {
            type: Array,
            default: [],
        },
        //    [ { index : {
        //     type : Number } , value : { type : String} } ],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

const SubCategory = mongoose.model('SubCategory', SubCategorySchema, 'SubCategory');
export default SubCategory;
