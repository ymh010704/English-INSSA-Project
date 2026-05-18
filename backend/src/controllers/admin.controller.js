import * as AdminService from '../services/admin.service.js';
import { pool } from "../repositories/db.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    // slangs 테이블에서 전체 슬랭 개수 가져오기
    const [slangRows] = await pool.execute('SELECT COUNT(*) as total FROM slangs');
    const totalSlangs = slangRows[0].total;
    const [userRows] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const totalUsers = userRows[0].total;

    return res.status(200).json({
      success: true,
      data: {
        totalSlangs: totalSlangs.toString(),
        activeUsers: totalUsers.toString(), 
        pendingReviews: "17",
        reports: "6"
      }
    });
  } catch (error) {
    console.error("🚨 관리자 대시보드 통계 조회 실패:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 유저 목록 조회
export const getUsers = async (req, res) => {
  try {
    const users = await AdminService.getUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('유저 조회 에러:', err);
    res.status(500).json({ success: false, message: '유저 조회 실패' });
  }
};

// 유저 삭제
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await AdminService.deleteUser(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '유저 없음' });
    }

    res.json({ success: true, message: '유저 삭제 완료' });
  } catch (err) {
    console.error('삭제 에러:', err);
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
};

// 슬랭 목록 조회
export const getSlangs = async (req, res) => {
  try {
    const data = await AdminService.getSlangs();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: '조회 실패' });
  }
};

// 슬랭 등록
export const createSlang = async (req, res) => {
  try {
    const result = await AdminService.createSlang(req.body);

    res.status(201).json({
      success: true,
      slangId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '등록 실패' });
  }
};

// 슬랭 삭제
export const deleteSlang = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await AdminService.deleteSlang(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '슬랭 없음' });
    }

    res.json({ success: true });
  } catch (err) {
  console.error(' 슬랭 삭제 진짜 에러 원인:', err); 
  res.status(500).json({ success: false, message: '삭제 실패' });
}
};

// 대시보드 통계 데이터 조회 + 신고 슬랭 목록 조회
export const getDashboardData = async (req, res) => {
  try {
    const stats = await AdminService.getDashboardStats();
    const reportedSlangs = await AdminService.getReportedSlangs();
    
    res.json({ 
      success: true, 
      data: {
        stats: stats,
        reports: reportedSlangs
      }
    });
  } catch (err) {
    console.error('대시보드 통계 조회 에러:', err);
    res.status(500).json({ 
      success: false, 
      message: '대시보드 조회 실패' 
    });
  }
};

// 신고 기록 삭제
export const deleteReportLog = async (req, res) => {
  try {
    const { slangId } = req.params;
    
    
    const isSuccess = await AdminService.clearSlangReport(slangId);
    
    if (isSuccess) {
      return res.status(200).json({ success: true, message: "신고 기록이 초기화되었습니다." });
    } else {
      return res.status(404).json({ success: false, message: "존재하지 않는 슬랭입니다." });
    }
  } catch (err) {
    console.error("신고 기록 삭제 컨트롤러 에러:", err);
    return res.status(500).json({ success: false, message: "서버 처리 실패" });
  }
};

export const createReportLog = async (req, res) => {
  try {
    const { slangId } = req.body; 
    await AdminService.increaseReportCount(slangId);
    
    return res.status(200).json({ 
      success: true, 
      message: "관리자 시스템에 신고 접수 완료!" 
    });
  } catch (err) {
    console.error("🚨 관리자 신고 접수 중 에러:", err);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
};

export const getReports = async (req, res) => {
  try {
    const query = `
      SELECT 
        slang_id,
        word,
        report_reason,
        report_count
      FROM slangs
      WHERE report_count > 0
      ORDER BY created_at DESC
    `;
    
    const [rows] = await pool.execute(query);

    const realReports = rows.map((row) => ({
      id: row.slang_id, 
      slangId: row.slang_id,
      slang_id: row.slang_id,
      word: row.word || "이름 없는 슬랭",
      reason: row.report_reason || "사유 미지정",
      reportCount: row.report_count || 0,
      report_count: row.report_count || 0,
      count: row.report_count || 0,

      severity: "높음",
      reporter: "user_204",
      confidence: "72점"
    }));

    return res.status(200).json({
      success: true,
      data: realReports
    });
  } catch (err) {
    console.error("🚨 관리자 실시간 신고 목록 조회 실패:", err);
    return res.status(500).json({ success: false, message: "서버 처리 실패" });
  }
};

export const updateSlang = async (req, res) => {
  try {
    const { id } = req.params; 
    const { word, definition_ko, example_ko } = req.body; 
    
    await AdminService.updateSlang(id, { word, definition_ko, example_ko });

    res.json({ success: true, message: '수정 성공' });
  } catch (err) {
    console.error("❌ 백엔드 컨트롤러 수정 에러:", err.message);
    res.status(500).json({ success: false, message: '수정 실패' });
  }
};