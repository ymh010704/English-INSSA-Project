import PracticeService from '../services/practice.service.js';

class PracticeController {
  async getQuestions(req, res) {
    try {
      // 서비스 통해서 가져오고 json 형태로 내보내기
      const questions = await PracticeService.generateQuiz();
      res.status(200).json(questions);
    } catch (error) {
      console.error('Practice Controller Error:', error);
      res.status(500).json({ message: '퀴즈 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
  }
}

export default new PracticeController();