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

// 신고 기록 삭제
router.post('/reports/delete/:slangId', authenticateJWT, AdminController.deleteReportLog);

router.post('/report-slang', async (req, res) => {
  try {
    const { slangId } = req.body; 
     await AdminService.increaseReportCount(slangId);
    
    return res.status(200).json({ success: true, message: "관리자 시스템에 신고 접수 완료!" });
  } catch (err) {
    console.error("관리자 신고 접수 중 에러:", err);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
});

export default router;