const express = require("express");
const { saveContactUs } = require("./contact-us");
const { fetchArticles, fetchArticleById } = require("./articles");

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

module.exports = router;
