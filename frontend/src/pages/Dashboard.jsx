import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BookOpen, CheckCircle, Target, Percent, Globe, Flame, Zap, Calendar, Bot, Smartphone, Bookmark as BookmarkIcon, PartyPopper, Sun } from "lucide-react";

import G from "../constants/colors";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import useBreakpoint from "../hooks/useBreakpoint";

/* ── 1. 상단 통계 카드 ── */
function StatCard({ icon: Icon, label, value, sub, color = G.accent, bg, onClick }) {
  const { isMobile } = useBreakpoint();
  return (
    <div onClick={onClick} style={{
      background: bg || G.white, borderRadius: 16, padding: isMobile ? "16px" : "24px 26px",
      border: "1px solid rgba(0,0,0,0.05)", minWidth: 0,
      fontFamily: "'Noto Sans KR', sans-serif",
      cursor: onClick ? "pointer" : "default", transition: "transform 0.15s",
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "none")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isMobile ? 8 : 14 }}>
        <div style={{ width: isMobile ? 34 : 44, height: isMobile ? 34 : 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={isMobile ? 17 : 22} color={color} strokeWidth={1.8} />
        </div>
        {sub && !isMobile && <div style={{ fontSize: 11, color: G.green, fontWeight: 700, background: "#d1fae5", padding: "3px 9px", borderRadius: 100 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: isMobile ? 20 : 28, fontWeight: 900, color: G.black, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: isMobile ? 11 : 13, color: G.gray }}>{label}</div>
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
      borderRadius: 24, padding: 32, flex: 1, display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'Noto Sans KR', sans-serif", position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>오늘의 학습</div>
        <div style={{ background: "rgba(255,77,0,0.15)", color: G.accent, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, display: "flex", alignItems: "center", gap: 4 }}><Flame size={10} strokeWidth={2} /> Pick</div>
      </div>

      <div onClick={() => setFlipped(!flipped)} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "28px 20px", textAlign: "center", cursor: "pointer", minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {todayWord ? (!flipped ? (
          <>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 38, fontWeight: 900, color: G.white, letterSpacing: -1 }}>{todayWord.word}</div>
            <div style={{ fontSize: 10, color: "rgba(255,204,0,0.7)", letterSpacing: 1, textTransform: "uppercase" }}>{todayWord.category || "SNS / 일상"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>탭해서 뒤집기</div>
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
          <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Bot size={14} color={G.black} strokeWidth={2} /> AI 회화 연습</div>
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
      flex: 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: G.black, display: "flex", alignItems: "center", gap: 6 }}><Calendar size={14} color={G.black} strokeWidth={2} /> 이번 주 학습</div>
          <div style={{ fontSize: 12, color: G.gray, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>4일 연속 학습 중 <Flame size={11} color={G.accent} strokeWidth={2} /></div>
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

/* ── 5. AI 회화 한 마디 ── */
const DAILY_SENTENCES = [
  { kr: "야 그거 완전 레전드였어, 진심으로!", en: "Bro that was legendary, no cap!", slang: "no cap" },
  { kr: "걔 완전 나 무시하고 연락 끊었어.", en: "She totally ghosted me.", slang: "ghosted" },
  { kr: "오늘 코디 완전 찢었다!", en: "You totally slayed today's outfit!", slang: "slayed" },
  { kr: "그 사람 매력이 넘쳐흘러.", en: "That person has so much rizz.", slang: "rizz" },
  { kr: "나 요즘 그 노래에 완전 꽂혔어.", en: "I'm lowkey obsessed with that song.", slang: "lowkey" },
  { kr: "솔직히 그 영화 별로였어.", en: "Ngl, that movie was mid.", slang: "ngl / mid" },
  { kr: "완전 내 스타일이야, 딱이야!", en: "It's giving exactly my vibe!", slang: "it's giving" },
  { kr: "알겠어, 그렇게 하자!", en: "Bet, let's do it!", slang: "bet" },
];

function AIChatChallenge({ navigate }) {
  const [revealed, setRevealed] = useState(false);
  const sentence = DAILY_SENTENCES[new Date().getDay() % DAILY_SENTENCES.length];

  return (
    <div style={{ background: G.white, borderRadius: 24, padding: 28, border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>이 문장, 슬랭으로 말할 수 있나요?</div>
        <div onClick={() => navigate("/ai-chat")} style={{ fontSize: 12, color: G.accent, fontWeight: 700, cursor: "pointer" }}>연습하기 →</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{
          background: "linear-gradient(135deg, #0d1b2a, #1a2744)",
          borderRadius: 16, padding: "24px 20px", flex: 1,
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 10,
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,204,0,0.6)", fontWeight: 700, letterSpacing: 1 }}>한국어</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: G.white, lineHeight: 1.5 }}>{sentence.kr}</div>
          {revealed && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
              <div style={{ fontSize: 11, color: "rgba(100,200,100,0.8)", fontWeight: 700, letterSpacing: 1 }}>슬랭 영어</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#7ee8a2", lineHeight: 1.5 }}>{sentence.en}</div>
              <div style={{ background: "rgba(255,77,0,0.15)", borderRadius: 8, padding: "6px 12px", width: "fit-content" }}>
                <span style={{ fontSize: 11, color: G.accent, fontWeight: 700 }}>핵심 슬랭: {sentence.slang}</span>
              </div>
            </>
          )}
        </div>

        {!revealed ? (
          <button onClick={() => setRevealed(true)} style={{
            padding: "12px", borderRadius: 12, border: `2px dashed ${G.accent}`,
            background: "rgba(255,77,0,0.04)", color: G.accent, fontWeight: 700,
            fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
          }}>
            정답 보기
          </button>
        ) : (
          <button onClick={() => navigate("/ai-chat")} style={{
            padding: "12px", borderRadius: 12, border: "none",
            background: G.accent, color: G.white, fontWeight: 700,
            fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
            boxShadow: "0 4px 14px rgba(255,77,0,0.3)",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Bot size={14} strokeWidth={2} /> AI랑 직접 연습하기 →</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ── 5. 최근 북마크 미리보기 ── */
function RecentBookmarks({ navigate }) {
  const { isMobile } = useBreakpoint();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get("/api/bookmarks/list", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.success) setBookmarks(res.data.data.slice(0, 4)); })
      .catch(() => {});
  }, []);

  if (bookmarks.length === 0) return null;

  return (
    <div style={{ background: G.white, borderRadius: 24, padding: 28, border: "1px solid rgba(0,0,0,0.05)", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><BookmarkIcon size={14} color={G.black} strokeWidth={2} /> 최근 북마크</div>
          <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>저장한 표현 빠르게 복습</div>
        </div>
        <div onClick={() => navigate("/bookmark")} style={{ fontSize: 12, color: G.accent, fontWeight: 700, cursor: "pointer" }}>전체 보기 →</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 10 }}>
        {bookmarks.map(b => (
          <div key={b.slang_id} style={{ background: G.pageBg, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: G.black, marginBottom: 4 }}>{b.word}</div>
            <div style={{ fontSize: 12, color: G.gray, lineHeight: 1.4 }}>{b.definition_ko}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 6. 슬랭 쇼츠 미리보기 ── */
function ShortsPreview({ navigate }) {
  const [shorts, setShorts] = useState([]);

  useEffect(() => {
    fetch("/api/slangs/shorts")
      .then(r => r.json())
      .then(data => setShorts((data.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  if (shorts.length === 0) return null;

  return (
    <div style={{ background: G.white, borderRadius: 24, padding: 28, border: "1px solid rgba(0,0,0,0.05)", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Smartphone size={14} color={G.black} strokeWidth={2} /> 슬랭 쇼츠</div>
          <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>영상으로 배우는 슬랭</div>
        </div>
        <div onClick={() => navigate("/shorts")} style={{ fontSize: 12, color: G.accent, fontWeight: 700, cursor: "pointer" }}>더 보기 →</div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {shorts.map(s => (
          <div key={s.slang_id} onClick={() => navigate("/shorts")} style={{ flex: 1, borderRadius: 16, overflow: "hidden", position: "relative", cursor: "pointer", aspectRatio: "9/16", maxHeight: 200, background: "#000" }}>
            <video src={s.shorts_url} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} muted />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 12px 12px", background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.word}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{s.definition_ko}</div>
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 24, opacity: 0.8 }}>▶</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 7. 오늘의 퀴즈 배너 ── */
function QuizBanner({ navigate, todayCount }) {
  const done = todayCount > 0;
  return (
    <div onClick={() => navigate("/practice")} style={{
      background: done
        ? "linear-gradient(135deg, #064e3b, #065f46)"
        : "linear-gradient(135deg, #1e3a5f, #1e40af)",
      borderRadius: 20, padding: "24px 28px", marginBottom: 20, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44 }}>
          {done ? <CheckCircle size={36} color="#6ee7b7" strokeWidth={1.6} /> : <Target size={36} color="rgba(255,255,255,0.7)" strokeWidth={1.6} />}
        </div>
        <div>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
            {done ? "오늘의 퀴즈 완료!" : "오늘의 퀴즈 아직 안 풀었어요!"}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            {done
              ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{todayCount}개 표현 학습 완료 <PartyPopper size={12} color="rgba(255,255,255,0.5)" strokeWidth={2} /></span>
              : <span style={{ display: "flex", alignItems: "center", gap: 5 }}>지금 바로 풀고 스트릭 유지하세요 <Flame size={12} color="rgba(255,255,255,0.5)" strokeWidth={2} /></span>
            }
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 100, whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.2)" }}>
        {done ? "다시 풀기 →" : "퀴즈 풀기 →"}
      </div>
    </div>
  );
}

/* ── 메인 콘텐츠── */
function MainContent({ stats }) {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
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

  const pad = isMobile ? "16px" : "36px 40px";

  return (
    <main style={{ flex: 1, padding: pad, overflowY: "auto", minHeight: "100vh", background: G.pageBg }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: G.gray, marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>좋은 하루에요 <Sun size={12} color={G.gray} strokeWidth={1.8} /></div>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: isMobile ? 18 : 26, fontWeight: 900, color: G.black, lineHeight: 1.3 }}>
            오늘도 한 표현씩,<br /><span style={{ color: G.accent }}>{userName}님!</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: G.white, borderRadius: 12, padding: isMobile ? "7px 12px" : "10px 18px", fontSize: isMobile ? 12 : 14, fontWeight: 700, border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 4 }}>
            <Flame size={12} color={G.accent} strokeWidth={2} /> <span style={{ color: G.accent }}>{currentStats.streak}일</span>
          </div>
          <div style={{ background: G.white, borderRadius: 12, padding: isMobile ? "7px 12px" : "10px 18px", fontSize: isMobile ? 12 : 14, fontWeight: 700, border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 4 }}>
            <Zap size={12} color={G.accent2} strokeWidth={2} /> <span style={{ color: G.accent2 }}>{currentStats.xp.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}><SearchBar /></div>

      {/* 1. 상단 스탯 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 10 : 16, marginBottom: 16 }}>
        <StatCard icon={BookOpen}    label="오늘 학습" value={currentStats.todayCount}        sub="+2 어제보다" color={G.accent} onClick={() => navigate("/learning-intro")} />
        <StatCard icon={CheckCircle} label="완료 카드" value={currentStats.masteredCount}      sub="이번 달"    color={G.blue}   onClick={() => navigate("/progress")} />
        <StatCard icon={Target}      label="AI 대화"  value={currentStats.aiCount}            sub="이번 주"    color={G.purple} onClick={() => navigate("/ai-chat")} />
        <StatCard icon={Percent}     label="정확도"   value={`${currentStats.accuracy}%`}     sub="↑ 5%"      color={G.green}  onClick={() => navigate("/progress")} />
      </div>

      {/* 2. 오늘의 학습 카드 + AI 프리뷰 */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 20, marginBottom: 16 }}>
        <TodayCard navigate={navigate} />
        <AIChatPreview navigate={navigate} />
      </div>

      {/* 3. 주간 그래프 + 슬랭 퀴즈 */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 20, marginBottom: 16, alignItems: "stretch" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}><WeeklyProgress /></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}><AIChatChallenge navigate={navigate} /></div>
      </div>

      {/* 4. 슬랭 쇼츠 미리보기 */}
      <ShortsPreview navigate={navigate} />

      {/* 5. 오늘의 퀴즈 배너 */}
      <QuizBanner navigate={navigate} todayCount={currentStats.todayCount} />

      {/* 6. 최근 북마크 */}
      <RecentBookmarks navigate={navigate} />

      {/* 커뮤니티 배너 */}
      <div onClick={() => navigate("/community")} style={{
        background: `linear-gradient(135deg, #4c1d95, #7c3aed)`,
        borderRadius: 20, padding: isMobile ? "18px 20px" : "24px 28px", marginBottom: 20, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(124,58,237,0.2)", transition: "transform 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "none"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Globe size={isMobile ? 28 : 36} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
          <div>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: isMobile ? 13 : 15, fontWeight: 900, color: "#ffffff", marginBottom: 2 }}>커뮤니티</div>
            {!isMobile && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>새 슬랭 제보 · 좋아요 · 댓글 · 이번 주 핫 랭킹</div>}
          </div>
        </div>
        <div style={{ background: "#7c3aed", color: "#ffffff", fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 100, fontFamily: "'Noto Sans KR', sans-serif", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.2)" }}>참여하기 →</div>
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