import * as SlangService from '../services/slangs.service.js';

export const searchSlangs = async (req, res) => {
  try {
    const { q } = req.query; // URL의 ?q=keyword 부분 추출
    
    if (!q || q.trim() === "") {
      return res.json([]); // 검색어가 없으면 빈 배열 반환
    }

    const results = await SlangService.search(q);
    res.json(results);
  } catch (err) {
    console.error("🚨 Search Controller Error:", err.message);
    res.status(500).json({ error: "검색 중 서버 에러 발생!" });
  }
};

export async function listSlangs(req, res, next) {
  try {
    const data = await service.list();
    return ok(res, data); 
  } catch (e) {
    next(e);
  }
}

// 오늘의 학습 관련 > learning-intro에 씀
export const getTodaySlangs = async (req, res) => {
  try {
    const slangs = await SlangService.getTodaySlangs();
    res.json(slangs);
  } catch (err) {
    console.error("[Controller] 오늘의 단어 로딩 실패:", err.message);
    res.status(500).json({ error: "데이터를 불러오는 중 오류가 발생했습니다." });
  }
};