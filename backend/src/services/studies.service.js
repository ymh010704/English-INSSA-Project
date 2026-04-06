// DB에서 가져온 데이터 가공해서 객관식이나 OX 같은거 랜덤하게 부여하는 로직
// 객관식일 경우엔 오답(다른 슬랭 데이터에서 랜덤으로 뽑아와서 오답용 문제로 넣기) 부여
import StudiesRepository from '../repositories/studies.repository.js';
import { pool } from '../repositories/db.js';

const StudiesService = {
  generateQuiz: async (count) => {
    console.log("🏃 [Service] generateQuiz 시작...");
    
    // 1. DB에서 데이터 가져오기
    const slangs = await StudiesRepository.getRandomSlangs(count);
    console.log(`📊 [Service] DB에서 가져온 슬랭 수: ${slangs?.length}`);

    if (!slangs || slangs.length === 0) {
      console.warn("⚠️ [Service] DB에 데이터가 없습니다!");
      return [];
    }

    const quizList = await Promise.all(slangs.map(async (slang, idx) => {
      try {
        const type = Math.random() > 0.5 ? 'MULTIPLE' : 'OX';
        console.log(`📝 [Service] ${idx+1}번 문제 생성 중... (단어: ${slang.word}, 타입: ${type})`);

        if (type === 'MULTIPLE') {
          const distractors = await StudiesRepository.getRandomMeanings(slang.word, 3);
          const answers = [
            { text: slang.definition_ko, isCorrect: true },
            ...distractors.map(d => ({ text: d, isCorrect: false }))
          ].sort(() => Math.random() - 0.5);

          return { 
            id: slang.slang_id || slang.id,
            type,
            word: slang.word, 
            answers 
          };
        } else {
          const isCorrect = Math.random() > 0.5;
          let displayMeaning = slang.definition_ko;
          if (!isCorrect) {
            const wrongMeanings = await StudiesRepository.getRandomMeanings(slang.word, 1);
            displayMeaning = wrongMeanings[0];
          }
          return { id: slang.slang_id || slang.id, type, word: slang.word, category: slang.category || "Gen-Z 슬랭", emoji: slang.emoji || "💬", exampleEn: slang.example_en, meaning: displayMeaning, isCorrect };
        }
      } catch (err) {
        console.error(`❌ [Service] ${idx+1}번 문제 생성 중 개별 에러:`, err.message);
        throw err;
      }
    }));

    return quizList;
  },


  // 학습 결과 저장 로직
  // 컨트롤러한테 전달받은 데이터 가공해서 DB에 insert 명령 내림 // ex. 서류 내용을 실제로 저장하는 담당부서역할
  saveStudyLog: async (userId, slangId, isCorrect, status) => {
    console.log(`🏃 [Service] saveStudyLog 시작... (유저: ${userId}, 슬랭: ${slangId}, 정답여부: ${isCorrect})`);
    
    try {
      // 1. DB에 로그 저장 (isCorrect는 1 또는 0으로 변환)
      const query = `
        INSERT INTO study_logs (user_id, slang_id, is_correct, status, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      const [result] = await pool.execute(query, [
        userId, 
        slangId, 
        isCorrect ? 1 : 0, 
        status || 'learning'
      ]);

      // 2. (선택사항) 학습 결과에 따라 유저의 XP나 스트릭을 업데이트하는 로직을 나중에 여기 추가할 수 있습니다.
      
      console.log("✅ [Service] DB 저장 성공!");
      return result;
    } catch (err) {
      console.error("❌ [Service] DB 저장 중 에러 발생:", err.message);
      throw err;
    }
  }
};

export default StudiesService;