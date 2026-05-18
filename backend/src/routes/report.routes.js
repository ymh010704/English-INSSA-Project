import express from 'express';
import ReportController from '../controllers/report.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.post('/slang', authenticateJWT, ReportController.reportSlang);
router.get('/slang', authenticateJWT, ReportController.getReportedSlangs);

export default router;