import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";

const SCENARIOS = [
  { id: "cafe",   emoji: "☕", label: "카페에서",     desc: "친구랑 카페 얘기",      color: "#92400e", bg: "#fef3c7" },
  { id: "party",  emoji: "🎉", label: "파티에서",     desc: "파티 분위기 대화",      color: "#6d28d9", bg: "#ede9fe" },
  { id: "sns",    emoji: "📱", label: "SNS DM",       desc: "인스타 DM 스타일",      color: "#0369a1", bg: "#e0f2fe" },
  { id: "friend", emoji: "👯", label: "친구 사이",    desc: "편한 일상 대화",        color: "#065f46", bg: "#d1fae5" },
  { id: "work",   emoji: "💼", label: "직장 동료",    desc: "캐주얼한 직장 대화",    color: "#9f1239", bg: "#ffe4e6" },
  { id: "date",   emoji: "💕", label: "썸 타는 중",   desc: "설레는 대화",           color: "#be185d", bg: "#fce7f3" },
];

const SYSTEM_PROMPTS = {
  cafe:   "You are Alex, a friendly native English speaker at a café. Chat casually about coffee, life, etc. Use natural slang. If the user uses slang awkwardly, gently correct them in a friendly way with [💡 Tip: ...]. Keep messages short (2-3 sentences). Respond in English only.",
  party:  "You are Jordan, a fun native speaker at a party. Use party/social slang. If the user uses slang awkwardly, gently correct them with [💡 Tip: ...]. Keep it energetic and short.",
  sns:    "You are Sam, chatting over Instagram DM. Use Gen Z slang and abbreviations. If the user uses slang awkwardly, correct them with [💡 Tip: ...]. Keep messages very short like real DMs.",
  friend: "You are Riley, a close friend. Use casual everyday slang freely. If the user uses slang awkwardly, correct them with [💡 Tip: ...]. Very natural and relaxed tone.",
  work:   "You are Casey, a cool coworker. Use casual workplace slang. If the user uses slang awkwardly, correct them with [💡 Tip: ...]. Keep it friendly but professional-ish.",
  date:   "You are Jamie, someone the user has a crush on. Use sweet, playful slang. If the user uses slang awkwardly, correct them with [💡 Tip: ...]. Flirty and fun tone.",
};

/* ── 애니메이션 캐릭터 ── */
function Avatar({ speaking, scenario }) {
  const colors = {
    cafe: "#f59e0b", party: "#8b5cf6", sns: "#3b82f6",
    friend: "#10b981", work: "#ef4444", date: "#ec4899",
  };
  const c = colors[scenario] || G.accent;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", position: "relative" }}>
      {/* 배경 글로우 */}
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${c}22 0%, transparent 70%)`, animation: "pulse 2s ease-in-out infinite" }} />

      {/* 캐릭터 몸체 */}
      <div style={{ position: "relative", animation: speaking ? "talking 0.3s ease-in-out infinite alternate" : "breathing 3s ease-in-out infinite" }}>

        {/* 머리 */}
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: `linear-gradient(145deg, #f5cba7, #e8a87c)`, margin: "0 auto 0", position: "relative", boxShadow: `0 8px 32px ${c}44` }}>
          {/* 눈 */}
          <div style={{ display: "flex", gap: 24, justifyContent: "center", paddingTop: 38 }}>
            <div style={{ width: 14, height: speaking ? 8 : 14, borderRadius: "50%", background: "#1a1a2e", transition: "height 0.1s" }} />
            <div style={{ width: 14, height: speaking ? 8 : 14, borderRadius: "50%", background: "#1a1a2e", transition: "height 0.1s" }} />
          </div>
          {/* 입 */}
          <div style={{ width: speaking ? 36 : 28, height: speaking ? 18 : 10, borderRadius: speaking ? "0 0 20px 20px" : "50%", background: speaking ? "#c0392b" : "#e07060", margin: "10px auto 0", transition: "all 0.15s" }} />
          {/* 헤드폰 */}
          <div style={{ position: "absolute", top: -8, left: -12, right: -12, height: 60, border: `4px solid ${c}`, borderBottom: "none", borderRadius: "60px 60px 0 0", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 16, left: -18, width: 20, height: 34, borderRadius: 10, background: c }} />
          <div style={{ position: "absolute", top: 16, right: -18, width: 20, height: 34, borderRadius: 10, background: c }} />
        </div>

        {/* 몸 */}
        <div style={{ width: 100, height: 90, background: `linear-gradient(145deg, ${c}, ${c}cc)`, borderRadius: "20px 20px 14px 14px", margin: "-4px auto 0", position: "relative" }}>
          {/* 로고 */}
          <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", fontFamily: "'Unbounded', sans-serif", fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.7)", letterSpacing: 1, whiteSpace: "nowrap" }}>ENGSSA</div>
        </div>

        {/* 팔 */}
        <div style={{ position: "absolute", top: 128, left: -28, width: 28, height: 70, background: `linear-gradient(145deg, ${c}, ${c}cc)`, borderRadius: 14, transformOrigin: "top center", animation: speaking ? "waveArm 0.5s ease-in-out infinite alternate" : "none" }} />
        <div style={{ position: "absolute", top: 128, right: -28, width: 28, height: 70, background: `linear-gradient(145deg, ${c}, ${c}cc)`, borderRadius: 14 }} />
      </div>

      {/* 말풍선 표시 */}
      {speaking && (
        <div style={{ position: "absolute", top: 20, right: "15%", background: G.white, borderRadius: 16, padding: "8px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", display: "flex", gap: 4, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, animation: `dotBounce 0.6s ${i * 0.15}s ease-in-out infinite alternate` }} />
          ))}
        </div>
      )}

      {/* 이름 뱃지 */}
      <div style={{ marginTop: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "6px 20px", backdropFilter: "blur(10px)" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: G.white }}>Alex · 원어민 친구</span>
      </div>

      <style>{`
        @keyframes breathing { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes talking { 0%{transform:translateY(0) rotate(-1deg)} 100%{transform:translateY(-4px) rotate(1deg)} }
        @keyframes waveArm { 0%{transform:rotate(-15deg)} 100%{transform:rotate(15deg)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.1);opacity:1} }
        @keyframes dotBounce { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}

/* ── 시나리오 선택 화면 ── */
function ScenarioSelect({ onSelect }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: G.navy, display: "flex", flexDirection: "column", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'Noto Sans KR', sans-serif" }}>← 대시보드</button>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.white }}>🤖 AI <span style={{ color: G.accent }}>회화</span></div>
        <div style={{ width: 80 }} />
      </div>

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

      {/* 통계 */}
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

      {/* 사용한 슬랭 */}
      {unique.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "22px 28px", marginBottom: 36, width: "100%", maxWidth: 460, textAlign: "left" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>오늘 사용한 표현 🗒️</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {unique.map(w => (
              <span key={w} style={{ background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.3)", color: G.accent, fontSize: 13, fontWeight: 700, padding: "5px 14px", borderRadius: 100 }}>{w}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={onBack} style={{ padding: "14px 28px", borderRadius: 100, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 8px 24px rgba(255,77,0,0.3)" }}>🔄 다시 대화하기</button>
        <button onClick={() => navigate("/dashboard")} style={{ padding: "14px 28px", borderRadius: 100, border: "1.5px solid rgba(255,255,255,0.2)", background: "transparent", color: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>🏠 대시보드로</button>
      </div>
    </div>
  );
}

/* ── 메인 채팅 ── */
export default function AiChat() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startChat(s) {
    setScenario(s);
    setLoading(true);
    const firstMsg = await callAI([], s.id);
    setMessages([{ role: "assistant", content: firstMsg }]);
    setLoading(false);
  }

  async function callAI(history, scenarioId) {
    try {
      // 이제 외부 API가 아닌, 우리 프로젝트의 백엔드로 요청을 보냅니다.
      // Nginx가 /api 경로를 백엔드로 연결해주고 있으므로 주소는 아래와 같습니다.
      const res = await fetch("http://localhost/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          // 백엔드 컨트롤러가 기대하는 형식에 맞춰 데이터를 보냅니다.
          message: history.length > 0 ? history[history.length - 1].content : "Hello!",
          history: history.slice(0, -1).map(h => ({
            role: h.role === "assistant" ? "ai" : "user",
            content: h.content
          })),
          scenario: scenarioId // 시나리오 정보도 함께 전달 가능
        }),
      });

      const data = await res.json();
      
      // 백엔드에서 { reply: "..." } 형식으로 응답하므로 data.reply를 반환합니다.
      if (data.reply) {
        return data.reply;
      } else {
        throw new Error("No reply from server");
      }
    } catch (error) {
      console.error("Frontend Fetch Error:", error);
      return "지금 백엔드 서버랑 연결이 안 됐어.";
    }
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const history = newMessages.map(m => ({ role: m.role, content: m.content }));
    const reply = await callAI(history, scenario.id);
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  if (!scenario) return <ScenarioSelect onSelect={startChat} />;
  if (done) return <SummaryScreen messages={messages} scenario={scenario} onBack={() => { setScenario(null); setMessages([]); setDone(false); }} />;

  // 말풍선 팁 파싱
  function parseMessage(text) {
    const tipMatch = text.match(/\[💡 Tip: (.+?)\]/);
    const cleanText = text.replace(/\[💡 Tip: .+?\]/, "").trim();
    return { cleanText, tip: tipMatch?.[1] };
  }

  return (
    <div style={{ height: "100vh", background: G.navy, display: "flex", flexDirection: "column", fontFamily: "'Noto Sans KR', sans-serif", overflow: "hidden" }}>

      {/* 헤더 */}
      <div style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <button onClick={() => setScenario(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'Noto Sans KR', sans-serif" }}>← 상황 변경</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{scenario.emoji}</span>
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 14, fontWeight: 900, color: G.white }}>{scenario.label}</span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: G.green, boxShadow: `0 0 0 3px ${G.green}33` }} />
        </div>
        <button onClick={() => setDone(true)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "7px 16px", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600 }}>대화 종료</button>
      </div>

      {/* 메인 영역 */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* 왼쪽 캐릭터 */}
        <div style={{ width: 300, flexShrink: 0, background: "rgba(0,0,0,0.2)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            <Avatar speaking={loading} scenario={scenario.id} />
          </div>
          {/* 시나리오 안내 */}
          <div style={{ padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>현재 상황</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{scenario.desc}</div>
            <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>💡 슬랭을 어색하게 쓰면 자동으로 피드백 받아요</div>
          </div>
        </div>

        {/* 오른쪽 채팅 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* 메시지 목록 */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, i) => {
              const isAI = m.role === "assistant";
              const { cleanText, tip } = parseMessage(m.content);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end", gap: 6 }}>
                  {isAI && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 4, fontWeight: 600 }}>Alex</div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "12px 18px",
                    borderRadius: isAI ? "4px 18px 18px 18px" : "18px 18px 4px 18px",
                    background: isAI ? "rgba(255,255,255,0.08)" : G.accent,
                    border: isAI ? "1px solid rgba(255,255,255,0.08)" : "none",
                    color: G.white, fontSize: 14, lineHeight: 1.6,
                    boxShadow: isAI ? "none" : "0 4px 16px rgba(255,77,0,0.3)",

                    /* AI 답변 줄바꿈 스타일 */
                    whiteSpace: "pre-wrap", 
                    wordBreak: "break-word"


                  }}>
                    {cleanText}
                  </div>
                  {/* 피드백 팁 */}
                  {tip && (
                    <div style={{ maxWidth: "75%", display: "flex", gap: 8, background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.25)", borderRadius: 12, padding: "10px 14px" }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                      <div style={{ fontSize: 13, color: G.accent2, lineHeight: 1.6 }}>Tip: {tip}</div>
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px 18px 18px 18px", padding: "14px 20px", display: "flex", gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: `dotBounce 0.6s ${i * 0.15}s ease-in-out infinite alternate` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="영어로 입력해보세요... (슬랭 써도 돼요!)"
                disabled={loading}
                style={{
                  flex: 1, padding: "14px 18px", borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.06)",
                  color: G.white, fontSize: 14, outline: "none",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  backdropFilter: "blur(10px)",
                }}
              />
              <button onClick={send} disabled={!input.trim() || loading} style={{
                width: 48, height: 48, borderRadius: 14, border: "none", flexShrink: 0,
                background: input.trim() && !loading ? G.accent : "rgba(255,255,255,0.1)",
                color: G.white, fontSize: 18, cursor: input.trim() && !loading ? "pointer" : "default",
                transition: "background 0.2s",
                boxShadow: input.trim() && !loading ? "0 4px 16px rgba(255,77,0,0.35)" : "none",
              }}>↑</button>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8, textAlign: "center" }}>
              Enter로 전송 · 어색한 슬랭은 자동 피드백 받아요
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dotBounce { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}