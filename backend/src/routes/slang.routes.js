import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root1234',
  database: process.env.DB_NAME || 'slang_db'
};

const pool = mysql.createPool(dbConfig);

router.get('/', async (req, res) => {
  try {
    console.log("🚀 슬랭 데이터 조회 시도 중..."); // 실행 여부 확인용
    const [rows] = await pool.execute('SELECT * FROM slangs');
    console.log("✅ 조회 성공! 데이터 개수:", rows.length);
    res.json({ success: true, data: rows });
  } catch (err) {
  
    console.error("❌ DB 에러 발생!!! 상세내용:", err.message); 
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;