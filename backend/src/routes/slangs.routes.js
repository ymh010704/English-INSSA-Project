import express from "express";
import { pool } from "../repositories/db.js"; 

const router = express.Router();

/**
 * @route   GET /api/slangs/today
 * @desc    홈 화면 중앙에 띄울 랜덤 단어 하나 가져오기
 */
router.get("/today", async (req, res) => {
  try {
    console.log("🌞 [Route] 오늘의 단어 조회 중...");
    const [rows] = await pool.execute("SELECT * FROM slangs ORDER BY RAND() LIMIT 1");
    
    if (rows.length === 0) {
      return res.status(404).json([]); 
    }
    
    res.json([rows[0]]); 
    
    console.log("✅ [Route] 단어 송출 성공 (배열 형태)");
  } catch (err) {
    console.error("❌ 에러 발생:", err.message);
    res.status(500).json([]); 
  }
});

/**
 * @route   GET /api/slangs
 * @desc   
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM slangs");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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