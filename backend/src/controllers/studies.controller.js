// 프론트 요청 받아서 서비스 호출하고 응답하는 controller
import StudiesService from '../services/studies.service.js';

const StudiesController = {
  // getQuiz = 문제 가져오는 역할
  getQuiz: async (req, res) => {
    // 🚩 1번 로그: 요청 도착 확인
    console.log("🚀 [Controller] GET /api/studies/quiz 요청 도착! count:", req.query.count);
    
    try {
      const { count = 10 } = req.query;
      const userId = req.user.id || req.user.user_id;

      const quizData = await StudiesService.generateQuiz(userId, Number(count));
      
      // 🚩 2번 로그: 서비스 로직 성공 확인
      console.log("✅ [Controller] 데이터 생성 성공! 문제 수:", quizData.length);
      
      res.status(200).json({ success: true, data: quizData });
    } catch (error) {
      // 🚩 3번 로그: 여기서 에러가 나면 무조건 터미널에 찍힘
      console.error("❌ [Controller] 에러 발생!!!");
      console.error(error); // 에러 객체 전체 출력
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 학습 결과 저장 로직
  // 프론트 요청을 받고, 유저가 누구인지 확인 <<해서 service에 전달함 //ex. 손님 요청 서류 확인해 담당 부서에 넣음 <<
  logResult: async (req, res) => {
    console.log("📝 [Controller] 학습 결과 저장 요청:", req.body);
    
    try {
      const userId = req.user.id; // 미들웨어(authenticateJWT)에서 가져온 ID
      const { slangId, isCorrect, status } = req.body;

      // Service에 데이터 저장을 요청합니다.
      const result = await StudiesService.saveStudyLog(userId, slangId, isCorrect, status);
      
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error("❌ [Controller] 저장 에러:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default StudiesController;