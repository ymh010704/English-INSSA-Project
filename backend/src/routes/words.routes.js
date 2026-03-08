import express from "express";
import * as controller from "../controllers/words.controller.js"; 

const router = express.Router();

router.post("/", controller.createWord);
router.get("/", controller.listWords);
router.get("/:id", controller.getWord);
router.patch("/:id", controller.updateWord);
router.delete("/:id", controller.deleteWord);

export default router;