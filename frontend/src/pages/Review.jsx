import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ClipboardList, Heart, BookOpen, Trophy, Flame, Dumbbell, Home, CheckCircle, XCircle, Puzzle, PenLine, ArrowLeftRight } from "lucide-react";
import G from "../constants/colors";
import Mascot from "../components/Mascot";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";

const TOTAL_QUESTIONS = 10;
const MAX_HEARTS = 3;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickWrong(all, correct, count = 3) {
  return shuffle(all.filter(s => s.slang_id !== correct.slang_id)).slice(0, count);
}

/* ── 문제 생성 ── */
function makeQuestions(slangs) {
  const picked = shuffle(slangs).slice(0, TOTAL_QUESTIONS);
  const types = ["meaning", "blank", "ko2en"];
  return picked.map(card => {
    const type = types[Math.floor(Math.random() * types.length)];
    return { card, type };
  });
}

/* ── 결과 화면 ── */
function ResultScreen({ correct, total, onRetry }) {
  const navigate = useNavigate();
  const pct = Math.round((correct / total) * 100);
  const msg = pct === 100 ? "완벽해요!" : pct >= 80 ? "거의 다 알아요!" : pct >= 50 ? "조금만 더!" : "다시 해봐요!";
  const ResultIcon = pct === 100 ? Trophy : pct >= 80 ? Flame : pct >= 50 ? Dumbbell : BookOpen;
  const resultColor = pct === 100 ? G.accent : pct >= 80 ? "#f97316" : pct >= 50 ? "#94a3b8" : G.blue;

  return (
    <div style={{ minHeight: "100vh", background: G.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", padding: 40, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(255,77,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ marginBottom: 12 }}><ResultIcon size={72} color={resultColor} strokeWidth={1.4} /></div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>복습 완료</div>
      <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 900, color: G.white, marginBottom: 8 }}>{msg}</h1>

      <div style={{ display: "flex", gap: 14, margin: "36px 0", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "정답", value: `${correct}개`, color: G.green },
          { label: "오답", value: `${total - correct}개`, color: "#f87171" },
          { label: "정확도", value: `${pct}%`, color: G.accent2 },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "20px 28px", minWidth: 110 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: s.color, marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onRetry} style={{ padding: "14px 28px", borderRadius: 14, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 4px 16px rgba(255,77,0,0.35)", display: "inline-flex", alignItems: "center", gap: 6 }}><RotateCcw size={14} strokeWidth={2} /> 다시 풀기</button>
        <button onClick={() => navigate("/dashboard")} style={{ padding: "14px 28px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", display: "inline-flex", alignItems: "center", gap: 6 }}><Home size={14} strokeWidth={2} /> 대시보드</button>
      </div>
    </div>
  );
}

/* ── 정답/오답 피드백 바 ── */
function FeedbackBar({ correct, explanation, onNext }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: correct ? "#d1fae5" : "#fee2e2",
      borderTop: `3px solid ${correct ? G.green : G.red}`,
      padding: "20px 32px 28px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      zIndex: 100, fontFamily: "'Noto Sans KR', sans-serif",
      animation: "slideUp 0.2s ease",
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: correct ? "#065f46" : "#991b1b", marginBottom: 4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {correct ? <CheckCircle size={15} color="#065f46" strokeWidth={2.5} /> : <XCircle size={15} color="#991b1b" strokeWidth={2.5} />}
            {correct ? "정답이에요!" : "틀렸어요"}
          </span>
        </div>
        {explanation && <div style={{ fontSize: 13, color: correct ? "#047857" : "#b91c1c" }}>{explanation}</div>}
      </div>
      <button onClick={onNext} style={{
        padding: "13px 28px", borderRadius: 14, border: "none", flexShrink: 0,
        background: correct ? G.green : G.red, color: G.white,
        fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        계속 →
      </button>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </div>
  );
}

/* ── 뜻 고르기 (영→한) ── */
function MeaningQuestion({ card, allSlangs, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const options = useRef(shuffle([card, ...pickWrong(allSlangs, card)])).current;

  function select(opt) {
    if (selected) return;
    const ok = opt.slang_id === card.slang_id;
    setSelected(opt.slang_id);
    setTimeout(() => onAnswer(ok, `정답: ${card.definition_ko}`), 0);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: `linear-gradient(145deg, ${G.navy}, #1e3a5f)`, borderRadius: 24, padding: "36px 32px", textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 14 }}>이 단어의 뜻은?</div>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 42, fontWeight: 900, color: G.white, letterSpacing: -1 }}>{card.word}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt, i) => {
          const isCorrect = opt.slang_id === card.slang_id;
          const isSelected = selected === opt.slang_id;
          let bg = G.white, border = "rgba(0,0,0,0.08)", color = G.black;
          if (selected && isCorrect) { bg = "#d1fae5"; border = G.green; color = "#065f46"; }
          else if (selected && isSelected) { bg = "#fee2e2"; border = G.red; color = "#991b1b"; }
          return (
            <button key={opt.slang_id} onClick={() => select(opt)} style={{
              padding: "16px 20px", borderRadius: 14, border: `1.5px solid ${border}`, background: bg,
              textAlign: "left", cursor: selected ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: 14, transition: "all 0.15s",
              fontFamily: "'Noto Sans KR', sans-serif",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: selected && isCorrect ? G.green : selected && isSelected ? G.red : G.pageBg, color: selected && (isCorrect || isSelected) ? G.white : G.gray }}>
                {selected && isCorrect ? "✓" : selected && isSelected ? "✗" : ["A","B","C","D"][i]}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color }}>{opt.definition_ko}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── 빈칸 채우기 ── */
function BlankQuestion({ card, allSlangs, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const options = useRef(shuffle([card, ...pickWrong(allSlangs, card)])).current;

  const sentence = card.example_en || "";
  const regex = new RegExp(`(${card.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i");
  const parts = sentence.split(regex);
  const hasBlank = parts.length > 1;

  function select(opt) {
    if (selected) return;
    const ok = opt.slang_id === card.slang_id;
    setSelected(opt.slang_id);
    setTimeout(() => onAnswer(ok, `정답: ${card.word} — ${card.definition_ko}`), 0);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: G.white, borderRadius: 24, padding: "28px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#bbb", textTransform: "uppercase", marginBottom: 14 }}>빈칸에 들어갈 단어는?</div>
        <div style={{ fontSize: 17, lineHeight: 2, color: G.black }}>
          {hasBlank ? parts.map((p, i) =>
            regex.test(p)
              ? <span key={i} style={{
                  display: "inline-block", minWidth: 100, height: 30,
                  background: selected ? (selected === card.slang_id ? "#d1fae5" : "#fee2e2") : G.pageBg,
                  border: `2px dashed ${selected ? (selected === card.slang_id ? G.green : G.red) : "#d1d5db"}`,
                  borderRadius: 8, textAlign: "center", lineHeight: "28px",
                  fontSize: 14, fontWeight: 700, verticalAlign: "middle", margin: "0 4px",
                  color: selected ? (selected === card.slang_id ? "#065f46" : "#991b1b") : "transparent",
                }}>
                  {selected ? card.word : ""}
                </span>
              : <span key={i}>{p}</span>
          ) : <span>{sentence}</span>}
        </div>
        <div style={{ fontSize: 13, color: G.gray, marginTop: 10 }}>{card.example_ko}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map(opt => {
          const isCorrect = opt.slang_id === card.slang_id;
          const isSelected = selected === opt.slang_id;
          let bg = G.white, border = "rgba(0,0,0,0.08)", color = G.black;
          if (selected && isCorrect) { bg = "#d1fae5"; border = G.green; color = "#065f46"; }
          else if (selected && isSelected) { bg = "#fee2e2"; border = G.red; color = "#991b1b"; }
          return (
            <button key={opt.slang_id} onClick={() => select(opt)} style={{
              padding: "14px", borderRadius: 14, border: `1.5px solid ${border}`, background: bg,
              cursor: selected ? "default" : "pointer", fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: 14, fontWeight: 700, color, transition: "all 0.15s",
            }}>
              {opt.word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── 한→영 고르기 ── */
function Ko2EnQuestion({ card, allSlangs, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const options = useRef(shuffle([card, ...pickWrong(allSlangs, card)])).current;

  function select(opt) {
    if (selected) return;
    const ok = opt.slang_id === card.slang_id;
    setSelected(opt.slang_id);
    setTimeout(() => onAnswer(ok, `정답: ${card.word}`), 0);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: G.white, borderRadius: 24, padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#bbb", textTransform: "uppercase", marginBottom: 14 }}>이 뜻에 맞는 슬랭은?</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: G.black, marginBottom: 8 }}>{card.definition_ko}</div>
        <div style={{ fontSize: 13, color: G.gray }}>"{card.example_ko}"</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt, i) => {
          const isCorrect = opt.slang_id === card.slang_id;
          const isSelected = selected === opt.slang_id;
          let bg = G.white, border = "rgba(0,0,0,0.08)", color = G.black;
          if (selected && isCorrect) { bg = "#d1fae5"; border = G.green; color = "#065f46"; }
          else if (selected && isSelected) { bg = "#fee2e2"; border = G.red; color = "#991b1b"; }
          return (
            <button key={opt.slang_id} onClick={() => select(opt)} style={{
              padding: "16px 20px", borderRadius: 14, border: `1.5px solid ${border}`, background: bg,
              textAlign: "left", cursor: selected ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: 14, transition: "all 0.15s",
              fontFamily: "'Noto Sans KR', sans-serif",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: selected && isCorrect ? G.green : selected && isSelected ? G.red : G.pageBg, color: selected && (isCorrect || isSelected) ? G.white : G.gray }}>
                {selected && isCorrect ? "✓" : selected && isSelected ? "✗" : ["A","B","C","D"][i]}
              </div>
              <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 700, color }}>{opt.word}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── 인트로 화면 ── */
function IntroScreen({ total, onStart }) {
  const items = [
    { icon: Puzzle,          label: "뜻 고르기",  desc: "단어를 보고 뜻 맞히기" },
    { icon: PenLine,         label: "빈칸 채우기", desc: "예문 빈칸에 단어 선택" },
    { icon: ArrowLeftRight,  label: "한→영",       desc: "뜻을 보고 슬랭 찾기" },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column", background: G.pageBg }}>
      <PageHeader title="슬랭 복습" icon={RotateCcw} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          {/* 캐릭터 + 배지 */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Mascot size={140} mode="cheer" />
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,77,0,0.08)", border: "1px solid rgba(255,77,0,0.2)",
              borderRadius: 100, padding: "8px 20px", marginTop: 16,
            }}>
              <RotateCcw size={18} color={G.accent} strokeWidth={2} />
              <span style={{ fontSize: 14, fontWeight: 700, color: G.accent }}>랜덤 퀴즈로 복습해요!</span>
            </div>
          </div>

          {/* 타이틀 */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 900, color: G.black, letterSpacing: -1, marginBottom: 10,
            }}>
              슬랭 복습 <span style={{ color: G.accent }}>{TOTAL_QUESTIONS}문제</span>
            </h1>
            <p style={{ fontSize: 14, color: G.gray, lineHeight: 1.7 }}>
              배운 슬랭을 다시 한번 확인해요.<br />
              3가지 유형이 랜덤으로 출제돼요
            </p>
          </div>

          {/* 출제 유형 리스트 */}
          <div style={{
            background: G.white, borderRadius: 20,
            border: "1px solid rgba(0,0,0,0.06)",
            overflow: "hidden", marginBottom: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}>
            {items.map((m, i) => (
              <div key={m.label} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 24px",
                borderBottom: i < items.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${G.accent}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {(() => { const I = m.icon; return <I size={18} color={G.accent} strokeWidth={2} />; })()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: G.black }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 스탯 카드 */}
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            {[
              { icon: ClipboardList, label: "출제 문제", value: `${TOTAL_QUESTIONS}개` },
              { icon: Heart,         label: "하트",      value: `${MAX_HEARTS}개`       },
              { icon: BookOpen,      label: "슬랭 풀",   value: `${total}개`            },
            ].map(item => {
              const Icon = item.icon;
              return (
              <div key={item.label} style={{
                flex: 1, background: G.white, borderRadius: 14,
                padding: "14px 10px", textAlign: "center",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><Icon size={20} color={G.accent} strokeWidth={1.8} /></div>
                <div style={{ fontSize: 11, color: G.gray, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: G.black, fontFamily: "'Unbounded', sans-serif" }}>{item.value}</div>
              </div>
            );})}
          </div>

          {/* 시작 버튼 */}
          <Button onClick={onStart} style={{ width: "100%", borderRadius: 16, padding: "18px", fontSize: 16, letterSpacing: 0.5 }}>
            복습 시작하기 →
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── 메인 ── */
export default function Review() {
  const navigate = useNavigate();
  const [slangs, setSlangs] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    fetch("/api/slangs")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data || [];
        setSlangs(list);
        setQuestions(makeQuestions(list));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleAnswer(isCorrect, explanation) {
    if (isCorrect) setCorrect(c => c + 1);
    else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      if (newHearts <= 0) {
        setTimeout(() => setDone(true), 1200);
        setFeedback({ correct: false, explanation });
        return;
      }
    }
    setFeedback({ correct: isCorrect, explanation });
  }

  function handleNext() {
    setFeedback(null);
    if (index + 1 >= questions.length || hearts <= 0) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
    }
  }

  function handleRetry() {
    setQuestions(makeQuestions(slangs));
    setIndex(0);
    setHearts(MAX_HEARTS);
    setCorrect(0);
    setFeedback(null);
    setDone(false);
    setStarted(false);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: G.pageBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", color: G.gray, fontSize: 14 }}>
      슬랭 불러오는 중...
    </div>
  );

  if (!started) return <IntroScreen total={slangs.length} onStart={() => setStarted(true)} />;

  if (done) return <ResultScreen correct={correct} total={index + (feedback && !feedback.correct && hearts <= 0 ? 1 : 0)} onRetry={handleRetry} />;

  const q = questions[index];
  if (!q) return null;

  return (
    <div style={{ minHeight: "100vh", background: G.pageBg, fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ padding: "20px 28px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", padding: 0 }}>✕</button>
          {/* 하트 */}
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <span key={i} style={{ fontSize: 20, filter: i >= hearts ? "grayscale(1) opacity(0.3)" : "none", transition: "filter 0.3s" }}>❤️</span>
            ))}
          </div>
        </div>
        {/* 진행 바 */}
        <div style={{ height: 8, background: "#e5e7eb", borderRadius: 100, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((index + 1) / questions.length) * 100}%`, background: G.accent, borderRadius: 100, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ fontSize: 11, color: G.gray }}>{index + 1} / {questions.length}</div>
          <div style={{ fontSize: 11, color: G.gray }}>
            {q.type === "meaning"
              ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Puzzle size={11} strokeWidth={2} /> 뜻 고르기</span>
              : q.type === "blank"
              ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><PenLine size={11} strokeWidth={2} /> 빈칸 채우기</span>
              : <span style={{ display: "flex", alignItems: "center", gap: 4 }}><ArrowLeftRight size={11} strokeWidth={2} /> 한→영</span>
            }
          </div>
        </div>
      </div>

      {/* 문제 영역 */}
      <div style={{ flex: 1, padding: "8px 28px", paddingBottom: feedback ? 130 : 28, display: "flex", flexDirection: "column" }}>
        {q.type === "meaning" && <MeaningQuestion key={index} card={q.card} allSlangs={slangs} onAnswer={handleAnswer} />}
        {q.type === "blank"   && <BlankQuestion   key={index} card={q.card} allSlangs={slangs} onAnswer={handleAnswer} />}
        {q.type === "ko2en"   && <Ko2EnQuestion   key={index} card={q.card} allSlangs={slangs} onAnswer={handleAnswer} />}
      </div>

      {/* 피드백 바 */}
      {feedback && <FeedbackBar correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />}
    </div>
  );
}
