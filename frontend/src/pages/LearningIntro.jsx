import { useNavigate } from "react-router-dom";
import Mascot from "./mascot.jsx";

const G = {
  black: "#0a0a0a", white: "#ffffff", bg: "#fffdf9",
  accent: "#ff4d00", gray: "#6b7280", lightGray: "#f3f4f6",
};

const TODAY_WORDS = [
  { word: "No cap", meaning: "진심으로, 거짓말 아님" },
  { word: "Rizz",   meaning: "이성을 끄는 매력" },
  { word: "Slay",   meaning: "완벽하게 해내다" },
  { word: "Lowkey", meaning: "은근히, 조용히" },
  { word: "Bussin", meaning: "진짜 맛있다, 최고다" },
];

export default function LearningIntro() {
  const navigate = useNavigate();
  const streak = 7;

  return (
    <div style={{
      minHeight: "100vh", background: G.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans KR', sans-serif", padding: "40px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* 뒤로가기 */}
        <button onClick={() => navigate("/dashboard")} style={{
          background: "none", border: "none", color: G.gray,
          fontSize: 14, cursor: "pointer", marginBottom: 32,
          display: "flex", alignItems: "center", gap: 6, padding: 0,
        }}>← 대시보드로</button>

        {/* 캐릭터 + 스트릭 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Mascot size={140} mode="cheer" />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,77,0,0.08)", border: "1px solid rgba(255,77,0,0.2)",
            borderRadius: 100, padding: "8px 20px", marginTop: 16,
          }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: G.accent }}>
              {streak}일 연속 학습 중!
            </span>
          </div>
        </div>

        {/* 타이틀 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 900, color: G.black, letterSpacing: -1, marginBottom: 10,
          }}>
            오늘의 슬랭 <span style={{ color: G.accent }}>5개</span>
          </h1>
          <p style={{ fontSize: 14, color: G.gray, lineHeight: 1.7 }}>
            딱 5분이면 충분해요.<br />
            오늘도 한 걸음 더 원어민에 가까워져요 💪
          </p>
        </div>

        {/* 오늘 배울 단어 미리보기 */}
        <div style={{
          background: G.white, borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden", marginBottom: 24,
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
        }}>
          {TODAY_WORDS.map((w, i) => (
            <div key={w.word} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 24px",
              borderBottom: i < TODAY_WORDS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}></span>
                <span style={{
                  fontFamily: "'Unbounded', sans-serif",
                  fontSize: 14, fontWeight: 800, color: G.black,
                }}>{w.word}</span>
              </div>
              <span style={{ fontSize: 13, color: G.gray }}>{w.meaning}</span>
            </div>
          ))}
        </div>

        {/* 예상 소요 시간 */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 28, justifyContent: "center",
        }}>
          {[
            { icon: "⏱️", label: "예상 시간", value: "5분" },
            { icon: "📚", label: "학습 단어", value: "5개" },
            { icon: "🎯", label: "오늘 목표", value: "100%" },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, background: G.white, borderRadius: 14,
              padding: "14px 10px", textAlign: "center",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: G.gray, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: G.black,
                fontFamily: "'Unbounded', sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* 시작 버튼 */}
        <button onClick={() => navigate("/card-study")} style={{
          width: "100%", background: G.accent, color: G.white,
          border: "none", borderRadius: 16, padding: "18px",
          fontSize: 16, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Noto Sans KR', sans-serif",
          boxShadow: "0 8px 32px rgba(255,77,0,0.35)",
          transition: "transform 0.2s",
          letterSpacing: 0.5,
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        >
          🚀 학습 시작하기
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#d1d5db", marginTop: 16 }}>
          오늘 학습하면 {streak + 1}일 연속 달성! 🔥
        </p>
      </div>
    </div>
  );
}