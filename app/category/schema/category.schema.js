import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
});

const Category = mongoose.model('category', CategorySchema, 'category');
export default Category;
