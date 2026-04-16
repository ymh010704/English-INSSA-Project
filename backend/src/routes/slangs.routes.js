import express from "express";
import * as SlangController from "../controllers/slangs.controller.js";
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/", SlangController.listSlangs);
router.get('/search', SlangController.searchSlangs);
router.get('/today', authenticateJWT, SlangController.getTodaySlangs);

export default router;