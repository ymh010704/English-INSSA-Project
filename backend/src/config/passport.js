// 구글이나 카카오 소셜 로그인을 위한 passport 설정 파일

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { pool } from '../repositories/db.js';

// 구글 
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const nickname = profile.displayName;
      const snsId = profile.id;

      console.log(`📍 구글 데이터 확인 - 이메일: ${email}, 닉네임: ${nickname}, SNS_ID: ${snsId}`);

      // 1. 기존 유저인지 확인
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      
      if (rows.length > 0) {
        return done(null, rows[0]);
      } else {
        // 2. 신규 유저라면 DB 저장 (비밀번호는 소셜 로그인이라 null 가능하게 DB 설정 필요)
        const [result] = await pool.execute(
          'INSERT INTO users (email, nickname, sns_id, provider) VALUES (?, ?, ?, ?)',
          [email, nickname, snsId, 'google']
        );
        const newUser = { id: result.insertId, email, nickname };
        return done(null, newUser);
      }
    } catch (err) {
      return done(err);
    }
  }
));



// 카카오 
passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET, 
    callbackURL: "http://localhost/api/auth/kakao/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log("--- 🚀 카카오 인증 프로세스 시작 ---");
    
    try {
      const snsId = String(profile.id);
      const email = profile._json?.kakao_account?.email || `${snsId}@kakao.com`;
      const nickname = profile.properties?.nickname || profile.displayName || '카카오유저';

      console.log(`📍 데이터 확인 - 이메일: ${email}, 닉네임: ${nickname}, SNS_ID: ${snsId}`);

      // 1. DB 연결 및 조회 (에러 발생 시 catch 블록으로 이동)
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE sns_id = ? AND provider = ?', 
        [snsId, 'kakao']
      );

      if (rows.length > 0) {
        console.log("✅ 기존 유저 발견! 로그인 진행");
        return done(null, rows[0]);
      } 

      // 2. 신규 유저 등록
      console.log("📝 신규 유저 등록 중...");
      const [result] = await pool.execute(
        'INSERT INTO users (email, nickname, sns_id, provider) VALUES (?, ?, ?, ?)',
        [email, nickname, snsId, 'kakao']
      );

      const newUser = {
        user_id: result.insertId, // PK 컬럼명에 맞춤
        email: email,
        nickname: nickname
      };

      console.log("✨ 회원가입 완료:", newUser);
      return done(null, newUser);

    } catch (err) {
      // 🚨 여기서 DB 연결 실패(ECONNREFUSED)가 찍히면 .env의 DB_HOST를 'mysql'로 고쳐야 합니다.
      console.error("🚨 [Passport Kakao Error]:", err.message);
      return done(err);
    }
  }
));

export default passport;