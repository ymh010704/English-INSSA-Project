import { pool } from '../repositories/db.js';
import { getUserStats } from './dashboard.service.js';

const BADGE_CONDITIONS = [
  { name: '7일 연속',      check: (s) => s.streak >= 7 },
  { name: '첫 10개',       check: (s) => s.masteredCount >= 10 },
  { name: '스피드 러너',   check: (s) => s.todayCount >= 10 },
  { name: '야간 학습',     check: (s) => s.hasNightStudy },
  { name: '퍼펙트 스코어', check: (s) => s.accuracy >= 100 },
  { name: '30일 연속',     check: (s) => s.streak >= 30 },
  { name: '올라운더',      check: (s) => s.categories.length > 0 && s.categories.every(c => c.total > 0 && (c.mastered / c.total) >= 0.5) },
  { name: '100개 달성',    check: (s) => s.masteredCount >= 100 },
  { name: 'AI 마스터',     check: (s) => s.totalAiCount >= 50 },
];

export const evaluateAndGetBadges = async (userId) => {
  const stats = await getUserStats(userId);

  const [[nightRow]] = await pool.execute(
    `SELECT COUNT(*) as cnt FROM study_logs WHERE user_id = ? AND HOUR(CONVERT_TZ(created_at, '+00:00', '+09:00')) >= 23`,
    [userId]
  );
  const [[aiRow]] = await pool.execute(
    `SELECT COUNT(*) as cnt FROM ai_chat_logs WHERE user_id = ?`,
    [userId]
  );

  const extStats = {
    ...stats,
    hasNightStudy: nightRow.cnt > 0,
    totalAiCount: aiRow.cnt,
  };

  const earned = BADGE_CONDITIONS.filter(b => b.check(extStats)).map(b => b.name);

  if (earned.length > 0) {
    const values = earned.map(name => [userId, name]);
    await pool.query(
      `INSERT IGNORE INTO user_badges (user_id, badge_name) VALUES ?`,
      [values]
    );
  }

  const [rows] = await pool.execute(
    `SELECT badge_name FROM user_badges WHERE user_id = ? ORDER BY earned_at ASC`,
    [userId]
  );

  return rows.map(r => r.badge_name);
};
