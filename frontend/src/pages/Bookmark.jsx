import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // SweetAlert2 임포트 확인 필요

const G = {
  black: "#0a0a0a",
  white: "#ffffff",
  bg: "#f3f4f6",
  accent: "#ff4d00",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  cardBg: "#ffffff",
  navy: "#0d1b2a",
};

const BOOKMARKS = [
  { id: 1, word: "Slay", meaning: "완벽하게 해내다, 죽인다", example: "She absolutely slayed that presentation.", tag: "칭찬 / 긍정", emoji: "💅" },
  { id: 2, word: "Ghosted", meaning: "연락을 갑자기 끊다", example: "He ghosted me after our first date.", tag: "연애 / SNS", emoji: "👻" },
  { id: 3, word: "Lowkey", meaning: "은근히, 조용히", example: "I'm lowkey obsessed with this song.", tag: "일상 / 강조", emoji: "✨" },
  { id: 4, word: "Bussin", meaning: "진짜 맛있다, 최고다", example: "This pizza is bussin fr fr.", tag: "음식 / 긍정", emoji: "🍔" },
  { id: 5, word: "No cap", meaning: "진심으로, 거짓말 아님", example: "That was the best day ever, no cap.", tag: "SNS / 일상", emoji: "🔥" },
  { id: 6, word: "Rizz", meaning: "이성을 끄는 매력", example: "Bro has unlimited rizz.", tag: "연애", emoji: "👑" },
];

const CATEGORIES = ["전체", "칭찬 / 긍정", "연애 / SNS", "일상 / 강조", "음식 / 긍정", "SNS / 일상", "연애"];

/* ── SIDEBAR COMPONENT ── */
function Sidebar({ active, setActive }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "인싸", nickname: "인" });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      navigate("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(savedUser);
      setUser({
        name: parsedUser.nickname || parsedUser.name || "인싸",
        nickname: (parsedUser.nickname || parsedUser.name || "경").substring(0, 1)
      });
    } catch (e) {
      console.error("유저 정보 파싱 에러:", e);
    }
  }, [navigate]);

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
        localStorage.removeItem("user");
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1000,
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
    { id: "home",         icon: "🏠", label: "홈",           path: "/dashboard" },
    { id: "bookmark",     icon: "⭐", label: "북마크",        path: "/bookmark" },
    { id: "today",        icon: "🃏", label: "오늘의 학습",    path: "/learning-intro" },
    { id: "practice",     icon: "✍️", label: "연습",           path: "/practice" },
    { id: "conversation", icon: "💬", label: "회화 학습",      path: "/conversation" },
    { id: "community",    icon: "🌐", label: "커뮤니티",        path: "/community" },
    { id: "ai",           icon: "🤖", label: "AI 회화",        path: "/ai-chat" },
    { id: "review",       icon: "🔁", label: "복습",           path: "/review" },
    { id: "progress",     icon: "📊", label: "진도 관리",      path: "/progress" },
  ];

  return (
    <aside style={{
      width: 220, background: G.black, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      padding: "28px 16px", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div onClick={() => navigate("/dashboard")} style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.white, padding: "0 12px", marginBottom: 36, cursor: "pointer" }}>
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

/* ── MAIN BOOKMARK PAGE ── */
export default function Bookmark() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [viewMode, setViewMode] = useState("grid");
  const [flipped, setFlipped] = useState(null);
  const [activeMenu, setActiveMenu] = useState("bookmark"); // 사이드바 활성 메뉴 상태

  const filtered = BOOKMARKS.filter(b => {
    const matchSearch = b.word.toLowerCase().includes(search.toLowerCase()) ||
      b.meaning.includes(search);
    const matchCategory = activeCategory === "전체" || b.tag === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: G.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 교체된 사이드바 */}
      <Sidebar active={activeMenu} setActive={setActiveMenu} />

      {/* 메인 콘텐츠 */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: G.black, margin: 0, fontFamily: "'Unbounded', sans-serif" }}>
              ⭐ 북마크
            </h1>
            <p style={{ fontSize: 13, color: G.gray, margin: "4px 0 0" }}>저장한 표현 {BOOKMARKS.length}개</p>
          </div>
          <button onClick={() => navigate("/card-study")} style={{
            background: G.accent, color: G.white, border: "none",
            padding: "12px 24px", borderRadius: 100, fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
            boxShadow: "0 4px 16px rgba(255,77,0,0.3)",
          }}>북마크로 학습 →</button>
        </div>

        {/* 검색창 */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="저장한 표현 검색... (예: Slay, 은근히)"
            style={{
              width: "100%", padding: "14px 16px 14px 44px", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.08)", background: G.white,
              fontSize: 14, color: G.black, outline: "none", boxSizing: "border-box",
              fontFamily: "'Noto Sans KR', sans-serif",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          />
        </div>

        {/* 필터 및 뷰 토글 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "7px 16px", borderRadius: 100, border: "none", cursor: "pointer",
                background: activeCategory === cat ? G.accent : G.white,
                color: activeCategory === cat ? G.white : G.gray,
                fontSize: 12, fontWeight: 600, fontFamily: "'Noto Sans KR', sans-serif",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)", transition: "all 0.15s",
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, background: G.white, borderRadius: 10, padding: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
            {[{ mode: "grid", icon: "⊞" }, { mode: "list", icon: "☰" }].map(v => (
              <button key={v.mode} onClick={() => setViewMode(v.mode)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: viewMode === v.mode ? G.accent : "transparent",
                color: viewMode === v.mode ? G.white : G.gray,
                fontSize: 16, transition: "all 0.15s",
              }}>{v.icon}</button>
            ))}
          </div>
        </div>

        {/* 결과 리스트 (기존 로직 유지) */}
        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map((b) => (
              <div key={b.id} onClick={() => setFlipped(flipped === b.id ? null : b.id)} style={{ height: 180, cursor: "pointer", perspective: 1000 }}>
                <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: flipped === b.id ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.5s ease" }}>
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: G.white, borderRadius: 20, padding: 24, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "3px 10px", borderRadius: 100 }}>{b.tag}</span>
                      <span>⭐</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: G.black }}>{b.word}</div>
                      <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 8 }}>탭해서 뜻 보기 👆</div>
                    </div>
                  </div>
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: G.navy, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: G.white }}>{b.meaning}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic", lineHeight: 1.7 }}>"{b.example}"</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "right" }}>탭해서 닫기 ←</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(b => (
              <div key={b.id} style={{ background: G.white, borderRadius: 16, padding: "18px 24px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: G.black }}>{b.word}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "2px 10px", borderRadius: 100 }}>{b.tag}</span>
                  </div>
                  <div style={{ fontSize: 13, color: G.gray }}>{b.meaning}</div>
                </div>
                <div style={{ fontSize: 12, color: "#d1d5db", maxWidth: 240, fontStyle: "italic", textAlign: "right" }}>"{b.example}"</div>
                <span>⭐</span>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: G.gray }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>검색 결과가 없어요</div>
          </div>
        )}
      </div>
    </div>
  );
}