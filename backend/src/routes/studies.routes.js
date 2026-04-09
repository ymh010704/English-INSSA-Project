// URL 연결용
import express from 'express';
import StudiesController from '../controllers/studies.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/studies/quiz?count=10 형태의 요청을 처리 (기존 퀴즈 가져오기)
router.get('/quiz', authenticateJWT, StudiesController.getQuiz);

// 학습 결과 저장하기 POST 방식)
router.post('/log', authenticateJWT, StudiesController.logResult);

export default router;