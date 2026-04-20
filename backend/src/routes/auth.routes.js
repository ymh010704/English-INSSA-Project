import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import { pool } from '../repositories/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// 공통 토큰 생성 함수
const generateToken = (user) => {
  const id = user.user_id || user.id;
  return jwt.sign(
    { id: id, email: user.email, nickname: user.nickname },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
  [회원가입]
 */
router.post("/signup", async (req, res) => {
  const { email, pw, name } = req.body;
  try {
    const [rows] = await pool.execute('SELECT email FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ success: false, error: "이미 가입된 이메일입니다." });
    }
    const hashedPassword = await bcrypt.hash(pw, 10);
    
    const [userResult] = await pool.execute(
      'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    const newUserId = userResult.insertId;

    // 학습 기능을 위해 초기 스탯 데이터 생성
    await pool.execute(
      'INSERT INTO user_stats (user_id, total_xp, current_streak) VALUES (?, 0, 0)',
      [newUserId]
    );
    
    res.status(201).json({ success: true, message: "회원가입 성공!" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, error: "서버 오류" });
  }
});

/** * [로그인]
 */
router.post("/login", async (req, res) => {
  const { email, pw } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: "가입되지 않은 이메일" });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(pw, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "비번 틀림" });
    }

    const token = generateToken(user);
    res.json({ 
      success: true, 
      token,
      user: { email: user.email, nickname: user.nickname, role: user.role } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, error: "서버 오류" });
  }
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user);
    const user = encodeURIComponent(JSON.stringify({ 
      id: req.user.user_id || req.user.id,
      email: req.user.email, 
      nickname: req.user.nickname,
      provider: req.user.provider || 'google'
    }));
    res.redirect(`http://localhost/login?token=${token}&user=${user}`);
  }
);

router.get("/kakao", passport.authenticate("kakao", { session: false }));

router.get("/kakao/callback", 
  passport.authenticate("kakao", { session: false, failureRedirect: "http://localhost/login?error=kakao_fail" }),
  (req, res) => {
    try {
      const token = generateToken(req.user);
      const userData = encodeURIComponent(JSON.stringify({ 
        id: req.user.user_id || req.user.id,
        email: req.user.email, 
        nickname: req.user.nickname,
        provider: req.user.provider || 'kakao'
      }));

      console.log(`✅ 로그인 성공: ${req.user.nickname}`);
      res.redirect(`http://localhost/login?token=${token}&user=${userData}`);
    } catch (err) {
      res.redirect("http://localhost/login?error=server_error");
    }
  }
);

export default router;