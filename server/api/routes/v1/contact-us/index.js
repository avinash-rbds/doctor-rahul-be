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

exports.saveContactUs = (req, res) => {
  // Mail to user
  readHTMLFile(
    __dirname + "/contactus_response_to_user.html",
    function (err, html) {
      var template = handlebars.compile(html);
      var replacements = {
        username: req.params.name,
        timestamp: new Date().getFullYear(),
      };
      var htmlToSend = template(replacements);

      console.log("client: ", req.params.email);

      // 1. send response mail to user
      var mailOptions = {
        from: '"Dr. Rahul Singh" <contact.doctorrahul@gmail.com>', // sender address
        to: req.params.email,
        subject: "Dr. Rahul Singh - Contact us",
        text: req.params.subject,
        html: htmlToSend,
      };

      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          logger.error(
            `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND CONTACT-US CLIENT-MAIL TO ::: ${
              req.params.email
            } ::: ${error}`
          );
          res.end(JSON.stringify(error));
        } else {
          console.log("(Client) Message sent: " + response);
          res.end(JSON.stringify(response));
        }
      });
    }
  );

  // Mail to admin
  readHTMLFile(__dirname + "/contactus_to_admin.html", function (err, html) {
    // 2. send mail to admin about the contact us
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
      to: "contact.doctorrahul@gmail.com",
      subject: req.params.email + " - Contact details",
      text: req.params.subject,
      html: htmlToSend,
    };

    smtpTransport.sendMail(adminMailOptions, function (error, response) {
      if (error) {
        logger.error(
          `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR SENDIND CONTACT-US TO ADMIN-MAIL FROM CLIENT ::: ${
            req.params.email
          } ::: ${error}`
        );
        res.end(JSON.stringify(error));
      } else {
        console.log("(Admin) Message sent: " + response);
        res.end(JSON.stringify(response));
      }
    });
  });
};
