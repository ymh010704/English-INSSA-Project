import express from 'express';
import * as AdminController from '../controllers/admin.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 유저
router.get('/users', authenticateJWT, AdminController.getUsers);
router.delete('/users/:id', authenticateJWT, AdminController.deleteUser);

// 슬랭
router.get('/slangs', authenticateJWT, AdminController.getSlangs);
router.post('/slangs', authenticateJWT, AdminController.createSlang);
router.delete('/slangs/:id', authenticateJWT, AdminController.deleteSlang);

// 관리자페이지 대시보드 데이터 주소
router.get('/dashboard', authenticateJWT, AdminController.getDashboardData);


export default router;