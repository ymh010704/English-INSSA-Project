import { pool } from '../repositories/db.js';

class PracticeService {
  async generateQuiz() {
    // 1. 문제로 사용할 메인 슬랭 5개 가져오기
    const [slangs] = await pool.query(`
      SELECT slang_id, word, definition_ko, example_en, emoji 
      FROM slangs 
      ORDER BY RAND() 
      LIMIT 5
    `);

    // 2. 각 문제마다 동적으로 보기(Options) 생성
    const quizPromises = slangs.map(async (s, index) => {
      const types = ["fill", "choice", "input"];
      const type = types[index % types.length];

      const baseQuiz = {
        id: s.slang_id,
        type: type,
        answer: s.word,
        meaning: s.definition_ko,
        explanation: `${s.emoji} ${s.definition_ko}`,
      };

      // --- [추가] 오답 보기 가져오기 로직 ---
      // Choice(뜻 고르기)라면 다른 단어의 '뜻'을, Fill(빈칸)이라면 다른 '단어' 자체를 가져옴
      let options = [];
      if (type === "fill" || type === "choice") {
        const [wrongItems] = await pool.query(
          `SELECT word, definition_ko FROM slangs WHERE word != ? ORDER BY RAND() LIMIT 3`,
          [s.word]
        );
        
        if (type === "fill") {
          // 빈칸 채우기는 '단어'들이 보기로 나와야 함
          options = this._shuffle([s.word, ...wrongItems.map(item => item.word)]);
        } else {
          // 객관식(뜻 고르기)은 '뜻'들이 보기로 나와야 함
          // 이 경우 answer를 s.definition_ko로 바꿔줘야 프론트에서 매칭됨
          baseQuiz.answer = s.definition_ko; 
          options = this._shuffle([s.definition_ko, ...wrongItems.map(item => item.definition_ko)]);
        }
      }

      if (type === "fill") {
        return {
          ...baseQuiz,
          question: "예문에 가장 적절한 단어를 고르세요",
          sentence: s.example_en ? s.example_en.replace(new RegExp(s.word, 'gi'), "____").split(/(____)/) : [],
          options
        };
      } 
      
      if (type === "choice") {
        return {
          ...baseQuiz,
          question: `'${s.word}'의 올바른 뜻은 무엇일까요?`,
          word: s.word,
          options
        };
      }

      if (type === "input") {
        return {
          ...baseQuiz,
          question: "다음 뜻을 가진 영어 표현을 입력하세요",
          hint: `${s.word.charAt(0)}${"_ ".repeat(s.word.length - 1).trim()}`
        };
      }
      
      return baseQuiz;
    });

    // 모든 비동기 쿼리가 끝날 때까지 기다림
    return Promise.all(quizPromises);
  }

  _shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }
}

export default new PracticeService();