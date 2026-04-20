import express from "express";
import wordsRoutes from "./words.routes.js";
import bookmarksRoutes from "./bookmarks.routes.js";
import authRoutes from "./auth.routes.js";
import chatRoutes from "./chatRoutes.js";
import adminRoutes from "./admin.routes.js";
import slangsRoutes from "./slangs.routes.js";
import { pool } from "../repositories/db.js";
import { sendDailyWord } from "../services/telegram.service.js";

const router = express.Router();

// 헬스체크
router.get("/ping", (req, res) => res.json({ ok: true, message: "pong" }));

// 텔레그램 테스트 발송
router.post("/telegram/test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM slangs ORDER BY RAND() LIMIT 1");
    if (rows.length === 0) return res.status(404).json({ error: "슬랭 없음" });
    await sendDailyWord(rows[0]);
    res.json({ ok: true, word: rows[0].word });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 기존 라우트 유지
router.use("/words", wordsRoutes);
router.use("/bookmarks", bookmarksRoutes);

// 인증 및 채팅 라우트
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/admin", adminRoutes);
router.use("/slangs", slangsRoutes);

export default router;