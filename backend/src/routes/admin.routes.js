import express from 'express';
import mysql from 'mysql2/promise'; 

const router = express.Router();

// DB 연결 설정 
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql', 
    user: process.env.DB_USER || 'root',        
    password: process.env.DB_PASSWORD || 'root1234', 
    database: process.env.DB_NAME || 'slang_db',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// [GET] 전체 회원 목록 조회 (관리자 전용)
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, email, nickname, role, created_at FROM users'
        );
        
        res.status(200).json({
            success: true,
            data: rows
        });
 } catch (error) {
        console.error('🚨 [Admin API] 회원 목록 조회 중 에러 발생:', error);
        
        // 클라이언트(브라우저)에는 보안을 위해 깔끔한 JSON만 보냄
        res.status(500).json({
            success: false,
            message: '서버 내부 오류로 회원 목록을 가져오지 못했습니다.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

export default router;