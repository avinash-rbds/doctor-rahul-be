var nodemailer = require("nodemailer");
var smtp_transport = require("nodemailer-smtp-transport");
var xoauth2 = require("xoauth2");
const {
    ODM_GMAIL,
    ODM_GMAIL_CLIENT_ID,
    ODM_GMAIL_CLIENT_SECRET,
    ODM_GMAIL_REFRESH_TOKEN,
} = require("../config/constants");

// email smtp
exports.smtpTransport = nodemailer.createTransport(
    smtp_transport({
        service: "Gmail",
        auth: {
            xoauth2: xoauth2.createXOAuth2Generator({
                user: ODM_GMAIL,
                clientId: ODM_GMAIL_CLIENT_ID,
                clientSecret: ODM_GMAIL_CLIENT_SECRET,
                refreshToken: ODM_GMAIL_REFRESH_TOKEN,
            }),
        },
    })
);
