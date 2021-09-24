const handlebars = require("handlebars");
const fs = require("fs");
const logger = require("../../../../config/logger");
const { smtpTransport } = require("../../../../config/nodemailer");

const readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

exports.savePrayerRequest = (req, res) => {
    //Mail to user
    readHTMLFile(
        __dirname + "/prayer_request_response_to_user.html",
        function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                username: req.params.firstname + " " + req.params.lastname,
                timestamp: new Date().getFullYear(),
            };
            var htmlToSend = template(replacements);

            //1. send response mail to user
            var mailOptions = {
                from: '"ODM India" <odmindia.contact@gmail.com>', // sender address
                to: req.params.email,
                subject: "ODM India - Prayer request",
                text: req.params.subject,
                html: htmlToSend,
            };

            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    logger.error(
                        `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND PRAYER-REQUEST CLIENT-MAIL TO ::: ${
                            req.params.email
                        } ::: ${error}`
                    );
                    res.end(JSON.stringify(error));
                } else {
                    console.log("Message sent: " + response);
                    res.end(JSON.stringify(response));
                }
            });
        }
    );

    //Mail to admin
    readHTMLFile(
        __dirname + "/prayer_request_to_admin.html",
        function (err, html) {
            //2. send mail to admin about the prayer request
            var template = handlebars.compile(html);
            var replacements = {
                user_email: req.params.email,
                user_name: req.params.firstname + " " + req.params.lastname,
                user_phone: req.params.phone,
                user_message: req.params.message,
                timestamp: new Date().getFullYear(),
            };
            var htmlToSend = template(replacements);

            var adminMailOptions = {
                from: req.params.email, //user's address
                to: "odmindia.contact@gmail.com",
                subject: "Prayer request from " + req.params.email,
                text: req.params.subject,
                html: htmlToSend,
            };

            smtpTransport.sendMail(
                adminMailOptions,
                function (error, response) {
                    if (error) {
                        logger.error(
                            `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND PRAYER-REQUEST TO ADMIN-MAIL FROM CLIENT ::: ${
                                req.params.email
                            } ::: ${error}`
                        );
                        res.end(JSON.stringify(error));
                    } else {
                        console.log("Message sent: " + response);
                        res.end(JSON.stringify(response));
                    }
                }
            );
        }
    );
};
