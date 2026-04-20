import cron from 'node-cron';
import { pool } from '../repositories/db.js';
import { sendDailyWord } from '../services/telegram.service.js';

// 매일 오전 9시 발송
export function startDailyWordCron() {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] 오늘의 단어 발송 시작');
    try {
      const [rows] = await pool.query('SELECT * FROM slangs ORDER BY RAND() LIMIT 1');
      if (rows.length === 0) return;
      await sendDailyWord(rows[0]);
    } catch (err) {
      console.error('[Cron] 발송 실패:', err.message);
    }
  }, { timezone: 'Asia/Seoul' });

  console.log('[Cron] 매일 오전 9시 단어 발송 예약됨');
}
