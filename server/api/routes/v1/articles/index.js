const firebase = require("firebase-admin");

exports.fetchArticles = (req, res) => {
    const ref = firebase.database().ref("articles");
    ref.once("value", (snapshot) => {
        const data = snapshot.val();

        let formattedData = Object.entries(data)
            .filter(([key, value]) => value !== null)
            .map(([key, value]) => value)
            // const formattedData = data
            //     .filter((item) => item !== null)
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

exports.createArticle = (req, res) => {
    let recentId = null;
    const ref = firebase.database().ref("articles");
    const editorObject = req.body.editorObject || "-";

    ref.limitToLast(1)
        .once("child_added", (snap) => {
            const data = snap.val();
            recentId = data?.id;
        })
        .then(() => {
            if (recentId !== null) {
                recentId = parseInt(recentId);
                const newId = recentId + 1;

                // create a new article
                const newRef = firebase.database().ref("articles").child(newId);
                newRef.set({
                    id: newId,
                    title: `title-${newId}`,
                    bannerImage:
                        "https://images.unsplash.com/photo-1633712454766-a54eae84f1e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYzMzczNDIxMw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
                    description: `description-${newId}`,
                    editorObject,
                    html: "-",
                    timestamp: new Date().toISOString(),
                });

                res.send({
                    error: false,
                    data: `Article ${newId} was created successfully`,
                });
            }
        })
        .catch((err) =>
            res.send({
                data: `Error creating article ${newId} - ${err}`,
                error: true,
            })
        );
};

exports.updateArticleById = (req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    const bannerImage = req.body.bannerImage;
    const description = req.body.description;
    const editorObject = req.body.editorObject;
    const timestamp = req.body.timestamp;

    const ref = firebase.database().ref("articles").child(id);
    ref.set({
        id,
        title,
        bannerImage,
        description,
        editorObject,
        html: "-",
        timestamp,
    })
        .then(() => {
            res.send({
                error: false,
                data: `Article ${id} was updated successfully`,
            });
        })
        .catch((err) => {
            res.send({
                data: `Error updating article ${id} - ${err}`,
                error: true,
            });
        });
};

exports.deleteArticleById = (req, res) => {
    const id = req.params.id;

    const ref = firebase.database().ref("articles").child(id);
    ref.remove()
        .then(() => {
            res.send({
                data: `Article ${id} was deleted successfully`,
                error: false,
            });
        })
        .catch((err) => {
            res.send({ data: `Error deleting article - ${err}`, error: true });
        });
};
