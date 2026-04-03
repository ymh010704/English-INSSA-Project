import { useState } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";

const QUESTIONS = [
  // 유형 1: 빈칸 채우기
  {
    type: "fill",
    question: "예문에서 알맞은 표현을 고르세요",
    sentence: ["That outfit is amazing. She totally ", "____", " tonight!"],
    answer: "slayed",
    options: ["slayed", "vibed", "capped", "ghosted"],
    meaning: "완전 잘해냈어, 멋지다",
    explanation: "'Slay'는 누군가 굉장히 멋지거나 잘해냈을 때 쓰는 칭찬 표현이에요.",
  },
  // 유형 2: 보기 4개 중 정답
  {
    type: "choice",
    question: "'Lowkey'의 뜻으로 올바른 것은?",
    answer: "은근히, 살짝",
    options: ["크게, 대놓고", "은근히, 살짝", "완전히, 확실히", "아마도, 어쩌면"],
    word: "Lowkey",
    explanation: "'Lowkey'는 뭔가를 살짝 인정하거나 강조할 때 써요. 한국어로 '은근 ~'과 비슷해요.",
  },
  // 유형 3: 뜻 보고 영어 단어 맞추기 (보기)
  {
    type: "choice",
    question: "'진심으로, 거짓말 아님'을 뜻하는 표현은?",
    answer: "No cap",
    options: ["No cap", "No way", "For real", "Deadass"],
    word: "No cap",
    explanation: "'No cap'은 한국어 'ㄹㅇ'처럼 자신이 한 말이 진심임을 강조할 때 써요.",
  },
  // 유형 4: 한국어 보고 영어 입력
  {
    type: "input",
    question: "한국어 뜻을 보고 영어 표현을 입력하세요",
    meaning: "분위기 파악, 상태 확인",
    answer: "vibe check",
    hint: "V_ _ _   C_ _ _ _",
    explanation: "'Vibe check'는 상황이나 사람의 분위기를 체크할 때 써요.",
  },
  // 유형 5: 빈칸 채우기
  {
    type: "fill",
    question: "예문에서 알맞은 표현을 고르세요",
    sentence: ["This café? ", "____", " Paris vibes, honestly."],
    answer: "It's giving",
    options: ["It's giving", "No cap", "Lowkey", "Slay"],
    meaning: "~느낌이야, ~분위기다",
    explanation: "'It's giving'은 뭔가의 분위기나 느낌을 묘사할 때 사용해요.",
  },
];

/* ── 결과 화면 ── */
function ResultScreen({ score, total, onRetry }) {
  const navigate = useNavigate();
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? "완벽해요! 🏆" : pct >= 60 ? "잘했어요! 👍" : "조금 더 연습해요 💪";

  return (
    <div style={{ minHeight: "100vh", background: G.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", padding: 40, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,77,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ fontSize: 72, marginBottom: 20 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪"}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>연습 완료!</div>
      <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 36, fontWeight: 900, color: G.white, lineHeight: 1.2, letterSpacing: -1, marginBottom: 8 }}>
        {grade}
      </h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 44, fontWeight: 300 }}>{total}문제 중 {score}개 정답</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 44, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "총 문제", value: `${total}개`, color: G.accent },
          { label: "정답", value: `${score}개`, color: G.green },
          { label: "정확도", value: `${pct}%`, color: G.accent2 },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "22px 28px", minWidth: 110 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={onRetry} style={{ padding: "14px 32px", borderRadius: 100, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 8px 24px rgba(255,77,0,0.3)" }}>🔁 다시 풀기</button>
        <button onClick={() => navigate("/dashboard")} style={{ padding: "14px 32px", borderRadius: 100, border: "1.5px solid rgba(255,255,255,0.2)", background: "transparent", color: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>🏠 대시보드로</button>
      </div>
    </div>
  );
}

/* ── 메인 연습 페이지 ── */
export default function Practice() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[index];
  const total = QUESTIONS.length;

  function check() {
    if (checked) return;
    const ans = q.type === "input"
      ? inputVal.trim().toLowerCase() === q.answer.toLowerCase()
      : selected === q.answer;
    setIsCorrect(ans);
    setChecked(true);
    if (ans) setScore(s => s + 1);
  }

  function next() {
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
      setInputVal("");
      setChecked(false);
      setIsCorrect(false);
    }
  }

  function retry() {
    setIndex(0); setSelected(null); setInputVal("");
    setChecked(false); setIsCorrect(false); setScore(0); setDone(false);
  }

  if (done) return <ResultScreen score={score} total={total} onRetry={retry} />;

  const canCheck = q.type === "input" ? inputVal.trim().length > 0 : selected !== null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* 헤더 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500 }}>
          ← 대시보드
        </button>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black }}>
          ✍️ <span style={{ color: G.accent }}>연습</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: G.gray }}>{index + 1} / {total}</div>
      </div>

      {/* 진행 바 */}
      <div style={{ height: 5, background: "#e5e0d8", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(index / total) * 100}%`, background: G.accent, transition: "width 0.4s ease" }} />
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 24px 24px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 620 }}>

          {/* 문제 유형 뱃지 */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ background: "rgba(255,77,0,0.1)", border: "1px solid rgba(255,77,0,0.2)", color: G.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 16px", borderRadius: 100 }}>
              {q.type === "fill" ? "🔤 빈칸 채우기" : q.type === "input" ? "⌨️ 직접 입력" : "🎯 객관식"}
            </span>
          </div>

          {/* 문제 카드 */}
          <div style={{ background: G.white, borderRadius: 28, padding: "36px 36px 28px", boxShadow: "0 16px 48px rgba(0,0,0,0.08)", marginBottom: 20, border: "1px solid rgba(0,0,0,0.04)" }}>

            {/* 문제 */}
            <div style={{ fontSize: 17, fontWeight: 700, color: G.black, marginBottom: 24, lineHeight: 1.5 }}>{q.question}</div>

            {/* 빈칸 예문 */}
            {q.type === "fill" && (
              <div style={{ background: "#f7f4ef", borderRadius: 16, padding: "20px 24px", marginBottom: 8, fontSize: 16, lineHeight: 1.8, color: G.black, fontWeight: 500 }}>
                {q.sentence.map((t, i) =>
                  t === "____"
                    ? <span key={i} style={{ display: "inline-block", minWidth: 100, borderBottom: `3px solid ${checked ? (isCorrect ? G.green : G.red) : G.accent}`, color: checked ? (isCorrect ? G.green : G.red) : G.accent, fontWeight: 800, textAlign: "center", padding: "0 8px", transition: "color 0.3s" }}>
                        {checked ? q.answer : "____"}
                      </span>
                    : <span key={i}>{t}</span>
                )}
              </div>
            )}

            {/* 단어 표시 (객관식) */}
            {q.type === "choice" && q.word && (
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 36, fontWeight: 900, color: G.navy, letterSpacing: -1 }}>{q.word}</div>
              </div>
            )}

            {/* 직접 입력 */}
            {q.type === "input" && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ background: "#f7f4ef", borderRadius: 14, padding: "16px 20px", marginBottom: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: G.black }}>{q.meaning}</div>
                  <div style={{ fontSize: 13, color: G.gray, marginTop: 6 }}>힌트: {q.hint}</div>
                </div>
                <input
                  value={inputVal}
                  onChange={e => !checked && setInputVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && canCheck && !checked && check()}
                  placeholder="영어 표현을 입력하세요..."
                  style={{
                    width: "100%", padding: "16px 20px", borderRadius: 14,
                    border: `2px solid ${checked ? (isCorrect ? G.green : G.red) : "#e5e0d8"}`,
                    fontSize: 16, fontWeight: 600, outline: "none",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    background: checked ? (isCorrect ? "#f0fdf4" : "#fef2f2") : G.white,
                    color: G.black, transition: "border-color 0.3s",
                    boxSizing: "border-box",
                  }}
                />
                {checked && !isCorrect && (
                  <div style={{ fontSize: 14, color: G.red, marginTop: 8, fontWeight: 600 }}>
                    정답: <span style={{ color: G.black }}>{q.answer}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 보기 (빈칸/객관식) */}
          {(q.type === "fill" || q.type === "choice") && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {q.options.map(opt => {
                let bg = G.white, border = "2px solid #e5e0d8", color = G.black;
                if (!checked && selected === opt) { bg = "rgba(255,77,0,0.06)"; border = `2px solid ${G.accent}`; color = G.accent; }
                if (checked) {
                  if (opt === q.answer) { bg = "#f0fdf4"; border = `2px solid ${G.green}`; color = G.green; }
                  else if (opt === selected && opt !== q.answer) { bg = "#fef2f2"; border = `2px solid ${G.red}`; color = G.red; }
                  else { bg = G.white; border = "2px solid #e5e0d8"; color = G.gray; }
                }
                return (
                  <button key={opt} onClick={() => !checked && setSelected(opt)} style={{
                    padding: "16px 18px", borderRadius: 16, border, background: bg, color,
                    fontSize: 14, fontWeight: 600, cursor: checked ? "default" : "pointer",
                    fontFamily: "'Noto Sans KR', sans-serif", textAlign: "left",
                    transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    {checked && opt === q.answer && <span>✅</span>}
                    {checked && opt === selected && opt !== q.answer && <span>❌</span>}
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* 정답 해설 */}
          {checked && (
            <div style={{ background: isCorrect ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isCorrect ? "#86efac" : "#fca5a5"}`, borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: isCorrect ? G.green : G.red, marginBottom: 6 }}>
                {isCorrect ? "✅ 정답이에요!" : "❌ 틀렸어요!"}
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{q.explanation}</div>
            </div>
          )}

          {/* 버튼 */}
          <div style={{ display: "flex", gap: 12 }}>
            {!checked ? (
              <button onClick={check} disabled={!canCheck} style={{
                flex: 1, padding: "18px", borderRadius: 20, border: "none",
                background: canCheck ? G.accent : "#e5e0d8",
                color: canCheck ? G.white : G.gray,
                fontSize: 15, fontWeight: 700, cursor: canCheck ? "pointer" : "default",
                fontFamily: "'Noto Sans KR', sans-serif",
                boxShadow: canCheck ? "0 8px 24px rgba(255,77,0,0.3)" : "none",
                transition: "all 0.2s",
              }}>정답 확인</button>
            ) : (
              <button onClick={next} style={{
                flex: 1, padding: "18px", borderRadius: 20, border: "none",
                background: G.black, color: G.white,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Noto Sans KR', sans-serif",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}>{index + 1 >= total ? "결과 보기 🏆" : "다음 문제 →"}</button>
            )}
          </div>

          {/* 진행 점 */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 28 }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{ width: i === index ? 28 : 8, height: 8, borderRadius: 4, background: i < index ? "rgba(255,77,0,0.35)" : i === index ? G.accent : "#d6d0c8", transition: "all 0.3s ease" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}