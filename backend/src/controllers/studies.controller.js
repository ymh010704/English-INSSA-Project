import StudiesService from '../services/studies.service.js';

const StudiesController = {
  getQuiz: async (req, res) => {
    console.log("[Controller] GET /api/studies/quiz 요청 도착! count:", req.query.count);
    
    try {
      const { count = 10 } = req.query;
      const userId = req.user.id || req.user.user_id;

      const quizData = await StudiesService.generateQuiz(userId, Number(count));
      
      console.log("✅ [Controller] 데이터 생성 성공! 문제 수:", quizData.length);
      
      res.status(200).json(quizData); 
      
    } catch (error) {
      console.error("❌ [Controller] 에러 발생!!!", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  logResult: async (req, res) => {
    try {
      const userId = req.user.id || req.user.user_id;
      const { slangId, isCorrect, status } = req.body;

      const result = await StudiesService.saveStudyLog(userId, slangId, isCorrect, status);
      res.status(201).json(result); 
    } catch (error) {
      console.error("❌ [Controller] 저장 에러:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default StudiesController;