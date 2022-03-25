const firebase = require("firebase-admin");
const { projectId } = require("./constants");

var serviceAccount = require("../../doctor-rahul-web-firebase-adminsdk-iofnq-81fd5a6ea0.json");

exports.init = () => {
    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
        storageBucket: "gs://doctor-rahul-web.appspot.com",
    });
};
