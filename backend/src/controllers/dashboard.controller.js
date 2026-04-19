import { pool } from '../repositories/db.js';

const DashboardController = {
  getStats: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "인증 정보가 없습니다." });
      }

      const userId = req.user.id || req.user.user_id;
      console.log(`📊 Dashboard 조회 유저 ID: ${userId}`);
      const q1 = `SELECT COUNT(*) as todayCount FROM study_logs WHERE user_id = ? AND DATE(created_at) = CURDATE()`;
      const q2 = `SELECT COUNT(*) as masteredCount FROM study_logs WHERE user_id = ? AND status = 'mastered'`;
      const q3 = `SELECT COUNT(*) as aiCount FROM ai_chat_logs WHERE user_id = ? AND DATE(created_at) = CURDATE()`;
      const q4 = `SELECT current_streak, total_xp FROM user_stats WHERE user_id = ?`;
      const q5 = `SELECT IFNULL(ROUND(AVG(is_correct) * 100), 0) as accuracy FROM study_logs WHERE user_id = ? AND created_at >= CURDATE()`;

      const [res1, res2, res3, res4, res5] = await Promise.all([
        pool.execute(q1, [userId]).catch(() => [{ todayCount: 0 }]),
        pool.execute(q2, [userId]).catch(() => [{ masteredCount: 0 }]),
        pool.execute(q3, [userId]).catch(() => [{ aiCount: 0 }]),
        pool.execute(q4, [userId]).catch(() => [[{ current_streak: 0, total_xp: 0 }]]),
        pool.execute(q5, [userId]).catch(() => [{ accuracy: 0 }])
      ]);

      const stats = {
        todayCount: res1[0][0]?.todayCount || 0,
        masteredCount: res2[0][0]?.masteredCount || 0,
        aiCount: res3[0][0]?.aiCount || 0,
        streak: res4[0][0]?.current_streak || 0,
        xp: res4[0][0]?.total_xp || 0,
        accuracy: res5[0][0]?.accuracy || 0
      };

      console.log("✅ 보낼 스탯 데이터:", stats);
      res.json(stats);

    } catch (err) {
      console.error("🚨 Dashboard Controller Error:", err);
      res.status(200).json({ todayCount: 0, masteredCount: 0, aiCount: 0, streak: 0, xp: 0, accuracy: 0 });
    }
  }
};

export default DashboardController;