import express from 'express';
import PracticeController from '../controllers/practice.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 퀴즈 데이터 가져오기
router.get('/questions', authenticateJWT, PracticeController.getQuestions);

export default router;