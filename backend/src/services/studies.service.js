// DB에서 가져온 데이터 가공해서 객관식이나 OX 같은거 랜덤하게 부여하는 로직
// 객관식일 경우엔 오답(다른 슬랭 데이터에서 랜덤으로 뽑아와서 오답용 문제로 넣기) 부여
import StudiesRepository from '../repositories/studies.repository.js';

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

          return { type, word: slang.word, answers };
        } else {
          const isCorrect = Math.random() > 0.5;
          let displayMeaning = slang.definition_ko;
          if (!isCorrect) {
            const wrongMeanings = await StudiesRepository.getRandomMeanings(slang.word, 1);
            displayMeaning = wrongMeanings[0];
          }
          return { type, word: slang.word, category: slang.category || "Gen-Z 슬랭", emoji: slang.emoji || "💬", exampleEn: slang.example_en, meaning: displayMeaning, isCorrect };
        }
      } catch (err) {
        console.error(`❌ [Service] ${idx+1}번 문제 생성 중 개별 에러:`, err.message);
        throw err;
      }
    }));

    return quizList;
  }
};

export default StudiesService;