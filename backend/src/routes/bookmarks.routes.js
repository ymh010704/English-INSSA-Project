import express from "express";
import * as controller from "../controllers/bookmarks.controller.js";

const router = express.Router();

router.post("/", controller.createBookmark);
router.get("/", controller.listBookmarks);
router.delete("/:id", controller.deleteBookmark);

export default router;