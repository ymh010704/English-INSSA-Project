import { pool } from "../repositories/db.js";

// 유저의 북마크 목록 가져오기
export const getUserBookmarks = async (userId) => {
  const query = `
    SELECT b.bookmark_id, s.slang_id, s.word, s.definition_ko, s.example_en, s.category 
    FROM bookmarks b
    JOIN slangs s ON b.slang_id = s.slang_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;
  const [rows] = await pool.execute(query, [userId]);
  return rows;
};

// 북마크 토글 로직 (추가/삭제 결정)
export const toggleBookmark = async (userId, slangId) => {
  // 1. 이미 북마크 했는지 확인
  const checkQuery = "SELECT * FROM bookmarks WHERE user_id = ? AND slang_id = ?";
  const [existing] = await pool.execute(checkQuery, [userId, slangId]);

  if (existing.length > 0) {
    // 2. 이미 있으면 삭제
    await pool.execute("DELETE FROM bookmarks WHERE user_id = ? AND slang_id = ?", [userId, slangId]);
    return { isBookmarked: false };
  } else {
    // 3. 없으면 추가(=등록)
    await pool.execute("INSERT INTO bookmarks (user_id, slang_id) VALUES (?, ?)", [userId, slangId]);
    return { isBookmarked: true };
  }
};