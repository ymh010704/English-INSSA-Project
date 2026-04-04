// 혹시 오류나면 cd backend 이후 >> npm install jsonwebtoken passport passport-google-oauth20 passport-kakao 깔아보기
// backend/package.json에 소셜로그인 그거 추가하는것

import express from "express";
import { pool } from '../repositories/db.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js"; // passport 설정 가져오기

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; // JWT 환경변수


// 공통 (우선 토큰 생성 함수)
const generateToken = (user) => {
  const id = user.user_id || user.id;
  return jwt.sign(
    { id: id, email: user.email, nickname: user.nickname },
    JWT_SECRET,
    { expiresIn: '7d' } // 7일 유지
  );
};


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

    // JWT 토큰 발행
    const token = generateToken(user);

    res.json({ 
      success: true, 
      token,
      user: { email: user.email, nickname: user.nickname } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, error: "서버 오류 발생" });
  }
});

// --- 구글 로그인 ---
// GET /api/auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// GET /api/auth/google/callback
router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user);
    const user = encodeURIComponent(JSON.stringify({ 
      email: req.user.email, 
      nickname: req.user.nickname 
    }));
    // 프론트엔드 로그인 페이지로 토큰과 유저 정보를 들고 리다이렉트
    res.redirect(`http://localhost:3000/login?token=${token}&user=${user}`);
  }
);

// --- 카카오 로그인 ---
// GET /api/auth/kakao
router.get("/kakao", passport.authenticate("kakao", { session: false }));

// --- 카카오 콜백 처리 ---
router.get("/kakao/callback", 
  passport.authenticate("kakao", { session: false, failureRedirect: "http://localhost/login?error=kakao_fail" }),
  (req, res) => {
    try {
      if (!req.user) {
        throw new Error("유저 정보가 없습니다.");
      }

      const token = generateToken(req.user);
      const userData = encodeURIComponent(JSON.stringify({ 
        email: req.user.email, 
        nickname: req.user.nickname 
      }));

      console.log(`✅ 로그인 성공: ${req.user.nickname}`);
      // 프론트엔드로 최종 리다이렉트
      res.redirect(`http://localhost/login?token=${token}&user=${userData}`);

    } catch (err) {
      console.error("🚨 리다이렉트 처리 중 에러:", err.message);
      res.redirect("http://localhost/login?error=server_error");
    }
  }
);

export default router;