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

exports.saveGiveDetails = (req, res) => {
    // Mail to user
    readHTMLFile(
        __dirname + "/give_response_to_user.html",
        function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                username: req.params.firstname + " " + req.params.lastname,
                option1: req.params.option1,
                option2: req.params.option2,
                option3: req.params.option3,
                option4: req.params.option4,
                option5: req.params.option5,
                option6: req.params.option6,
                option7: req.params.option7,
                timestamp: new Date().getFullYear(),
            };
            var htmlToSend = template(replacements);

            // 1. send response mail to user
            var mailOptions = {
                from: '"ODM India" <odmindia.contact@gmail.com>', // sender address
                to: req.params.email,
                subject: "ODM India - Give",
                text: req.params.subject,
                html: htmlToSend,
            };

            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    logger.error(
                        `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND GIVE CLIENT-MAIL TO ::: ${
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
    readHTMLFile(__dirname + "/give_to_admin.html", function (err, html) {
        // 2. send mail to admin about the give details
        var template = handlebars.compile(html);
        var replacements = {
            user_phone: req.params.phone,
            user_email: req.params.email,
            user_name: req.params.firstname + " " + req.params.lastname,
            user_message: req.params.message,
            option1: req.params.option1,
            option2: req.params.option2,
            option3: req.params.option3,
            option4: req.params.option4,
            option5: req.params.option5,
            option6: req.params.option6,
            option7: req.params.option7,
            timestamp: new Date().getFullYear(),
        };
        var htmlToSend = template(replacements);

        var adminMailOptions = {
            from: req.params.email, //user's address
            to: "odmindia.contact@gmail.com",
            subject: "Give details from " + req.params.email,
            text: req.params.subject,
            html: htmlToSend,
        };

        smtpTransport.sendMail(adminMailOptions, function (error, response) {
            if (error) {
                logger.error(
                    `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND GIVE TO ADMIN-MAIL FROM CLIENT ::: ${
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
