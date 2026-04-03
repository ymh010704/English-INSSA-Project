// URL 연결용
import express from 'express';
const router = express.Router();
import StudiesController from '../controllers/studies.controller.js';

// GET /api/studies/quiz?count=10 형태의 요청을 처리
router.get('/quiz', StudiesController.getQuiz);

export default router;