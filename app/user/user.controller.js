import {
    FindNewsletter,
    Finduser,
    SaveNewsletter,
    SaveUser,
    FindNotification,
    getdisplaynameandcustomurl,
    FindUserandUpdate,
    addbalace,
    Findgameuser,
    creteMultipleusercurrency,
    findinuserCurrency,
    updateuserbalance,
    deletall,
    findOneUser,
    userFindOneAndUpdate,
    updateManyUser,
    createUserWithWalletAddress,
} from './user.services';
import {
    sendResponse,
    catchresponse,
    isEmpty,
    ImageAddFunc,
    sendRes,
    signature_imageURL,
    generateReferralCode,
    toLowerCase,
    sendGameResponseEncrpted,
} from '../../shared/commonFunction';
import { Encryptdata, JWT_SIGN } from '../../shared/credentialsetup';
import { checkcurencyexist_service, get_cuurencyList_Service } from '../admin/cms/cms.service';
import {
    DataOfTranscation,
    Token_Balance_Calculation,
    TranscationhashStatus,
} from '../../shared/contract';
import { saveTrancationService, updateCurrency } from '../exchange/exchange.service';
import {
    getUserPlanetsService,
    userAssetsdbdelete,
    userPlanetdbdelete,
} from '../game/game.service';
import constant from '../../shared/constant';
import { getShipTokenDetailesWithContractAddress, getTokenDetailes, getUserPlanetAndAstroidHexIds, getUserShipHexIds } from '../nft/nft.services';
import { countOfMission } from '../missions/mission.service';
import config from '../../config/config';
import { uploadImageToS3 } from '../../services/aws';
import logger from '../../utils/logger';
export const UserRegister = async (req, res) => {
    try {
        const {
            WalletAddress,
            WalletType,
            EmailId,
            DisplayName,
            Youtube,
            Facebook,
            Twitter,
            Instagram,
            Bio,
            CustomUrl,
            image_key,
        } = req.body;

        console.log("uerRegister_req", req.body)
        const saveData = {
            DisplayName: DisplayName ? DisplayName : WalletAddress,
            EmailId: EmailId,
            Youtube: Youtube,
            Facebook: Facebook,
            Twitter: Twitter,
            Instagram: Instagram,
            Bio: Bio,
            CustomUrl: CustomUrl ? CustomUrl : WalletAddress,
            profile_url: image_key ? image_key : null,
            Profile: image_key ? image_key : null,
            Cover: '',
            WalletAddress: WalletAddress,
            WalletType: WalletType,
        };

        const findcustom = { DisplayName: DisplayName };

        const select = { DisplayName: 1, CustomUrl: 1, EmailId: 1 };
        const customExits = await Finduser(findcustom, select);
        const FinDatacus = { CustomUrl: saveData.CustomUrl };
        const customExitscustomurl = await Finduser(FinDatacus, select);

        if (customExits) {
            if (customExits.DisplayName) {
                return sendResponse(res, 409, false, 'displayname already exist');
            }
            if (customExitscustomurl.CustomUrl) {
                return sendResponse(res, 409, false, 'custom url already exist');
            }
        }

        const savedata = await SaveUser(saveData);
        const token = JWT_SIGN(savedata?._id);
        if (savedata) {
            const Usercurrency = await createCurrencyforuser(
                saveData?.WalletAddress,
                savedata?._id,
            );
            const cuurencydata = await findinuserCurrency({
                WalletAddress: savedata?.WalletAddress,
            });

            res.status(201).json(
                Encryptdata({
                    status: true,
                    data: savedata,
                    token: token,
                    usercuurency: cuurencydata,
                    message: `connected successfully`,
                }),
            );
        } else {
            sendResponse(res, 400, false, "can't create user profile");
        }
    } catch (error) {
        logger.error(error);
        catchresponse(res, error);
    }
};
export const CreateGameUser = async (req, res) => {
    try {
        const {
            refferalByCode, // new added  8/jul/2024
            Type,
            WalletAddress,
            WalletType,
            EmailId,
            DisplayName,
            imageKey,
            Youtube,
            Facebook,
            Twitter,
            Instagram,
            Bio,
            CustomUrl,
        } = req.body;

        console.log("reqbody", req.body)
        const saveData = {
            DisplayName: DisplayName,
            EmailId: EmailId,
            Youtube: Youtube,
            Facebook: Facebook,
            Twitter: Twitter,
            Instagram: Instagram,
            Bio: Bio,
            CustomUrl: toLowerCase(WalletAddress),
            profile_url: imageKey ? imageKey : null,
            Profile: imageKey ? imageKey : null,
            Cover: '',
            WalletAddress: toLowerCase(WalletAddress),
            WalletType: WalletType,
            refferalByCode: refferalByCode ? refferalByCode : null,
            refferalCode: generateReferralCode(DisplayName.substring(0, 4)),
            refferedBy: null, // assigning value at last
        };

        const findcustom = { DisplayName: DisplayName };
        const FinData = { WalletAddress: WalletAddress };

        const select = { DisplayName: 1, CustomUrl: 1, EmailId: 1 };
        const customExits = await Finduser(findcustom, select);
        const FinDatacus = { CustomUrl: saveData.CustomUrl };
        const customExitscustomurl = await Finduser(FinDatacus, select);

        if (customExits) {
            if (customExits.DisplayName) {
                return sendRes(res, 409, false, 'displayname already exist');
            }
        }
        const walletExits = await Finduser(FinData, {});

        if (walletExits) {
            const token = JWT_SIGN(walletExits?._id);
            walletExits.profile_url = walletExits.profile_url
                ? signature_imageURL(walletExits.profile_url)
                : null;
            return res.status(200).json({
                status: true,
                data: walletExits,
                token: token,
                message: `connected successfully`,
            });
        }

        if (DisplayName.length <= 4) {
            return sendRes(res, 400, false, 'displayname must be greater than 4 letter');
        }

        if (refferalByCode) {
            const reffrecodeuser = await findOneUser({ refferalCode: refferalByCode }); // find refferal code user
            saveData.refferedBy = reffrecodeuser?._id;
            if (!reffrecodeuser) {
                return sendRes(res, 400, false, 'refferalcode not match any user !');
            }
        }

        const savedata = await SaveUser(saveData); // creating user
        console.log("savedata", savedata)
        const token = JWT_SIGN(savedata?._id); // generating JWT token

        if (savedata) {
            const da = await Finduser({ WalletAddress: savedata?.WalletAddress }, {});
            const Usercurrency = await createCurrencyforuser(
                savedata?.WalletAddress,
                savedata?._id,
            );
            console.log("Usercurrency", Usercurrency)
            da.profile_url = da.profile_url ? signature_imageURL(da.profile_url) : null;

            return res.status(201).json({
                status: true,
                data: da,
                token: token,
                message: `Created successfully`,
            });
        }
        console.log("savedata", savedata)

        return sendRes(res, 400, false, "can't create user profile");
    } catch (error) {
        logger.error(error);
        catchresponse(res, error);
    }
};

export const EditGameUser = async (req, res) => {
    try {
        const { userId, userData } = req;

        const {
            EmailId,
            DisplayName,
            Youtube,
            Facebook,
            Twitter,
            Instagram,
            Bio,
            imageKey,
            customUrl,
        } = req.body;

        const saveData = {
            DisplayName: DisplayName,
            EmailId: EmailId,
            Youtube: Youtube,
            Facebook: Facebook,
            Twitter: Twitter,
            Instagram: Instagram,
            Profile: imageKey ? imageKey : null,
            profile_url: imageKey ? imageKey : null,
            Bio: Bio,
            CustomUrl: customUrl ? customUrl : userData.WalletAddress,
        };

        const FinData = { WalletAddress: userData.WalletAddress };
        const select = { DisplayName: 1, CustomUrl: 1, EmailId: 1, WalletAddress: 1 };
        const customExits = await Finduser(FinData, select);
        const customExitscustomurl = await getdisplaynameandcustomurl(
            userId,
            saveData?.DisplayName,
            saveData?.CustomUrl,
        );

        if (!customExits) {
            logger.info('create profile');
            return sendRes(res, 409, false, 'create profile');
        }

        if (customExitscustomurl) {
            if (customExitscustomurl.DisplayName === saveData?.DisplayName) {
                return sendRes(res, 409, false, 'displayname already exist');
            }
            if (customExitscustomurl.CustomUrl === saveData?.CustomUrl) {
                return sendRes(res, 409, false, 'custom url already exist');
            }
        }

        const savedata = await FindUserandUpdate(
            { WalletAddress: userData.WalletAddress },
            saveData,
        );
        // const savedata = await SaveUser(saveData)
        const token = JWT_SIGN(savedata?._id);
        if (savedata) {
            savedata.profile_url = savedata.profile_url
                ? signature_imageURL(savedata.profile_url)
                : null;
            return res.status(201).json({
                statusCode: 201,
                status: true,
                data: savedata,
                token: token,
                message: `updated successfully`,
            });
        }

        return sendRes(res, 400, false, "can't update");
    } catch (error) {
        catchresponse(res, error);
    }
};
export const Editprofile = async (req, res) => {
    try {
        const { userId } = req;
        let {
            WalletAddress,
            EmailId,
            DisplayName,
            Youtube,
            Facebook,
            Twitter,
            Instagram,
            Bio,
            CustomUrl,
            Profile,
            Cover,
        } = req.body;
        const time = Date.now();
        let url = null;
        WalletAddress = toLowerCase(WalletAddress);
        if (req.files) {
            let key = `/user/${WalletAddress}/profile/${time +
                '.' +
                req.files.Profile.name.split('.')[req.files.Profile.name.split('.').length - 1]
                }`;
            url = await uploadImageToS3(key, req.files.Profile, req.files.Profile.mimetype);

            // var profile = req?.files?.Profile
            //   ? await ImageAddFunc([
            //       {
            //         path: `public/user/${WalletAddress}/profile/`,
            //         files: req.files.Profile,
            //         filename:
            // time +
            //   "." +
            //   req.files.Profile.name.split(".")[req.files.Profile.name.split(".").length - 1],
            //       },
            //     ])
            //   : null;
            // var cover = req?.files?.Cover
            //   ? await ImageAddFunc([
            //       {
            //         path: `public/user/${WalletAddress}/cover/`,
            //         files: req.files.Cover,
            //         filename:
            //         time  +
            //           "." +
            //           req.files.Cover.name.split(".")[
            //             req.files.Cover.name.split(".").length - 1
            //           ],
            //       },
            //     ])
            //   : null;
        }

        const saveData = {
            DisplayName: DisplayName,
            EmailId: EmailId,
            Youtube: Youtube,
            Facebook: Facebook,
            Twitter: Twitter,
            Instagram: Instagram,
            Profile: url ? url.Key : Profile,
            profile_url: url ? url.Key : '',
            // Cover: cover ?? Cover,
            Bio: Bio,
            CustomUrl: CustomUrl ? CustomUrl : WalletAddress,
        };

        const findcustom = { DisplayName: DisplayName };
        const FinData = { WalletAddress: WalletAddress };
        const select = { DisplayName: 1, CustomUrl: 1, EmailId: 1, WalletAddress: 1 };
        const customExits = await Finduser(FinData, select);
        const customExitscustomurl = await getdisplaynameandcustomurl(
            userId,
            saveData?.DisplayName,
            saveData?.CustomUrl,
        );

        if (!customExits) {
            return sendResponse(res, 409, false, 'create profile');
        }

        if (customExitscustomurl) {
            if (customExitscustomurl.DisplayName === saveData?.DisplayName) {
                return sendResponse(res, 409, false, 'displayname already exist');
            }
            if (customExitscustomurl.CustomUrl === saveData?.CustomUrl) {
                return sendResponse(res, 409, false, 'custom url already exist');
            }
        }

        const savedata = await FindUserandUpdate({ WalletAddress: WalletAddress }, saveData);
        // const savedata = await SaveUser(saveData)
        const token = JWT_SIGN(savedata?._id);
        if (savedata) {
            savedata.profile_url = savedata.profile_url
                ? signature_imageURL(savedata.profile_url)
                : null;
            res.status(201).json(
                Encryptdata({
                    status: true,
                    data: savedata,
                    token: token,
                    message: `updated successfully`,
                }),
            );
        }

        return sendResponse(res, 400, false, "can't update");
    } catch (error) {
        logger.error(error);
        catchresponse(res, error);
    }
};

export const InitialConnect = async (req, res) => {
    try {
        const { WalletAddress } = req.body;
        let FinData = {};

        if (!isEmpty(WalletAddress)) {
            FinData = { WalletAddress: toLowerCase(WalletAddress) };
        } else {
            return sendResponse(res, 200, false, 'WalletAddress Empty');
        }

        if (!isEmpty(FinData)) {
            const FIndAlreadyExits = await Finduser(FinData);
            if (FIndAlreadyExits) {
                const token = JWT_SIGN(FIndAlreadyExits?._id);

                return res.status(200).json(
                    Encryptdata({
                        status: true,
                        data: FIndAlreadyExits,
                        token: token,
                        message: `Wallet connected successfully`,
                    }),
                );
            } else {
                const newUser = await createUserWithWalletAddress(WalletAddress);
                const Usercurrency = await createCurrencyforuser(
                    newUser?.WalletAddress,
                    newUser?._id,
                );

                if (newUser) {
                    const token = JWT_SIGN(newUser?._id);
                    return res.status(201).json(
                        Encryptdata({
                            status: true,
                            data: newUser,
                            token: token,
                            message: `Wallet created and connected successfully`,
                        }),
                    );
                }
                // return sendResponse(res, 200, false, 'createaccount');
            }
        }

        return sendResponse(res, 200, false, 'createaccount');
    } catch (error) {
        catchresponse(res, error);
    }
};
export const GameConnect = async (req, res) => {
    try {
        let { WalletAddress, time } = req.body;
        let FinData = {};
        WalletAddress = WalletAddress.toLowerCase();

        if (!isEmpty(WalletAddress)) {
            FinData = { WalletAddress: WalletAddress };
        } else {
            return sendRes(res, 200, false, 'WalletAddress Empty');
        }

        if (!isEmpty(FinData)) {
            const THIRTY_MINUTES = 30 * 60 * 1000;
            if (Date.now() - time >= THIRTY_MINUTES) {
                return sendRes(res, 200, false, 'session expired');
            }
            const FIndAlreadyExits = await Findgameuser(FinData, {});
            console.log("FIndAlreadyExits", FIndAlreadyExits)
            if (FIndAlreadyExits) {
                if (FIndAlreadyExits?.blockedStatus == 'blocked' || FIndAlreadyExits?.blockedStatus == 'suspended') {
                    console.log("blockedStatus", FIndAlreadyExits?.blockedStatus)
                    return sendRes(res, 400, false, `Your account is ${FIndAlreadyExits?.blockedStatus}`);
                }

                FIndAlreadyExits.profile_url = FIndAlreadyExits.profile_url
                    ? signature_imageURL(FIndAlreadyExits.profile_url)
                    : null;

                const token = JWT_SIGN(FIndAlreadyExits?._id);

                let currencydata = await findinuserCurrency({
                    walletAddress: WalletAddress,
                });
                console.log('currencydata', currencydata);
                currencydata = currencydata.filter((item) => {
                    item.balance = Number(item.balance);
                    item.stacked = Number(item.stacked);
                    item.currencyId.valueofGalfi = Number(item?.currencyId?.valueofGalfi);
                    return !config.currencyNotforGamePlatform.includes(item?.label);
                });

                // get onchain and offchain
                // const onchainoffchaincurrencydata = await  getonChainCurrencyaddinexist(currencydata , WalletAddress )

                // const tokenDatas = await getTokenDetailes(WalletAddress); // service from nft service
                // const nftIDs = [];
                // for (let i = 0; i < tokenDatas.length; i++) {
                //     nftIDs.push(tokenDatas[i].tokenData._id);
                // }
                // const userplanets = await getUserPlanetsService({ nftId: { $in: nftIDs } });

                // if (userplanets.length) {
                //     userplanets.forEach((item) => {
                //         item.planetId.image_url = item.planetId.image
                //             ? signature_imageURL(item.planetId.image)
                //             : null;
                //     });
                // }
                return sendRes(res, 200, true, `Wallet connected successfully`, {
                    user: FIndAlreadyExits,
                    // userPlanet: userplanets,
                    usercurrency: currencydata,
                    token: token,
                    hexIds: await getUserPlanetAndAstroidHexIds(WalletAddress),
                    shipHexIds: await getUserShipHexIds(WalletAddress)
                    // usercurrency : onchainoffchaincurrencydata
                });
            } else {
                return sendRes(res, 200, false, 'createaccount');
            }
        }
        return sendRes(res, 200, false, 'createaccount');
    } catch (error) {
        catchresponse(res, error);
    }
};


export const getprofile = async (req, res) => {
    try {
        const { CustomUrl } = req.params;
        let FinData = {};
        if (!CustomUrl) {
            return sendResponse(req, 200, false, 'custom url empty');
        }

        FinData = { CustomUrl: CustomUrl };

        const FIndAlreadyExits = await Finduser(FinData);

        if (FIndAlreadyExits) {
            res.status(200).json(
                Encryptdata({
                    data: FIndAlreadyExits,
                    status: true,
                    message: `connected successfully`,
                }),
            );
        } else {
            res.status(404).json(Encryptdata({ status: false, message: 'User Not Found' }));
        }
    } catch (err) { }
};

// profile image upload
export const profileimage = async (req, res) => {
    try {
        const { WalletAddress, Profile, Cover } = req.body;
        const { userData } = req;
        let profile = '';
        let cover = '';
        if (req.files) {
            profile = req?.files?.Profile
                ? await ImageAddFunc([
                    {
                        path: `public/user/${toLowerCase(WalletAddress)}/profile/`,
                        files: req.files.Profile,
                        filename:
                            Date.now() +
                            '.' +
                            req.files.Profile.name.split('.')[
                            req.files.Profile.name.split('.').length - 1
                            ],
                    },
                ])
                : null;

            cover = req?.files?.Cover
                ? await ImageAddFunc([
                    {
                        path: `public/user/${toLowerCase(WalletAddress)}/cover/`,
                        files: req.files.Cover,
                        filename:
                            Date.now() +
                            '.' +
                            req.files.Cover.name.split('.')[
                            req.files.Cover.name.split('.').length - 1
                            ],
                    },
                ])
                : null;
        }

        const saveData = {
            Profile: req?.files?.Profile ? profile : Profile,
            Cover: cover ? cover : Cover,
        };

        const FinData = { WalletAddress: toLowerCase(userData.WalletAddress) };

        const Finddata = await FindUserandUpdate(FinData, { Profile: saveData.Profile });
        if (Finddata) {
            return sendResponse(res, 201, true, 'Profile Image Updated Successfully', Finddata);
        }
        return sendResponse(res, 409, false, 'updation failed', Finddata);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const coverimage = async (req, res) => {
    try {
        const { WalletAddress, Profile, Cover } = req.body;
        const { userData } = req;
        let profile = '';
        let cover = '';
        if (req.files) {
            profile = req?.files?.Profile
                ? await ImageAddFunc([
                    {
                        path: `public/user/${toLowerCase(WalletAddress)}/profile/`,
                        files: req.files.Profile,
                        filename:
                            Date.now() +
                            '.' +
                            req.files.Profile.name.split('.')[
                            req.files.Profile.name.split('.').length - 1
                            ],
                    },
                ])
                : null;
            cover = req?.files?.Cover
                ? await ImageAddFunc([
                    {
                        path: `public/user/${toLowerCase(WalletAddress)}/cover/`,
                        files: req.files.Cover,
                        filename:
                            Date.now() +
                            '.' +
                            req.files.Cover.name.split('.')[
                            req.files.Cover.name.split('.').length - 1
                            ],
                    },
                ])
                : null;
            cover = req?.files?.Cover
                ? await ImageAddFunc([
                    {
                        path: `public/user/${toLowerCase(WalletAddress)}/cover/`,
                        files: req.files.Cover,
                        filename:
                            Date.now() +
                            '.' +
                            req.files.Cover.name.split('.')[
                            req.files.Cover.name.split('.').length - 1
                            ],
                    },
                ])
                : null;
        }

        const saveData = {
            CustomUrl: CustomUrl ? CustomUrl : WalletAddress,
            Profile: req?.files?.Profile ? profile : Profile,
            Cover: cover ?? Cover,
        };

        const FinData = { WalletAddress: toLowerCase(userData.WalletAddress) };

        const Finddata = await FindUserandUpdate(FinData, { Cover: saveData.Cover });
        if (Finddata) {
            return sendResponse(res, 201, true, 'cover image updated successfully', Finddata);
        }
        return sendResponse(res, 409, false, 'updation failed', Finddata);
    } catch (error) {
        catchresponse(res, error);
    }
};

/**
 *
 * @param {    "ClickAddr": "0xea4fe72960c36ca7a9f4e6a107fdfe07a952704e",
 *           "ClickCustomUrl": "kamesh11",
 *          "From": "myitem",
 *          "MyItemAddr": "0x69ebd648b36b2b3d8f22a998ec9edf9df2737190",
 *          "MyItemCustomUrl": "test111"
 *     } req
 * @param { this function is used to Follow and un-follow the user   } res
 * @usage   create
 * @TYPE : POST
 * @URL : http://localhost:3331/v1/front/user/FollowUnFollow
 * @Date : 19/12/2023
 */

export const FollowUnFollow = async (req, res) => {
    try {
        const { MyItemAddr, ClickAddr, MyItemCustomUrl, ClickCustomUrl } = req.body;
        if (MyItemAddr && ClickAddr) {
            const update = {
                $pull: { Follower: { Address: ClickAddr, CustomUrl: ClickCustomUrl } },
            };

            const finVal = {
                WalletAddress: MyItemAddr,
                CustomUrl: MyItemCustomUrl,
                Follower: {
                    $elemMatch: { Address: ClickAddr, CustomUrl: ClickCustomUrl },
                },
            };

            const Find = await FindUserandUpdate(finVal, update);

            if (Find) {
                const update_following = {
                    $pull: {
                        Following: { Address: MyItemAddr, CustomUrl: MyItemCustomUrl },
                    },
                };

                const finVal_following = {
                    WalletAddress: ClickAddr,
                    CustomUrl: ClickCustomUrl,
                    Following: {
                        $elemMatch: {
                            Address: MyItemAddr,
                            CustomUrl: MyItemCustomUrl,
                        },
                    },
                };
                const Find_following = await FindUserandUpdate(finVal_following, update_following);

                if (Find_following) {
                    return sendResponse(res, 200, true, 'unfollow');
                }
            } else {
                const update = {
                    $push: {
                        Follower: { Address: ClickAddr, CustomUrl: ClickCustomUrl },
                    },
                };
                const find = { WalletAddress: MyItemAddr, CustomUrl: MyItemCustomUrl };
                const Findup = await FindUserandUpdate(find, update);

                if (Findup) {
                    const update_following = {
                        $push: {
                            Following: { Address: MyItemAddr, CustomUrl: MyItemCustomUrl },
                        },
                    };
                    const find = { WalletAddress: ClickAddr, CustomUrl: ClickCustomUrl };

                    const Find_following = await FindUserandUpdate(find, update_following);
                    if (Find_following) {
                        return sendResponse(res, 200, true, 'follow');
                    }
                }
            }
        }
    } catch (error) {
        catchresponse(res, error);
    }
};

/**
 *
 * @param { email : "example@gmail.com"  } req
 * @param { this function is used to add email in newsletter collection in DB   } res
 * @usage   Newsletter
 * @TYPE : POST
 */

export const Newsletter = async (req, res) => {
    try {
        const { email } = req.body;
        const data = { email: email };
        const Exists = await FindNewsletter(data);

        if (Exists) {
            return sendResponse(res, 409, false, 'Email Id already exist');
        }
        await SaveNewsletter({ email: email });
        sendResponse(res, 201, true, 'subscribed');
    } catch (error) {
        catchresponse(res, error);
    }
};

/**
 *
 * @param { address , skip  } req
 * @param { this function is used to get  notication based on the recent activity  in DB   } res
 * @usage   Newsletter
 * @TYPE : POST
 */

export const notification = async (req, res) => {
    const { address, skip } = req?.query;
    try {
        let notificationdata = await FindNotification(address, skip);
        if (notificationdata) {
            sendResponse(res, 200, true, 'fetched', notificationdata);
        } else {
            sendResponse(res, 200, true, 'fetchednull', []);
        }
    } catch (error) {
        catchresponse(res, error);
    }
};

export const addbalance = async (req, res) => {
    try {
        const { walletAddress, stacked, currencyId, balance } = req?.body;
        const data = await Finduser({ WalletAddress: walletAddress });
        const payload = {
            walletAddress: walletAddress,
            userId: data?._id,
            currencyId: currencyId,
            stacked: stacked,
            balance: balance,
        };

        // this service is from admin cms module (sry because of too much work)
        const curexis = await checkcurencyexist_service(currencyId);
        if (!curexis) {
            return res.status(404).json({ status: false, message: 'no currency available' });
        }
        const cr = await addbalace(payload);
        sendRes(res, 200, true, 'Success', cr);
    } catch (error) {
        catchresponse(res, error);
    }
};

// ! remove deletewithdisplay when you see this
// ! this is developed only for developing purpose
export const deletealluserdata = async (req, res) => {
    const { walletAddress } = req?.body;
    const address = walletAddress.toLowerCase();
    const userData = await Finduser({ WalletAddress: address });
    if (!userData) {
        return res.status(404).json({ status: false, message: 'user not found' });
    }
    await userAssetsdbdelete({ walletAddress: address });
    await userPlanetdbdelete({ userId: userData._id });
    await deletall(address);
    res.status(200).json({ status: true, message: 'deleted' });
};

export const createCurrencyforuser = async (walletAddress, _id) => {
    try {
        console.log("createCurrencyforuser", walletAddress, _id)
        // this service from admin cms
        const data = await get_cuurencyList_Service();
        console.log("data", data)

        const newcurrency = [];
        for (let i = 0; i < data.length; i++) {
            // const bal = await Token_Balance_Calculation(data[i].address , walletAddress )

            // off chain currency firstentry
            let payload = {
                userId: _id,
                walletAddress: walletAddress.toLowerCase(),
                currencyId: data[i]._id,
                label: data[i].label,
                balance: 0,
                name: data[i].name,
            };

            newcurrency.push(payload);
        }
        console.log("newcurrency", newcurrency)

        const records = await creteMultipleusercurrency(newcurrency);
        console.log("records", records)
        return records

    } catch (error) {
        logger.error(error);
        // catchresponse(res , error);
    }
};

export const getonChainCurrencyforuser = async (walletAddress, _id, network) => {
    try {
        // this service from admin cms
        const data = await get_cuurencyList_Service();

        const newcurrency = [];
        for (let i = 0; i < data.length; i++) {
            if (config.currencyNotforGamePlatform.includes(data[i]?.label)) {
                const bal = await Token_Balance_Calculation(
                    data[i].address,
                    walletAddress,
                    network,
                );

                let payload = {
                    userId: _id,
                    walletAddress: walletAddress.toLowerCase(),
                    address: data[i].address,
                    label: data[i].label,
                    decimal: data[i].decimal,
                    balance: bal,
                };

                newcurrency.push(payload);
            }
        }

        // sendRes(res,200 , true , "Success" , records)
    } catch (error) {
        logger.error(error);
        // catchresponse(res , error);
    }
};

export const Depositebalance = async (req, res) => {
    try {
        const { walletAddress, tokenName, amount, transactionHash } = req?.body;
        if (
            !walletAddress ||
            !tokenName ||
            !transactionHash ||
            amount === undefined ||
            amount === null
        ) {
            return sendRes(
                res,
                400,
                false,
                'walletAddress, tokenName, amount and transactionHash are required',
                null,
            );
        }

        // contract interaction
        const txdata = await DataOfTranscation(transactionHash);
        if (!txdata?.status) {
            return sendRes(res, 400, false, 'Transaction Failed', null);
        }

        // const balance = await getBalance(address)
        // const  pastbalance = await findinuserCurrency({ walletAddress : walletAddress , label : tokenName })

        // const newamount = pastbalance?.balance + amount
        const updatedata = await updateuserbalance(
            { walletAddress: walletAddress, label: tokenName },
            { $inc: { balance: amount } },
        );

        const transcationEntrydata = {
            walletAddress: walletAddress,
            from: walletAddress,
            to: walletAddress,
            action: constant.DEPOSITE,
            tokenName: tokenName,
            token: amount,
            hash: transactionHash,
            //  fromTokenName : from ,
            //  toTokenName : to ,
            //  fromToken :  token  ,
            //  toToken : tobal ,
        };
        // service from exchange module
        await updateCurrency({ label: tokenName }, { $inc: { circulateCurrency: amount } });

        await saveTrancationService(transcationEntrydata);

        sendRes(res, 200, true, 'Success', { balance: updatedata });
        // res.status(200).json({ status : true  , message : "Success" , balance: updatedata})
    } catch (error) {
        catchresponse(res, error);
    }
};

export const getbalance = async (req, res) => {
    try {
        const { walletAddress, network } = req.query;
        let currencydata = await findinuserCurrency({ walletAddress: walletAddress.toLowerCase() });

        if (currencydata.length === 0) {
            return sendRes(res, 404, false, 'please create profile');
        }

        const onchainoffchaincurrencydata = await getonChainCurrencyaddinexist(
            currencydata,
            walletAddress,
            network,
        );

        sendRes(res, 200, true, 'fetched', onchainoffchaincurrencydata);
    } catch (err) {
        logger.error(err);
        sendRes(res, 500, false, 'fetched');
    }
};
// function help to get on chain balance of tokens
export const getonChainCurrencyaddinexist = async (data, walletAddress, network) => {
    try {
        const dataforGame = [];
        for (let i = 0; i < data.length; i++) {
            if (!config.currencyNotforGamePlatform.includes(data[i]?.label)) {
                const bal = await Token_Balance_Calculation(
                    data[i].currencyId.address,
                    walletAddress,
                    network,
                );
                data[i].onChainBalance = bal?.toString(); // bal.toDecimal(18)
                let item = data[i];
                item.balance = Number(item.balance);
                item.stacked = Number(item.stacked);
                item.currencyId.valueofGalfi = Number(item.currencyId.valueofGalfi);
                dataforGame.push(item);
            }
        }


        // Add USDT balance even if it doesn't exist in DB
        const usdtBalance = await Token_Balance_Calculation(
            config.CHAIN_DETAILS[network].USDT_TOKEN,
            walletAddress,
            network
        );

        dataforGame.push({
            label: "USDT",
            balance: 0,
            stacked: 0,
            onChainBalance: usdtBalance?.toString() || "0",
            currencyId: {
                label: "USDT",
                symbol: "USDT",
                address: config.CHAIN_DETAILS[network].USDT_TOKEN,
                decimal: 6, // change to 18 if your USDT uses 18 decimals
                valueofGalfi: 0,
            },
        });

        return dataforGame;
        // return data
    } catch (error) {
        logger.error(error);
        console.log("onCHainCurrency_error", error)
        throw error;
    }
};

export const gameUserprofile = async (req, res) => {
    try {
        const { userData } = req;
        const data = {
            userData: userData,
            mission: {
                combat: await countOfMission({
                    from_walletAddress: userData.WalletAddress,
                    mission: constant.MISSION_TYPE[0],
                }),

                explore: await countOfMission({
                    from_walletAddress: userData.WalletAddress,
                    mission: constant.MISSION_TYPE[1],
                }),

                mining: await countOfMission({
                    from_walletAddress: userData.WalletAddress,
                    mission: constant.MISSION_TYPE[2],
                }),

                social: await countOfMission({
                    from_walletAddress: userData.WalletAddress,
                    mission: constant.MISSION_TYPE[3],
                }),
            },
        };

        sendRes(res, 200, true, 'fetched', data);
    } catch (error) {
        logger.error(error);
        catchresponse(res, error);
    }
};

export const MakeTrueisTutorialPlayed = async (req, res) => {
    const { userData } = req;
    try {
        const result = await userFindOneAndUpdate(
            { _id: userData._id },
            { isTutorialPlayed: true },
        );
        sendRes(res, 200, true, 'play completed', result);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const ClaimFreeReward = async (req, res) => {
    try {
        const { userData } = req;
        const result = await userFindOneAndUpdate({ _id: userData._id }, { freeNftClaimed: true });
        sendRes(res, 200, true, 'claimed', result);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const CRON_REFFERAL = async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    updateManyUser(
        { createdAt: { $lt: oneYearAgo } }, // Find users created more than a year ago
        { $set: { refferedBy: null } }, // Update the refferedBy field
    );
};
