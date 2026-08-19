import {
    catchresponse,
    isEmpty,
    Node_Mailer,
    sendRes,
    sendResponse,
    signature_imageURL,
} from '../../../shared/commonFunction';
import Userschema from '../../user/schema/user.schema';
import bcrypt from 'bcrypt';
import config from '../../../config/config';
import jwt from 'jsonwebtoken';
import { userban, userfindby } from '../../user/user.services';
import { AdminfindOne, GameValues_update } from './admin.service';
import { Encryptdata } from '../../../shared/credentialsetup';
import * as adminservice from './admin.service';
import {
    findAsset,
    findAssetOne,
    findLevels,
    findOneandUpdate_level_db,
} from '../../game/game.service';
import { findOneMissionStatsPopulate } from '../../missions/mission.service';
import { httpStatus } from '../../../utils/httpStatus';
import { mailTemplate } from '../../emailTemplate/emailTemplate.controller';
import Admin from './schema/admin.schema';
import { log } from 'winston';
import level_db from '../../game/schema/level.schema';
import assetdb from '../../game/schema/asset.schema';
const yup = require('yup');

export const loginAdmin = async (req, res) => {
    try {
        let ReqBody = req.body;
        let checkPassword = ReqBody.password;
        let user = await AdminfindOne({ email: ReqBody.email });
        user = user[0];
        if (user) {
            const match = await bcrypt.compare(checkPassword, user.hashpassword);
            if (match) {
                let payload = { id: user._id };
                let tokenhash = jwt.sign(payload, config.SECRET_KEY);
                const token = `Bearer ${tokenhash}`;
                console.log("condition1")
                res.status(200).json({
                    status: true,
                    message: 'successfully logged in',
                    data: true,
                    token: tokenhash,
                });
            } else {
                console.log("condition2")
                sendResponse(res, 400, false, 'incorrect password');
            }
        } else {
            console.log("condition3")
            sendResponse(res, 400, false, 'user not found', false);
        }
    } catch (err) {
        console.log("loginAdmin___err", err)
        catchresponse(res, err);
    }
};

export const getForgotPasswordOTP = async (req, res) => {
    console.log("getForgotPasswordOTP called", req.body);
    try {
        const { email } = req.body;
        if (!email) {
            return sendResponse(res, 400, false, 'Email is required');
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return sendResponse(res, 404, false, "Admin not found");
        }
        const OTP = (Math.floor(Math.random() * 900000) + 100000).toString();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

        admin.otp = OTP;
        admin.otpExpire = otpExpire;
        await admin.save();

        var sentMail = await mailTemplate({
            identifier: 'forgot_otp_admin',
            toEmail: admin.email,
            content: {
                otp: OTP,
                userName: admin.username,
                email: admin.email,
                reason: '',
                loginlink: '',
            }
        });

        if (sentMail) {
            return sendResponse(res, 200, true, 'OTP sent to email successfully');
        } else {
            return sendResponse(res, 500, false, 'Failed to send OTP email');
        }

    } catch (error) {
        console.log("getForgotPasswordOTP___err", error);
        catchresponse(res, error);
    }
};

export const updateForgotPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmNewPassword } = req.body;
        if (!email || !otp) {
            return sendResponse(res, 400, false, 'Email and OTP are required');
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        console.log("updateForgotPassword", { email, otp, newPassword, admin })
        if (!admin) {
            return sendResponse(res, 404, false, "Admin not found");
        }
        if (admin.otp !== otp) {
            return sendResponse(res, 400, false, "Invalid OTP");
        }
        if (admin.otpExpire < new Date()) {
            return sendResponse(res, 400, false, "OTP has expired");
        }
        if (!newPassword || !confirmNewPassword) {
            return sendResponse(res, 400, false, 'New password and confirm password are required');
        }
        if (newPassword !== confirmNewPassword) {
            return sendResponse(res, 400, false, "New password and confirm password do not match");
        }
        admin.otp = "";
        admin.otpExpire = null;
        admin.password = newPassword;
        admin.hashpassword = await bcrypt.hash(newPassword, 10);
        await admin.save();

        return sendResponse(res, 200, true, "OTP verified successfully");
    } catch (error) {
        console.log("verifyForgotPasswordOTP___err", error);
        catchresponse(res, error);
    }
};

export const userlist = async (req, res) => {
    try {
        const userdata = await Userschema.find(
            {},
            { DisplayName: 1, WalletAddress: 1, EmailId: 1, phone: 1, _id: 1, blockedStatus: 1 },
        );

        res.status(200).json(
            Encryptdata({ status: true, message: 'user data fetched! ', data: userdata }),
        );
    } catch (error) {
        catchresponse(res, error);
    }
};

export const updateuserstatus = async (req, res) => {
    try {
        const { userId, blockedStatus } = req.body;

        // Allow only active or blocked
        const allowedStatus = ['active', 'blocked'];
        console.log(req.body, "allowedStatus", allowedStatus, blockedStatus, !allowedStatus.includes(blockedStatus))
        if (!allowedStatus.includes(blockedStatus)) {
            return res.status(400).json(Encryptdata({ status: false, message: 'Status must be either active or blocked' }),);
        }

        // Find user first
        const userData = await Userschema.findById(userId);

        if (!userData) {
            return res.status(404).json(Encryptdata({ status: false, message: 'User not found' }));
        }

        // Validation for already same status
        if (userData.blockedStatus === blockedStatus) {
            return res.status(400).json(Encryptdata({
                status: false,
                message:
                    blockedStatus === 'blocked'
                        ? 'User is already blocked'
                        : 'User is already active',
            }),
            );
        }

        // Update status
        userData.blockedStatus = blockedStatus;
        await userData.save();

        res.status(200).json(Encryptdata({
            status: true,
            message:
                blockedStatus === 'blocked'
                    ? 'User blocked successfully!'
                    : 'User activated successfully!',
            data: userData,
        }),
        );
    } catch (error) {
        console.log("updateuserstatus___err", error)
        catchresponse(res, error);
    }
};

export const userdetail = async (req, res) => {
    try {
        const { id } = req.body;
        // ! userfindby service from user module
        const userdata = await userfindby(id);

        // Userschema.find({_id : id }, { firstname: 1, lastname: 1, email: 1, phone: 1 , _id : 1 , refcode : 1 , registered : 1 ,
        //   kycverify : 1 , delete : 1 , userid : 1
        // })
        sendResponse(res, 200, true, 'user data fetched', userdata);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const Banuser = async (req, res) => {
    try {
        const { _id, status } = req.body;
        // ! userban service from user module
        const userdata = await userban(_id, status);
        sendResponse(res, 200, true, 'user banned', userdata);
    } catch (error) {
        catchresponse(res, error);
    }
};
export const gamevalue = async (req, res) => {
    try {
        const payload = {
            rewardTimes: req.body.rewardTimes,
            missionReward: req.body.missionReward,
            refferal_Percent: req.body.refferal_Percent,
            consumabelTimes: req.body.consumabelTimes,
        };

        const userdata = await GameValues_update(req.body._id, payload);
        sendResponse(res, 200, true, 'updated', userdata);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const creategamevalue = async (req, res) => {
    try {
        const lod = req.body;
        const data = await adminservice.get_GameValues();
        if (data) {
            return sendRes(res, 400, false, 'already exist gameValue', null);
        }
        const result = await adminservice.Create_GameValues(lod);
        sendRes(res, 200, true, 'created', result);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const UpdateMissionPlanetLimit = async (req, res) => {
    try {
        const {
            body: { rarity, limit },
        } = req;
        const val = await adminservice.UpdateOneGameValues(
            { 'missionPlanetsLimit.rarity': rarity },
            { 'missionPlanetsLimit.$.limit': limit },
        );
        sendRes(res, 200, true, 'updated', val);
    } catch (e) {
        catchresponse(res, error);
    }
};

export const getGamevalue = async (req, res) => {
    try {
        const data = await adminservice.getGameValues();
        sendRes(res, 200, true, 'fetched', data);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const UpdateGameSettingMissionTime = async (req, res) => {
    try {
        const {
            body: { _id, mission_min, rewardTimes, xpmin, xpmax },
        } = req;
        const val = await adminservice.UpdateOneGameValues(
            { 'missionReward._id': _id },
            {
                'missionReward.$.mission_min': mission_min,
                'missionReward.$.rewardTimes': rewardTimes,
                'missionReward.$.xpmin': xpmin,
                'missionReward.$.xpmax': xpmax
            },
        );
        sendRes(res, 200, true, 'updated', val);
    } catch (e) {
        catchresponse(res, e);
    }
};

export const UpdateGameSetting = async (req, res) => {
    console.log("UpdateGameSetting", req.body)
    try {
        const { body } = req;

        const updateData = {};

        // ✅ Simple fields
        if (!isEmpty(body.rewardTimes)) updateData.rewardTimes = Number(body.rewardTimes);
        if (!isEmpty(body.adminPrivateKey)) updateData.adminPrivateKey = body.adminPrivateKey;
        if (!isEmpty(body.costTimes)) updateData.costTimes = Number(body.costTimes);
        if (!isEmpty(body.consumabelTimes)) updateData.consumabelTimes = Number(body.consumabelTimes);
        if (!isEmpty(body.optionalCost)) updateData.optionalCost = Number(body.optionalCost);
        // if (!isEmpty(body.production_time_in_min)) updateData.production_time_in_min = Number(body.production_time_in_min);
        if (!isEmpty(body.contruction_time_in_min)) updateData.contruction_time_in_min = Number(body.contruction_time_in_min);
        if (!isEmpty(body.hex_jump_time_in_min)) updateData.hex_jump_time_in_min = Number(body.hex_jump_time_in_min);
        if (!isEmpty(body.refferal_Percent)) updateData.refferal_Percent = Number(body.refferal_Percent);
        if (!isEmpty(body.default_royalty)) updateData.default_royalty = Number(body.default_royalty);
        if (!isEmpty(body.maxWithdrawLimit)) updateData.maxWithdrawLimit = Number(body.maxWithdrawLimit);
        if (!isEmpty(body.withdrawHitLimit)) updateData.withdrawHitLimit = Number(body.withdrawHitLimit);

        // ✅ Arrays (only update if provided)
        if (Array.isArray(body.missionReward)) {
            updateData.missionReward = body.missionReward.map((item) => ({
                scope: Number(item.scope),
                mission_min: Number(item.mission_min),
                rewardTimes: Number(item.rewardTimes),
                xpmin: Number(item.xpmin),
                xpmax: Number(item.xpmax)
            }));
        }

        if (Array.isArray(body.missionPlanetsLimit)) {
            updateData.missionPlanetsLimit = body.missionPlanetsLimit.map((item) => ({
                rarity: item.rarity,
                limit: Number(item.limit),
            }));
        }

        if (Array.isArray(body.missionRarityLevel)) {
            updateData.missionRarityLevel = body.missionRarityLevel.map((item) => ({
                rarity: item.rarity,
                xpPoints: Number(item.xpPoints),
            }));
        }

        if (Array.isArray(body.missionMultiplier)) {
            updateData.missionMultiplier = body.missionMultiplier.map((item) => ({
                minlevel: item.minlevel,
                maxlevel: item.maxlevel,
                multiplier: Number(item.multiplier),
            }));
        }

        console.log(updateData, "UpdateGameSetting")

        // ✅ ObjectId
        if (!isEmpty(body.freeShipId)) {
            updateData.freeShipId = body.freeShipId;
        }

        const val = await adminservice.UpdateOneGameValues(
            {},
            { $set: updateData },
            { new: true }
        );


        if (!isEmpty(body.rewardTimes) || !isEmpty(body.consumabelTimes) || !isEmpty(body.costTimes)) {
            const assets = await assetdb.find({}).lean();
            const updateMany = [];

            for (const asset of assets) {
                const levelOne = await level_db.findOne({
                    assetId: asset._id,
                    level: 1,
                });

                if (!levelOne) continue;

                const maxLevel = asset.levelLimit;

                for (let level = 1; level <= maxLevel; level++) {
                    const updatePayload = {};

                    if (!isEmpty(body.rewardTimes)) {
                        updatePayload.reward = levelOne.reward.map((item) => ({
                            label: item.label,
                            amount: Number(item.amount) * Math.pow(Number(body.rewardTimes), level - 1),
                        }));
                    }

                    if (!isEmpty(body.consumabelTimes)) {
                        updatePayload.dailyConsumption = levelOne.dailyConsumption.map((item) => ({
                            label: item.label,
                            amount: Number(item.amount) * Math.pow(Number(body.consumabelTimes), level - 1),
                        }));
                    }

                    if (!isEmpty(body.costTimes)) {
                        updatePayload.cost = levelOne.cost.map((item) => ({
                            label: item.label,
                            amount: Number(item.amount) * Math.pow(Number(body.costTimes), level - 1),
                        }));
                    }


                    updateMany.push(
                        findOneandUpdate_level_db(
                            { assetId: asset._id, level },
                            updatePayload
                        )
                    );
                }
            }

            await Promise.all(updateMany);
        }

        sendRes(res, 200, true, 'updated', val);

    } catch (e) {
        catchresponse(res, e);
    }
};

export const gamesetting = async (req, res) => {
    console.log('gamesetting')
    try {
        const { body } = req;
        const encryptPrivateKey = body?.adminPrivateKey ? Encryptdata(body?.adminPrivateKey) : null;
        const val = await adminservice.UpdateOneGameValues(
            {},
            { ...body, adminPrivateKey: encryptPrivateKey },
        );
        sendRes(res, 200, true, 'updated', val);
    } catch (e) {
        catchresponse(res, e);
    }
};

export const addMissionRewardOnGameSettings = async (req, res) => {
    try {
        const body = req.body;
        const gameSettings = await adminservice.FindOneGameValues({});

        let newScope = 1;

        if (gameSettings?.missionReward?.length > 0) {
            const lastItem = gameSettings.missionReward[gameSettings.missionReward.length - 1];

            newScope = (lastItem.scope || 0) + 1;
        }

        const newMissionReward = {
            ...body.missionReward,
            scope: newScope,
        };

        const val = await adminservice.UpdateOneGameValues(
            {},
            {
                $push: {
                    missionReward: newMissionReward,
                },
            },
        );

        sendRes(res, 200, true, 'Mission reward added successfully', val);
    } catch (e) {
        catchresponse(res, e);
    }
};

export const getMissionRewardOnGameSettings = async (req, res) => {
    try {
        const { id } = req.query;

        const gameSetting = await adminservice.FindOneGameValues({});

        if (!gameSetting) {
            return sendRes(res, 404, false, 'Game settings not found');
        }

        if (id) {
            const item = gameSetting.missionReward.find((mr) => mr._id.toString() === id);

            if (!item) {
                return sendRes(res, 404, false, 'Mission reward not found');
            }

            return sendRes(res, 200, true, 'Single mission reward fetched', item);
        }

        return sendRes(res, 200, true, 'All mission rewards fetched', gameSetting.missionReward);
    } catch (e) {
        catchresponse(res, e);
    }
};

export const deleteMissionRewardOnGameSettings = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return sendRes(res, 400, false, 'missionReward id is required');
        }

        const val = await adminservice.DeleteOneGameValues(
            {},
            {
                $pull: {
                    missionReward: { _id: id },
                },
            },
        );

        sendRes(res, 200, true, 'Mission reward deleted successfully', val);
    } catch (e) {
        catchresponse(res, e);
    }
};

// export const buildings = async (req, res) => {
//     try {
//         const buildingsAssets = await findAsset();
//         sendRes(res, httpStatus.OK, true, 'fetched', buildingsAssets);
//     } catch (e) {
//         catchresponse(res, e);
//     }
// };

export const buildings = async (req, res) => {
    try {
        const buildingsAssets = await findAsset();

        for (const asset of buildingsAssets) {
            const levelOne = await level_db.findOne(
                { assetId: asset._id, level: 1 },
                { build_time_min: 1 }
            );

            asset.build_time_min = levelOne?.build_time_min || 0;
        }

        sendRes(
            res,
            httpStatus.OK,
            true,
            'fetched',
            buildingsAssets
        );
    } catch (e) {
        catchresponse(res, e);
    }
};

export const editBuildTimeForBuildings = async (req, res) => {
    try {
        // ✅ Yup Schema
        const schema = yup.object().shape({
            id: yup.string().required('ID is required').length(24, 'Invalid MongoDB ID'),
            build_Time_in_min: yup
                .number()
                .min(1, 'Build time must be >= 1')
                .nullable(),

            levelLimit: yup
                .number()
                .min(1, 'Level limit must be >= 1')
                .nullable(),

            buildLocationType: yup
                .string()
                .oneOf(["planet", "asteroid", "all"], "Invalid build location type")
                .nullable(),

        });

        // ✅ Validate input
        await schema.validate(req.body, { abortEarly: false });

        const { id, build_Time_in_min, levelLimit, buildLocationType } = req.body;

        if (
            build_Time_in_min === undefined &&
            levelLimit === undefined &&
            buildLocationType === undefined
        ) {
            return sendRes(
                res,
                httpStatus.BAD_REQUEST,
                false,
                'Either build_Time_in_min, levelLimit or buildLocationType is required'
            );
        }


        // ✅ Check if asset exists
        const data = await findAssetOne({ _id: id });
        if (!data) {
            return sendRes(res, httpStatus.NOT_FOUND, false, 'Asset not found');
        }

        // if (levelLimit !== undefined) {
        //     const levelData = await assetdb.findByIdAndUpdate(
        //         id,
        //         { levelLimit },
        //         { new: true }
        //     );
        //     console.log("levelData", levelData)
        // }


        const updateData = {};

        if (levelLimit !== undefined) {
            updateData.levelLimit = levelLimit;
        }

        if (buildLocationType !== undefined) {
            updateData.buildLocationType = buildLocationType;
        }

        if (Object.keys(updateData).length > 0) {
            await assetdb.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );
        }


        // ✅ Update asset levels

        // const levels = await findLevels({ assetId: data._id });
        // console.log("levels", levels, levels.length)
        // const multiplier = 1.5; // 50% increase per level
        if (build_Time_in_min !== undefined) {
            const maxLevel = levelLimit ?? data.levelLimit;
            const gameValue = await adminservice.getGameValues();
            console.log("gameValue", gameValue)
            const multiplier = gameValue?.contruction_time_in_min || 1.5; // 50% increase per level
            console.log("multiplier", multiplier)

            const assetLelFind = [];
            const buildTimes = [];

            for (let i = 1; i <= maxLevel; i++) {
                const time = build_Time_in_min * Math.pow(multiplier, i - 1);
                console.log("time", time)
                assetLelFind.push({ assetId: data._id, level: i });
                buildTimes.push({ build_time_min: time });
            }

            const updateMany = [];
            for (let i = 0; i < assetLelFind.length; i++) {
                updateMany.push(findOneandUpdate_level_db(assetLelFind[i], buildTimes[i]));
            }

            await Promise.all(updateMany);
        }
        const updatedTime = await findAssetOne({ _id: id });
        console.log("updatedTime", updatedTime)


        return sendRes(res, httpStatus.OK, true, 'Updated successfully', updatedTime);
    } catch (e) {
        if (e.name === 'ValidationError') {
            return sendRes(res, httpStatus.BAD_REQUEST, false, e.errors.join(', '));
        }
        catchresponse(res, e);
    }
};

export const getMissionStats = async (req, res) => {
    try {
        const {
            params: { id },
        } = req;

        const missionData = await findOneMissionStatsPopulate({ _id: id });

        sendRes(res, httpStatus.OK, true, 'fetched', missionData);
    } catch (e) {
        catchresponse(res, e);
    }
};

export const getDashboardData = async (req, res) => {
    try {
        const data = await adminservice.getDashboardData();
        sendRes(res, httpStatus.OK, true, 'Dashboard data fetched successfully', data);
    } catch (e) {
        catchresponse(res, e);
    }
}