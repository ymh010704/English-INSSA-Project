import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 아래부터 컴포넌트
import G from "../constants/colors";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";

/* ── 1. 상단 통계 카드 ── */
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

/* ── 2. 오늘의 학습 카드 (중앙 카드) ── */
function TodayCard({ navigate }) {
  const [flipped, setFlipped] = useState(false);
  const [todayWord, setTodayWord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchToday = async () => {
    try {
      const res = await axios.get('/api/slangs/today-dashboard');
      
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setTodayWord(data);
      
      console.log("오늘의 단어 로딩 완료! No cap! 🃏");
    } catch (e) {
      console.error("오늘의 단어 로딩 실패:", e);
    }
  };
  fetchToday();
}, []);

  return (
    <div style={{
      background: "linear-gradient(135deg, #0d1b2a 0%, #1a2744 100%)",
      borderRadius: 24, padding: 32, flex: 1.2, display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'Noto Sans KR', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>🃏 오늘의 학습</div>
        <div style={{ background: "rgba(255,77,0,0.15)", color: G.accent, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>🔥 Pick</div>
      </div>

      <div onClick={() => setFlipped(!flipped)} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "28px 20px", textAlign: "center", cursor: "pointer", minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {todayWord ? (!flipped ? (
          <>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 38, fontWeight: 900, color: G.white, letterSpacing: -1 }}>{todayWord.word}</div>
            <div style={{ fontSize: 10, color: "rgba(255,204,0,0.7)", letterSpacing: 1, textTransform: "uppercase" }}>{todayWord.category || "SNS / 일상"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>탭해서 뒤집기 👆</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: G.white }}>{todayWord.definition_ko}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>🇪🇳 e.g. : {todayWord.example_en}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>🇰🇷 e.g. : {todayWord.example_ko}</div>
          </>
        )) : <div style={{ color: "#fff" }}>단어를 불러오는 중...</div>}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => navigate("/learning-intro")} style={{ flex: 1, padding: "11px", borderRadius: 12, background: G.accent, color: G.white, border: "none", fontWeight: 700, cursor: "pointer" }}>학습 시작 →</button>
      </div>
    </div>
  );
}

/* ── 3. AI 회화 연습 미리보기 ── */
function AIChatPreview({ navigate }) {
  const msgs = [
    { from: "ai", text: "Hey! Let's practice some slangs today. 😊" },
    { from: "user", text: "I'm ready! What should I say?" },
    { from: "ai", text: "Try using 'no cap' in a sentence! 🔥" },
  ];
  return (
    <div style={{ 
      background: G.white, borderRadius: 24, padding: 28, 
      border: "1px solid rgba(0,0,0,0.05)", flex: 1, display: "flex", 
      flexDirection: "column", gap: 16 
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>🤖 AI 회화 연습</div>
          <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>원어민 친구와 대화 연습</div> 
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: G.green, boxShadow: `0 0 0 3px ${G.green}30` }} />
        </div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 14, background: m.from === "user" ? G.accent : G.lightGray, color: m.from === "user" ? "#fff" : "#000", fontSize: 13 }}>{m.text}</div>
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/ai-chat")} style={{ padding: "10px", borderRadius: 12, background: G.lightGray, border: "none", fontSize: 13, cursor: "pointer" }}>클릭해서 AI 회화 시작하기 →</button>
    </div>
  );
}

/* ── 4. 이번 주 학습 그래프 ── */
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

/* ── 5. 카테고리별 숙련도 ── */
function CategoryProgress() {
  const cats = [
    { label: "SNS / 일상 표현", pct: 72, color: G.accent },
    { label: "감탄 / 리액션", pct: 55, color: G.blue },
    { label: "칭찬 / 긍정", pct: 88, color: G.green },
  ];
  return (
    <div style={{ background: G.white, borderRadius: 24, padding: 28, border: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>🎯 카테고리별 숙련도</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cats.map(c => (
          <div key={c.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span>{c.label}</span><span>{c.pct}%</span>
            </div>
            <div style={{ height: 7, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${c.pct}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 메인 콘텐츠── */
function MainContent({ stats }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("인싸");
  const currentStats = stats || { todayCount: 0, masteredCount: 0, aiCount: 0, streak: 0, xp: 0, accuracy: 0 };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.nickname || user.name || "인싸");
      } catch (e) { console.error(e); }
    }
  }, []);

  return (
    <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto", minHeight: "100vh", background: "#f0ede6" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: G.gray, marginBottom: 4 }}>좋은 하루에요 ☀️</div>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: G.black }}>
            오늘도 한 표현씩, <span style={{ color: G.accent }}>{userName}님!</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: G.white, borderRadius: 14, padding: "10px 18px", fontSize: 14, fontWeight: 700, border: "1px solid rgba(0,0,0,0.05)" }}>
            🔥 <span style={{ color: G.accent }}>{currentStats.streak}일</span> 연속
          </div>
          <div style={{ background: G.white, borderRadius: 14, padding: "10px 18px", fontSize: 14, fontWeight: 700, border: "1px solid rgba(0,0,0,0.05)" }}>
            ⚡ <span style={{ color: G.accent2 }}>{currentStats.xp.toLocaleString()}</span> XP
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}><SearchBar /></div>

      {/* 1. 상단 스탯 카드 */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon="📚" label="오늘 학습한 표현" value={currentStats.todayCount} sub="+2 어제보다" color={G.accent} onClick={() => navigate("/learning-intro")} />
        <StatCard icon="✅" label="완료한 카드" value={currentStats.masteredCount} sub="이번 달" color={G.blue} onClick={() => navigate("/progress")} />
        <StatCard icon="🎯" label="AI 대화 횟수" value={currentStats.aiCount} sub="이번 주" color={G.purple} onClick={() => navigate("/ai-chat")} />
        <StatCard icon="💪" label="평균 정확도" value={`${currentStats.accuracy}%`} sub="↑ 5%" color={G.green} onClick={() => navigate("/progress")} />
      </div>

      {/* 2. 중앙 카드 + AI 프리뷰  */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <TodayCard navigate={navigate} />
        <AIChatPreview navigate={navigate} />
      </div>

      {/* 3. 주간 그래프 + 카테고리 숙련도  */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={{ flex: 1 }}><WeeklyProgress /></div>
        <div style={{ flex: 1 }}><CategoryProgress /></div>
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
    </main>
  );
}

/* ── 대시보드 메인 ── */
export default function Dashboard() {
  const [active, setActive] = useState("home");

  const [stats, setStats] = useState({
    todayCount: 0,
    masteredCount: 0,
    aiCount: 0,
    streak: 0,
    xp: 0,
    accuracy: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');

        const cleanToken = token ? token.trim().replace(/^["']|["']$/g, '') : null;
        if (!cleanToken) return;

        if (!token || token === "undefined") {
          console.error("토큰이 없어서 요청을 보낼 수 없습니다.");
          return;
        }

        const res = await axios.get('http://localhost/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // 서버 응답이 와야만 업데이트 하도록
        if (res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Stats 로딩 실패", err);
      }
    };

    fetchStats();
  }, []);
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
      `}</style>
      
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        
        {/* 2. MainContent는 아래처럼 "단 한 번만" 호출해야 합니다. */}
        {/* stats가 있으면 MainContent를 그리고, 없으면 로딩 화면을 보여줍니다. */}
        {stats ? (
          <MainContent stats={stats} />
        ) : (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", background: "#F3F4F6" }}>
            <p>데이터를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </>
  );
}