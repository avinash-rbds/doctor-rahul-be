const firebase = require("firebase-admin");

exports.fetchArticles = (req, res) => {
  const ref = firebase.database().ref("articles");
  ref.once("value", (snapshot) => {
    const data = snapshot.val();
    const formattedData = data
      .filter((item) => item !== null)
      .sort((previous, next) => {
        if (previous.timestamp > next.timestamp) {
          return -1;
        }
        if (previous.timestamp < next.timestamp) {
          return 1;
        }
        return 0;
      })
      .sort((previous, next) => {
        if (previous.id > next.id) {
          return -1;
        }
        if (previous.id < next.id) {
          return 1;
        }
        return 0;
      })
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

exports.fetchArticleById = (req, res) => {
  const id = req.params.id;

  const ref = firebase.database().ref("articles").child(id);
  ref.once("value", (snapshot) => {
    const data = snapshot.val();

    if (data !== null) {
      const response = {
        data,
      };
      res.send(response);
    } else {
      res.send({ data: null });
    }
  });
};
