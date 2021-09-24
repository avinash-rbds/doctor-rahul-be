const firebase = require("firebase-admin");
const { projectId } = require("./constants");

var serviceAccount = require("../../doctor-rahul-fe-firebase-adminsdk-mebs4-f162ca4eb2.json");

exports.init = () => {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
  });
};
