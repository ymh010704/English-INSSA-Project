import express from "express";
import * as SlangController from "../controllers/slangs.controller.js";
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/", SlangController.listSlangs);
router.get('/search', SlangController.searchSlangs);
router.get('/today', authenticateJWT, SlangController.getTodaySlangs);
router.get('/today-dashboard', SlangController.getTodayDashboardSlangs); // 대시보드용

/**
 * @route   GET /api/slangs/shorts
 * @desc    shorts_url이 있는 슬랭 목록 조회
 */
router.get("/shorts", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT slang_id, word, definition_ko, example_en, example_ko, shorts_url FROM slangs WHERE shorts_url IS NOT NULL AND shorts_url != '' AND shorts_url != 'SKIPPED' ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;