import { config } from "dotenv";
config();

import nodemailer from "nodemailer";

export const SendEmail = async (sendTo, subject, message) => {
  try {
    let mailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
    });
    let mailDetails = {
      from: process.env.EMAIL_HOST_USER,
      to: sendTo,
      subject,
      text: message,
    };
    await mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        return false;
      }
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
