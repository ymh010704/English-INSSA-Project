import express from "express";
import * as BookmarkController from '../controllers/bookmarks.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/toggle', authenticateJWT, BookmarkController.toggleBookmark);
router.get('/list', authenticateJWT, BookmarkController.getMyBookmarks);

export default router;
