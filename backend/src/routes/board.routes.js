import express from 'express';
import * as boardController from '../controllers/board.controller.js';

const router = express.Router();

// 자유게시판 글 쓰기
router.get('/', boardController.getAllPosts);
router.post('/write', boardController.writePost);

// 좋아요 / 싫어요 
router.post('/:id/like', boardController.likePost);
router.post('/:id/dislike', boardController.dislikePost);

// 자유게시판 글에 댓글달기
router.post('/:id/comment', boardController.createComment);

export default router;