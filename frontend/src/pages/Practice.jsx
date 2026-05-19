import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useBreakpoint from "../hooks/useBreakpoint";
import { PenLine, Trophy, ThumbsUp, Dumbbell, RotateCcw, Home, CheckCircle, XCircle } from "lucide-react";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Skeleton from "../components/Skeleton";
import Mascot from "../components/Mascot";

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const pick    = (arr, n) => shuffle(arr).slice(0, n);

/* ── 결과 화면 ── */
function ResultScreen({ score, total, onRetry }) {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = pct >= 80 ? "완벽해요!" : pct >= 60 ? "잘했어요!" : "조금 더 연습해요";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "24px 16px" : 40, textAlign: "center" }}>
      <Mascot size={isMobile ? 120 : 150} mode={pct >= 60 ? "cheer" : "study"} />
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: G.gray, marginBottom: 10, marginTop: 4 }}>연습 완료!</div>
      <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: isMobile ? 24 : 30, fontWeight: 900, color: G.black, marginBottom: 8, letterSpacing: -1 }}>{grade}</h2>
      <p style={{ fontSize: 15, color: G.gray, marginBottom: 40 }}>{total}문제 중 {score}개 정답 · {pct}%</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Button onClick={onRetry} style={{ padding: "14px 28px", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <RotateCcw size={14} strokeWidth={2} /> 다시 풀기
        </Button>
        <Button variant="secondary" onClick={() => navigate("/dashboard")} style={{ padding: "14px 28px", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Home size={14} strokeWidth={2} /> 대시보드로
        </Button>
      </div>
    </div>
  );
}

/* ── 문장 완성 모드 ── */
function SentenceBuilder({ slangs, onDone }) {
  const { isMobile } = useBreakpoint();

  const [questions] = useState(() => {
    const valid = slangs.filter(s => s.example_en && s.example_ko && s.example_en.trim().split(/\s+/).length >= 4);
    const picked = shuffle(valid).slice(0, Math.min(8, valid.length));
    const pool   = valid.flatMap(s => s.example_en.trim().split(/\s+/));
    return picked.map((s, qi) => {
      const words  = s.example_en.trim().split(/\s+/);
      const decoys = shuffle(pool.filter(w => !words.includes(w))).slice(0, 3);
      const tiles  = shuffle([...words, ...decoys]).map((w, i) => ({ id: `q${qi}_${i}`, text: w }));
      return { word: s.word, korean: s.example_ko, english: s.example_en.trim(), tiles };
    });
  });

  const [idx,       setIdx]       = useState(0);
  const [bank,      setBank]      = useState(() => questions[0]?.tiles ?? []);
  const [answer,    setAnswer]    = useState([]);
  const [checked,   setChecked]   = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score,     setScore]     = useState(0);
  const [mascot,    setMascot]    = useState("study");
  const [dragId,    setDragId]    = useState(null);
  const [dragFrom,  setDragFrom]  = useState(null);

  const q = questions[idx];

  if (!q) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.gray, gap: 12, padding: 24 }}>
      <PenLine size={40} color="#ccc" strokeWidth={1.5} />
      <div style={{ fontSize: 15, textAlign: "center" }}>예문 데이터가 부족해요.<br />슬랭 사전에서 예문을 추가해주세요!</div>
    </div>
  );

  function pickTile(tile)   { if (checked) return; setBank(b => b.filter(t => t.id !== tile.id)); setAnswer(a => [...a, tile]); }
  function returnTile(tile) { if (checked) return; setAnswer(a => a.filter(t => t.id !== tile.id)); setBank(b => [...b, tile]); }

  function onDragStart(e, tile, from) { setDragId(tile.id); setDragFrom(from); e.dataTransfer.effectAllowed = "move"; }
  function onDropAnswer(e) {
    e.preventDefault();
    if (dragFrom === "bank") { const t = bank.find(t => t.id === dragId); if (t) pickTile(t); }
    setDragId(null); setDragFrom(null);
  }
  function onDropAnswerTile(e, target, i) {
    e.preventDefault(); e.stopPropagation();
    if (dragFrom === "bank") {
      const tile = bank.find(t => t.id === dragId); if (!tile) return;
      setBank(b => b.filter(t => t.id !== dragId));
      setAnswer(a => { const n = [...a]; n.splice(i, 0, tile); return n; });
    } else if (dragFrom === "answer" && dragId !== target.id) {
      setAnswer(a => {
        const fi = a.findIndex(t => t.id === dragId), ti = a.findIndex(t => t.id === target.id);
        const n = [...a]; const [m] = n.splice(fi, 1); n.splice(ti, 0, m); return n;
      });
    }
    setDragId(null); setDragFrom(null);
  }
  function onDropBank(e) {
    e.preventDefault();
    if (dragFrom === "answer") { const t = answer.find(t => t.id === dragId); if (t) returnTile(t); }
    setDragId(null); setDragFrom(null);
  }

  function handleCheck() {
    if (!answer.length || checked) return;
    const correct = answer.map(t => t.text).join(" ").toLowerCase() === q.english.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    setMascot(correct ? "cheer" : "dance");
    setScore(s => s + (correct ? 1 : 0));
  }

  function handleNext() {
    const next = idx + 1;
    if (next >= questions.length) { onDone(score, questions.length); return; }
    setIdx(next); setBank(questions[next].tiles);
    setAnswer([]); setChecked(false); setIsCorrect(false); setMascot("study");
  }

  const borderColor = checked ? (isCorrect ? G.green : G.red) : answer.length > 0 ? G.accent : "#d6d0c8";
  const answerBg    = checked ? (isCorrect ? "#f0fdf4" : "#fef2f2") : answer.length > 0 ? "rgba(255,77,0,0.02)" : "#f7f4ef";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "16px 12px 20px" : "36px 24px 24px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 620 }}>

        {/* 뱃지 */}
        <div style={{ marginBottom: 14 }}>
          <span style={{ background: "rgba(255,77,0,0.1)", border: "1px solid rgba(255,77,0,0.2)", color: G.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 16px", borderRadius: 100 }}>
            {q.word} · 문장 완성하기
          </span>
        </div>

        {/* 마스코트 + 말풍선 */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 20 }}>
          <div style={{ flexShrink: 0 }}>
            <Mascot size={isMobile ? 80 : 100} mode={mascot} />
          </div>
          <div style={{ position: "relative", background: G.white, borderRadius: 28, borderBottomLeftRadius: 6, padding: isMobile ? "18px 20px" : "24px 28px", flex: 1, boxShadow: "0 16px 48px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.gray, letterSpacing: 1.5, marginBottom: 10 }}>한국어 문장을 영어로 완성하세요</div>
            <div style={{ fontSize: isMobile ? 16 : 19, fontWeight: 700, color: G.navy, lineHeight: 1.6 }}>{q.korean}</div>
            {/* 말풍선 꼬리 */}
            <div style={{ position: "absolute", bottom: 16, left: -9, width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderRight: "9px solid rgba(0,0,0,0.05)" }} />
            <div style={{ position: "absolute", bottom: 17, left: -7, width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: `8px solid ${G.white}` }} />
          </div>
        </div>

        {/* 답안 드롭존 */}
        <div onDragOver={e => e.preventDefault()} onDrop={onDropAnswer}
          style={{ minHeight: 58, borderRadius: 14, border: `2px dashed ${borderColor}`, background: answerBg, padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8, transition: "all 0.25s" }}>
          {answer.length === 0
            ? <span style={{ fontSize: 13, color: "#bbb5a8", fontStyle: "italic", userSelect: "none" }}>단어를 눌러서 여기에 쌓아보세요</span>
            : answer.map((tile, i) => (
              <div key={tile.id}
                draggable={!checked}
                onDragStart={e => !checked && onDragStart(e, tile, "answer")}
                onDragOver={e => e.preventDefault()}
                onDrop={e => !checked && onDropAnswerTile(e, tile, i)}
                onClick={() => returnTile(tile)}
                style={{ padding: "8px 14px", borderRadius: 10, background: checked ? (isCorrect ? "#dcfce7" : "#fee2e2") : G.navy, color: checked ? (isCorrect ? G.green : G.red) : G.white, fontSize: 14, fontWeight: 700, cursor: checked ? "default" : "pointer", border: `2px solid ${checked ? (isCorrect ? G.green : G.red) : G.navy}`, userSelect: "none", transition: "all 0.2s", boxShadow: checked ? "none" : "0 2px 8px rgba(0,0,0,0.15)", opacity: dragId === tile.id ? 0.4 : 1 }}
              >{tile.text}</div>
            ))}
        </div>

        {/* 해설 */}
        {checked && (
          <div style={{ background: isCorrect ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isCorrect ? "#86efac" : "#fca5a5"}`, borderRadius: 16, padding: "16px 20px", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
            {isCorrect
              ? <CheckCircle size={15} color={G.green} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
              : <XCircle    size={15} color={G.red}   strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: isCorrect ? G.green : G.red, marginBottom: isCorrect ? 0 : 6 }}>{isCorrect ? "정답이에요!" : "틀렸어요! 정답:"}</div>
              {!isCorrect && <div style={{ fontSize: 14, color: G.black, fontWeight: 600 }}>{q.english}</div>}
            </div>
          </div>
        )}

        {/* 단어 뱅크 */}
        <div onDragOver={e => e.preventDefault()} onDrop={onDropBank}
          style={{ background: "#ede8e0", borderRadius: 18, padding: "14px 12px", display: "flex", flexWrap: "wrap", gap: 8, minHeight: 56, marginBottom: 20, alignContent: "flex-start" }}>
          {bank.length === 0 && !checked && <span style={{ fontSize: 13, color: "#bbb5a8", fontStyle: "italic" }}>모든 단어를 사용했어요</span>}
          {bank.map(tile => (
            <div key={tile.id}
              draggable={!checked}
              onDragStart={e => !checked && onDragStart(e, tile, "bank")}
              onClick={() => pickTile(tile)}
              style={{ padding: "8px 14px", borderRadius: 10, background: G.white, border: "2px solid #c8c2b8", color: checked ? "#aaa" : G.black, fontSize: 14, fontWeight: 600, cursor: checked ? "default" : "pointer", userSelect: "none", transition: "all 0.15s", boxShadow: "0 2px 4px rgba(0,0,0,0.06)", opacity: (checked || dragId === tile.id) ? 0.45 : 1 }}
              onMouseEnter={e => { if (!checked) { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.color = G.accent; e.currentTarget.style.background = "rgba(255,77,0,0.04)"; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#c8c2b8"; e.currentTarget.style.color = G.black; e.currentTarget.style.background = G.white; }}
            >{tile.text}</div>
          ))}
        </div>

        {/* 버튼 */}
        <div style={{ display: "flex", gap: 12 }}>
          {!checked
            ? <Button onClick={handleCheck} disabled={!answer.length} style={{ flex: 1, borderRadius: 20, padding: "18px", fontSize: 15, ...(!answer.length && { background: "#e5e0d8", color: G.gray, boxShadow: "none", opacity: 1 }) }}>
                정답 확인
              </Button>
            : <Button onClick={handleNext} style={{ flex: 1, borderRadius: 20, padding: "18px", fontSize: 15, background: G.black, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {idx + 1 >= questions.length ? <><Trophy size={15} strokeWidth={2} /> 결과 보기</> : "다음 문제 →"}
              </Button>}
        </div>

        {/* 진행 점 */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 28 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ width: i === idx ? 28 : 8, height: 8, borderRadius: 4, background: i < idx ? "rgba(255,77,0,0.35)" : i === idx ? G.accent : "#d6d0c8", transition: "all 0.3s ease" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 단어 매칭 모드 ── */
function WordMatch({ slangs, onDone }) {
  const { isMobile } = useBreakpoint();
  const ROUNDS = 3, PAIRS = 4;
  const scoreRef = useRef(0);
  const roundRef = useRef(0);
  const wrongTimer = useRef(null);

  function shortenKo(str) {
    // 첫 번째 온점·쉼표 앞까지 or 최대 14자
    const cut = str.replace(/\(.*?\)/g, "").trim();
    const stop = cut.search(/[.,·]/);
    const short = stop > 0 && stop < 18 ? cut.slice(0, stop) : cut;
    return short.length > 14 ? short.slice(0, 14) + "…" : short;
  }

  function genRound() {
    const picked = pick(slangs, PAIRS);
    return {
      left:  picked.map(s => ({ id: s.slang_id, text: shortenKo(s.definition_ko) })),
      right: shuffle(picked.map(s => ({ id: s.slang_id, text: s.word }))),
    };
  }

  const [round,     setRound]     = useState(0);
  const [roundData, setRoundData] = useState(() => genRound());
  const [selLeft,   setSelLeft]   = useState(null);
  const [selRight,  setSelRight]  = useState(null);
  const [matched,   setMatched]   = useState([]);
  const [wrong,     setWrong]     = useState(null);
  const [mascot,    setMascot]    = useState("study");

  useEffect(() => {
    if (matched.length > 0 && matched.length >= PAIRS) {
      const t = setTimeout(() => {
        if (roundRef.current + 1 >= ROUNDS) {
          onDone(scoreRef.current, ROUNDS * PAIRS);
        } else {
          roundRef.current += 1;
          setRound(roundRef.current);
          setRoundData(genRound());
          setMatched([]); setSelLeft(null); setSelRight(null); setMascot("study");
        }
      }, 700);
      return () => clearTimeout(t);
    }
  }, [matched.length]);

  function doCheck(leftId, rightId) {
    if (leftId === rightId) {
      setMatched(m => [...m, leftId]);
      setSelLeft(null); setSelRight(null);
      setMascot("cheer");
      scoreRef.current += 1;
      setTimeout(() => setMascot("study"), 800);
    } else {
      setWrong({ left: leftId, right: rightId });
      setMascot("dance");
      clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => {
        setWrong(null); setSelLeft(null); setSelRight(null); setMascot("study");
      }, 700);
    }
  }

  function handleLeft(id) {
    if (matched.includes(id) || wrong) return;
    if (selLeft === id) { setSelLeft(null); return; }
    setSelLeft(id);
    if (selRight !== null) doCheck(id, selRight);
  }
  function handleRight(id) {
    if (matched.includes(id) || wrong) return;
    if (selRight === id) { setSelRight(null); return; }
    setSelRight(id);
    if (selLeft !== null) doCheck(selLeft, id);
  }

  function tileStyle(id, side) {
    const isMatched = matched.includes(id);
    const isSel     = side === "left" ? selLeft === id : selRight === id;
    const isWrong   = wrong && (side === "left" ? wrong.left === id : wrong.right === id);
    if (isMatched) return { bg: "#f0fdf4", border: G.green,  color: G.green  };
    if (isWrong)   return { bg: "#fef2f2", border: G.red,    color: G.red    };
    if (isSel)     return { bg: "rgba(255,77,0,0.06)", border: G.accent, color: G.accent };
    return           { bg: G.white,  border: "#e5e0d8", color: G.black  };
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: isMobile ? "16px 12px" : "24px 24px", maxWidth: 680, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

      {/* 진행 바 */}
      <div style={{ height: 5, background: "#e5e0d8", borderRadius: 3, marginBottom: 20, flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${(round / ROUNDS) * 100}%`, background: G.accent, borderRadius: 3, transition: "width 0.5s" }} />
      </div>

      {/* 마스코트 + 말풍선 */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 24 }}>
        <div style={{ flexShrink: 0 }}>
          <Mascot size={isMobile ? 80 : 100} mode={mascot} />
        </div>
        <div style={{ position: "relative", background: G.white, borderRadius: 28, borderBottomLeftRadius: 6, padding: isMobile ? "18px 20px" : "24px 28px", flex: 1, boxShadow: "0 16px 48px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: G.gray, letterSpacing: 1.5, marginBottom: 10 }}>라운드 {round + 1} / {ROUNDS}</div>
          <div style={{ fontSize: isMobile ? 16 : 19, fontWeight: 700, color: G.navy, lineHeight: 1.5 }}>의미가 일치하는 단어끼리 짝을 지으세요</div>
          <div style={{ position: "absolute", bottom: 16, left: -9, width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderRight: "9px solid rgba(0,0,0,0.05)" }} />
          <div style={{ position: "absolute", bottom: 17, left: -7, width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: `8px solid ${G.white}` }} />
        </div>
      </div>

      {/* 매칭 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {roundData.left.map(item => {
            const s = tileStyle(item.id, "left");
            return (
              <button key={item.id} onClick={() => handleLeft(item.id)} disabled={matched.includes(item.id)}
                style={{ flex: 1, minHeight: isMobile ? 62 : 72, padding: "10px 12px", borderRadius: 14, background: s.bg, border: `2px solid ${s.border}`, color: s.color, fontSize: isMobile ? 12 : 13, fontWeight: 600, cursor: matched.includes(item.id) ? "default" : "pointer", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.2s", lineHeight: 1.4, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {item.text}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {roundData.right.map(item => {
            const s = tileStyle(item.id, "right");
            return (
              <button key={item.id} onClick={() => handleRight(item.id)} disabled={matched.includes(item.id)}
                style={{ flex: 1, minHeight: isMobile ? 62 : 72, padding: "10px 12px", borderRadius: 14, background: s.bg, border: `2px solid ${s.border}`, color: s.color, fontSize: isMobile ? 13 : 15, fontWeight: 800, cursor: matched.includes(item.id) ? "default" : "pointer", fontFamily: "'Unbounded', sans-serif", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: G.gray }}>
        맞춘 쌍: <span style={{ color: G.green, fontWeight: 700 }}>{scoreRef.current}</span> / {ROUNDS * PAIRS}
      </div>
    </div>
  );
}

/* ── 메인 ── */
export default function Practice() {
  const { isMobile } = useBreakpoint();
  const [slangs,  setSlangs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode]                = useState(() => Math.random() > 0.5 ? "sentence" : "match");
  const [result,  setResult]  = useState(null);
  const [key,     setKey]     = useState(0);

  useEffect(() => {
    fetch("/api/slangs")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setSlangs(list);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleDone(score, total) { setResult({ score, total }); }
  function retry() { setResult(null); setKey(k => k + 1); }

  const modeLabel = mode === "sentence" ? "문장 완성하기" : "단어 매칭";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: G.pageBg, fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>
        <PageHeader title="연습" icon={PenLine} noSeparator />
        <div style={{ height: 5, background: "#e5e0d8" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, padding: isMobile ? "16px 12px" : "24px 24px", maxWidth: 680, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <Skeleton width={isMobile ? 72 : 90} height={isMobile ? 80 : 100} radius={12} />
            <Skeleton width="100%" height={isMobile ? 80 : 100} radius={20} />
          </div>
          <Skeleton width="100%" height={64} radius={14} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} width={72} height={40} radius={10} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: G.pageBg, fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>
      <PageHeader
        title={result ? "연습 완료" : modeLabel}
        icon={PenLine}
        right={!result ? <span style={{ fontSize: 13, fontWeight: 700, color: G.gray }}>{modeLabel}</span> : null}
        noSeparator
      />
      <div style={{ height: 5, background: "#e5e0d8", flexShrink: 0 }} />

      {result
        ? <ResultScreen score={result.score} total={result.total} onRetry={retry} />
        : mode === "sentence"
        ? <SentenceBuilder key={key} slangs={slangs} onDone={handleDone} />
        : <WordMatch       key={key} slangs={slangs} onDone={handleDone} />}
    </div>
  );
}
