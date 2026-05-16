import { pool } from '../repositories/db.js';

export const getUserStats = async (userId) => {
    // 사용할 쿼리들 
    const q1 = `SELECT COUNT(*) as todayCount FROM study_logs WHERE user_id = ? AND DATE(created_at) = CURDATE()`;
    const q2 = `SELECT COUNT(*) as masteredCount FROM study_logs WHERE user_id = ? AND status = 'mastered'`;
    const q3 = `SELECT COUNT(*) as aiCount FROM ai_chat_logs WHERE user_id = ? AND DATE(created_at) = CURDATE()`;
    const q4 = `SELECT current_streak, total_xp FROM user_stats WHERE user_id = ?`;
    const q5 = `
    SELECT IFNULL(ROUND(AVG(is_correct) * 100), 0) as accuracy 
    FROM study_logs 
    WHERE user_id = ? AND created_at >= CURDATE()
    `;
    // AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)로 바꾸면 현재부터 24시간 전 (즉, 오후 2시에 웹을 켜면 전날 오후 2시 이후부터 현재까지 적중률 나타냄)
    const q6 = `
        SELECT 
            DATE_FORMAT(created_at, '%m-%d') as date, 
            COUNT(*) as count 
        FROM study_logs 
        WHERE user_id = ? 
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY date  -- 별칭(date)을 그대로 사용하거나 DATE_FORMAT(...) 전체를 적어줍니다.
        ORDER BY date ASC
    `; // 대시보드 중간에 있는 일주일치 학습량
    const q7 = `
        SELECT 
            s.category, 
            COUNT(s.slang_id) as total, 
            SUM(CASE WHEN l.status = 'mastered' THEN 1 ELSE 0 END) as mastered
        FROM slangs s
        LEFT JOIN study_logs l ON s.slang_id = l.slang_id AND l.user_id = ?
        GROUP BY s.category
    `; // 진도 관리 -> 카테고리별 숙련도 통계
    const q8 = `
        SELECT DISTINCT DATE_FORMAT(created_at, '%e') as day 
        FROM study_logs 
        WHERE user_id = ? 
          AND MONTH(created_at) = MONTH(CURDATE()) 
          AND YEAR(created_at) = YEAR(CURDATE())
    `; // 진도 관리 -> 월간 캘린더 (이번 달 공부한 날짜들)

    // 2. 결과 배열 구조를 명확히 처리
    const [res1, res2, res3, res4, res5, res6] = await Promise.all([
    pool.execute(q1, [userId]), // 하루 학습량 쿼리
    pool.execute(q2, [userId]), // 오늘 맞춘 문제 쿼리
    pool.execute(q3, [userId]), // ai랑 대화 횟수 쿼리
    pool.execute(q4, [userId]), // 대쉬보드 우측 상단에 뜨는 2개 (연속 접속일, xp) 쿼리
    pool.execute(q5, [userId]),  // 정확도 쿼리
    pool.execute(q6, [userId]), // 일주일치 학습량
    pool.execute(q7, [userId]), // 카테고리 숙련도
    pool.execute(q8, [userId]) // 월간 캘린더

    ]);

    // 컨트롤러가 바로 쓰도록 추출 로직으로 변경함
    return {
        todayCount: res1[0][0]?.todayCount || 0,
        masteredCount: res2[0][0]?.masteredCount || 0,
        aiCount: res3[0][0]?.aiCount || 0,
        streak: res4[0][0]?.current_streak || 0,
        xp: res4[0][0]?.total_xp || 0,
        accuracy: res5[0][0]?.accuracy || 0,
        activityLog: res6[0] || [],
        categories: resCat[0], // [{category: 'SNS', total: 20, mastered: 15}, ...]
        calendarDays: resCal[0].map(r => Number(r.day))
  };
};

