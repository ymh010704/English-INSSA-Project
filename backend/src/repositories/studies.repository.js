import { pool } from './db.js';

const StudiesRepository = {
  getRandomSlangs: async (limit) => {
    const query = `SELECT * FROM slangs ORDER BY RAND() LIMIT ?`;
    const [rows] = await pool.execute(query, [String(limit)]);
    return rows;
  },

  getRandomMeanings: async (excludeWord, limit) => {
    // definition_ko 컬럼에서 오답용 뜻을 가져옵니다.
    const query = `SELECT definition_ko FROM slangs WHERE word != ? ORDER BY RAND() LIMIT ?`;
    const [rows] = await pool.execute(query, [excludeWord, String(limit)]);
    return rows.map(row => row.definition_ko);
  }
};

export default StudiesRepository;