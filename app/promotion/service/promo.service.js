import blog from '../schema/blog.schema';
import news from '../schema/news.schema';
import partners from '../schema/partners.schema';
import promobuild from '../schema/building.promtional.schema';
import { client } from '../../../services/redisclient';
export const createBlog = async (data) => {
    await client.del('blogs:list', 'blogs:list:site', `blog:${data.url}`, 'promo:cms');

    return await blog.create(data);
};
export const deleteOneBlog = async (data) => {
    return await blog.deleteOne(data);
};
export const deleteOnenews = async (data) => {
    return await news.deleteOne(data);
};
export const updateBlog = async (find, update) => {
    return await blog.findOneAndUpdate(find, update);
};
export const findBlogs = async (data) => {
    return await blog.find(data).sort({ createdAt: -1 }).lean();
};
export const findByIdBlogs = async (data) => {
    return await blog.findById(data);
};
export const findOneBlog = async (data) => {
    return await blog.findOne(data);
};
export const findOneNews = async (data) => {
    return await news.findOne(data);
};

export const createNews = async (data) => {
    return await news.create(data);
};
export const updateNews = async (find, update) => {
    return await news.findOneAndUpdate(find, update);
};
export const findNewss = async (data) => {
    return await news.find(data).lean();
};
export const findByIdNews = async (data) => {
    return await news.findById(data);
};

export const findPartners = async (data) => {
    return await partners.find(data);
};
export const partnerDelete = async (id) => {
    return await partners.findByIdAndDelete(id);
};
export const partnerCreate = async (data) => {
    return await partners.create(data);
};

export const findPromobuild = async (data) => {
    return await promobuild.find(data);
};
export const PromobuildDelete = async (id) => {
    return await promobuild.findByIdAndDelete(id);
};
export const PromobuildCreate = async (data) => {
    return await promobuild.create(data);
};

export const PromoBuildUpdateOne = async (find, update) => {
    return await promobuild.findOneAndUpdate(find, update, { new: true });
};
