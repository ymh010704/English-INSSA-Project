import { pool } from "./db.js";

const BookmarkRepository = {
  getBookmarkedSlangs: async (userId, count = 5) => {
    const limit = Math.min(Number(count) || 5, 5);

    const [rows] = await pool.execute(
      `
      SELECT 
        s.slang_id,
        s.word,
        s.definition_en,
        s.definition_ko,
        s.example_en,
        s.example_ko,
        s.category,
        s.emoji,
        s.shorts_url
      FROM bookmarks b
      JOIN slangs s ON b.slang_id = s.slang_id
      WHERE b.user_id = ?
      ORDER BY RAND()
      LIMIT ${limit}
      `,
      [userId]
    );

    return rows;
  },
};

export default BookmarkRepository;