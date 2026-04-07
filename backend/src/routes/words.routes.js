const express = require("express");
const controller = require("../controllers/words.controller");

const router = express.Router();

router.post("/", controller.createWord);
router.get("/", controller.listWords);
router.get("/:id", controller.getWord);
router.patch("/:id", controller.updateWord);
router.delete("/:id", controller.deleteWord);

module.exports = router;