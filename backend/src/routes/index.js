const express = require("express");
const wordsRoutes = require("./words.routes");
const bookmarksRoutes = require("./bookmarks.routes");

const router = express.Router();

router.get("/ping", (req, res) => res.json({ ok: true, message: "pong" }));

router.use("/words", wordsRoutes);
router.use("/bookmarks", bookmarksRoutes);

module.exports = router;