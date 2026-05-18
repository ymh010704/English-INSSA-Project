import express from "express";
import * as BookmarkController from '../controllers/bookmarks.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 북마크 페이지용
router.post('/toggle', authenticateJWT, BookmarkController.toggleBookmark);
router.get('/list', authenticateJWT, BookmarkController.getMyBookmarks);

// 북마크 학습 페이지용
router.get("/study", authenticateJWT, BookmarkController.getBookmarkStudyQuiz);

export default router;