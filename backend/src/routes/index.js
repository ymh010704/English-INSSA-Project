import express from "express";
import wordsRoutes from "./words.routes.js";
import bookmarksRoutes from "./bookmarks.routes.js";
import authRoutes from "./auth.routes.js";
import chatRoutes from "./chatRoutes.js";
import adminRoutes from "./admin.routes.js";
import slangsRoutes from "./slangs.routes.js";

const router = express.Router();

// 헬스체크
router.get("/ping", (req, res) => res.json({ ok: true, message: "pong" }));

// 기존 라우트 유지
router.use("/words", wordsRoutes);
router.use("/bookmarks", bookmarksRoutes);

// 인증 및 채팅 라우트
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/admin", adminRoutes);
router.use("/slangs", slangsRoutes);

export default router;