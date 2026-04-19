import * as SlangService from '../services/slangs.service.js';
import { pool } from '../repositories/db.js';

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
    const [rows] = await pool.execute("SELECT * FROM slangs ORDER BY RAND() LIMIT 1");
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "데이터가 없습니다." });
    }
    
    console.log("✅ [Controller] 오늘의 슬랭 데이터 전송 성공!");
    res.json(rows[0]); 

  } catch (err) {
    console.error("❌ [Controller] 오늘의 단어 로딩 실패:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};