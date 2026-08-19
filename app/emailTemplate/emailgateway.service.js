//Import package
import nodemailer from 'nodemailer';

// import Files
import smtpConfig from './smtpconfig.json';

export const sendEmail = async (to, content) => {
  try {

    const { subject, template, attachments } = content;
    console.log("content", to);
    let transporter = nodemailer.createTransport(smtpConfig.nodemailer);
    let info = await transporter.sendMail({
      from: smtpConfig.fromMail,
      to,
      subject,
      html: template,
      ...(attachments ? { attachments } : {})
    });

    console.log("Message sent: %s", info);
    return info
  } catch (err) {
    console.log("sendEmail err", err);
    return false
  }

}

