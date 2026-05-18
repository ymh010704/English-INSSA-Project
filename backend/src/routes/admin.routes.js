import express from 'express';
import * as AdminController from '../controllers/admin.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { getAdminDashboardStats } from "../controllers/admin.controller.js";
import { deleteReportLog, createReportLog } from "../controllers/admin.controller.js";

const router = express.Router();

// 통계 
router.get('/dashboard/stats', authenticateJWT, getAdminDashboardStats);

// 유저
router.get('/users', authenticateJWT, AdminController.getUsers);
router.delete('/users/:id', authenticateJWT, AdminController.deleteUser);

// 슬랭
router.get('/slangs', authenticateJWT, AdminController.getSlangs);
router.post('/slangs', authenticateJWT, AdminController.createSlang);
router.delete('/slangs/:id', authenticateJWT, AdminController.deleteSlang);

// 신고 기록 삭제
router.post('/reports/delete/:slangId', authenticateJWT, AdminController.deleteReportLog);
// 일반 회원이 신고하는 경로
router.post('/report-slang', authenticateJWT, AdminController.createReportLog);

// 관리자 페이지로 신고 슬랭 넘기는 경로
router.get('/reports/list', AdminController.getReports);

router.put('/slangs/:id', AdminController.updateSlang);

export default router;