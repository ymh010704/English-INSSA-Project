import * as DashboardService from '../services/dashboard.service.js';


const DashboardController = {
  getStats: async (req, res) => {
    try {
      // 1. req.user가 있는지 먼저 체크 (미들웨어 통과 확인)
      const userId = req.user.user_id || req.user.id;

      if (!userId) {
        return res.status(401).json({ error: "인증 정보가 없습니다." });
      }
      console.log(`📊 조회된 유저 ID: ${userId}`);

      // 서비스 호출
      const stats = await DashboardService.getUserStats(userId);

      res.json(stats);
      
    } catch (err) {
      console.error("🚨 Dashboard Controller Error:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export default DashboardController; 