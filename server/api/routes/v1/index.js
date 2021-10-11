const express = require("express");
const { saveContactUs } = require("./contact-us");
const {
    fetchArticles,
    fetchArticleById,
    createArticle,
    deleteArticleById,
    updateArticleById,
} = require("./articles");
const { uploadByFile } = require("./upload");

// no authentication for now
const router = express.Router();

/*
 * GET /api/v1
 */
router.get("/", (req, res) => {
    res.send("/api/v1");
});

// Contact Us
router.get("/contactus/:subject/:name/:email/:message", saveContactUs);

// Articles
router.get("/articles", fetchArticles);
router.get("/articles/:id", fetchArticleById);
router.post("/articles", createArticle);
router.delete("/articles/:id", deleteArticleById);
router.put("/articles", updateArticleById);

// Upload
router.post("/uploadFile", uploadByFile);

module.exports = router;
