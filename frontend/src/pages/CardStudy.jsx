import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";

// 퀴즈 컴포넌트들
import MultipleChoice from "../components/quiz/MultipleChoice";
import OXQuiz from "../components/quiz/OXQuiz";

/* ── 학습 완료 화면 ── */
function CompletionScreen({ known, total, onRestart }) {
  const navigate = useNavigate();
  const pct = total > 0 ? Math.round((known / total) * 100) : 0;
  return (
    <div style={{
      minHeight: "100vh", background: G.navy,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans KR', sans-serif", padding: 40, textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(255,77,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: 80, marginBottom: 24 }}>🏆</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>오늘의 퀴즈 완료!</div>
      <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 40, fontWeight: 900, color: G.white, lineHeight: 1.15, letterSpacing: -1, marginBottom: 10 }}>
        완전 <span style={{ color: G.accent }}>인싸</span> 됐어요!
      </h1>
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: 48, fontWeight: 300 }}>오늘 {total}문제 학습 완료 🎉</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "완료한 문제", value: `${total}개`, color: G.accent },
          { label: "맞혔어요", value: `${known}개`, color: G.green },
          { label: "정확도", value: `${pct}%`, color: G.accent2 },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "24px 32px", minWidth: 130 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Button onClick={onRestart}>🔁 다시 학습하기</Button>
        <Button variant="secondary" onClick={() => navigate("/dashboard")} style={{ color: G.white, border: "1.5px solid rgba(255,255,255,0.2)" }}>🏠 대시보드로</Button>
      </div>
    </div>
  );
}

/* ── 메인 퀴즈 학습 ── */
export default function CardStudy() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // 백엔드 API 호출 (민우가 만든 퀴즈 API)
      const response = await axios.get("/api/studies/quiz?count=5");
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

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

  const total = quizzes.length;
  const currentQuiz = quizzes[index];

  function handleNext(isCorrect) {
    if (isCorrect) setKnown(prev => prev + 1);
    setLeaving(isCorrect ? "right" : "left");

    setTimeout(() => {
      setLeaving(null);
      if (index + 1 >= total) setDone(true);
      else setIndex(i => i + 1);
    }, 500);
  }

  function restart() {
    setIndex(0); setKnown(0); setDone(false); setLeaving(null);
    fetchQuizzes();
  }

  if (done) return <CompletionScreen known={known} total={total} onRestart={restart} />;
  if (!currentQuiz) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>
      <PageHeader 
        title="오늘의 학습" 
        right={<span style={{ fontSize: 13, fontWeight: 700, color: G.gray }}>{index + 1} / {total}</span>} 
      />

      <div style={{ height: 5, background: "#e5e0d8" }}>
        <div style={{ height: "100%", width: `${((index + 1) / total) * 100}%`, background: G.accent, transition: "width 0.4s ease" }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ background: "rgba(255,77,0,0.1)", border: "1px solid rgba(255,77,0,0.2)", color: G.accent, fontSize: 11, fontWeight: 700, padding: "7px 18px", borderRadius: 100 }}>
            {currentQuiz.emoji} {currentQuiz.category}
          </div>
        </div>

        <div style={{
          width: "100%", maxWidth: 640,
          transform: leaving === "right" ? "translateX(130%) rotate(8deg)" : leaving === "left" ? "translateX(-130%) rotate(-8deg)" : "none",
          opacity: leaving ? 0 : 1,
          transition: leaving ? "transform 0.35s ease, opacity 0.3s ease" : "none",
        }}>
          {currentQuiz.type === "MULTIPLE" ? (
            <MultipleChoice data={currentQuiz} onNext={handleNext} />
          ) : (
            <OXQuiz data={currentQuiz} onNext={handleNext} />
          )}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 28 }}>
          {quizzes.map((_, i) => (
            <div key={i} style={{ width: i === index ? 28 : 8, height: 8, borderRadius: 4, background: i < index ? "rgba(255,77,0,0.35)" : i === index ? G.accent : "#d6d0c8", transition: "all 0.3s ease" }} />
          ))}
        </div>
      </div>
    </div>
  );
}