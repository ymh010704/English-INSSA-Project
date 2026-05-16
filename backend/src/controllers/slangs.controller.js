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
    // 서비스에서 가공된 데이터 가져오기
    const slangs = await SlangService.getSlangList();

    res.status(200).json({
      success: true,
      data: slangs
    });
  } catch (error) {
    console.error('🚨 Slang Controller Error:', error);
    // 에러 미들웨어가 있다면 next(error)로 넘기고, 없다면 바로 응답
    res.status(500).json({ 
      success: false, 
      message: '서버에서 데이터를 가져오는데 실패했습니다.' 
    });
  }
}

// 오늘의 학습 관련 > learning-intro에 씀 (5개)
export const getTodaySlangs = async (req, res) => {
  try {
    const slangs = await SlangService.getTodaySlangs();
    res.json(slangs);
  } catch (err) {
    console.error("[Controller] 오늘의 단어 로딩 실패:", err.message);
    res.status(500).json({ error: "데이터를 불러오는 중 오류가 발생했습니다." });
  }
};

// Dashboard에 보일 슬랭 단어 (한 개)
export const getTodayDashboardSlangs = async (req, res) => {
  try {
    const slangs = await SlangService.getTodayDashboardSlangs();
    res.json(slangs);
  } catch (err) {
    console.error("[Controller] 오늘의 단어 로딩 실패:", err.message);
    res.status(500).json({ error: "데이터를 불러오는 중 오류가 발생했습니다." });
  }
};

// 쇼츠용 슬랭 목록 (shorts_url 있는 것만)
export const getShorts = async (req, res) => {
  try {
    const data = await SlangService.getShorts();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};