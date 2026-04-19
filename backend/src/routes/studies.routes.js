// URL 연결용
import express from 'express';
import StudiesController from '../controllers/studies.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/quiz', authenticateJWT, StudiesController.getQuiz);

// 학습 결과 저장하기 POST 방식)
router.post('/log', authenticateJWT, StudiesController.logResult);

export default router;