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

// 전체 회원 목록 조회 (관리자 전용)
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users'
        );
        
        res.status(200).json({
            success: true,
            data: rows
        });
 } catch (error) {
        console.error('🚨 [Admin API] 회원 목록 조회 중 에러 발생:', error);
        
        res.status(500).json({
            success: false,
            message: '서버 내부 오류로 회원 목록을 가져오지 못했습니다.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});
router.get('/slangs-test', (req, res) => {
    const mockSlangs = [
        { id: 1, term: "no cap", meaning: "진짜, 거짓 없이", origin: "AAVE", tags: ["SNS", "Gen Z"], level: "중급", status: "공개", trend: 94 },
        { id: 2, term: "ate", meaning: "완전 잘했다, 찢었다", origin: "Drag culture", tags: ["밈", "Gen Z"], level: "초급", status: "검수 대기", trend: 88 },
        { id: 5, term: "rizz", meaning: "이성을 끄는 매력", origin: "Charisma", tags: ["SNS", "Gen Z"], level: "고급", status: "공개", trend: 71 }
    ];
    
    res.status(200).json({
        success: true,
        data: mockSlangs
    });
});

// 특정 회원 삭제
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 실제 삭제 
        const [result] = await connection.execute(
            'DELETE FROM users WHERE user_id = ?',
            [id]
        );

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '해당 유저를 찾지 못했습니다.' });
        }

        res.status(200).json({ success: true, message: `user_id ${id}번 유저 삭제 완료!` });
    } catch (error) {
        await connection.rollback();
        console.error('🚨 삭제 에러:', error);
        res.status(500).json({ success: false, message: 'DB 에러로 삭제 실패' });
    } finally {
        connection.release();
    }
});

router.get('/slangs', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM slangs ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('슬랭 목록 조회 에러:', error);
    res.status(500).json({ success: false, message: 'DB 조회 실패' });
  }
});
// 새로운 슬랭 등록 
router.post('/slangs', async (req, res) => {
    const { word, definition_ko, definition_en, example_en, example_ko } = req.body;
    
    try {
        const [result] = await pool.execute(
            'INSERT INTO slangs (word, definition_ko, definition_en, example_en, example_ko) VALUES (?, ?, ?, ?, ?)',
            [word, definition_ko, definition_en, example_en, example_ko]
        );

        res.status(201).json({
            success: true,
            message: '새로운 슬랭이 등록되었습니다!',
            slangId: result.insertId
        });
    } catch (error) {
        console.error('🚨 슬랭 등록 에러:', error);
        res.status(500).json({ success: false, message: 'DB 등록 실패', detail: error.message });
    }
});

// 특정 슬랭 삭제
router.delete('/slangs/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const [result] = await pool.execute(
            'DELETE FROM slangs WHERE slang_id = ?', 
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '삭제할 슬랭을 찾지 못했습니다.' });
        }

        res.status(200).json({ success: true, message: `${id}번 슬랭이 삭제되었습니다.` });
    } catch (error) {
        console.error('🚨 슬랭 삭제 에러:', error);
        res.status(500).json({ success: false, message: '삭제 실패' });
    }
});

export default router;

