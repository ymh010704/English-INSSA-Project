import ReportService from '../services/report.service.js'; 

const ReportController = {
  reportSlang: async (req, res) => {
    try {
      const { slangId } = req.body;

      if (!slangId) {
        return res.status(400).json({ success: false, message: "slangId가 누락되었습니다." });
      }
      await ReportService.processSlangReport(slangId);

      return res.status(200).json({ success: true, message: "신고 접수 완료" });
    } catch (err) {
  console.error("❌ [Admin Controller - 신고 처리 에러]:", err);
  return res.status(500).json({ 
    success: false, 
    message: "서버 내부 오류가 발생했습니다." 
  });
  }
},

getReportedSlangs: async (req, res) => {
    try {
     
      const data = await ReportService.getReportedSlangsList();
      return res.status(200).json({ success: true, reports: data });
    } catch (err) {
      console.error("신고 목록 조회 중 에러:", err);
      return res.status(500).json({ success: false, message: "서버 오류" });
    }
  }
};

export default ReportController;