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

    // 2. 결과 배열 구조를 명확히 처리
    const [res1, res2, res3, res4, res5, res6] = await Promise.all([
    pool.execute(q1, [userId]), // 하루 학습량 쿼리
    pool.execute(q2, [userId]), // 오늘 맞춘 문제 쿼리
    pool.execute(q3, [userId]), // ai랑 대화 횟수 쿼리
    pool.execute(q4, [userId]), // 대쉬보드 우측 상단에 뜨는 2개 (연속 접속일, xp) 쿼리
    pool.execute(q5, [userId]),  // 정확도 쿼리
    pool.execute(q6, [userId])
    ]);

    // 컨트롤러가 바로 쓰도록 추출 로직으로 변경함
    return {
        todayCount: res1[0][0]?.todayCount || 0,
        masteredCount: res2[0][0]?.masteredCount || 0,
        aiCount: res3[0][0]?.aiCount || 0,
        streak: res4[0][0]?.current_streak || 0,
        xp: res4[0][0]?.total_xp || 0,
        accuracy: res5[0][0]?.accuracy || 0,
        activityLog: res6[0] || []
  };
};

