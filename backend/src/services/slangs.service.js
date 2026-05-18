import { pool } from "../repositories/db.js";

// 검색 관련 함수 e.g.: 대시보드, 북마크
export const search = async (keyword) => {
  const searchTerm = `%${keyword}%`; // 부분 일치 검사하려고 %단어% 넣음
  const query = `
    SELECT word, definition_ko as meaning, category, emoji 
    FROM slangs 
    WHERE word LIKE ? OR definition_ko LIKE ? OR category LIKE ?
    LIMIT 5
  `;
  const [rows] = await pool.execute(query, [searchTerm, searchTerm, searchTerm]);
  return rows;
}; 

export const list = async () => {
  // DB에서 모든 슬랭 데이터를 가져와서 반환합니다.
  const [rows] = await pool.query("SELECT * FROM slangs ORDER BY created_at DESC");
  return rows;
};

export const getShorts = async () => {
  // query 대신 execute를 사용해보거나, pool이 제대로 불러와졌는지 확인
  const [rows] = await pool.execute(
    "SELECT slang_id, word, definition_ko, example_en, example_ko, shorts_url FROM slangs WHERE shorts_url IS NOT NULL AND shorts_url != '' AND shorts_url != 'SKIPPED' ORDER BY created_at DESC"
  );
  return rows;
};


// 슬랭 사전용
export async function getSlangList() {
  // DB에서 데이터 조회
  const [rows] = await pool.query(`
    SELECT 
      slang_id, word, definition_en, definition_ko, 
      example_en, example_ko, category, emoji, shorts_url 
    FROM slangs 
    ORDER BY word ASC
  `);

  // UI에 맞춰 데이터 가공 (필요 시)
  return rows.map(item => ({
    ...item,
    // 예: 비디오 경로가 있으면 서버 주소와 연결
    shorts_url: item.shorts_url ? `/uploads/videos/${item.shorts_url}` : null
  }));
}

// 오늘의 학습 단어 5개 가져오기 (learning-intro에 보이는 거)
export const getTodaySlangs = async () => {
  // 오늘 날짜를 숫자 형태로 생성 (예: 20240520) // 매일 바꿀라고
  const todaySeed = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const query = `
    SELECT slang_id, word, definition_ko, category, emoji
    FROM slangs 
    ORDER BY RAND(${todaySeed}) 
    LIMIT 5
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

// Dashboard에 보일 슬랭 1개 가져오기
export const getTodayDashboardSlangs = async () => {
  const todaySeed = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const query = `
    SELECT slang_id, word, definition_ko, category, emoji, example_en, example_ko 
    FROM slangs 
    ORDER BY RAND(${todaySeed}) 
    LIMIT 1
  `; 
  const [rows] = await pool.execute(query);
  return rows[0];
};

// 유저가 슬랭학습 하다 신고했을때 업데이트하는 로직
export const reportSlang = async (word, reason) => {
  try {
    
    const [result] = await pool.execute(
      'UPDATE slangs SET report_count = report_count + 1, report_reason = ? WHERE word = ?',
      [reason || '유저 신고 접수', word]
    );
    return result;
  } catch (error) {
    console.error("❌ [DB 슬랭 신고 업데이트 에러]:", error.message);
    throw error;
  }
};