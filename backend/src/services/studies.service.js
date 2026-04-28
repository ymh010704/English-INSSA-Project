// DB에서 가져온 데이터 가공해서 객관식이나 OX 같은거 랜덤하게 부여하는 로직
// 객관식일 경우엔 오답(다른 슬랭 데이터에서 랜덤으로 뽑아와서 오답용 문제로 넣기) 부여
import StudiesRepository from '../repositories/studies.repository.js';
import { pool } from '../repositories/db.js';

/*
// 나중에 4가지 타입이 될 경우 아래 형태로 바꿀 예정
const rand = Math.random();
let type;

if (rand < 0.25) type = 'MULTIPLE';   // 현재는 이거랑
else if (rand < 0.5) type = 'OX';     // 이거만 추가됨
else if (rand < 0.75) type = 'SUBJECTIVE'; // 주관식
else type = 'DRAG_AND_DROP';               // 드래그 앤 드롭(<- 이건 단어 끌어댕겨서 문장 만들기)


*/

const StudiesService = {
  generateQuiz: async (userId, count) => {
    console.log("🏃 [Service] generateQuiz 시작...");
    
    // 1. DB에서 데이터 가져오기
    const slangs = await StudiesRepository.getRandomSlangs(count);
    console.log(`📊 [Service] DB에서 가져온 슬랭 수: ${slangs?.length}`);

    if (!slangs || slangs.length === 0) {
      console.warn("⚠️ [Service] DB에 데이터가 없습니다!");
      return [];
    }

    const quizList = await Promise.all(slangs.map(async (slang, idx) => {
      // 🚩 현재 유저가 이 단어를 북마크했는지 체크하는 로직 추가
      const [bookmark] = await pool.execute(
        "SELECT 1 FROM bookmarks WHERE user_id = ? AND slang_id = ?",
        [userId, slang.slang_id || slang.id]
      );
    
    const isBookmarked = bookmark.length > 0;

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
            answers,
            isBookmarked 
          };
        } else { // 여기가 OX퀴즈 관련
          const isCorrect = Math.random() > 0.5;
          let displayMeaning = slang.definition_ko;
          if (!isCorrect) {
            const wrongMeanings = await StudiesRepository.getRandomMeanings(slang.word, 1);
            displayMeaning = wrongMeanings[0];
          }
          return { 
            id: slang.slang_id || slang.id, 
            type, 
            word: slang.word, 
            category: slang.category || "Gen-Z 슬랭", 
            emoji: slang.emoji || "💬", 
            exampleEn: slang.example_en, 
            meaning: displayMeaning, 
            isCorrect,
            isBookmarked 
          };
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
      // 1. DB에 로그 저장 (isCorrect는 1 또는 0으로 변환) // 문제 풀 때마다 insert 되는 형식임
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

      // 2. XP 업데이트 (정답일 경우 +10) // 일단 임시로 +10으로 지정했음 (추후에 이야기 ㄱㄱ)
      if (isCorrect) {
        // ON DUPLICATE KEY UPDATE를 쓰면 데이터가 없을 땐 INSERT, 있을 땐 UPDATE를 한 번에 처리해줌 (기존에 이거 안 해서 xp랑 스트릭이 반영 안됐음.. // 테이블이 없는데 업데이트만 해서ㅎ)
        const xpQuery = `
          INSERT INTO user_stats (user_id, total_xp, current_streak)
          VALUES (?, 10, 0)
          ON DUPLICATE KEY UPDATE total_xp = total_xp + 10
        `;

        try {
          await pool.execute(xpQuery, [userId]);
          console.log(`✨ 유저 ${userId}: XP 10점 획득!`); // 이건 쿼리 잘 들어갔나 확인용이라 나중에 지울 것(로그 넘 ㅜ많이 남음)
        } catch (err) {
          console.error("❌ XP 업데이트 중 에러:", err.message);
        } 
      }

      // 3. 스트릭 업데이트 (오늘 첫 학습일 경우 +1)
      // 오늘 해당 유저가 남긴 로그가 방금 넣은 1개뿐인지 확인
      const checkStreakQuery = `
        SELECT COUNT(*) as todayLogs FROM study_logs 
        WHERE user_id = ? AND DATE(created_at) = CURDATE()
      `;
      const [rows] = await pool.execute(checkStreakQuery, [userId]);

      if (rows[0].todayLogs === 1) {
        const streakQuery = `
          INSERT INTO user_stats (user_id, current_streak, total_xp)
          VALUES (?, 1, 0)
          ON DUPLICATE KEY UPDATE current_streak = current_streak + 1
        `;

        await pool.execute(streakQuery, [userId]);
        console.log(`🔥 유저 ${userId}: 스트릭 1일 상승!`);
      }
      
      
      console.log("✅ [Service] DB 저장 성공!");
      return result;
    } catch (err) {
      console.error("❌ [Service] DB 저장 중 에러 발생:", err.message);
      throw err;
    }
  }
};

export default StudiesService;