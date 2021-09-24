const { port, env } = require("./config/constants");
const app = require("./config/express");
const firebase = require("./config/firebase");
const logger = require("./config/logger");

// keep awake
var http = require("http");

// firebase init
firebase.init();

// listen
app.listen(port, () =>
  logger.info(
    `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: server started on port ${port} (${env})`
  )
);

// heroku
function herokuKeepAlive() {
  setInterval(() => {
    console.log("PRODUCTION - SET INTERVAL");
    var options = {
      host: herokuURI,
      port: 80,
      path: "/",
    };
    http
      .get(options, (res) => {
        res.on("data", (chunk) => {
          try {
            // optional logging... disable after it's working
            console.log("(WAKE UP) HEROKU RESPONSE: " + chunk);
          } catch (err) {
            console.log("(keep awake) Error: ", err.message);
          }
        });
      })
      .on("error", function (err) {
        console.log("(keep awake) Error: " + err.message);
      });
  }, 30 * 60 * 1000); // load every 30 minutes
}

if (env === "production") {
  console.log("PRODUCTION - LOG");
  // herokuKeepAlive();
}

/*
 * Exports express
 * @public
 */
module.exports = app;
