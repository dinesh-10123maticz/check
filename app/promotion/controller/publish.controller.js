import { sendRes } from '../../../shared/commonFunction';
import * as publishService from '../service/publish.service';

export const PublishDelete = async (req, res) => {
    try {
        const {
            body: { _id },
        } = req;
        const data = await publishService.DeletePublish({ _id: _id });
        sendRes(res, 200, true, `deleted successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const PublishList = async (req, res) => {
    try {
        //! add redis cache
        const data = await publishService.FindPublish({});
        sendRes(res, 200, true, `publish list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const PublishCreate = async (req, res) => {
    try {
        req.body.navLink = req.body.navLink.trim();
        const data = await publishService.CreatePublish(req.body);
        sendRes(res, 200, true, `created successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const PublishUpdate = async (req, res) => {
    try {
        const {
            body: { _id },
        } = req;
        const data = await publishService.FindOneAndUpdatePublish({ _id: _id }, req.body);
        if (!data) {
            return sendRes(res, 200, false, `failed to upload`, data);
        }
        sendRes(res, 200, true, `updated successfully `, data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};
