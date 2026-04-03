import express from "express";
import chatRoutes from "./chatRoutes.js";
import wordsRoutes from "./words.routes.js";
import bookmarksRoutes from "./bookmarks.routes.js";
import authRoutes from "./auth.routes.js"; // 로그인 로직 구현한 것 << index.js 좀 덜 더럽게 하려구 분리함 >>
import slangsRoutes from "./slangs.routes.js";

const router = express.Router();

// 헬스체크
router.get("/ping", (req, res) => res.json({ ok: true, message: "pong" }));

// 기존 라우트 유지
router.use("/words", wordsRoutes);
router.use("/bookmarks", bookmarksRoutes);

// 인증 관련 라우트 추가 (로그인, 회원가입 등)
router.use("/auth", authRoutes); 
router.use("/chat", chatRoutes);
router.use("/slangs", slangsRoutes);

export default router;