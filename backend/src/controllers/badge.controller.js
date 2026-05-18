import { evaluateAndGetBadges } from '../services/badge.service.js';

const BadgeController = {
  getBadges: async (req, res) => {
    try {
      const userId = req.user.user_id || req.user.id;
      if (!userId) return res.status(401).json({ error: '인증 정보가 없습니다.' });
      const badges = await evaluateAndGetBadges(userId);
      res.json({ badges });
    } catch (err) {
      console.error('🚨 Badge Controller Error:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default BadgeController;
