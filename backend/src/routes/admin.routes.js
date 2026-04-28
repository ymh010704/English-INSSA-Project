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

export default router;