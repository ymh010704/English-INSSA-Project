import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 퀴즈에 사용할 컴포넌트들 임포트
import MultipleChoice from "../components/quiz/MultipleChoice";
import OXQuiz from "../components/quiz/OXQuiz";

const G = {
  black: "#0a0a0a", white: "#ffffff",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981",
};

/* ── 공부 완료 화면  ── */
function CompletionScreen({ known, total, onRestart }) {
  const navigate = useNavigate();
  const pct = Math.round((known / total) * 100);
  return (
    <div style={{
      minHeight: "100vh", background: G.navy,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans KR', sans-serif", padding: 40, textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(255,77,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: 80, marginBottom: 24 }}>🏆</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>오늘의 학습 완료!</div>
      <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 40, fontWeight: 900, color: G.white, lineHeight: 1.15, letterSpacing: -1, marginBottom: 10 }}>
        완전 <span style={{ color: G.accent }}>인싸</span> 됐어요!
      </h1>
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: 48, fontWeight: 300 }}>오늘 {total}문제 학습 완료 🎉</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "완료한 문제", value: `${total}개`, color: G.accent },
          { label: "맞혔어요", value: `${known}개`, color: G.green }, // '알겠어요' -> '맞혔어요'로 변경
          { label: "정확도", value: `${pct}%`, color: G.accent2 },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "24px 32px", minWidth: 130 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={onRestart} style={{ padding: "14px 32px", borderRadius: 100, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 8px 24px rgba(255,77,0,0.3)" }}>🔁 다시 학습하기</button>
        <button onClick={() => navigate("/dashboard")} style={{ padding: "14px 32px", borderRadius: 100, border: "1.5px solid rgba(255,255,255,0.2)", background: "transparent", color: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>🏠 대시보드로</button>
      </div>
    </div>
  );
}

/* ── 메인 퀴즈 학습 (컴포넌트들 불러와서 랜덤값 입힐 예정) ── */
export default function CardStudy() {
  const navigate = useNavigate();
  
  // 1. 모든 상태(State) 선언
  const [quizzes, setQuizzes] = useState([]); // 데이터를 담을 공간
  const [loading, setLoading] = useState(true); // 로딩 중인지 확인
  const [index, setIndex] = useState(0);
  const [userSelections, setUserSelections] = useState([]);
  const [known, setKnown] = useState(0); // 맞힌 개수 기록
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(null);

  // ── API 데이터 호출 로직 ──
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // 백엔드 API 호출 (5개만 가져오도록 설정)
      const response = await axios.get("/api/studies/quiz?count=5");
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      alert("서버에서 퀴즈를 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // ── 데이터가 로딩 중일 때 보여줄 화면 ──
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0ede6" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
          <p style={{ fontWeight: 700, color: G.accent }}>인싸 문제 가져오는 중...</p>
        </div>
      </div>
    );
  }

  // 퀴즈 로드 후 변수 설정
  const total = quizzes.length;
  const currentQuiz = quizzes[index];

  // 2. 모든 로직 함수(Functions) 선언
  function handleNext(isCorrect, selection) {
    if (isCorrect) setKnown(prev => prev + 1);

    // 기록 저장
    const newSelections = [...userSelections];
    newSelections[index] = selection; 
    setUserSelections(newSelections);

    // 애니메이션 효과
    setLeaving(isCorrect ? "right" : "left");

    setTimeout(() => {
      setLeaving(null);
      if (index + 1 >= total) setDone(true);
      else setIndex(i => i + 1);
    }, 500);
  }

  function handlePrev() {
    if (index > 0) setIndex(i => i - 1);
  }

  function restart() {
    setIndex(0);
    setUserSelections([]);
    setKnown(0);
    setDone(false);
    setLeaving(null);
    fetchQuizzes(); // 새로운 랜덤 퀴즈 받아오기
  }

  // 3. 조건부 렌더링 (결과 화면) - 메인 return 보다 위에 있어야 함
  if (done) {
    return <CompletionScreen known={known} total={total} onRestart={restart} />;
  }
  if (!currentQuiz) return null; // 방어 코드

  // 4. 메인 UI 렌더링
  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* 상단 헤더 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: G.gray }}>
          ← 그만하기
        </button>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black }}>
          인싸 <span style={{ color: G.accent }}>학습 퀴즈</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: G.gray }}>{index + 1} / {total}</div>
      </div>

      {/* 진행 바 */}
      <div style={{ height: 5, background: "#e5e0d8" }}>
        <div style={{ height: "100%", width: `${((index + 1) / total) * 100}%`, background: G.accent, transition: "width 0.4s ease" }} />
      </div>

      {/* 퀴즈 컨테이너 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        
        {/* 뱃지 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ background: "rgba(255,77,0,0.1)", border: "1px solid rgba(255,77,0,0.2)", color: G.accent, fontSize: 11, fontWeight: 700, padding: "7px 18px", borderRadius: 100 }}>
            {currentQuiz.emoji} {currentQuiz.category}
          </div>
        </div>

        {/* 퀴즈 컴포넌트 영역 */}
        <div style={{
          width: "100%", maxWidth: 640,
          transform: leaving === "right" ? "translateX(130%) rotate(8deg)" : leaving === "left" ? "translateX(-130%) rotate(-8deg)" : "none",
          opacity: leaving ? 0 : 1,
          transition: leaving ? "transform 0.35s ease, opacity 0.3s ease" : "none",
        }}>
          {currentQuiz.type === "MULTIPLE" ? (
            <MultipleChoice 
              data={currentQuiz} 
              onNext={handleNext} 
              savedSelection={userSelections[index]} 
            />
          ) : (
            <OXQuiz 
              data={currentQuiz} 
              onNext={handleNext} 
              savedSelection={userSelections[index]} 
            />
          )}
        </div>

        {/* 하단 네비게이션 버튼 (이전 문제 / 처음부터 다시) */}
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 640, marginTop: 32 }}>
          <button 
            onClick={handlePrev} 
            disabled={index === 0}
            style={{
              flex: 1, padding: "16px", borderRadius: 16, border: "2px solid #e5dfd5",
              background: index === 0 ? "#eee" : G.white,
              color: index === 0 ? "#aaa" : G.gray,
              cursor: index === 0 ? "default" : "pointer", fontWeight: 700
            }}
          >
            ← 이전 문제
          </button>
          <button 
            onClick={restart}
            style={{
              flex: 1, padding: "16px", borderRadius: 16, border: `2px solid #c9c9c9`,
              background: "#aaa", color: G.gray, cursor: "pointer", fontWeight: 700
            }}
          >
            🔁 처음부터 다시 풀어보기
          </button>
        </div>

        {/* 진행 도트 */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 28 }}>
          {quizzes.map((_, i) => (
            <div key={i} style={{ width: i === index ? 28 : 8, height: 8, borderRadius: 4, background: i < index ? "rgba(255,77,0,0.35)" : i === index ? G.accent : "#d6d0c8", transition: "all 0.3s ease" }} />
          ))}
        </div>
      </div>
    </div>
  );
}