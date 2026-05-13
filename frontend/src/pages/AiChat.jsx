import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import RemyAvatar from "../components/RemyAvatar";

const SCENARIOS = [
  { id: "cafe",    emoji: "☕", label: "카페에서",     desc: "친구랑 카페 얘기",      color: "#92400e", bg: "#fef3c7" },
  { id: "party",   emoji: "🎉", label: "파티에서",     desc: "파티 분위기 대화",      color: "#6d28d9", bg: "#ede9fe" },
  { id: "sns",     emoji: "📱", label: "SNS DM",       desc: "인스타 DM 스타일",      color: "#0369a1", bg: "#e0f2fe" },
  { id: "friend",  emoji: "👯", label: "친구 사이",     desc: "편한 일상 대화",        color: "#065f46", bg: "#d1fae5" },
  { id: "work",    emoji: "💼", label: "직장 동료",     desc: "캐주얼한 직장 대화",    color: "#9f1239", bg: "#ffe4e6" },
  { id: "date",    emoji: "💕", label: "썸 타는 중",    desc: "설레는 대화",           color: "#be185d", bg: "#fce7f3" },
];

/* ── 애니메이션 캐릭터 ── */
function Avatar({ speaking, scenario }) {
  const colors = {
    cafe: "#f59e0b", party: "#8b5cf6", sns: "#3b82f6",
    friend: "#10b981", work: "#ef4444", date: "#ec4899",
  };
  const c = colors[scenario] || G.accent;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", position: "relative" }}>
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${c}22 0%, transparent 70%)`, animation: "pulse 2s ease-in-out infinite" }} />
      <div style={{ position: "relative", animation: speaking ? "talking 0.3s ease-in-out infinite alternate" : "breathing 3s ease-in-out infinite" }}>
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: `linear-gradient(145deg, #f5cba7, #e8a87c)`, margin: "0 auto 0", position: "relative", boxShadow: `0 8px 32px ${c}44` }}>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", paddingTop: 38 }}>
            <div style={{ width: 14, height: speaking ? 8 : 14, borderRadius: "50%", background: "#1a1a2e", transition: "height 0.1s" }} />
            <div style={{ width: 14, height: speaking ? 8 : 14, borderRadius: "50%", background: "#1a1a2e", transition: "height 0.1s" }} />
          </div>
          <div style={{ width: speaking ? 36 : 28, height: speaking ? 18 : 10, borderRadius: speaking ? "0 0 20px 20px" : "50%", background: speaking ? "#c0392b" : "#e07060", margin: "10px auto 0", transition: "all 0.15s" }} />
          <div style={{ position: "absolute", top: -8, left: -12, right: -12, height: 60, border: `4px solid ${c}`, borderBottom: "none", borderRadius: "60px 60px 0 0", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 16, left: -18, width: 20, height: 34, borderRadius: 10, background: c }} />
          <div style={{ position: "absolute", top: 16, right: -18, width: 20, height: 34, borderRadius: 10, background: c }} />
        </div>
        <div style={{ width: 100, height: 90, background: `linear-gradient(145deg, ${c}, ${c}cc)`, borderRadius: "20px 20px 14px 14px", margin: "-4px auto 0", position: "relative" }}>
          <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", fontFamily: "'Unbounded', sans-serif", fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.7)", letterSpacing: 1, whiteSpace: "nowrap" }}>ENGSSA</div>
        </div>
      </div>
      {speaking && (
        <div style={{ position: "absolute", top: 20, right: "15%", background: G.white, borderRadius: 16, padding: "8px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", display: "flex", gap: 4, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, animation: `dotBounce 0.6s ${i * 0.15}s ease-in-out infinite alternate` }} />
          ))}
        </div>
      )}
      <div style={{ marginTop: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "6px 20px", backdropFilter: "blur(10px)" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: G.white }}>Alex · 원어민 친구</span>
      </div>
      <style>{`
        @keyframes breathing { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes talking { 0%{transform:translateY(0) rotate(-1deg)} 100%{transform:translateY(-4px) rotate(1deg)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.1);opacity:1} }
        @keyframes dotBounce { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}

/* ── 시나리오 선택 화면 ── */
function ScenarioSelect({ onSelect }) {
  return (
    <div style={{ minHeight: "100vh", background: G.navy, display: "flex", flexDirection: "column", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <PageHeader title="AI 회화" emoji="🤖" dark />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>상황 선택</div>
        <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 900, color: G.white, letterSpacing: -1, marginBottom: 10, textAlign: "center", lineHeight: 1.2 }}>
          어떤 상황에서<br /><span style={{ color: G.accent }}>대화할까요?</span>
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 48, fontWeight: 300 }}>상황에 맞는 슬랭을 자연스럽게 연습해요</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, width: "100%", maxWidth: 640 }}>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => onSelect(s)} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: "24px 16px", cursor: "pointer", textAlign: "center",
              transition: "all 0.2s", fontFamily: "'Noto Sans KR', sans-serif",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{s.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: G.white, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 대화 요약 화면 ── */
function SummaryScreen({ messages, scenario, onBack }) {
  const navigate = useNavigate();
  const slangUsed = messages
    .filter(m => m.role === "user")
    .flatMap(m => {
      const words = ["no cap", "lowkey", "slay", "it's giving", "vibe check", "fr", "ngl", "tbh", "bussin", "lit", "bet", "periodt", "highkey", "ghosted"];
      return words.filter(w => m.content.toLowerCase().includes(w));
    });
  const unique = [...new Set(slangUsed)];

  return (
    <div style={{ minHeight: "100vh", background: G.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif", padding: 40, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,77,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>대화 완료!</div>
      <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 900, color: G.white, lineHeight: 1.2, letterSpacing: -1, marginBottom: 36 }}>
        오늘도 <span style={{ color: G.accent }}>원어민처럼</span> 했어요!
      </h1>
      <div style={{ display: "flex", gap: 14, marginBottom: 36, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "주고받은 대화", value: `${messages.filter(m => m.role === "user").length}회`, color: G.accent },
          { label: "사용한 슬랭", value: `${unique.length}개`, color: G.green },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "20px 28px" }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Button onClick={onBack}>🔄 다시 대화하기</Button>
        <Button variant="secondary" onClick={() => navigate("/dashboard")} style={{ color: G.white, border: "1.5px solid rgba(255,255,255,0.2)" }}>🏠 대시보드로</Button>
      </div>
    </div>
  );
}

// ── 음성 유틸 (나중에 외부 API로 교체 시 이 함수만 수정) ──
function speakEnglish(text, onStart, onEnd) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.9;
  utter.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const enVoice =
    voices.find(v => v.lang.startsWith("en") && v.name.includes("Male")) ||
    voices.find(v => v.lang.startsWith("en") && v.name.includes("David")) ||
    voices.find(v => v.lang.startsWith("en") && v.name.includes("Mark")) ||
    voices.find(v => v.lang === "en-US");
  if (enVoice) utter.voice = enVoice;
  // 크롬 버그: 15초 후 자동 중단 → 10초마다 pause/resume으로 방지
  const keepAlive = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearInterval(keepAlive);
    }
  }, 10000);

  utter.onstart = onStart;
  utter.onend = () => { clearInterval(keepAlive); onEnd(); };
  utter.onerror = () => { clearInterval(keepAlive); onEnd(); };
  window.speechSynthesis.speak(utter);
}

function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

function createSTT(onResult, onEnd) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "en-US";
  r.continuous = false;
  r.interimResults = true;
  r.onresult = (e) => {
    const text = Array.from(e.results).map(x => x[0].transcript).join("");
    onResult(text, e.results[e.results.length - 1].isFinal);
  };
  r.onend = onEnd;
  r.onerror = onEnd;
  return r;
}

function extractSpeakText(text) {
  return text.replace(/\[💡 Tip: .+?\]/s, "").replace(/\[KR: .+?\]/s, "").trim();
}

/* ── 메인 채팅 화면 ── */
export default function AiChat() {
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showKr, setShowKr] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // AI 메시지 도착 시 자동 TTS
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      const text = extractSpeakText(last.content);
      speakEnglish(text, () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  }, [messages]);

  function replayTTS(content) {
    const text = extractSpeakText(content);
    speakEnglish(text, () => setIsSpeaking(true), () => setIsSpeaking(false));
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    stopSpeaking();
    setIsSpeaking(false);
    const r = createSTT(
      (text, isFinal) => { setInput(text); if (isFinal) recognitionRef.current?.stop(); },
      () => setIsListening(false)
    );
    if (!r) { alert("이 브라우저는 음성 인식을 지원하지 않아요. Chrome을 사용해주세요."); return; }
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  }

  async function startChat(s) {
    setScenario(s);
    setLoading(true);
    const firstMsg = await callAI([], s.id);
    setMessages([{ role: "assistant", content: firstMsg }]);
    setLoading(false);
  }

  async function callAI(history, scenarioId) {
    try {
      const message = history.length > 0 ? history[history.length - 1].content : "";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: history.slice(0, -1).map(h => ({
            role: h.role === "assistant" ? "ai" : "user",
            content: h.content
          })),
          scenario: scenarioId,
        }),
      });

      const data = await res.json();
      if (data.reply) return data.reply;
      throw new Error("No reply from server");
    } catch (error) {
      console.error("Frontend Fetch Error:", error);
      return "지금 백엔드 서버랑 연결이 안 됐어. API 키 설정을 확인해봐!";
    }
  }

  async function send() {
    if (!input.trim() || loading) return;
    stopSpeaking();
    setIsSpeaking(false);
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const reply = await callAI(newMessages, scenario.id);
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  if (!scenario) return <ScenarioSelect onSelect={startChat} />;
  if (done) return <SummaryScreen messages={messages} scenario={scenario} onBack={() => { setScenario(null); setMessages([]); setDone(false); }} />;

  function parseMessage(text) {
    const tipMatch = text.match(/\[💡 Tip: (.+?)\]/s);
    const krMatch = text.match(/\[KR: (.+?)\]/s);
    const cleanText = text
      .replace(/\[💡 Tip: .+?\]/s, "")
      .replace(/\[KR: .+?\]/s, "")
      .trim();
    return { cleanText, tip: tipMatch?.[1], kr: krMatch?.[1] };
  }

  return (
    <div style={{ height: "100vh", background: G.navy, display: "flex", flexDirection: "column", fontFamily: "'Noto Sans KR', sans-serif", overflow: "hidden" }}>
      <div style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <Button variant="ghost" onClick={() => setScenario(null)} style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>← 상황 변경</Button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{scenario.emoji}</span>
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 14, fontWeight: 900, color: G.white }}>{scenario.label}</span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: G.green, boxShadow: `0 0 0 3px ${G.green}33` }} />
        </div>
        <Button variant="secondary" onClick={() => setDone(true)} size="sm" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>대화 종료</Button>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: 840, flexShrink: 0, background: "rgba(0,0,0,0.2)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <RemyAvatar speaking={loading || isSpeaking} accentColor={scenario.color} />
          </div>
          <div style={{ padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>현재 상황</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{scenario.desc}</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, i) => {
              const isAI = m.role === "assistant";
              const { cleanText, tip, kr } = parseMessage(m.content);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end", gap: 6 }}>
                  {isAI && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 4 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>Alex</span>
                      <button onClick={() => replayTTS(m.content)} title="다시 듣기" style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.3)", padding: 0, lineHeight: 1,
                        display: "flex", alignItems: "center",
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "12px 18px",
                    borderRadius: isAI ? "4px 18px 18px 18px" : "18px 18px 4px 18px",
                    background: isAI ? "rgba(255,255,255,0.08)" : G.accent,
                    color: G.white, fontSize: 14, lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    boxShadow: isAI ? "none" : "0 4px 16px rgba(255,77,0,0.3)",
                  }}>
                    {cleanText}
                  </div>
                  {isAI && kr && (
                    <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 4 }}>
                      <button
                        onClick={() => setShowKr(prev => ({ ...prev, [i]: !prev[i] }))}
                        style={{
                          alignSelf: "flex-start", background: "none", border: "none",
                          cursor: "pointer", fontSize: 11, color: "rgba(255,255,255,0.35)",
                          padding: "2px 4px", fontFamily: "'Noto Sans KR', sans-serif",
                        }}
                      >
                        {showKr[i] ? "번역 숨기기 ▲" : "번역 보기 ▼"}
                      </button>
                      {showKr[i] && (
                        <div style={{
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12, padding: "10px 14px", fontSize: 13,
                          color: "rgba(255,255,255,0.55)", lineHeight: 1.6,
                        }}>
                          {kr}
                        </div>
                      )}
                    </div>
                  )}
                  {tip && (
                    <div style={{ maxWidth: "75%", display: "flex", gap: 8, background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.25)", borderRadius: 12, padding: "10px 14px" }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                      <div style={{ fontSize: 13, color: "#f59e0b", lineHeight: 1.6 }}>Tip: {tip}</div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
            {isListening && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 12, color: "#ef4444" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1s infinite" }} />
                음성 인식 중... 영어로 말해보세요
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <button onClick={toggleListening} title="음성 입력" style={{
                width: 48, height: 48, borderRadius: 14, border: "none", flexShrink: 0,
                background: isListening ? "#ef4444" : "rgba(255,255,255,0.1)",
                color: G.white, cursor: "pointer",
                boxShadow: isListening ? "0 0 12px rgba(239,68,68,0.5)" : "none",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="9" y1="22" x2="15" y2="22" />
                </svg>
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder={isListening ? "음성 인식 중..." : "영어로 입력하거나 마이크 버튼을 눌러보세요"}
                disabled={loading}
                style={{
                  flex: 1, padding: "14px 18px", borderRadius: 16,
                  border: `1px solid ${isListening ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                  background: "rgba(255,255,255,0.06)",
                  color: G.white, fontSize: 14, outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
              <button onClick={send} disabled={!input.trim() || loading} style={{
                width: 48, height: 48, borderRadius: 14, border: "none", flexShrink: 0,
                background: input.trim() && !loading ? G.accent : "rgba(255,255,255,0.1)",
                color: G.white, fontSize: 18, cursor: input.trim() && !loading ? "pointer" : "default",
              }}>↑</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}