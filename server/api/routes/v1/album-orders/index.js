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

exports.saveAlbumOrders = (req, res) => {
    // Mail to user
    readHTMLFile(
        __dirname + "/music_album_orders_response_to_user.html",
        function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                username: req.params.name,
                album_name: req.params.albumname,
                album_item: req.params.albumitem,
                timestamp: new Date().getFullYear(),
            };
            var htmlToSend = template(replacements);

            // 1. send response mail to user
            var mailOptions = {
                from: '"ODM India" <odmindia.contactn@gmail.com>', // sender address
                to: req.params.email,
                subject: "ODM India - Music Album orders",
                text: req.params.subject,
                html: htmlToSend,
            };

            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    logger.error(
                        `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND ALBUM-ORDERS CLIENT-MAIL TO ::: ${
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
    readHTMLFile(
        __dirname + "/music_album_orders_to_admin.html",
        function (err, html) {
            // 2. send mail to admin about the music album orders
            var template = handlebars.compile(html);
            var replacements = {
                user_email: req.params.email,
                user_name: req.params.name,
                user_phone: req.params.phone,
                user_message: req.params.message,
                album_name: req.params.albumname,
                album_item: req.params.albumitem,
                timestamp: new Date().getFullYear(),
            };
            var htmlToSend = template(replacements);

            var adminMailOptions = {
                from: req.params.email, //user's address
                to: "odmindia.contact@gmail.com",
                subject: "Music album details from " + req.params.email,
                text: req.params.subject,
                html: htmlToSend,
            };

            smtpTransport.sendMail(
                adminMailOptions,
                function (error, response) {
                    if (error) {
                        logger.error(
                            `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND ALBUM-ORDERS TO ADMIN-MAIL FROM CLIENT ::: ${
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
