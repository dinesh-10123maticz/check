import * as trainingService from '../services/training.service';
import constant from '../../../shared/constant';
import { checkforenounghbalance } from '../../user/user.services';
import { add_minutes, sendRes } from '../../../shared/commonFunction';
import { FindTokenandUpdate, updateManyToken } from '../../nft/nft.services';

export const createTraining = async (req, res) => {
    // get the nfts as ids
    const {
        body: { nftIds },
        userData,
    } = req;
    const walletAddress = userData.WalletAddress;
    try {
        const payloads = [];
        let trainAmount = constant.TRAINING_PRICE.amount;
        const trainingtime = constant.TRAINING_DETAILS.time_minute;
        let totaltrainAmount = 0;
        let time = Date.now();
        // TODO : check the user have the train Amout is this on create Train is already trainig
        for (let i = 0; i < nftIds.length; i++) {
            let data = {
                nftId: nftIds[i],
                walletAddress: walletAddress,
                startAt: time,
                endAt: add_minutes(time, trainingtime),
                amount: trainAmount,
            };

            totaltrainAmount = totaltrainAmount + trainAmount;

            payloads.push(data);
        }

        const isValid = await checkforenounghbalance(
            [
                {
                    label: constant.TRAINING_PRICE.lable,
                    amount: totaltrainAmount,
                },
            ],
            walletAddress,
        );

        if (!isValid) return sendRes(res, 400, false, 'Insufficient balance');

        // check the user have the train Amout is this on create Train

        const created = await trainingService.insertManyTraining(payloads);

        await updateManyToken({ _id: { $in: nftIds } }, { isLocked: true });
        sendRes(res, 201, true, 'traning', created);
    } catch (e) {
        sendRes(res, 500, false, 'please try later', e);
    }
};

export const claimTrainedCrew = async (req, res) => {
    const {
        body: { id },
        userData,
    } = req;
    try {
        const walletAddress = userData.WalletAddress;

        const result = await trainingService.findOneTraining({
            _id: id,
            walletAddress: walletAddress,
        });
        if (!result) return sendRes(res, 404, false, 'Not found');
        const nftId = result.nftId._id;
        const updatednft = await FindTokenandUpdate(
            { _id: nftId },
            { $inc: { xp: constant.TRAINING_REWARD_XP }, isLocked: false },
        );

        await trainingService.findOneAndUpdateTraining({ _id: id }, { status: 'completed' });
        sendRes(res, 200, true, 'claimed', updatednft);
    } catch (e) {
        sendRes(res, 500, false, 'please try later', e);
    }
};

export const getTrainningCrew = async (req, res) => {
    const {
        query: { status },
        userData,
    } = req;
    try {
        const walletAddress = userData.WalletAddress;

        const result = await trainingService.findTraining({
            walletAddress: walletAddress,
            status: status,
        });
        sendRes(res, 200, true, 'success', result);
    } catch (e) {
        sendRes(res, 500, false, 'please try later', e.message);
    }
};
