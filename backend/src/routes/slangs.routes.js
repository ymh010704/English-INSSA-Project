import express from "express";
import * as controller from "../controllers/slangs.controller.js";

const router = express.Router();

router.get("/", controller.listSlangs);

export default router;