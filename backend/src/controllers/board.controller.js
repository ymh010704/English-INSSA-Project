import * as boardService from '../services/board.service.js';

export const getAllPosts = async (req, res) => {
    try {
        const posts = await boardService.getAllPosts();
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "조회 실패", error: err.message });
    }
};

export const writePost = async (req, res) => {
    try {
        const result = await boardService.createNewPost(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ message: "글 등록 실패", error: err.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body; // 프론트에서 넘어오는 유저 이름 받기
        
        const updatedPost = await boardService.updateLike(Number(id), 'like', username);
        res.status(200).json({ success: true, data: updatedPost });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const dislikePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        
        const updatedPost = await boardService.updateLike(Number(id), 'dislike', username);
        res.status(200).json({ success: true, data: updatedPost });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const createComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, user } = req.body; 
        
        
        const updatedPost = await boardService.addComment(Number(id), content, user);
        res.status(201).json({ success: true, data: updatedPost });
    } catch (err) {
        res.status(500).json({ message: "댓글 작성 실패", error: err.message });
    }
};