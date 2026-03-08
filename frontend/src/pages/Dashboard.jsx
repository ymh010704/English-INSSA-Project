import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const G = {
  black: "#0a0a0a", white: "#ffffff", cream: "#f5f2eb",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981", blue: "#3b82f6", purple: "#8b5cf6",
};

const SLANG_DATA = [
  { word: "No cap", meaning: "진심으로, 거짓말 아님", category: "SNS / 일상", emoji: "🔥" },
  { word: "It's giving", meaning: "~느낌이야, ~분위기다", category: "Gen Z", emoji: "✨" },
  { word: "Lowkey", meaning: "은근히, 살짝", category: "일상 / 강조", emoji: "🤫" },
  { word: "Slay", meaning: "완전 잘해냈어, 멋지다", category: "칭찬 / 긍정", emoji: "👑" },
  { word: "Vibe check", meaning: "분위기 파악, 상태 확인", category: "SNS / 일상", emoji: "📡" },
  { word: "Ghosted", meaning: "갑자기 연락을 끊다", category: "연애 / SNS", emoji: "👻" },
  { word: "No worries", meaning: "괜찮아, 신경 쓰지 마", category: "일상", emoji: "😌" },
  { word: "Bussin", meaning: "완전 맛있다, 대박이다", category: "음식 / 긍정", emoji: "🤤" },
  { word: "Highkey", meaning: "확실히, 대놓고", category: "일상 / 강조", emoji: "📢" },
  { word: "Periodt", meaning: "딱 잘라 말해서, 끝", category: "Gen Z", emoji: "💅" },
  { word: "Bet", meaning: "알겠어, 좋아", category: "동의 / 긍정", emoji: "🤝" },
  { word: "Stan", meaning: "열렬히 좋아하다, 팬이다", category: "SNS", emoji: "⭐" },
  { word: "Tea", meaning: "가십, 뒷얘기", category: "SNS / 일상", emoji: "☕" },
  { word: "Extra", meaning: "과하다, 오버스럽다", category: "성격 표현", emoji: "💥" },
  { word: "Flex", meaning: "자랑하다, 과시하다", category: "SNS / 일상", emoji: "💪" },
];

/* ── 검색창 ── */
function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState(
    JSON.parse(localStorage.getItem("recentSearch") || "[]")
  );
  const ref = useRef(null);

  const results = query.trim()
    ? SLANG_DATA.filter(s =>
        s.word.toLowerCase().includes(query.toLowerCase()) ||
        s.meaning.includes(query) ||
        s.category.includes(query)
      ).slice(0, 5)
    : [];

  function saveRecent(word) {
    const updated = [word, ...recent.filter(r => r !== word)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("recentSearch", JSON.stringify(updated));
  }

  function handleSelect(word) {
    saveRecent(word);
    setQuery("");
    setFocused(false);
    navigate("/card-study");
  }

  function removeRecent(word, e) {
    e.stopPropagation();
    const updated = recent.filter(r => r !== word);
    setRecent(updated);
    localStorage.setItem("recentSearch", JSON.stringify(updated));
  }

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown = focused && (results.length > 0 || (query === "" && recent.length > 0));

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 800 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#ffffff", borderRadius: 14,
        border: `1.5px solid ${focused ? G.accent : "rgba(0,0,0,0.08)"}`,
        padding: "11px 16px", transition: "border-color 0.2s",
        boxShadow: focused ? "0 4px 20px rgba(255,77,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="슬랭 단어 검색... (예: No cap, 은근히)"
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif", background: "transparent", color: G.black }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, flexShrink: 0 }}>✕</button>
        )}
      </div>

      {/* 드롭다운 */}
      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: "#ffffff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden",
        }}>
          {/* 검색 결과 */}
          {results.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: G.gray, padding: "12px 16px 6px", textTransform: "uppercase" }}>검색 결과</div>
              {results.map(s => (
                <div key={s.word} onClick={() => handleSelect(s.word)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 16px", cursor: "pointer", transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = G.lightGray}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G.black }}>{s.word}</div>
                    <div style={{ fontSize: 12, color: G.gray }}>{s.meaning}</div>
                  </div>
                  <div style={{ fontSize: 10, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "3px 8px", borderRadius: 100, fontWeight: 600, whiteSpace: "nowrap" }}>{s.category}</div>
                </div>
              ))}
            </div>
          )}

          {/* 검색 결과 없음 */}
          {query && results.length === 0 && (
            <div style={{ padding: "20px 16px", textAlign: "center", fontSize: 13, color: G.gray }}>
              '{query}' 검색 결과가 없어요 😅
            </div>
          )}

          {/* 최근 검색어 */}
          {query === "" && recent.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: G.gray, padding: "12px 16px 6px", textTransform: "uppercase" }}>최근 검색어</div>
              {recent.map(r => (
                <div key={r} onClick={() => { setQuery(r); }} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", cursor: "pointer", transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = G.lightGray}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 14, color: G.gray }}>🕐</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: G.black }}>{r}</span>
                  <button onClick={(e) => removeRecent(r, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: G.gray }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── SIDEBAR ── */
function Sidebar({ active, setActive }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "인싸", nickname: "인" });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    
    // 1. 로그인 여부 체크: 정보가 없으면 로그인 페이지로 튕기기
    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser({
        name: parsedUser.nickname || parsedUser.name || "인싸",
        // 아바타에 표시할 첫 글자 추출
        nickname: (parsedUser.nickname || parsedUser.name || "경").substring(0, 1)
      });
    } catch (e) {
      console.error("유저 정보 파싱 에러:", e);
    }
  }, [navigate]);

  // 2. 로그아웃 함수 정의
  const handleLogout = () => {
    Swal.fire({
      title: '로그아웃 하시겠어요?',
      text: "공부한 내용들은 안전하게 저장되어 있어요! 🔥",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: G.accent,
      cancelButtonColor: G.gray,
      confirmButtonText: '네, 나갈래요',
      cancelButtonText: '아니요!',
      background: G.white,
      borderRadius: '20px'
    }).then((result) => {
      if (result.isConfirmed) {
        // 1. 먼저 로컬 스토리지 비우기
        localStorage.removeItem("user");

        // 2. 로그아웃 성공 Toast 띄우기
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1000, // 작별 인사는 조금 더 빠르게!
          timerProgressBar: true,
        });

        Toast.fire({
          icon: 'success',
          title: '다음에 또 만나요~! 👋',
          background: '#ffffff',
          iconColor: G.accent,
        });

        navigate("/");
      }
    });
  };
  const menus = [
    { id: "home",         icon: "🏠", label: "홈",          path: "/dashboard" },
    { id: "bookmark",     icon: "⭐", label: "북마크",        path: "/bookmark" },
    { id: "today",        icon: "🃏", label: "오늘의 학습",   path: "/card-study" },
    { id: "practice",     icon: "✍️", label: "연습",          path: "/practice" },
    { id: "conversation", icon: "💬", label: "회화 학습",     path: "/conversation" },
    { id: "community",    icon: "🌐", label: "커뮤니티",       path: "/community" },
    { id: "ai",           icon: "🤖", label: "AI 회화",       path: "/ai-chat" },
    { id: "review",       icon: "🔁", label: "복습",          path: "/review" },
    { id: "progress",     icon: "📊", label: "진도 관리",     path: "/progress" },
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

      <button onClick={() => navigate("/settings")} style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
        background: "transparent", color: "rgba(255,255,255,0.5)",
        fontSize: 14, fontWeight: 400, fontFamily: "'Noto Sans KR', sans-serif",
        textAlign: "left", width: "100%", marginBottom: 8, transition: "all 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = G.white; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
      >
        <span style={{ fontSize: 18 }}>⚙️</span> 설정
      </button>

      {/* User & Logout Section */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: "50%", background: G.accent, 
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: 14, fontWeight: 700, color: G.white, flexShrink: 0 
          }}>
            {user.nickname}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: G.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Intermediate</div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500, cursor: "pointer",
            transition: "all 0.2s", fontFamily: "'Noto Sans KR', sans-serif"
          }}
          onMouseEnter={e => { e.currentTarget.style.color = G.accent; e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.background = "rgba(255,77,0,0.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "transparent"; }}
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}

/* ── STAT CARD ── */
function StatCard({ icon, label, value, sub, color = G.accent, bg, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: bg || G.white, borderRadius: 20, padding: "24px 26px",
      border: "1px solid rgba(0,0,0,0.05)", flex: 1, minWidth: 0,
      fontFamily: "'Noto Sans KR', sans-serif",
      cursor: onClick ? "pointer" : "default", transition: "transform 0.15s",
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "none")}
    >
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
function TodayCard({ navigate }) {
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
function AIChatPreview({ navigate }) {
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: G.green, boxShadow: `0 0 0 3px ${G.green}30` }} />
        </div>
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
          onClick={() => navigate("/ai-chat")}
          placeholder="클릭해서 AI 회화 시작하기 →"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", background: G.lightGray, cursor: "pointer" }}
          readOnly
        />
        <button onClick={() => navigate("/ai-chat")} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: G.accent, color: G.white, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

/* ── WEEKLY PROGRESS ── */
function WeeklyProgress({ navigate }) {
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
        <div onClick={() => navigate("/progress")} style={{ fontSize: 12, color: G.accent, fontWeight: 700, cursor: "pointer" }}>전체 보기 →</div>
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
function CategoryProgress({ navigate }) {
  const cats = [
    { label: "SNS / 일상 표현", pct: 72, color: G.accent,  icon: "📱" },
    { label: "감탄 / 리액션",   pct: 55, color: G.blue,    icon: "😮" },
    { label: "칭찬 / 긍정",     pct: 88, color: G.green,   icon: "🙌" },
    { label: "완곡 / 거절",     pct: 34, color: G.purple,  icon: "🙅" },
  ];
  return (
    <div style={{ background: G.white, borderRadius: 24, padding: 28, border: "1px solid rgba(0,0,0,0.05)", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: G.black }}>🎯 카테고리별 숙련도</div>
        <div onClick={() => navigate("/progress")} style={{ fontSize: 12, color: G.accent, fontWeight: 700, cursor: "pointer" }}>전체 보기 →</div>
      </div>
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
function RecentSlang({ navigate }) {
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
        <div onClick={() => navigate("/review")} style={{ fontSize: 12, color: G.accent, fontWeight: 700, cursor: "pointer" }}>전체 보기 →</div>
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
  const navigate = useNavigate();
  const [userName, setUserName] = useState("인싸"); // 기본값

  useEffect(() => {
    // 로컬 스토리지에서 유저 정보 가져오기
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.nickname || user.name || "인싸"); // nickname 우선, 없으면 name
      } catch (e) {
        console.error("유저 정보 파싱 에러:", e);
      }
    }
  }, []);

  return (
    <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: G.gray, marginBottom: 4 }}>좋은 하루에요 ☀️</div>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, letterSpacing: -0.8, color: G.black }}>
            오늘도 한 표현씩, <span style={{ color: G.accent }}>{userName}님!</span>
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

      {/* 검색창 */}
      <div style={{ marginBottom: 28 }}>
        <SearchBar />
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon="📚" label="오늘 학습한 표현" value="3" sub="+2 어제보다" color={G.accent} onClick={() => navigate("/card-study")} />
        <StatCard icon="✅" label="완료한 카드" value="48" sub="이번 달" color={G.blue} onClick={() => navigate("/progress")} />
        <StatCard icon="🎯" label="AI 대화 횟수" value="12" sub="이번 주" color={G.purple} onClick={() => navigate("/ai-chat")} />
        <StatCard icon="💪" label="평균 정확도" value="87%" sub="↑ 5%" color={G.green} onClick={() => navigate("/progress")} />
      </div>

      {/* Today + AI */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <TodayCard navigate={navigate} />
        <AIChatPreview navigate={navigate} />
      </div>

      {/* Weekly + Category */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={{ flex: 1 }}><WeeklyProgress navigate={navigate} /></div>
        <div style={{ flex: 1 }}><CategoryProgress navigate={navigate} /></div>
      </div>

      {/* 회화 학습 배너 */}
      <div onClick={() => navigate("/conversation")} style={{
        background: `linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%)`,
        borderRadius: 20, padding: "24px 28px", marginBottom: 20, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "none"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 36 }}>💬</div>
          <div>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: "#ffffff", marginBottom: 4 }}>회화 학습</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>상황별 패턴 · 핵심 표현 · 실전 대화문 · 문법 포인트</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,77,0,1)", color: "#ffffff", fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 100, fontFamily: "'Noto Sans KR', sans-serif", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(255,77,0,0.4)" }}>학습하기 →</div>
      </div>

      {/* 커뮤니티 배너 */}
      <div onClick={() => navigate("/community")} style={{
        background: `linear-gradient(135deg, #4c1d95, #7c3aed)`,
        borderRadius: 20, padding: "24px 28px", marginBottom: 20, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(124,58,237,0.2)", transition: "transform 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "none"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 36 }}>🌐</div>
          <div>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: "#ffffff", marginBottom: 4 }}>커뮤니티</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>새 슬랭 제보 · 좋아요 · 댓글 · 이번 주 핫 랭킹</div>
          </div>
        </div>
        <div style={{ background: "#7c3aed", color: "#ffffff", fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 100, fontFamily: "'Noto Sans KR', sans-serif", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.2)" }}>참여하기 →</div>
      </div>

      {/* Recent Slang */}
      <RecentSlang navigate={navigate} />
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