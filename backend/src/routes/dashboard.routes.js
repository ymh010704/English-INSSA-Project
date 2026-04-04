// 대시보드에서 사용할 api << user_stats 같은 테이블들 api로 JSON 형태로 프론트에 보낼 것임
import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/stats', authenticateJWT, DashboardController.getStats);

export default router;