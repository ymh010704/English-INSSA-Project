// 북마크 컨트롤러
import * as BookmarkService from '../services/bookmarks.service.js';

export const toggleBookmark = async (req, res) => {
  console.log("toggleBookmark 요청됨"); // 나중에 지우기 (에러나서 확인용으로 넣음)

  try {
    const userId = req.user.user_id || req.user.id;
    const { slangId } = req.body;

    if (!userId || !slangId) {
      return res.status(400).json({ success: false, message: "필수 데이터 누락" });
    }

    // 서비스 호출
    const result = await BookmarkService.toggleBookmark(userId, slangId);
    return res.json({ success: true, ...result });

  } catch (err) {
    console.error("[Controller Error] 내용:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;

    // 서비스 호출
    const bookmarks = await BookmarkService.getUserBookmarks(userId);
    res.json({ success: true, data: bookmarks });

  } catch (err) {
    console.error("[Controller<getMyBookmarks 내> Error] 내용:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};