const firebase = require("firebase-admin");

exports.fetchArticles = (req, res) => {
  const ref = firebase.database().ref("articles");
  ref.once("value", (snapshot) => {
    const data = snapshot.val();
    const formattedData = data
      .filter((item) => item !== null)
      .map(({ id, title, description, timestamp, bannerImage }) => ({
        id,
        title,
        description,
        timestamp,
        bannerImage,
      }));

    if (data !== null) {
      const len = Object.keys(data).length;
      const response = {
        data: formattedData,
        items: len,
      };

      res.send(response);
    } else {
      const response = {
        data: [],
        items: 0,
      };

      res.send(response);
    }
  });
};
