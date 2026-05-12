import express from "express";
import * as SlangController from "../controllers/slangs.controller.js";
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/", SlangController.listSlangs);
router.get('/search', SlangController.searchSlangs);
router.get('/today', authenticateJWT, SlangController.getTodaySlangs);
router.get('/today-dashboard', SlangController.getTodayDashboardSlangs); // 대시보드용

router.get("/shorts", SlangController.getShorts);

export default router;