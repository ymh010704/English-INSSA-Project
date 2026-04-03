// 프론트 요청 받아서 서비스 호출하고 응답하는 controller
import StudiesService from '../services/studies.service.js';

const StudiesController = {
  getQuiz: async (req, res) => {
    // 🚩 1번 로그: 요청 도착 확인
    console.log("🚀 [Controller] GET /api/studies/quiz 요청 도착! count:", req.query.count);
    
    try {
      const { count = 10 } = req.query;
      const quizData = await StudiesService.generateQuiz(Number(count));
      
      // 🚩 2번 로그: 서비스 로직 성공 확인
      console.log("✅ [Controller] 데이터 생성 성공! 문제 수:", quizData.length);
      
      res.status(200).json({ success: true, data: quizData });
    } catch (error) {
      // 🚩 3번 로그: 여기서 에러가 나면 무조건 터미널에 찍힘
      console.error("❌ [Controller] 에러 발생!!!");
      console.error(error); // 에러 객체 전체 출력
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default StudiesController;