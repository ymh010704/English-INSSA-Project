// 북마크 컨트롤러 // 북마크 추가, 삭제, 조회 담당할 것
import { pool } from '../repositories/db.js';

export const toggleBookmark = async (req, res) => {
  console.log("toggleBookmark 요청됨"); // 나중에 지우기 (에러나서 확인용으로 넣음)

  try {
    const userId = req.user.user_id || req.user.id;
    const { slangId } = req.body;

    if (!userId || !slangId) {
      return res.status(400).json({ success: false, message: "필수 데이터 누락" });
    }

    // 이미 북마크 했는지 확인
    const checkQuery = "SELECT * FROM bookmarks WHERE user_id = ? AND slang_id = ?";
    const [existing] = await pool.execute(checkQuery, [userId, slangId]);

    if (existing.length > 0) {
      // 이미 있으면 삭제 (북마크 해제)
      await pool.execute("DELETE FROM bookmarks WHERE user_id = ? AND slang_id = ?", [userId, slangId]);
      return res.json({ isBookmarked: false });
    } else {
      // 없으면 추가
      await pool.execute("INSERT INTO bookmarks (user_id, slang_id) VALUES (?, ?)", [userId, slangId]);
      return res.json({ isBookmarked: true });
    }
  } catch (err) {
    console.error("🚨 [Controller Error] 상세 내용:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT b.bookmark_id, s.* FROM bookmarks b
      JOIN slangs s ON b.slang_id = s.slang_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};