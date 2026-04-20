import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  // 헤더에서 토큰 추출 
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // 'Bearer' 뒤의 토큰만 가져옴

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
      if (err) {
        console.error("🚨 JWT 검증 실패:", err.message);
        return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
      }
      req.user = user; 
      next(); // 다음 로직(컨트롤러)으로 진행
    });
  } else {
    // 토큰이 아예 없는 경우
    res.status(401).json({ error: "로그인이 필요한 서비스입니다." });
  }
};