import { pool } from '../repositories/db.js';

class PracticeService {
  async generateQuiz() {
    // 1. DB에서 랜덤 슬랭 5개 추출 (컬럼명에 맞춰 쿼리)
    const [slangs] = await pool.query(`
      SELECT slang_id, word, definition_ko, example_en, emoji 
      FROM slangs 
      ORDER BY RAND() 
      LIMIT 5
    `);

    // 2. 데이터 가공
    return slangs.map((s, index) => {
      const types = ["fill", "choice", "input"];
      const type = types[index % types.length];

      const baseQuiz = {
        id: s.slang_id, // slang_id 사용
        type: type,
        answer: s.word,
        meaning: s.definition_ko, // definition_ko 매핑
        explanation: `${s.emoji} ${s.definition_ko}`, // 에모지 활용
      };

      if (type === "fill") {
        return {
          ...baseQuiz,
          question: "예문에서 알맞은 표현을 고르세요",
          // example_en에서 정답 단어를 찾아 빈칸으로 치환
          sentence: s.example_en ? s.example_en.replace(new RegExp(s.word, 'gi'), "____").split(/(____)/) : [],
          options: this._shuffle([s.word, "vibe", "slay", "cap"]) 
        };
      } 
      
      if (type === "choice") {
        return {
          ...baseQuiz,
          question: "다음 뜻에 알맞은 단어는?",
          word: s.word,
          options: this._shuffle([s.definition_ko, "ghosted", "lowkey", "sus"])
        };
      }

      if (type === "input") {
        return {
          ...baseQuiz,
          question: "뜻을 보고 영어 표현을 입력하세요",
          // 첫 글자만 보여주고 나머지는 언더바로 표시하는 힌트
          hint: `${s.word.charAt(0)}${"_ ".repeat(s.word.length - 1).trim()}`
        };
      }
      
      return baseQuiz;
    });
  }

  _shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }
}

export default new PracticeService();