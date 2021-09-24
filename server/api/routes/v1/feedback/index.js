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

exports.saveFeedback = (req, res) => {
    // Mail to user
    readHTMLFile(
        __dirname + "/feedback_response_to_user.html",
        function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                username: req.params.name,
                timestamp: new Date().getFullYear(),
            };
            var htmlToSend = template(replacements);

            // 1. send response mail to user
            var mailOptions = {
                from: '"ODM India" <odmindia.contact@gmail.com>', // sender address
                to: req.params.email,
                subject: "ODM India - Feedback",
                text: req.params.subject,
                html: htmlToSend,
            };

            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    logger.error(
                        `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND FEEDBACK CLIENT-MAIL TO ::: ${
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

    // Mail to admin
    readHTMLFile(__dirname + "/feedback_to_admin.html", function (err, html) {
        // 2. send mail to admin about the feedback
        var template = handlebars.compile(html);
        var replacements = {
            user_email: req.params.email,
            user_name: req.params.name,
            user_message: req.params.message,
            timestamp: new Date().getFullYear(),
        };
        var htmlToSend = template(replacements);

        var adminMailOptions = {
            from: req.params.email, //user's address
            to: "odmindia.contact@gmail.com",
            subject: "Feedback details from " + req.params.email,
            text: req.params.subject,
            html: htmlToSend,
        };

        smtpTransport.sendMail(adminMailOptions, function (error, response) {
            if (error) {
                logger.error(
                    `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND FEEDBACK TO ADMIN-MAIL FROM CLIENT ::: ${
                        req.params.email
                    } ::: ${error}`
                );
                res.end(JSON.stringify(error));
            } else {
                console.log("Message sent: " + response);
                res.end(JSON.stringify(response));
            }
        });
    });
};
