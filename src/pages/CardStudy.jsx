import { useState } from "react";
import { useNavigate } from "react-router-dom";

const G = {
  black: "#0a0a0a", white: "#ffffff",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981",
};

const CARDS = [
  {
    word: "No cap",
    category: "SNS / 일상",
    meaning: "진심으로, 거짓말 아님",
    korean: "ㄹㅇ (리얼)",
    exampleEn: ["That movie was amazing, ", "no cap", ". You gotta watch it."],
    exampleKr: "그 영화 진짜 대박이야, ㄹㅇ. 꼭 봐봐.",
    nuance: "친구 대화, SNS에서 자주 사용. 자신이 한 말이 사실임을 강조할 때 써요.",
    emoji: "🔥",
  },
  {
    word: "It's giving",
    category: "Gen Z / 유행어",
    meaning: "~느낌이야, ~분위기다",
    korean: "완전 ~ 느낌",
    exampleEn: ["This café? ", "It's giving", " Paris vibes, honestly."],
    exampleKr: "이 카페? 완전 파리 느낌인데, 진짜로.",
    nuance: "뭔가의 분위기나 느낌을 묘사할 때. 긍정적인 맥락에서 주로 쓰여요.",
    emoji: "✨",
  },
  {
    word: "Lowkey",
    category: "일상 / 강조",
    meaning: "은근히, 살짝, 솔직히",
    korean: "은근 ~",
    exampleEn: ["I ", "lowkey", " love this song but don't tell anyone."],
    exampleKr: "이 노래 은근 좋은데 아무한테도 말하지 마.",
    nuance: "뭔가를 살짝 인정하거나 강조할 때. 공개적으로 말하기 애매한 감정에 써요.",
    emoji: "🤫",
  },
  {
    word: "Slay",
    category: "칭찬 / 긍정",
    meaning: "완전 잘해냈어, 멋지다",
    korean: "완전 킬링이야",
    exampleEn: ["She walked in and ", "slayed", " the whole room."],
    exampleKr: "그녀가 들어오자마자 완전 킬링이었어.",
    nuance: "누군가가 굉장히 잘했거나 멋질 때 쓰는 칭찬 표현. 외모, 퍼포먼스에 주로 사용.",
    emoji: "👑",
  },
  {
    word: "Vibe check",
    category: "SNS / 일상",
    meaning: "분위기 파악, 상태 확인",
    korean: "분위기 보는 중",
    exampleEn: ["Just doing a quick ", "vibe check", " — how is everyone?"],
    exampleKr: "잠깐 분위기 좀 볼게요 — 다들 어때요?",
    nuance: "상황이나 사람의 분위기를 체크할 때. 가볍고 유머러스한 맥락에서 써요.",
    emoji: "📡",
  },
];

/* ── 완료 화면 ── */
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
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: 48, fontWeight: 300 }}>오늘 {total}개 표현 학습 완료 🎉</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "완료한 카드", value: `${total}개`, color: G.accent },
          { label: "알겠어요", value: `${known}개`, color: G.green },
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

/* ── 메인 카드 학습 ── */
export default function CardStudy() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(null);

  const card = CARDS[index];
  const total = CARDS.length;

  function next(isKnown) {
    setLeaving(isKnown ? "right" : "left");
    if (isKnown) setKnown(k => k + 1);
    setTimeout(() => {
      setLeaving(null);
      setFlipped(false);
      if (index + 1 >= total) setDone(true);
      else setIndex(i => i + 1);
    }, 350);
  }

  function restart() {
    setIndex(0); setFlipped(false); setKnown(0); setDone(false); setLeaving(null);
  }

  if (done) return <CompletionScreen known={known} total={total} onRestart={restart} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* 상단 헤더 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500 }}>
          ← 대시보드
        </button>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black }}>
          오늘의 <span style={{ color: G.accent }}>학습</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: G.gray }}>{index + 1} / {total}</div>
      </div>

      {/* 진행 바 */}
      <div style={{ height: 5, background: "#e5e0d8", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(index / total) * 100}%`, background: G.accent, transition: "width 0.4s ease" }} />
      </div>

      {/* 카드 컨테이너 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>

        {/* 카테고리 뱃지 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ background: "rgba(255,77,0,0.1)", border: "1px solid rgba(255,77,0,0.2)", color: G.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "7px 18px", borderRadius: 100 }}>
            {card.emoji} {card.category}
          </div>
        </div>

        {/* 카드 */}
        <div style={{
          width: "100%", maxWidth: 640,
          transform: leaving === "right" ? "translateX(130%) rotate(8deg)" : leaving === "left" ? "translateX(-130%) rotate(-8deg)" : "none",
          opacity: leaving ? 0 : 1,
          transition: leaving ? "transform 0.35s ease, opacity 0.3s ease" : "none",
        }}>

          {/* 앞면 */}
          {!flipped ? (
            <div onClick={() => setFlipped(true)} style={{
              background: `linear-gradient(145deg, ${G.navy} 0%, #1e3a5f 100%)`,
              borderRadius: 32, padding: "80px 48px",
              textAlign: "center", cursor: "pointer",
              boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.05)",
              minHeight: 380, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 20,
              position: "relative", overflow: "hidden", userSelect: "none",
            }}>
              {/* 배경 데코 */}
              <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, background: "radial-gradient(circle, rgba(255,77,0,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, background: "radial-gradient(circle, rgba(255,204,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
              {/* 코너 데코 */}
              <div style={{ position: "absolute", top: 24, left: 28, width: 40, height: 40, border: "2px solid rgba(255,255,255,0.07)", borderRadius: 12 }} />
              <div style={{ position: "absolute", bottom: 24, right: 28, width: 40, height: 40, border: "2px solid rgba(255,255,255,0.07)", borderRadius: 12 }} />

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>오늘의 표현</div>

              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 60, fontWeight: 900, color: G.white, letterSpacing: -2, lineHeight: 1, textShadow: "0 0 60px rgba(255,77,0,0.4)" }}>
                {card.word}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 20px", borderRadius: 100, marginTop: 8 }}>
                <span style={{ fontSize: 14 }}>👆</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>탭해서 뜻 보기</span>
              </div>
            </div>
          ) : (
            /* 뒷면 */
            <div style={{
              background: G.white,
              borderRadius: 32, padding: "40px 44px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
              minHeight: 380, display: "flex", flexDirection: "column", gap: 22,
            }}>
              {/* 단어 헤더 */}
              <div style={{ paddingBottom: 20, borderBottom: "2px solid #f0ece5" }}>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 34, fontWeight: 900, color: G.black, letterSpacing: -0.5 }}>{card.word}</div>
              </div>

              {/* 뜻 + 한국어 유사 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#bbb5a8" }}>한국어 뜻</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: G.black, lineHeight: 1.3 }}>{card.meaning}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: G.black, color: "#63b3ed", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 100, width: "fit-content", marginTop: 4 }}>
                  🇰🇷 한국어로: {card.korean}
                </div>
              </div>

              {/* 예문 */}
              <div style={{ background: "#f7f4ef", borderRadius: 18, padding: "18px 20px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#bbb5a8", marginBottom: 10 }}>예문</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: G.black, lineHeight: 1.7, marginBottom: 8 }}>
                  {card.exampleEn.map((t, i) =>
                    i === 1
                      ? <span key={i} style={{ color: G.accent, background: "rgba(255,77,0,0.08)", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>{t}</span>
                      : <span key={i}>{t}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: G.gray, lineHeight: 1.6 }}>{card.exampleKr}</div>
              </div>

              {/* 뉘앙스 */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fffbf0", border: "1px solid rgba(255,204,0,0.3)", borderRadius: 14, padding: "14px 16px" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <div style={{ fontSize: 13, color: "#5a5750", lineHeight: 1.7 }}>{card.nuance}</div>
              </div>
            </div>
          )}
        </div>

        {/* 진행 점 */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 28 }}>
          {CARDS.map((_, i) => (
            <div key={i} style={{ width: i === index ? 28 : 8, height: 8, borderRadius: 4, background: i < index ? "rgba(255,77,0,0.35)" : i === index ? G.accent : "#d6d0c8", transition: "all 0.3s ease" }} />
          ))}
        </div>
      </div>

      {/* 버튼 영역 */}
      <div style={{ padding: "0 32px 40px", display: "flex", gap: 14, flexShrink: 0 }}>
        <button onClick={() => next(false)} style={{
          flex: 1, padding: "18px", borderRadius: 20,
          border: "2px solid #e5dfd5", background: G.white,
          color: G.gray, fontSize: 15, fontWeight: 600, cursor: "pointer",
          fontFamily: "'Noto Sans KR', sans-serif",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}>🔁 다시볼게요</button>
        <button onClick={() => next(true)} style={{
          flex: 1.4, padding: "18px", borderRadius: 20,
          border: "none", background: G.accent, color: G.white,
          fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Noto Sans KR', sans-serif",
          boxShadow: "0 8px 28px rgba(255,77,0,0.35)",
        }}>알겠어요 ✅</button>
      </div>
    </div>
  );
}