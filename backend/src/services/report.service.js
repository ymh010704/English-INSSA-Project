import * as AdminService from './admin.service.js'; 

const ReportService = {
  processSlangReport: async (slangId) => {
    try {
      await AdminService.increaseReportCount(slangId);
      return { success: true };
    } catch (err) {
      console.error("ReportService 에러 발생:", err);
      throw new Error(err.message); 
    }
  },

getReportedSlangsList: async () => {
    try {
      const rows = await AdminService.getReportedSlangs();
      return rows;
    } catch (err) {
      console.error("ReportService 조회 에러:", err);
      throw err;
    }
  }
};

export default ReportService;