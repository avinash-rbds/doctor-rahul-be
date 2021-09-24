const data = require("./sample.json");
const error = require("./error.json");

exports.fetchList = (req, res) => {
    if (data !== null) {
        res.status(200).send(data);
    } else {
        res.status(500).send(error);
    }
};
