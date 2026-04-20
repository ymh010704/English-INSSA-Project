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
    await pool.execute("DELETE FROM bookmarks WHERE user_id = ? AND slang_id = ?", [userId, slangId]);
    return { isBookmarked: false };
  } else {
    await pool.execute("INSERT INTO bookmarks (user_id, slang_id) VALUES (?, ?)", [userId, slangId]);
    return { isBookmarked: true };
  }
  
}

export function create(req) {
  return repo.create(getUserId(req), req.body);
}

export function list(req) {
  const userId = getUserId(req);
  const { q, tag } = req.query || {};
  return repo.list(userId, { q, tag });
}

export function remove(req) { // export 추가
  const userId = getUserId(req);
  const ok = repo.remove(userId, req.params.id);
  if (!ok) {
    const err = new Error("not_found");
    err.status = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return true;
}

