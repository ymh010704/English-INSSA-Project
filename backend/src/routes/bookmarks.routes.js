const express = require("express");
const controller = require("../controllers/bookmarks.controller");

const router = express.Router();

router.post("/", controller.createBookmark);
router.get("/", controller.listBookmarks);
router.delete("/:id", controller.deleteBookmark);

module.exports = router;