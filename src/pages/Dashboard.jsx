import { useState } from "react";
import { useNavigate } from "react-router-dom";

const G = {
  black: "#0a0a0a", white: "#ffffff", cream: "#f5f2eb",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981", blue: "#3b82f6", purple: "#8b5cf6",
};

/* ── SIDEBAR ── */
function Sidebar({ active, setActive }) {
  const navigate = useNavigate();
  const menus = [
    { id: "home",     icon: "🏠", label: "홈",          path: "/dashboard" },
    { id: "today",    icon: "🃏", label: "오늘의 학습",  path: "/card-study" },
    { id: "practice", icon: "✍️", label: "연습",         path: "/practice" },
    { id: "ai",       icon: "🤖", label: "AI 회화",      path: "/ai-chat" },
    { id: "review",   icon: "🔁", label: "복습",         path: "/review" },
    { id: "progress", icon: "📊", label: "진도 관리",    path: "/progress" },
  ];
  return (
    <aside style={{
      width: 220, background: G.black, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      padding: "28px 16px", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div onClick={() => navigate("/")} style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.white, padding: "0 12px", marginBottom: 36, cursor: "pointer" }}>
        영어<span style={{ color: G.accent }}>인싸</span>되기
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {menus.map(m => (
          <button key={m.id} onClick={() => { setActive(m.id); if (m.path) navigate(m.path); }} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 12,
            border: "none", cursor: "pointer",
            background: active === m.id ? "rgba(255,77,0,0.12)" : "transparent",
            color: active === m.id ? G.accent : "rgba(255,255,255,0.5)",
            fontSize: 14, fontWeight: active === m.id ? 700 : 400,
            fontFamily: "'Noto Sans KR', sans-serif",
            textAlign: "left", transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 18 }}>{m.icon}</span>
            {m.label}
            {active === m.id && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: G.accent }} />}
          </button>
        ))}
      </nav>
      {/* User */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: G.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: G.white, flexShrink: 0 }}>민</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: G.white }}>김민지</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Intermediate</div>
        </div>
      </div>
    </aside>
  );
}

/* ── STAT CARD ── */
function StatCard({ icon, label, value, sub, color = G.accent, bg }) {
  return (
    <div style={{
      background: bg || G.white, borderRadius: 20, padding: "24px 26px",
      border: "1px solid rgba(0,0,0,0.05)", flex: 1, minWidth: 0,
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        {sub && <div style={{ fontSize: 11, color: G.green, fontWeight: 700, background: "#d1fae5", padding: "3px 9px", borderRadius: 100 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 28, fontWeight: 900, color: G.black, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, color: G.gray }}>{label}</div>
    </div>
  );
}

/* ── TODAY CARD PREVIEW ── */
function TodayCard() {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{
      background: "linear-gradient(135deg, #0d1b2a 0%, #1a2744 100%)",
      borderRadius: 24, padding: 32, flex: 1.2,
      display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'Noto Sans KR', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle,rgba(255,77,0,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>🃏 오늘의 학습</div>
        <div style={{ background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.3)", color: G.accent, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>🔥 Day 14</div>
      </div>

      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          background: "rgba(255,255,255,0.05)", borderRadius: 16,
          padding: "28px 20px", textAlign: "center", cursor: "pointer",
          border: "1px solid rgba(255,255,255,0.07)",
          minHeight: 140, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background 0.2s",
        }}>
        {!flipped ? (
          <>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 38, fontWeight: 900, color: G.white, letterSpacing: -1 }}>No cap</div>
            <div style={{ fontSize: 10, color: "rgba(255,204,0,0.7)", letterSpacing: 1, textTransform: "uppercase" }}>SNS / 일상 표현</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>탭해서 뒤집기 👆</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: G.white, marginBottom: 4 }}>진심으로, 거짓말 아님</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>🇰🇷 한국어로: ㄹㅇ</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6, lineHeight: 1.6 }}>
              "That movie was amazing, <span style={{ color: G.accent, fontWeight: 700 }}>no cap</span>."
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>🔁 다시볼게요</button>
        <button onClick={() => navigate("/card-study")} style={{ flex: 1.6, padding: "11px", borderRadius: 12, border: "none", background: G.accent, color: G.white, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>학습 시작 →</button>
      </div>

      <div style={{ display: "flex", gap: 5 }}>
        {[true, true, false, false, false].map((done, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i === 2 ? G.accent : done ? "rgba(255,77,0,0.4)" : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
    </div>
  );
}

/* ── AI CHAT PREVIEW ── */
function AIChatPreview() {
  const [input, setInput] = useState("");
  const msgs = [
    { from: "ai",   text: "Hey! Let's practice using 'no cap' today. Can you use it in a sentence? 😊" },
    { from: "user", text: "This food is so good, no cap!" },
    { from: "ai",   text: "Perfect use! 🔥 That's exactly right. Try another one?" },
  ];
  return (
    <div style={{
      background: G.white, borderRadius: 24, padding: 28,
      border: "1px solid rgba(0,0,0,0.05)", flex: 1,
      display: "flex", flexDirection: "column", gap: 16,
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: G.black }}>🤖 AI 회화 연습</div>
          <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>원어민 친구와 대화 연습</div>
        </div>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: G.green, boxShadow: `0 0 0 3px ${G.green}30` }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", padding: "10px 14px", borderRadius: m.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.from === "user" ? G.accent : G.lightGray,
              color: m.from === "user" ? G.white : G.black,
              fontSize: 13, lineHeight: 1.5,
            }}>{m.text}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="영어로 입력해보세요..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", background: G.lightGray }}
        />
        <button style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: G.accent, color: G.white, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

/* ── WEEKLY PROGRESS ── */
function WeeklyProgress() {
  const days = [
    { d: "월", done: true,  count: 3 },
    { d: "화", done: true,  count: 5 },
    { d: "수", done: true,  count: 4 },
    { d: "목", done: true,  count: 6 },
    { d: "금", done: false, count: 2 },
    { d: "토", done: false, count: 0 },
    { d: "일", done: false, count: 0, today: true },
  ];
  return (
    <div style={{
      background: G.white, borderRadius: 24, padding: 28,
      border: "1px solid rgba(0,0,0,0.05)",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: G.black }}>📅 이번 주 학습</div>
          <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>4일 연속 학습 중 🔥</div>
        </div>
        <div style={{ fontSize: 12, color: G.accent, fontWeight: 700, cursor: "pointer" }}>전체 보기 →</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        {days.map(d => (
          <div key={d.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: d.count > 0 ? 700 : 400, color: d.count > 0 ? G.black : G.gray }}>{d.count > 0 ? d.count : ""}</div>
            <div style={{
              width: "100%", borderRadius: 8,
              height: d.count ? Math.max(d.count * 10, 20) : 8,
              background: d.today ? G.accent : d.done ? "#fed7aa" : G.lightGray,
              transition: "height 0.3s",
              border: d.today ? `2px solid ${G.accent}` : "none",
            }} />
            <div style={{ fontSize: 11, color: d.today ? G.accent : G.gray, fontWeight: d.today ? 700 : 400 }}>{d.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CATEGORY PROGRESS ── */
function CategoryProgress() {
  const cats = [
    { label: "SNS / 일상 표현", pct: 72, color: G.accent,  icon: "📱" },
    { label: "감탄 / 리액션",   pct: 55, color: G.blue,    icon: "😮" },
    { label: "칭찬 / 긍정",     pct: 88, color: G.green,   icon: "🙌" },
    { label: "완곡 / 거절",     pct: 34, color: G.purple,  icon: "🙅" },
  ];
  return (
    <div style={{ background: G.white, borderRadius: 24, padding: 28, border: "1px solid rgba(0,0,0,0.05)", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: G.black, marginBottom: 4 }}>🎯 카테고리별 숙련도</div>
      <div style={{ fontSize: 12, color: G.gray, marginBottom: 22 }}>더 연습이 필요한 분야를 확인해요</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cats.map(c => (
          <div key={c.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                <span>{c.icon}</span>{c.label}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.pct}%</span>
            </div>
            <div style={{ height: 7, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 100, transition: "width 1s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── RECENT SLANG LIST ── */
function RecentSlang() {
  const list = [
    { word: "Lowkey",      meaning: "은근히, 살짝",    tag: "일상",    know: true  },
    { word: "It's giving", meaning: "~느낌이야",       tag: "Gen Z",   know: true  },
    { word: "Slay",        meaning: "완전 잘해냈어",   tag: "칭찬",    know: false },
    { word: "Vibe check",  meaning: "분위기 파악",     tag: "SNS",     know: true  },
    { word: "No worries",  meaning: "괜찮아, 신경 쓰지 마", tag: "일상", know: false },
  ];
  return (
    <div style={{ background: G.white, borderRadius: 24, padding: 28, border: "1px solid rgba(0,0,0,0.05)", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: G.black }}>📖 최근 학습한 표현</div>
          <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>총 48개 학습 완료</div>
        </div>
        <div style={{ fontSize: 12, color: G.accent, fontWeight: 700, cursor: "pointer" }}>전체 보기 →</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {list.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "11px 14px", borderRadius: 12,
            background: "transparent",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = G.lightGray}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 13, fontWeight: 700, color: G.black, minWidth: 110 }}>{s.word}</div>
            <div style={{ fontSize: 12, color: G.gray, flex: 1 }}>{s.meaning}</div>
            <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, background: G.lightGray, color: G.gray }}>{s.tag}</div>
            <div style={{ fontSize: 16 }}>{s.know ? "✅" : "🔁"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN CONTENT ── */
function MainContent() {
  return (
    <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 13, color: G.gray, marginBottom: 4 }}>좋은 오전이에요 ☀️</div>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, letterSpacing: -0.8, color: G.black }}>
            오늘도 한 표현씩, <span style={{ color: G.accent }}>민지님!</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: G.white, borderRadius: 14, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, border: "1px solid rgba(0,0,0,0.05)" }}>
            🔥 <span style={{ color: G.accent }}>14일</span> 연속
          </div>
          <div style={{ background: G.white, borderRadius: 14, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, border: "1px solid rgba(0,0,0,0.05)" }}>
            ⚡ <span style={{ color: G.accent2 }}>1,240</span> XP
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon="📚" label="오늘 학습한 표현" value="3" sub="+2 어제보다" color={G.accent} />
        <StatCard icon="✅" label="완료한 카드" value="48" sub="이번 달" color={G.blue} />
        <StatCard icon="🎯" label="AI 대화 횟수" value="12" sub="이번 주" color={G.purple} />
        <StatCard icon="💪" label="평균 정확도" value="87%" sub="↑ 5%" color={G.green} />
      </div>

      {/* Today + AI */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <TodayCard />
        <AIChatPreview />
      </div>

      {/* Weekly + Category */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={{ flex: 1 }}><WeeklyProgress /></div>
        <div style={{ flex: 1 }}><CategoryProgress /></div>
      </div>

      {/* Recent Slang */}
      <RecentSlang />
    </main>
  );
}

/* ── APP ── */
export default function Dashboard() {
  const [active, setActive] = useState("home");
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
      `}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar active={active} setActive={setActive} />
        <MainContent />
      </div>
    </>
  );
}