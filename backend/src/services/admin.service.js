import { pool } from "../repositories/db.js";

export const getUsers = async () => {
  const [rows] = await pool.execute('SELECT user_id, nickname, email, created_at, role FROM users');
  return rows;
};

// 유저 삭제
export const deleteUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const [result] = await connection.execute(
      'DELETE FROM users WHERE user_id = ?',
      [id]
    );

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();

    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// 슬랭 목록 조회
export const getSlangs = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM slangs ORDER BY created_at DESC'
    );
    console.log("✅ DB 조회 성공! 데이터 개수:", rows.length);
    return rows;
  } catch (error) {
    console.error("❌ [DB ERROR]:", error.message);
    throw error;
  }
};

// 슬랭 추가
export const createSlang = async (data) => {
  const { word, definition_ko, definition_en, example_en, example_ko } = data;

  const [result] = await pool.execute(
    'INSERT INTO slangs (word, definition_ko, definition_en, example_en, example_ko) VALUES (?, ?, ?, ?, ?)',
    [word, definition_ko, definition_en, example_en, example_ko]
  );

  return result;
};

// 슬랭 삭제
export const deleteSlang = async (id) => {
  const [result] = await pool.execute(
    'DELETE FROM slangs WHERE slang_id = ?',
    [id]
  );
  return result;
};

// 대시보드 메인 화면 통계 숫자 집계 함수
export const getDashboardStats = async () => {
  try {
    const [totalUsersResult] = await pool.execute('SELECT COUNT(*) as totalUserCount FROM users');
    const [pendingSlangsResult] = await pool.execute('SELECT COUNT(*) as pendingSlangCount FROM slangs');
    const [todayNewUsersResult] = await pool.execute('SELECT COUNT(*) as todayNewUserCount FROM users WHERE DATE(created_at) = CURDATE()');
    
    let todayBoardPostCount = 0;
    try {
      const [todayBoardPostsResult] = await pool.execute('SELECT COUNT(*) as count FROM board WHERE DATE(created_at) = CURDATE()');
      todayBoardPostCount = todayBoardPostsResult[0]?.count || 0;
    } catch (boardErr) {
      console.warn("⚠️ board 테이블 조회 실패 (posts 등 다른 이름인지 확인 필요):", boardErr.message);
      
    }

    return {
      totalUserCount: totalUsersResult[0]?.totalUserCount || 0,
      todayNewUserCount: todayNewUsersResult[0]?.todayNewUserCount || 0,
      todayBoardPostCount: 0, 
      pendingSlangCount: pendingSlangsResult[0]?.pendingSlangCount || 0
    };

  } catch (error) {
    console.error("❌ [DB 어드민 대시보드 조회 최종 에러]:", error.message);
    return {
      totalUserCount: totalUsersResult[0]?.totalUserCount || 0,
      todayNewUserCount: todayNewUsersResult[0]?.todayNewUserCount || 0,
      todayBoardPostCount: 0, 
      pendingSlangCount: pendingSlangsResult[0]?.pendingSlangCount || 0
    };
  }
};

// 신고 횟수가 1회 이상인 슬랭 목록 조회
export const getReportedSlangs = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT slang_id, word, report_reason, report_count FROM slangs WHERE report_count > 0 ORDER BY report_count DESC'
    );
    return rows;
  } catch (error) {
    console.error("❌ [DB 어드민 신고 슬랭 조회 에러]:", error.message);
    throw error;
  }
};

export const increaseReportCount = async (slangId) => {
  try {
    const [result] = await pool.execute(
      'UPDATE slangs SET report_count = report_count + 1 WHERE slang_id = ?',
      [slangId]
    );
    return result;
  } catch (error) {
    console.error("❌ [DB 어드민 신고 횟수 증가 에러]:", error.message);
    throw error;
  }
};

//슬랭의 신고 기록을 초기화
export const clearSlangReport = async (slangId) => {
  try {
    const query = `
      UPDATE slangs 
      SET report_count = 0, report_reason = NULL 
      WHERE slang_id = ?
    `;
    const [result] = await pool.execute(query, [slangId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("❌ [DB 신고 기록 초기화 에러]:", error.message);
    throw error;
  }
};