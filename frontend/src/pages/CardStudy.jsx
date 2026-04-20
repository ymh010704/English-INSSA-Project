import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";

// 퀴즈 컴포넌트들
import MultipleChoice from "../components/quiz/MultipleChoice";
import OXQuiz from "../components/quiz/OXQuiz";

function CompletionScreen({ known, total, onRestart }) {
  const navigate = useNavigate();
  const pct = total > 0 ? Math.round((known / total) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1c20", 
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans KR', sans-serif", padding: 40, textAlign: "center",
    }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🏆</div>
      <h1 style={{ fontSize: 40, fontWeight: 900, color: "#fff", marginBottom: 10 }}>
        완전 <span style={{ color: "#FF4D00" }}>인싸</span> 됐어요!
      </h1>
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: 48 }}>
        오늘 {total}문제 학습 완료 🎉
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 32px" }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#FF4D00" }}>{pct}%</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>정확도</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Button onClick={onRestart}>🔁 다시 학습하기</Button>
        <Button 
          onClick={() => navigate("/dashboard")} 
          style={{ background: "transparent", border: "1px solid #fff", color: "#fff" }}
        >
          🏠 대시보드로
        </Button>
      </div>
    </div>
  );
}

export default function CardStudy() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(null);

  // 1. 퀴즈 가져오기 함수
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/studies/quiz?count=5', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("🎁 백엔드 데이터 확인:", res.data);

      if (Array.isArray(res.data)) {
        setQuizzes(res.data);
      } else if (res.data && res.data.data) {
        setQuizzes(res.data.data);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 컴포넌트 마운트 시 실행
  useEffect(() => {
    fetchQuizzes();
  }, []); 

  // 3. 학습 기록 저장 함수
  const saveProgress = async (slangId, isCorrect) => {
  try {
    const token = localStorage.getItem('token');
    console.log("💾 저장 시도중인 ID:", slangId); 

    await axios.post('/api/studies/log', {
      slangId: slangId, 
      isCorrect: isCorrect,
      status: isCorrect ? 'mastered' : 'learning'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    console.error("❌ 기록 저장 실패:", err.message);
  }
};

  // 4. 다음 문제로 넘어가기
  function handleNext(isCorrect) {
    const currentQuiz = quizzes[index];
    const slangId = currentQuiz.id || currentQuiz.slang_id;
    
    if (slangId) {
      saveProgress(slangId, isCorrect);
    }

    if (isCorrect) setKnown(prev => prev + 1);
    setLeaving(isCorrect ? "right" : "left");

    setTimeout(() => {
      setLeaving(null);
      // quizzes.length(total)를 바로 사용
      if (index + 1 >= quizzes.length) {
        setDone(true);
      } else {
        setIndex(i => i + 1);
      }
    }, 500);
  }

  function restart() {
    setIndex(0); setKnown(0); setDone(false); setLeaving(null);
    fetchQuizzes();
  }

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

  if (done) return <CompletionScreen known={known} total={total} onRestart={restart} />;
  if (!currentQuiz) return <div style={{textAlign:'center', padding:50}}>문제가 없습니다.</div>;

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
            {currentQuiz.emoji || "💬"} {currentQuiz.category || "Gen-Z 슬랭"}
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