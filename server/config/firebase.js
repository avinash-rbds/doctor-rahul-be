const firebase = require("firebase-admin");
const { projectId } = require("./constants");

var serviceAccount = require("../../doctor-rahul-web-firebase-adminsdk-iofnq-65ba1e1fff.json");

exports.init = () => {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
  });
};
