import { RedisGet, RedisSet } from '../../../services/redisclient';
import { sendRes, signature_imageURL } from '../../../shared/commonFunction';
import * as promoService from '../service/promo.service';

function sanitizeUrl(input) {
    return input
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special characters with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

export const createBlog = async (req, res) => {
    try {
        const { imageUrl, heading, description } = req.body;
        const customurl = sanitizeUrl(heading);

        const payload = {
            image: imageUrl,
            heading: heading,
            description: description,
            url: customurl,
        };

        const exists = await promoService.findOneBlog({ url: customurl });

        if (exists) {
            return sendRes(res, 400, false, `heading already exists`, exists);
        }

        const data = await promoService.createBlog(payload);

        sendRes(res, 201, true, `blog created successfully`, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const GetBlog = async (req, res) => {
    try {
        const {
            params: { id },
        } = req;

        const cacheKey = `blog:${id}`;

        const cached = await RedisGet(cacheKey);
        if (cached) {
            return sendRes(res, 200, true, 'blog found (cache)', cached);
        }

        const exists = await promoService.findOneBlog({ url: id });

        if (exists) {
            await RedisSet(cacheKey, exists, 300);
        }

        sendRes(res, 201, true, exists ? 'blog found' : 'blog not found', exists);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const GetNews = async (req, res) => {
    try {
        const {
            params: { id },
        } = req;
        const cacheKey = `news:${id}`;

        const cached = await RedisGet(cacheKey);
        if (cached) {
            return sendRes(res, 200, true, 'news found (cache)', cached);
        }

        const exists = await promoService.findOneNews({ url: id });

        sendRes(res, 201, true, exists ? 'news found' : 'news not found', exists);

        if (exists) {
            await RedisSet(cacheKey, exists, 300);
        }
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const updateBlog = async (req, res) => {
    try {
        const { _id, imageUrl, heading, description } = req.body;
        const payload = {
            image: imageUrl,
            heading: heading,
            description: description,
        };
        const data = await promoService.updateBlog({ _id: _id }, payload);

        sendRes(res, 200, true, `blog updated successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
export const blogList = async (req, res) => {
    try {
        const data = await promoService.findBlogs({});

        data.forEach((a) => {
            a.image = signature_imageURL(a.image);
        });
        sendRes(res, 200, true, `blog list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const adminblogList = async (req, res) => {
    try {
        const data = await promoService.findBlogs({});

        sendRes(res, 200, true, `blog list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const BlogStatusChange = async (req, res) => {
    try {
        const { _id } = req.body;

        const data = await promoService.findByIdBlogs(_id);
        await promoService.updateBlog({ _id: data._id }, { isActive: !data.isActive });
        sendRes(res, 200, true, `${data.isActive ? 'hidden' : 'show'} successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const BlogDelete = async (req, res) => {
    try {
        const {
            body: { _id },
        } = req;

        const data = await promoService.deleteOneBlog({ _id: _id });
        sendRes(res, 200, true, `deleted successfully `, data);
    } catch (e) {
        return sendRes(res, 500, false, e.message);
    }
};

export const NewsDelete = async (req, res) => {
    try {
        const {
            body: { _id },
        } = req;

        const data = await promoService.deleteOnenews({ _id: _id });
        sendRes(res, 200, true, `Deleted successfully `, data);
    } catch (e) {
        return sendRes(res, 500, false, e.message);
    }
};

export const createNews = async (req, res) => {
    try {
        const { imageUrl, videoUrl, heading, description, navLink } = req.body;
        const payload = {
            image: imageUrl,
            video: videoUrl ? videoUrl : null,
            heading: heading,
            description: description,
            navLink: navLink.trim(),
        };
        const data = await promoService.createNews(payload);

        sendRes(res, 201, true, `News created successfully`, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const updateNews = async (req, res) => {
    try {
        const { _id, imageUrl, heading, description, navLink } = req.body;
        const payload = {
            image: imageUrl,
            heading: heading,
            description: description,
            navLink: navLink.trim(),
        };
        const data = await promoService.updateNews({ _id: _id }, payload);

        sendRes(res, 200, true, `blog updated successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const blogListForSite = async (req, res) => {
    try {
        const cacheKey = 'blogs:list:site';

        const cached = await RedisGet(cacheKey);
        if (cached) {
            return sendRes(res, 200, true, 'blog list (cache)', cached);
        }

        const data = await promoService.findBlogs({ isActive: true });

        data.forEach((a) => {
            if (a.image) {
                a.image = signature_imageURL(a.image);
            } else {
                a.image = null;
            }
        });

        await RedisSet(cacheKey, data, 300);

        sendRes(res, 200, true, `blog list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
export const partnerList = async (req, res) => {
    try {
        const data = await promoService.findPartners({ isActive: true });
        sendRes(res, 200, true, `partner list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
export const partnerDelete = async (req, res) => {
    try {
        const {
            body: { _id },
        } = req;
        const data = await promoService.partnerDelete(_id);
        sendRes(res, 200, true, `deleted successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const partnerCreate = async (req, res) => {
    try {
        req.body.navLink = req.body?.navLink?.trim();
        const data = await promoService.partnerCreate(req.body);
        sendRes(res, 200, true, `created successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
export const PromoBuildingList = async (req, res) => {
    try {
        const data = await promoService.findPromobuild({ isActive: true });
        sendRes(res, 200, true, `partner list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
export const PromoCMS = async (req, res) => {
    try {
        const cacheKey = 'promo:cms';

        const cached = await RedisGet(cacheKey);
        if (cached) {
            return sendRes(res, 200, true, 'PromoCMS (cache)', cached);
        }

        const build = await promoService.findPromobuild({ isActive: true });
        const partner = await promoService.findPartners({ isActive: true });
        build.forEach((e) => (e.image = signature_imageURL(e.image)));
        partner.forEach((e) => (e.image = signature_imageURL(e.image)));
        const data = {
            promoBuild: build,
            parnerts: partner,
        };
        sendRes(res, 200, true, `PromoCMS list fetched successfully `, data);

        await RedisSet(cacheKey, data, 300);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
export const PromoBuildingDelete = async (req, res) => {
    try {
        const {
            body: { _id },
        } = req;
        const data = await promoService.PromobuildDelete(_id);
        sendRes(res, 200, true, `deleted successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const PromoBuildingCreate = async (req, res) => {
    try {
        const data = await promoService.PromobuildCreate(req.body);
        sendRes(res, 200, true, `created successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const PromoBuildingUpdate = async (req, res) => {
    try {
        const {
            body: { id, image, description, buildingName },
        } = req;
        if (!id) return sendRes(res, 400, false, `id required`);
        const data = await promoService.PromoBuildUpdateOne(
            { _id: id },
            { image: image, description: description, buildingName: buildingName },
        );
        sendRes(res, 200, true, `updated successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
export const NewsStatusChange = async (req, res) => {
    try {
        const { _id } = req.body;
        const data = await promoService.findByIdNews(_id);
        console.log("NewsStatusChange_data:", {data, isActive: data.isActive });
        const result = await promoService.updateNews(
            { _id: data._id },
            { isActive: !data.isActive },
        );
        const data1 = await promoService.findByIdNews(_id);
        console.log("NewsStatusChange_result:", {result, data1, isActive: !data.isActive });
        sendRes(res, 200, true, `${data.isActive ? 'hidden' : 'show'} successfully `, result);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const NewsList = async (req, res) => {
    try {
        const data = await promoService.findNewss({});

        data.forEach((a) => {
            if (a.image) {
                a.image = signature_imageURL(a.image);
            } else {
                a.image = null;
            }
        });
        sendRes(res, 200, true, `news list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const adminNewsList = async (req, res) => {
    try {
        const data = await promoService.findNewss({});

        sendRes(res, 200, true, `news list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};
