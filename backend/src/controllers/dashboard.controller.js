import { pool } from '../repositories/db.js';

const DashboardController = {
  getStats: async (req, res) => {
    try {
      // 1. req.user가 있는지 먼저 체크 (미들웨어 통과 확인)
      if (!req.user) {
        return res.status(401).json({ error: "인증 정보가 없습니다." });
      }

      const userId = req.user.id || req.user.user_id;
      console.log(`📊 조회 시도 유저 ID: ${userId}`);

      const q1 = `SELECT COUNT(*) as todayCount FROM study_logs WHERE user_id = ? AND DATE(created_at) = CURDATE()`;
      const q2 = `SELECT COUNT(*) as masteredCount FROM study_logs WHERE user_id = ? AND status = 'mastered'`;
      const q3 = `SELECT COUNT(*) as aiCount FROM ai_chat_logs WHERE user_id = ? AND DATE(created_at) = CURDATE()`;
      const q4 = `SELECT current_streak, total_xp FROM user_stats WHERE user_id = ?`;

      // 2. 결과 배열 구조를 명확히 처리
      const [res1, res2, res3, res4] = await Promise.all([
        pool.execute(q1, [userId]),
        pool.execute(q2, [userId]),
        pool.execute(q3, [userId]),
        pool.execute(q4, [userId])
      ]);

      // resX[0]은 데이터 행(rows) 배열, resX[0][0]은 그 중 첫 번째 결과 객체
      res.json({
        todayCount: res1[0][0]?.todayCount || 0,
        masteredCount: res2[0][0]?.masteredCount || 0,
        aiCount: res3[0][0]?.aiCount || 0,
        streak: res4[0][0]?.current_streak || 0,
        xp: res4[0][0]?.total_xp || 0,
        accuracy: 87
      });

    } catch (err) {
      console.error("🚨 Dashboard Controller Error:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export default DashboardController;