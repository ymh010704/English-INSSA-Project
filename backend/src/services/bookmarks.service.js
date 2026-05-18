import { pool } from "../repositories/db.js";
import StudiesRepository from "../repositories/studies.repository.js";
import BookmarkRepository from "../repositories/bookmark.repository.js";

// 유저의 북마크 목록 가져오기
export const getUserBookmarks = async (userId) => {
  const query = `
    SELECT b.bookmark_id, s.slang_id, s.word, s.definition_ko, s.example_en, s.category 
    FROM bookmarks b
    JOIN slangs s ON b.slang_id = s.slang_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;
  const [rows] = await pool.execute(query, [userId]);
  return rows;
};

// 북마크 토글 로직 (추가/삭제 결정)
export const toggleBookmark = async (userId, slangId) => {
  // 1. 이미 북마크 했는지 확인
  const checkQuery = "SELECT * FROM bookmarks WHERE user_id = ? AND slang_id = ?";
  const [existing] = await pool.execute(checkQuery, [userId, slangId]);

  if (existing.length > 0) {
    // 2. 이미 있으면 삭제
    await pool.execute("DELETE FROM bookmarks WHERE user_id = ? AND slang_id = ?", [userId, slangId]);
    return { isBookmarked: false };
  } else {
    // 3. 없으면 추가(=등록)
    await pool.execute("INSERT INTO bookmarks (user_id, slang_id) VALUES (?, ?)", [userId, slangId]);
    return { isBookmarked: true };
  }
};

// 북마크 학습
export const generateBookmarkQuiz = async (userId, count = 5) => {
  console.log("🔖 [Service] generateBookmarkQuiz 시작...");

  const slangs = await BookmarkRepository.getBookmarkedSlangs(userId, count);

  console.log(`📊 [Service] 북마크에서 가져온 슬랭 수: ${slangs?.length}`);

  if (!slangs || slangs.length === 0) {
    console.warn("⚠️ [Service] 북마크 데이터가 없습니다.");
    return [];
  }

  const quizList = await Promise.all(
    slangs.map(async (slang, idx) => {
      try {
        const type = Math.random() > 0.5 ? "MULTIPLE" : "OX";

        console.log(
          `📝 [Service] 북마크 ${idx + 1}번 문제 생성 중... (단어: ${slang.word}, 타입: ${type})`
        );

        if (type === "MULTIPLE") {
          const distractors = await StudiesRepository.getRandomMeanings(
            slang.word,
            3
          );

          const answers = [
            { text: slang.definition_ko, isCorrect: true },
            ...distractors.map((d) => ({
              text: d,
              isCorrect: false,
            })),
          ].sort(() => Math.random() - 0.5);

          return {
            id: slang.slang_id || slang.id,
            type,
            word: slang.word,
            category: slang.category || "북마크",
            emoji: slang.emoji || "🔖",
            answers,
            isBookmarked: true,
          };
        }

        const isCorrect = Math.random() > 0.5;
        let displayMeaning = slang.definition_ko;

        if (!isCorrect) {
          const wrongMeanings = await StudiesRepository.getRandomMeanings(
            slang.word,
            1
          );

          displayMeaning = wrongMeanings[0] || "전혀 다른 의미";
        }

        return {
          id: slang.slang_id || slang.id,
          type,
          word: slang.word,
          category: slang.category || "북마크",
          emoji: slang.emoji || "🔖",
          exampleEn: slang.example_en,
          meaning: displayMeaning,
          isCorrect,
          isBookmarked: true,
        };
      } catch (err) {
        console.error(
          `❌ [Service] 북마크 ${idx + 1}번 문제 생성 중 개별 에러:`,
          err.message
        );
        throw err;
      }
    })
  );

  return quizList;
};