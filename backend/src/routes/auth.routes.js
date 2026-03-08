import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const router = express.Router();

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root1234',
  database: process.env.DB_NAME || 'slang_db'
};

const pool = mysql.createPool(dbConfig);

/**
 * [회원가입] POST /api/auth/signup
 */

router.post("/signup", async (req, res) => {
  const { email, pw, name } = req.body; // 프론트엔드에서 보낸 변수명
  
  try {
    // 1. 중복 확인
    const [rows] = await pool.execute('SELECT email FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ success: false, error: "이미 가입된 이메일입니다." });
    }

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(pw, 10);
    
    // 3. DB 저장
    await pool.execute(
      'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );
    
    res.status(201).json({ success: true, message: "회원가입 성공!" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, error: "서버 오류로 가입에 실패했습니다." });
  }
});

/**
 * [로그인] POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  const { email, pw } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: "가입되지 않은 이메일입니다." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(pw, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: "비밀번호가 틀렸습니다." });
    }

    res.json({ 
      success: true, 
      user: { email: user.email, nickname: user.nickname } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, error: "서버 오류 발생" });
  }
});

export default router;