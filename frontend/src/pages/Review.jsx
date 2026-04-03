import { useState } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";

// 임시 복습 데이터 (백엔드 연결 전)
const REVIEW_CARDS = [
  {
    id: 1, source: "card",
    word: "Vibe check",
    category: "SNS / 일상",
    meaning: "분위기 파악, 상태 확인",
    korean: "분위기 보는 중",
    exampleEn: ["Just doing a quick ", "vibe check", " — how is everyone?"],
    exampleKr: "잠깐 분위기 좀 볼게요 — 다들 어때요?",
    nuance: "상황이나 사람의 분위기를 체크할 때. 가볍고 유머러스한 맥락에서 써요.",
    emoji: "📡",
  },
  {
    id: 2, source: "practice",
    word: "Lowkey",
    category: "일상 / 강조",
    meaning: "은근히, 살짝, 솔직히",
    korean: "은근 ~",
    exampleEn: ["I ", "lowkey", " love this song but don't tell anyone."],
    exampleKr: "이 노래 은근 좋은데 아무한테도 말하지 마.",
    nuance: "뭔가를 살짝 인정하거나 강조할 때. 공개적으로 말하기 애매한 감정에 써요.",
    emoji: "🤫",
    wrongAnswer: "크게, 대놓고",
  },
  {
    id: 3, source: "card",
    word: "No worries",
    category: "일상",
    meaning: "괜찮아, 신경 쓰지 마",
    korean: "ㄱㅊ (괜찮아)",
    exampleEn: ["\"Sorry I'm late!\" \"", "No worries", ", we just started.\""],
    exampleKr: "\"늦어서 미안해!\" \"괜찮아, 방금 시작했어.\"",
    nuance: "상대방의 사과나 걱정을 가볍게 받아줄 때. 매우 자주 쓰이는 표현이에요.",
    emoji: "😌",
  },
  {
    id: 4, source: "practice",
    word: "It's giving",
    category: "Gen Z / 유행어",
    meaning: "~느낌이야, ~분위기다",
    korean: "완전 ~ 느낌",
    exampleEn: ["This café? ", "It's giving", " Paris vibes, honestly."],
    exampleKr: "이 카페? 완전 파리 느낌인데, 진짜로.",
    nuance: "뭔가의 분위기나 느낌을 묘사할 때. 긍정적인 맥락에서 주로 쓰여요.",
    emoji: "✨",
    wrongAnswer: "No cap",
  },
  {
    id: 5, source: "card",
    word: "Ghosted",
    category: "연애 / SNS",
    meaning: "갑자기 연락을 끊다",
    korean: "잠수탔어",
    exampleEn: ["We were texting every day, then he just ", "ghosted", " me."],
    exampleKr: "매일 문자했는데 그가 갑자기 잠수탔어.",
    nuance: "연애 또는 친구 사이에서 갑자기 연락이 없어질 때 사용. SNS에서도 자주 써요.",
    emoji: "👻",
  },
];

/* ── 결과 화면 ── */
function ResultScreen({ known, total, onRetry }) {
  const navigate = useNavigate();
  const pct = Math.round((known / total) * 100);
  const msg = pct === 100 ? "완벽해요! 🏆" : pct >= 80 ? "거의 다 왔어요! 💪" : pct >= 60 ? "조금만 더! 🔥" : "다시 한번 해봐요 📚";

  return (
    <div style={{ minHeight: "100vh", background: G.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", padding: 40, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,77,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ fontSize: 72, marginBottom: 16 }}>{pct === 100 ? "🏆" : pct >= 60 ? "🔥" : "📚"}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>복습 완료!</div>
      <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 34, fontWeight: 900, color: G.white, lineHeight: 1.2, letterSpacing: -1, marginBottom: 8 }}>
        {msg}
      </h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 44, fontWeight: 300 }}>{total}개 중 {known}개 완벽히 기억했어요</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 44, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "복습한 카드", value: `${total}개`, color: G.accent },
          { label: "알겠어요", value: `${known}개`, color: G.green },
          { label: "정확도", value: `${pct}%`, color: G.accent2 },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "22px 30px", minWidth: 120 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {known < total && (
          <button onClick={onRetry} style={{ padding: "14px 28px", borderRadius: 100, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 8px 24px rgba(255,77,0,0.3)" }}>🔁 틀린 것만 다시</button>
        )}
        <button onClick={() => navigate("/dashboard")} style={{ padding: "14px 28px", borderRadius: 100, border: "1.5px solid rgba(255,255,255,0.2)", background: "transparent", color: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>🏠 대시보드로</button>
      </div>
    </div>
  );
}

/* ── 메인 복습 페이지 ── */
export default function Review() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [wrongList, setWrongList] = useState([]);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(null);
  const [cards, setCards] = useState(REVIEW_CARDS);

  const card = cards[index];
  const total = cards.length;

  function next(isKnown) {
    setLeaving(isKnown ? "right" : "left");
    if (isKnown) {
      setKnown(k => k + 1);
    } else {
      setWrongList(w => [...w, card]);
    }
    setTimeout(() => {
      setLeaving(null);
      setFlipped(false);
      if (index + 1 >= total) setDone(true);
      else setIndex(i => i + 1);
    }, 350);
  }

  function retryWrong() {
    setCards(wrongList);
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setWrongList([]);
    setDone(false);
    setLeaving(null);
  }

  if (done) return <ResultScreen known={known} total={total} onRetry={retryWrong} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* 헤더 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500 }}>
          ← 대시보드
        </button>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black }}>
          🔁 <span style={{ color: G.accent }}>복습</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: G.gray }}>{index + 1} / {total}</div>
      </div>

      {/* 진행 바 */}
      <div style={{ height: 5, background: "#e5e0d8", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(index / total) * 100}%`, background: G.accent, transition: "width 0.4s ease" }} />
      </div>

      {/* 카드 컨테이너 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px" }}>

        {/* 출처 뱃지 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <div style={{
            background: card.source === "card" ? "rgba(255,77,0,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${card.source === "card" ? "rgba(255,77,0,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: card.source === "card" ? G.accent : G.red,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase", padding: "6px 16px", borderRadius: 100,
          }}>
            {card.source === "card" ? "🔁 다시볼게요 카드" : "❌ 연습에서 틀린 문제"}
          </div>
          <div style={{ background: "rgba(0,0,0,0.06)", color: G.gray, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 16px", borderRadius: 100 }}>
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
          {!flipped ? (
            /* 앞면 */
            <div onClick={() => setFlipped(true)} style={{
              background: `linear-gradient(145deg, ${G.navy} 0%, #1e3a5f 100%)`,
              borderRadius: 32, padding: "72px 48px",
              textAlign: "center", cursor: "pointer",
              boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.05)",
              minHeight: 360, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 20,
              position: "relative", overflow: "hidden", userSelect: "none",
            }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, background: "radial-gradient(circle, rgba(255,77,0,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, background: "radial-gradient(circle, rgba(255,204,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 24, left: 28, width: 40, height: 40, border: "2px solid rgba(255,255,255,0.07)", borderRadius: 12 }} />
              <div style={{ position: "absolute", bottom: 24, right: 28, width: 40, height: 40, border: "2px solid rgba(255,255,255,0.07)", borderRadius: 12 }} />

              {/* 연습에서 틀린 경우 오답 표시 */}
              {card.source === "practice" && card.wrongAnswer && (
                <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12 }}>❌</span>
                  <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 600 }}>이전 오답: {card.wrongAnswer}</span>
                </div>
              )}

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>복습 카드</div>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 56, fontWeight: 900, color: G.white, letterSpacing: -2, lineHeight: 1, textShadow: "0 0 60px rgba(255,77,0,0.4)" }}>
                {card.word}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 20px", borderRadius: 100, marginTop: 4 }}>
                <span style={{ fontSize: 14 }}>👆</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>탭해서 뜻 확인</span>
              </div>
            </div>
          ) : (
            /* 뒷면 */
            <div style={{
              background: G.white, borderRadius: 32, padding: "40px 44px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
              minHeight: 360, display: "flex", flexDirection: "column", gap: 20,
            }}>
              <div style={{ paddingBottom: 18, borderBottom: "2px solid #f0ece5" }}>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 900, color: G.black, letterSpacing: -0.5 }}>{card.word}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#bbb5a8" }}>한국어 뜻</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: G.black, lineHeight: 1.3 }}>{card.meaning}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: G.black, color: "#63b3ed", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 100, width: "fit-content", marginTop: 2 }}>
                  🇰🇷 한국어로: {card.korean}
                </div>
              </div>

              <div style={{ background: "#f7f4ef", borderRadius: 18, padding: "16px 20px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#bbb5a8", marginBottom: 10 }}>예문</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: G.black, lineHeight: 1.7, marginBottom: 6 }}>
                  {card.exampleEn.map((t, i) =>
                    i === 1
                      ? <span key={i} style={{ color: G.accent, background: "rgba(255,77,0,0.08)", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>{t}</span>
                      : <span key={i}>{t}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: G.gray, lineHeight: 1.6 }}>{card.exampleKr}</div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fffbf0", border: "1px solid rgba(255,204,0,0.3)", borderRadius: 14, padding: "14px 16px" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <div style={{ fontSize: 13, color: "#5a5750", lineHeight: 1.7 }}>{card.nuance}</div>
              </div>
            </div>
          )}
        </div>

        {/* 진행 점 */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              width: i === index ? 28 : 8, height: 8, borderRadius: 4,
              background: i < index ? "rgba(255,77,0,0.35)" : i === index ? G.accent : "#d6d0c8",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ padding: "0 32px 40px", display: "flex", gap: 14, flexShrink: 0 }}>
        <button onClick={() => next(false)} style={{
          flex: 1, padding: "18px", borderRadius: 20,
          border: "2px solid #e5dfd5", background: G.white,
          color: G.gray, fontSize: 15, fontWeight: 600, cursor: "pointer",
          fontFamily: "'Noto Sans KR', sans-serif",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}>🔁 아직 헷갈려요</button>
        <button onClick={() => next(true)} style={{
          flex: 1.4, padding: "18px", borderRadius: 20,
          border: "none", background: G.accent, color: G.white,
          fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Noto Sans KR', sans-serif",
          boxShadow: "0 8px 28px rgba(255,77,0,0.35)",
        }}>이제 알겠어요 ✅</button>
      </div>
    </div>
  );
}