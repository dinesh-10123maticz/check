//Import Files
import EmailTemplateSchema from "./schema/EmailTemplate";
import config from "../../config/config";
import { sendEmail } from './emailgateway.service'
// import SiteSettingSchema from "../../Admin/Model/siteSettings";
import mongoose from 'mongoose';
import { filterSearchQuery, isEmpty, paginationQuery, sendResponse } from "../../shared/commonFunction";
import cmsSchema from "../admin/cms/schema/cms.schema";

const ObjectId = mongoose.Types.ObjectId

/*
    Send Email to the user not api.
*/
export const mailTemplate = async ({
    userId,
    identifier,
    toEmail,
    content
}) => {
    try {
        let mailtemplet = await getMailTemplate(identifier, toEmail, content, 'en')
        return mailtemplet
    } catch (err) {
        console.log("mailTemplate", err);
        return false

    }
}

export const getMailTemplate = async (identifier, toEmail, content, langCode = '') => {
    try {

        var data = { DBName: EmailTemplateSchema, finData: { "identifier": identifier }}
        console.log("getMailTemplate",data )
        var emailTemplateData = await EmailTemplateSchema.findOne({identifier})
        console.log("getMailTemplate", data, emailTemplateData)
        if (!emailTemplateData) {
            console.log("No Email Template")
            return false
        }
        // let siteSettingsData = await SiteSettingSchema.findOne({});
        // console.log("siteSettingsData", siteSettingsData)
        let siteSettingsData = await cmsSchema.findOne({ slug: 'social' })
        console.log("siteSettingsData", siteSettingsData, config)

        let mailContent = {};
        mailContent['subject'] = emailTemplateData.subject;
        mailContent['template'] = emailTemplateData.content

            .replace('##HEADER_EMAIL##', config.IMAGE_URL + `/EmailTemplate/banner.png`)

            .replace('##TWITTER_LINK##', siteSettingsData?.twitter)
            .replace('##TELEGRAM_LINK##', siteSettingsData?.telegram)
            .replace('##DISCORD_LINK##', siteSettingsData?.discord)

            .replace('##TWITTER_LOGO##', config.IMAGE_URL + `/EmailTemplate/x.svg`)
            .replace('##TELEGRAM_LOGO##', config.IMAGE_URL + `/EmailTemplate/telegram.svg`)
            .replace('##DISCORD_LOGO##', config.IMAGE_URL + `/EmailTemplate/discord.svg`)
            
            /** User Details */
            .replace('##NAME##', isEmpty(content.userName) ? "value user" : content.userName)
            .replace('##DATE##', new Date().toLocaleDateString())
            .replace("##EMAIL##", isEmpty(content.email) ? "" : content.email)
            .replace('##REASON##', content.reason)
            .replace('##LOGIN_LINK##', content.loginlink)

        switch (identifier) {

            case "activate_register_user":
                /** 
                 * ##templateInfo_name## --> email
                 * ##templateInfo_url## --> confirmMailUrl
                 * ##templateInfo_appName##  --> siteName
                 * ##DATE## --> date
                */
                mailContent['template'] = mailContent['template']

                    .replace("##templateInfo_name##", content.email)
                    .replace("##templateInfo_url##", content.confirmMailUrl)
                    .replace("##templateInfo_appName##", config.SITE_NAME)
                    // .replace("##templateInfo_logo##", logo)
                    .replace("##DATE##", content.date);

                break;

            case "User_forgot":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##templateInfo_url##", content.confirmMailUrl);

                break;

            case "change_register_email":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##templateInfo_url##", content.confirmMailUrl);

                break;

            case "Change_Password":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)

                break;

            case "verify_new_email":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##templateInfo_url##", content.confirmMailUrl);

                break;

            case "Login_confirmation":
                /** 
                 * ##BROWSER## --> broswername
                 * ##IP## --> ipaddress
                 * ##COUNTRY## --> countryName
                 * ##DATE## --> date
                 * ##CODE## --> code
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##BROWSER##", content.broswername)
                    .replace("##IP##", content.ipaddress)
                    .replace("##COUNTRY##", content.countryName)
                    .replace("##DATE##", content.date)
                    .replace("##CODE##", content.code)
                break;

            case "withdraw_request":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##withdraw_Approve##", content.withdrawApprove)
                    .replace("##cancel_Withdraw##", content.cancelWithdraw);
                break;
            case "withdraw_request_fiat":
                /** 
                 * ##templateInfo_name## --> name
                 * ##templateInfo_url## --> confirmMailUrl
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##templateInfo_url##", content.confirmMailUrl);
                break;
            case "Login_notification":
                /** 
                 * ##BROWSER## --> broswername
                 * ##IP## --> ipaddress
                 * ##COUNTRY## --> countryName
                 * ##DATE## --> date
                 * ##CODE## --> code
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##BROWSER##", content.broswername)
                    .replace("##IP##", content.ipaddress)
                    .replace("##COUNTRY##", content.countryName)
                    .replace("##DATE##", content.date)

                break;

            case "User_deposit":
                /** 
                 * ##AMOUNT## --> amount
                 * ##CURRENCY## --> currency
                 * ##TXID## --> transactionId
                 * ##DATE## --> date
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##AMOUNT##", content.amount)
                    .replace("##CURRENCY##", content.currency)
                    .replace("##TXID##", content.transactionId)
                    .replace("##DATE##", content.date)
                break;

            case "Withdraw_notification":
                /** 
                 * ##AMOUNT## --> amount
                 * ##CURRENCY## --> currency
                 * ##TXID## --> transactionId
                 * ##DATE## --> date
                */
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("##AMOUNT##", content.amount)
                    .replace("##CURRENCY##", content.currency)
                    .replace("##TXID##", content.transactionId)
                    .replace("##message##", content.message)
                    .replace("##DATE##", content.date)
                break;

            case "newsletter_send":
                /** 
                 * ##message##
                */
                //  console.log("Email template 2 : ",mailContent['template'])
                mailContent['template'] = mailContent['template']
                    .replace("##templateInfo_name##", "Valid User")
                    .replace("#AdminReplay#", content.message);
                break;
            case "CONTACT_US":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##rly##", content.AdminMsg);
                break;

            case "SEND_OTP":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##OTP##", content.otp);
                break;


            /** Send a mail for change password otp for users */
            case "change_password_otp":
                mailContent['template'] = mailContent['template']
                    .replace("##OTP##", content.otp)
                break;

            case "forgot_otp_admin":
                mailContent['template'] = mailContent['template']
                    .replace("##OTP##", content.otp)
                break;


            case "SEND_INFO":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##TITLE##", content.title)
                    .replace("##DESCRIPTION##", content.description);
                break;

            case "SEND_PASS":
                /** 
                 * ##message##
                */
                //    console.log("content",content,emailTemplateData.content)
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##PASSWORD##", content.PASSWORD);
                break;


            case "CHANGE_2FA":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##STATUS##", content.status);
                break;
            case "KYC_APPROVE":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##rly##", content.notice);
                break;
            case "KYC_REJECT":
                /** 
                 * ##message##
                */
                mailContent['template'] = mailContent['template']
                    .replace("##DATE##", content.date)
                    .replace("##rly##", content.notice);
                break;
            case "new_support_ticket_user":
                /** 
                * ##message##
               */
                mailContent['template'] = mailContent['template']
                    .replace("##ID##", content.ticketId);
                break;
            case "support_ticket_reply":
                /** 
                  * ##message##
                 */
                mailContent['template'] = mailContent['template']
                    .replace("##TICKETID##", content.ticketId)
                    .replace("##DATE##", content.date)
                    .replace("##MESSAGE##", content.message);
                break;

            /** Send a mail when user activeted by admin */
            case "user_activation":
                mailContent['template'] = mailContent['template']
                    .replace("##LOGIN_LINK##", content.loginlink)
                break;

            /** Send a mail when user kyc request */
            case "user_deactivation":
                mailContent['template'] = mailContent['template']
                    .replace("##REASON##", content.reason)
                break;

        }
        console.log(mailContent,"mailContent")
        let email = await sendEmail(toEmail, mailContent)
        return email
    }
    catch (err) {
        console.log("Error on mail template", err)
        return false

    }
}


/** 
 * Techniques for retrieving the emailTemplate data
 * METHOD: GET
 */
export const fetchEmailTemplate = async (req, res) => {

    try {

        // let skip = (req?.query?.page - 1) * 10
        // let limit = 10
        let pagination = paginationQuery(req?.query);

        let filter = filterSearchQuery(req.query, ['identifier', 'subject'])
        var emaildata = await EmailTemplateSchema.find(filter).sort({ _id: -1 }).skip(pagination.skip).limit(pagination.limit)
        var emailCount = await find({ DBname: EmailTemplateSchema, findata: {}, count: true })
        if (emaildata.length > 0) {
            return sendResponse(res, 200, { status: true, message: 'Listed successfully', data: emaildata, count: emailCount.data })

        } else {
            return sendResponse(res, 400, { status: false, message: 'No data found!!' })
        }
    }
    catch (err) {
        console.log("FetchEmailTemplate err", err);
        return sendResponse(res, 500, { status: false, message: 'Something went wrong!!' })

    }

}


/**
 * Process for updating a particular email template.
 * METHOD: POST
 **/
export const editTemplate = async (req, res) => {
    try {
        let reqBody = req.body
        // console.log('emailtemplatebody', reqBody)
        // let updata = {
        //     subject: reqBody?.subject,
        //     content: reqBody?.content
        // }
        console.log("updataData", reqBody);


        // let data = { DBName: EmailTemplateSchema, finData: { _id: reqBody?.id }, updata: { "$set": updata }, save: { new: true } }
        // let result = await FindOneAndUpdate(data)
        let data = await EmailTemplateSchema.findOne({ "_id": new ObjectId(reqBody?.id) })

        console.log('result', data)
        data.subject = reqBody?.subject ? reqBody?.subject : data.subject
        data.content = reqBody?.content ? reqBody?.content : data.content
        data.langCode = reqBody?.langCode ? reqBody?.langCode : data.langCode
        data.status = reqBody?.status ? reqBody?.status : data.status

        await data.save();

        if (data) {
            return sendResponse(res, 200, { status: true, message: 'Template updated successfully' })

        } else {
            return sendResponse(res, 400, { status: false, message: 'Error occurred!!' })

        }
    } catch (err) {
        console.log('err', err)
        return sendResponse(res, 500, { status: false, message: 'Something went wrong!!' })

    }

}




