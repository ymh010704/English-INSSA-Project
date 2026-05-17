import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, ShieldAlert, Sparkles,
  BarChart3, CheckCircle2, Search, Plus, Filter,
  Flame, Clock3, Tag, Trash2, Pencil, Eye,
  LogOut, ChevronRight, MessageSquare, Bell, Star, Link,
  AlertTriangle, ZapOff, BookMarked, UserCheck, UserPlus,} from "lucide-react";
import {LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,} from "recharts";
import G from "../constants/colors";
import Button from "../components/Button";

/* ─── 데이터  ───────────────────────── */
const STATS = [
  { title: "전체 슬랭",   value: "284",   delta: "+12 this week", icon: BookOpen,      color: G.accent  },
  { title: "활성 사용자", value: "1,842", delta: "+8.4%",         icon: Users,         color: G.blue    },
  { title: "검수 대기",   value: "17",    delta: "Need review",   icon: CheckCircle2, color: "#f59e0b" },
  { title: "신고 접수",   value: "6",     delta: "2 urgent",      icon: ShieldAlert,  color: G.red      },
];

const WEEKLY = [
  { name: "월", users: 540, completion: 61 },
  { name: "화", users: 720, completion: 68 },
  { name: "수", users: 660, completion: 65 },
  { name: "목", users: 870, completion: 74 },
  { name: "금", users: 920, completion: 78 },
  { name: "토", users: 750, completion: 69 },
  { name: "일", users: 690, completion: 64 },
];

const TRENDING = [
  { name: "no cap", score: 94 },
  { name: "ate",    score: 88 },
  { name: "delulu", score: 81 },
  { name: "lowkey", score: 74 },
  { name: "rizz",   score: 71 },
];

const WRONG_SLANGS = [
  { name: "Rent free",               score: 312 },
  { name: "Main character energy", score: 278 },
  { name: "Sus",                    score: 241 },
  { name: "Stan",                  score: 198 },
  { name: "Tea",                   score: 165 },
];

const RIGHT_SLANGS = [
  { name: "Bet",      score: 654 },
  { name: "Flex",     score: 589 },
  { name: "No cap",   score: 541 },
  { name: "Ghosting", score: 487 },
  { name: "Slay",     score: 432 },
];

const AVG_QUIZ = [
  { name: "월", avg: 3.8 },
  { name: "화", avg: 4.2 },
  { name: "수", avg: 5.1 },
  { name: "목", avg: 4.6 },
  { name: "금", avg: 5.5 },
  { name: "토", avg: 3.2 },
  { name: "일", avg: 4.7 },
];

const PIPELINE = [
  { label: "작성 완료",   value: 82 },
  { label: "검수 대기",   value: 46 },
  { label: "승인 완료",   value: 71 },
  { label: "공개 배포",   value: 64 },
];

const AGE_GROUPS = [
  { name: "10대",  value: 38, color: G.accent  },
  { name: "20대",  value: 42, color: G.blue    },
  { name: "30대",  value: 13, color: G.purple  },
  { name: "40대+", value: 7,  color: G.green   },
];

const DAILY_ACTIVE = [
  { name: "재방문",  value: 289, color: G.blue   },
  { name: "신규방문", value: 23,  color: G.accent },
];

const SIGNUP_SOURCE = [
  { name: "일반가입", value: 11, color: G.navy   },
  { name: "Google",  value: 8,  color: G.blue    },
  { name: "Kakao",   value: 4,  color: "#f59e0b" },
];

const SLANGS = [
  { id: 1, term: "no cap",  meaning: "진짜, 거짓 없이",    origin: "African American Vernacular English", tags: ["SNS","Gen Z"], level: "중급", status: "공개",    validity: "트렌디",      trend: 94, source: "TikTok",  media: "https://youtube.com/shorts/abc" },
  { id: 2, term: "ate",     meaning: "완전 잘했다, 찢었다", origin: "Drag culture",                        tags: ["밈","Gen Z"], level: "초급", status: "검수 대기", validity: "트렌디",      trend: 88, source: "X",       media: "" },
  // ... 생략
];

const SUBMISSIONS = [
  { id: 1, term: "understood the assignment", meaning: "상황을 완벽히 파악하고 해낸 것", reporter: "김민지", trust: 89, status: "대기" },
  // ... 생략
];

const REPORTS = [
  { id: 1, term: "smash", reason: "성적인 의미 오해 가능",   severity: "높음", reporter: "user_204", trust: 72 },
  // ... 생략
];

const EXAMPLES = [
  { id: 1, term: "no cap", author: "김민지",  content: "This food is amazing, no cap!", likes: 34, isBest: true  },
  // ... 생략
];

const AI_LOGS = [
  { id: 1, content: "wtf is this shit lol",        user: "user_099", filtered: "욕설", action: "숨김처리", time: "2026-04-04 14:22" },
  // ... 생략
];

const POPULAR_SEARCHES = [
  { name: "rizz",   count: 412 },
  { name: "no cap", count: 389 },
  // ... 생략
];

const ZERO_RESULTS = [
  { word: "understood the assignment", count: 87, date: "2026-04-04" },
  // ... 생략
];

const DROPOUT_DATA = [
  { name: "도입부",   rate: 8  },
  { name: "예시1",    rate: 12 },
  // ... 생략
];

const WEIGHTS = [
  { label: "인기 점수",   value: 30 },
  { label: "개인화 점수", value: 40 },
  { label: "최신성",      value: 20 },
  { label: "학습 부족도", value: 10 },
];

const MENU = [
  { key: "dashboard",    label: "대시보드",           icon: LayoutDashboard },
  { key: "content",      label: "콘텐츠 관리",         icon: BookOpen        },
  { key: "users",        label: "유저 관리",           icon: Users            },
  { key: "review",       label: "검수 / 신고",         icon: ShieldAlert     },
  { key: "community",    label: "커뮤니티",            icon: MessageSquare   },
  { key: "analytics",    label: "통계",                icon: BarChart3        },
  { key: "notification", label: "공지사항",              icon: Bell             },
  { key: "recommend",    label: "추천 설정 (보류)",   icon: Sparkles         },
];

/* ─── 공통 컴포넌트 ─────────────────────────── */
function Card({ children, style = {} }) {
  return (
    <div style={{ background: G.white, borderRadius: 20, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: G.black }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: G.gray, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

function Badge({ children, color = G.gray, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: bg || `${color}18`, color, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function ProgressBar({ value, color = G.accent }) {
  return (
    <div style={{ height: 8, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 100, transition: "width 0.8s ease" }} />
    </div>
  );
}

function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, background: G.lightGray, borderRadius: 14, padding: 4, width: "fit-content" }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
          background: active === t.key ? G.white : "transparent",
          color: active === t.key ? G.black : G.gray,
          boxShadow: active === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.15s",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, danger = false }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 10, border: `1px solid ${danger ? G.red + "40" : G.border}`,
      background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      color: danger ? G.red : G.gray,
    }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? "#fef2f2" : G.lightGray}
      onMouseLeave={e => e.currentTarget.style.background = "white"}
    >
      <Icon size={14} />
    </button>
  );
}

function TrustBadge({ score }) {
  const color = score >= 80 ? G.green : score >= 60 ? "#f59e0b" : G.red;
  return <Badge color={color}>{score}점</Badge>;
}

/* ─── 대시보드 ──────────────── */
function DashboardPage({ onAddClick }) {
const [stats, setStats] = useState({
    totalUserCount: 0,
    todayNewUserCount: 0,
    todayBoardPostCount: 0,
    pendingSlangCount: 0
  });

  // 대시보드가 켜질 때 백엔드 API 호출해서 진짜 데이터 불러오기
  useEffect(() => {
    // 로그인할 때 저장된 토큰 꺼냄
    const token = localStorage.getItem("token"); 

    // 상대 경로 호출
    fetch('http://localhost:8000/api/admin/dashboard', {
        method: 'GET',
        headers: {
            // 백엔드 authenticateJWT 미들웨어 통과를 위한 Bearer 토큰 설정!
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then((res) => {
        if (!res.ok) throw new Error("인증 실패 또는 서버 에러");
        return res.json();
    })
    .then((resData) => {
        if (resData.success) {
            setStats(resData.data); 
        }
    })
    .catch((err) => console.error("대시보드 통계 로딩 실패:", err));
  }, []);

  const dynamicStats = [
    { title: "전체 회원수", value: `${stats.totalUserCount}명`, delta: "누적 가입자", icon: Users, color: G.blue }, 
    { title: "신규 회원", value: `${stats.todayNewUserCount}명`, delta: "오늘 가입", icon: UserPlus, color: G.green },
    { title: "게시글", value: `${stats.todayBoardPostCount}개`, delta: "오늘 등록", icon: MessageSquare, color: G.purple },
    { title: "검수대기", value: `${stats.pendingSlangCount}개`, delta: "승인 대기중", icon: BookOpen, color: G.orange },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle
        title="오늘의 현황"
        subtitle={new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" size="sm"><Bell size={14} style={{ marginRight: 6 }} />알림</Button>
            <Button size="sm" onClick={onAddClick}>
              <Plus size={14} style={{ marginRight: 6 }} />새 슬랭 등록
            </Button>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {dynamicStats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.title} style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, color: G.gray, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: G.black, fontFamily: "'Unbounded', sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: G.gray, marginTop: 4 }}>{s.delta}</div>
                </div>
                <div style={{ background: `${s.color}15`, borderRadius: 14, padding: 10 }}>
                  <Icon size={18} color={s.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { title: "일일 접속자",   sub: "오늘 기준 총 312명", data: DAILY_ACTIVE,  isPercent: false },
          { title: "일일 신규가입", sub: "오늘 기준 총 23명",  data: SIGNUP_SOURCE, isPercent: false },
          { title: "연령대 분포",   sub: "전체 사용자 기준",   data: AGE_GROUPS,    isPercent: true  },
        ].map(chart => (
          <Card key={chart.title} style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{chart.title}</div>
            <div style={{ fontSize: 12, color: G.gray, marginBottom: 4 }}>{chart.sub}</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={chart.data} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                  {chart.data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={v => chart.isPercent ? `${v}%` : `${v}명`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
              {chart.data.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 100, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: G.gray }}>{d.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: G.black }}>
                    {chart.isPercent ? `${d.value}%` : `${d.value}명`}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>주간 사용자 추이</div>
          </div>
          <div style={{ padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={WEEKLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke={G.accent} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>오늘의 관리 포인트</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: Flame,  color: G.accent, title: "트렌딩 슬랭 업데이트", desc: "급상승 표현 4개가 자동 후보로 등록되었습니다." },
              { icon: Clock3, color: G.blue,   title: "검수 대기",              desc: "17건 중 5건이 48시간 이상 지연 중입니다." },
              { icon: ZapOff, color: G.red,    title: "미등록 검색어",            desc: "오늘 미등록 검색어 5건이 수집되었습니다." },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} style={{ background: G.lightGray, borderRadius: 14, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: G.black, marginBottom: 4 }}>
                    <Icon size={13} color={item.color} />{item.title}
                  </div>
                  <div style={{ fontSize: 12, color: G.gray }}>{item.desc}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>인기 슬랭 TOP 5</div>
          </div>
          <div style={{ padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={TRENDING}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill={G.accent} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>콘텐츠 승인 파이프라인</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {PIPELINE.map(p => (
              <div key={p.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>{p.label}</span>
                  <span style={{ color: G.gray }}>{p.value}%</span>
                </div>
                <ProgressBar value={p.value} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── 콘텐츠 관리 ─────────────────── */
function ContentPage() {
  const [tab, setTab] = useState("list");
  const [query, setQuery] = useState("");
  const [slangs, setSlangs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlang, setNewSlang] = useState({ term: "", meaning: "", origin: "", tags: "" });

  useEffect(() => {
  const token = localStorage.getItem("token");

  fetch('/api/admin/slangs', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    }
  })
    .then(res => res.json())
    .then(response => { // 이름을 response로 바꿈 
      console.log("서버에서 온 원본 데이터:", response);
      const actualData = response.data; 

      if (!Array.isArray(actualData)) {
        console.error("데이터 형식이 배열이 아닙니다:", actualData);
        return;
      }

      const formattedData = actualData.map(item => ({
        id: item.slang_id,          
        term: item.word,            
        meaning: item.definition_ko, 
        origin: item.example_ko || "어원 정보 없음", 
        status: "공개",
        tags: item.tags ? item.tags.split(',') : [], // 태그가 문자열이면 배열로 변환
        trend: 80,
      }));

      setSlangs(formattedData);
    })
    .catch(err => console.error("연결 오류:", err));
}, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(slangs)) return [];
    return slangs.filter(s => {
      const tags = Array.isArray(s.tags) ? s.tags : []; 
      return [s.term, s.meaning, s.origin, ...tags].join(" ").toLowerCase().includes(query.toLowerCase());
    });
  }, [slangs, query]);

  function deleteSlang(id) {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      // 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem("token");

      // fetch 옵션에 headers 추가
      fetch(`/api/admin/slangs/${id}`, { 
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}` 
        }
      })
        .then(res => {
          if (res.ok) {
            setSlangs(prev => prev.filter(s => s.id !== id));
            alert("삭제 성공!");
          } else {
            return res.json().then(data => {
              alert(`삭제 실패: ${data.error || "권한이 없습니다."}`);
            });
          }
        })
        .catch(err => console.error("삭제 에러:", err));
    }
  }

  const statusColor = { "공개": G.green, "검수 대기": "#f59e0b", "비공개": G.gray };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle
        title="콘텐츠 관리"
        subtitle="슬랭 카드, 어원, 태그, 멀티미디어를 관리합니다."
        action={<Button size="sm" onClick={() => setIsModalOpen(true)}><Plus size={14} style={{ marginRight: 6 }} />슬랭 추가</Button>}
      />

      <SubTabs
        tabs={[{ key: "list", label: "슬랭 목록" }, { key: "media", label: "멀티미디어 매핑" }]}
        active={tab} onChange={setTab}
      />

      {tab === "list" && (
        <>
          <Card style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={14} color={G.gray} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="슬랭, 뜻, 어원, 태그 검색"
                  style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 100, border: `1.5px solid ${G.border}`, fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" }} />
              </div>
              <Button variant="secondary" size="sm"><Filter size={13} style={{ marginRight: 6 }} />필터</Button>
            </div>
          </Card>
          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                  {["슬랭", "뜻", "어원", "태그", "상태", "트렌드", ""].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f7f4ef" }} onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "14px 16px", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 12 }}>{s.term}</td>
                    <td style={{ padding: "14px 16px", color: G.gray, maxWidth: 160 }}>{s.meaning}</td>
                    <td style={{ padding: "14px 16px", color: G.gray, fontSize: 12, maxWidth: 140 }}>{s.origin}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(s.tags && Array.isArray(s.tags)) && s.tags.length > 0 ? s.tags.map(t => <Badge key={t} color={G.purple}>{t}</Badge>) : <Badge color={G.gray}>태그 없음</Badge>}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}><Badge color={statusColor[s.status] || G.gray}>{s.status}</Badge></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 50, height: 6, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${s.trend}%`, background: G.accent, borderRadius: 100 }} />
                        </div>
                        <span style={{ fontSize: 12, color: G.gray }}>{s.trend}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <IconBtn icon={Eye} />
                        <IconBtn icon={Pencil} />
                        <IconBtn icon={Trash2} onClick={() => deleteSlang(s.id)} danger />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "media" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                {["슬랭", "연결된 미디어 URL", "출처", ""].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slangs.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f7f4ef" }} onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 16px", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 12 }}>{s.term}</td>
                  <td style={{ padding: "14px 16px", flex: 1 }}>
                    {s.media ? <a href={s.media} target="_blank" rel="noreferrer" style={{ color: G.blue, fontSize: 12, textDecoration: "none" }}><Link size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{s.media}</a> : <span style={{ color: G.gray, fontSize: 12 }}>— 미연결</span>}
                  </td>
                  <td style={{ padding: "14px 16px", color: G.gray }}>{s.source}</td>
                  <td style={{ padding: "14px 16px" }}><Button variant="secondary" size="sm"><Link size={12} style={{ marginRight: 4 }} />URL 연결</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ─── 슬랭 추가 ─── */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <Card style={{ width: 450, padding: 30 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>새 슬랭 등록</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <input placeholder="슬랭 (예: Rizz)" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }} onChange={e => setNewSlang({...newSlang, term: e.target.value})} />
              <input placeholder="뜻" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }} onChange={e => setNewSlang({...newSlang, meaning: e.target.value})} />
              <textarea placeholder="어원/유래" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", height: 80 }} onChange={e => setNewSlang({...newSlang, origin: e.target.value})} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
               <Button style={{ flex: 1 }} onClick={() => {
                  const token = localStorage.getItem("token");
                  const payload = {
                    word: String(newSlang.term || ""),
                    definition_ko: String(newSlang.meaning || ""),
                    definition_en: "English definition", 
                    example_en: "English example",       
                    example_ko: String(newSlang.origin || "한국어 예문"), 
                    category: "Etc",
                    emoji: "✨"
                  };
                  fetch('/api/admin/slangs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`},
                    body: JSON.stringify(payload)
                  })
                  .then(res => res.json())
                  .then(data => {
                    const newData = { id: data.slangId || Date.now(), term: payload.word, meaning: payload.definition_ko, origin: payload.example_ko, tags: ["신규"], status: "공개", trend: 70 };
                    setSlangs(prev => [newData, ...prev]);
                    setIsModalOpen(false);
                    setNewSlang({ term: "", meaning: "", origin: "", tags: "" });
                    alert("DB 등록 성공!");
                  }).catch(err => alert("등록 중 에러 발생!"));
               }}>등록하기</Button>
                <Button variant="secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>취소</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── 유저 관리 ────────────────── */
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
  // 1. 로컬 스토리지에서 토큰 가져오기 
  const token = localStorage.getItem('token'); 

  fetch('/api/admin/users', {
    method: 'GET',
    headers: {
      // 2. 문지기가 요구하는 형식(Bearer <token>)으로 헤더 추가
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      if (res.status === 401) {
        alert("로그인이 필요하거나 권한이 없습니다.");
        return;
      }
      return res.json();
    })
    .then(response => {
      if (response && response.success && Array.isArray(response.data)) {
        const formattedUsers = response.data.map((u, index) => ({
          displayId: index + 1,  
          id: u.id || u.user_id, 
          name: u.nickname || "이름 없음", 
          email: u.email,
          streak: u.streak || 0,
          accuracy: u.accuracy || 0,
          reports: u.reports || 0,
          status: Number(u.role) === 1 ? "관리자" : "활성",
          joinDate: u.created_at ? u.created_at.split('T')[0] : "2026-05-14"
        }));
        setUsers(formattedUsers);
      }
    })
    .catch(err => console.error("데이터 로드 실패:", err));
}, []);

  const handleDeleteUser = (id) => {
    if (window.confirm("정말로 탈퇴 처리하시겠습니까?")) {
      fetch(`/api/admin/users/${id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            setUsers(prev => prev.filter(user => user.id !== id));
            alert("성공적으로 탈퇴 처리되었습니다.");
          }
        });
    }
  };

  const filtered = useMemo(() =>
    users.filter(u => [u.name, u.email].join(" ").toLowerCase().includes(query.toLowerCase())),
    [users, query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle title="유저 관리" subtitle={`총 ${users.length}명`} />
      <Card style={{ padding: "14px 18px" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} color={G.gray} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="이름, 이메일 검색"
            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 100, border: `1.5px solid ${G.border}`, fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" }} />
        </div>
      </Card>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
              {["#", "이름", "이메일", "연속 학습", "정답률", "신고누적", "상태", "가입일", ""].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
              ))}
            </tr>
          </thead>
         <tbody>
  {filtered.map((u, index) => ( 
    <tr key={u.id} style={{ borderBottom: "1px solid #f7f4ef" }} onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <td style={{ padding: "14px 16px" }}>{index + 1}</td> 
      
      <td style={{ padding: "14px 16px", fontWeight: 700 }}>{u.name}</td>
      <td style={{ padding: "14px 16px", color: G.gray }}>{u.email}</td>
      <td style={{ padding: "14px 16px" }}>{u.streak}일</td>
      <td style={{ padding: "14px 16px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 60, height: 6, background: '#eee', borderRadius: 3 }}>
              <div style={{ width: `${u.accuracy}%`, height: '100%', background: G.green, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12 }}>{u.accuracy}%</span>
          </div>
      </td>
      <td style={{ padding: "14px 16px", color: u.reports > 3 ? G.red : G.black }}>{u.reports}회</td>
      <td style={{ padding: "14px 16px" }}><Badge color={u.status === "관리자" ? G.purple : G.green}>{u.status}</Badge></td>
      <td style={{ padding: "14px 16px", color: G.gray }}>{u.joinDate}</td>
      <td style={{ padding: "14px 16px" }}>
        <Button variant="secondary" size="sm" onClick={() => handleDeleteUser(u.id)} style={{ color: G.red, border: `1px solid ${G.red}40` }}>탈퇴</Button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─── 검수 / 신고 ───────────────────────────────────── */
function ReviewPage() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState(SLANGS.filter(s => s.status === "검수 대기"));
  const [submissions, setSubmissions] = useState(SUBMISSIONS);
  
  // [수정했습니다] 더미 데이터 대신 백엔드 데이터를 가져옴
  const [reports, setReports] = useState([]);

  // [추가했습니다] 페이지 켜질 때 신고 접수 내역 서버에서 받아오기
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    fetch('http://localhost:8000/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      if (!res.ok) throw new Error("데이터 수신 실패");
      return res.json();
    })
    .then((resData ) => {
      if (resData.success && resData.data && Array.isArray(resData.data.reports)) {
        setReports(resData.data.reports); 
      } else
        setReports([]);
    })
    .catch((err) => {
      console.error("통합 데이터 로딩 실패:", err);
      setReports([]); 
    });
  }, []);

  const severityColor = { "높음": G.red, "중간": "#f59e0b", "낮음": G.green };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle title="검수 / 신고 관리" subtitle="콘텐츠 검수, 신조어 제보, 신고를 처리합니다." />

      <SubTabs
        tabs={[
          { key: "pending",     label: `검수 대기 (${pending.length})`     },
          { key: "submissions", label: `신조어 제보 (${submissions.length})` },
          { key: "reports",     label: `신고 접수 (${reports.length})`      }, 
        ]}
        active={tab} onChange={setTab}
      />

      {tab === "pending" && (
        <Card>
          {pending.length === 0
            ? <div style={{ padding: 40, textAlign: "center", color: G.gray, fontSize: 14 }}>검수 대기 항목이 없습니다</div>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                    {["슬랭", "뜻", "카테고리", "난이도", "출처", ""].map(h => (
                      <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 12 }}>{s.term}</td>
                      <td style={{ padding: "14px 16px", color: G.gray }}>{s.meaning}</td>
                      <td style={{ padding: "14px 16px" }}><Badge>{s.tags[0]}</Badge></td>
                      <td style={{ padding: "14px 16px" }}><Badge color={G.blue}>{s.level}</Badge></td>
                      <td style={{ padding: "14px 16px", color: G.gray }}>{s.source}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <Button size="sm" onClick={() => setPending(p => p.filter(x => x.id !== s.id))}>승인</Button>
                          <Button variant="secondary" size="sm" onClick={() => setPending(p => p.filter(x => x.id !== s.id))}
                            style={{ color: G.red, border: `1px solid ${G.red}40` }}>반려</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Card>
      )}

      {tab === "submissions" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                {["신조어", "뜻", "제보자", ""].map(h => ( // [수정했습니다] 신뢰도 점수 삭제함
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 12 }}>{s.term}</td>
                  <td style={{ padding: "14px 16px", color: G.gray }}>{s.meaning}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>{s.reporter}</td>
                  <td style={{ padding: "14px 16px" }}><TrustBadge score={s.trust} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <Button size="sm" onClick={() => setSubmissions(p => p.filter(x => x.id !== s.id))}>승인 → 등록</Button>
                      <Button variant="secondary" size="sm" onClick={() => setSubmissions(p => p.filter(x => x.id !== s.id))}
                        style={{ color: G.red, border: `1px solid ${G.red}40` }}>거절</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* [수정했습니다] , 데이터 매핑만 DB 필드로 매칭 */}
      {tab === "reports" && (
        <Card>
          {reports.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: G.gray, fontSize: 14 }}>신고 접수 항목이 없습니다</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                  {["표현 (단어)", "최신 신고 사유", "신고 누적 횟수", ""].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.slang_id} style={{ borderBottom: "1px solid #f7f4ef" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* 단어 */}
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: G.black }}>{r.word}</td>
                    
                    {/* 최신 신고 사유 */}
                    <td style={{ padding: "14px 16px", color: G.gray }}>{r.report_reason || "사유 미지정"}</td>
                    
                    {/* 누적 횟수 배지 스타일 */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ 
                        background: `${G.red}15`, 
                        color: G.red, 
                        padding: "4px 10px", 
                        borderRadius: 20, 
                        fontSize: 12, 
                        fontWeight: 700 
                      }}>
                        {r.report_count}회 신고됨
                      </span>
                    </td>

                    {/* 버튼 */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <Button variant="secondary" size="sm" onClick={() => setReports(p => p.filter(x => x.slang_id !== r.slang_id))}>유지</Button>
                        <Button size="sm" onClick={() => setReports(p => p.filter(x => x.slang_id !== r.slang_id))}
                          style={{ background: G.red, color: G.white }}>삭제</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}

/* ─── 커뮤니티 ──────────────────────────────────────── */
function CommunityPage() {
  const [tab, setTab] = useState("examples");
  const [examples, setExamples] = useState(EXAMPLES);
  const [logs, setLogs] = useState(AI_LOGS);

  function setBest(id) {
    setExamples(prev => prev.map(e =>
      e.term === prev.find(x => x.id === id)?.term
        ? { ...e, isBest: e.id === id }
        : e
    ));
  }

  const actionColor = { "숨김처리": G.red, "경고": "#f59e0b" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle title="커뮤니티 관리" subtitle="유저 예문 관리와 AI 필터 로그를 확인합니다." />

      <SubTabs
        tabs={[{ key: "examples", label: "예문 관리" }, { key: "ailog", label: "AI 필터 로그" }]}
        active={tab} onChange={setTab}
      />

      {tab === "examples" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                {["슬랭", "예문", "작성자", "좋아요", "대표 예문", ""].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examples.map(e => (
                <tr key={e.id} style={{ borderBottom: "1px solid #f7f4ef", background: e.isBest ? "rgba(255,77,0,0.02)" : "transparent" }}
                  onMouseEnter={ev => ev.currentTarget.style.background = e.isBest ? "rgba(255,77,0,0.04)" : "#fafaf9"}
                  onMouseLeave={ev => ev.currentTarget.style.background = e.isBest ? "rgba(255,77,0,0.02)" : "transparent"}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 12 }}>{e.term}</td>
                  <td style={{ padding: "14px 16px", color: G.black }}>{e.content}</td>
                  <td style={{ padding: "14px 16px", color: G.gray }}>{e.author}</td>
                  <td style={{ padding: "14px 16px" }}>❤️ {e.likes}</td>
                  <td style={{ padding: "14px 16px" }}>
                    {e.isBest
                      ? <Badge color={G.accent}>⭐ 대표</Badge>
                      : <span style={{ color: G.gray, fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {!e.isBest && <Button variant="secondary" size="sm" onClick={() => setBest(e.id)}><Star size={12} style={{ marginRight: 4 }} />대표 선정</Button>}
                      <IconBtn icon={Trash2} danger onClick={() => setExamples(p => p.filter(x => x.id !== e.id))} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "ailog" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                {["내용", "작성자", "필터 유형", "처리", "시간", ""].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, color: G.black }}>{l.content}</td>
                  <td style={{ padding: "14px 16px", color: G.gray }}>{l.user}</td>
                  <td style={{ padding: "14px 16px" }}><Badge color={G.red}>{l.filtered}</Badge></td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge color={actionColor[l.action] || G.gray}>{l.action}</Badge>
                  </td>
                  <td style={{ padding: "14px 16px", color: G.gray, fontSize: 12 }}>{l.time}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <IconBtn icon={Trash2} danger onClick={() => setLogs(p => p.filter(x => x.id !== l.id))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ─── 통계 ──────────────────────────────────────────── */
function AnalyticsPage() {
  const [tab, setTab] = useState("usage");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle title="통계" subtitle="사용 추이, 인기 검색어, 이탈 구간, 미등록 검색어를 추적합니다." />

      <SubTabs
        tabs={[
          { key: "usage",   label: "사용 추이"    },
          { key: "search",  label: "인기 검색어"  },
          { key: "dropout", label: "이탈 구간"    },
          { key: "zero",    label: "미등록 검색어"  },
        ]}
        active={tab} onChange={setTab}
      />

      {tab === "usage" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ padding: "20px 24px 0" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>일별 활성 사용자</div>
            </div>
            <div style={{ padding: "16px 8px 8px" }}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={WEEKLY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke={G.accent} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div style={{ padding: "20px 24px 0" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>일별 학습 완료율</div>
            </div>
            <div style={{ padding: "16px 8px 8px" }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={WEEKLY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="completion" fill={G.blue} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {tab === "search" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ padding: "20px 24px 0" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>인기 검색어 TOP 7</div>
              <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>최근 7일</div>
            </div>
            <div style={{ padding: "16px 8px 8px" }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={POPULAR_SEARCHES} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill={G.accent} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>검색어 순위</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {POPULAR_SEARCHES.map((s, i) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 100, background: i < 3 ? G.accent : G.lightGray, color: i < 3 ? G.white : G.gray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ flex: 1, fontFamily: "'Unbounded', sans-serif", fontSize: 12, fontWeight: 700 }}>{s.name}</span>
                  <span style={{ fontSize: 12, color: G.gray }}>{s.count}회</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "dropout" && (
        <Card>
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>학습 이탈 구간 분석</div>
            <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>각 단계에서 이탈한 유저 비율 (%)</div>
          </div>
          <div style={{ padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={DROPOUT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={v => `${v}%`} />
                <Bar dataKey="rate" fill={G.red} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: "0 24px 20px" }}>
            <div style={{ background: "#fef2f2", borderRadius: 12, padding: "12px 16px", fontSize: 12, color: G.red }}>
              <AlertTriangle size={12} style={{ marginRight: 6, verticalAlign: "middle" }} />
              <strong>퀴즈3</strong> 단계에서 이탈률이 41%로 가장 높습니다. 난이도 조정을 검토해보세요.
            </div>
          </div>
        </Card>
      )}

      {tab === "zero" && (
        <Card>
          <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>미등록 검색어 로그</div>
              <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>DB에 없어서 결과가 없었던 검색어 — 다음 등록 콘텐츠 후보</div>
            </div>
            <Button size="sm"><Plus size={14} style={{ marginRight: 6 }} />일괄 등록 요청</Button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                {["검색어", "검색 횟수", "최근 검색일", ""].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ZERO_RESULTS.map((z, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f7f4ef" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 12 }}>{z.word}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge color={z.count >= 60 ? G.red : G.gray}>{z.count}회</Badge>
                  </td>
                  <td style={{ padding: "14px 16px", color: G.gray }}>{z.date}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <Button variant="secondary" size="sm"><BookMarked size={12} style={{ marginRight: 4 }} />등록 요청</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ─── 공지사항 ──────────────────────────────────────── */
function NotificationPage() {
  const [newsletter, setNewsletter] = useState("이번 주 핫한 슬랭을 소개합니다!\n\n1. rizz - 이성을 끄는 매력\n2. delulu - 망상에 빠진 상태\n3. slay - 찢었다, 완전 멋지다\n\n자세한 내용은 앱에서 확인하세요 🔥");

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle title="공지사항" subtitle="유저에게 전달할 공지를 작성하고 발송합니다." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>공지 작성</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.gray, marginBottom: 8 }}>제목</div>
                <input placeholder="이번 주 핫한 슬랭 모음.zip" style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.gray, marginBottom: 8 }}>내용</div>
                <textarea value={newsletter} onChange={e => setNewsletter(e.target.value)} rows={10}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" style={{ flex: 1 }}>임시 저장</Button>
                <Button style={{ flex: 1 }}>발송하기</Button>
              </div>
            </div>
          </Card>

          <Card style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>미리보기</div>
            <div style={{ background: G.lightGray, borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: G.black, marginBottom: 12 }}>이번 주 핫한 슬랭 모음.zip</div>
              <div style={{ fontSize: 13, color: G.gray, lineHeight: 1.8, whiteSpace: "pre-line" }}>{newsletter}</div>
            </div>
          </Card>
      </div>
    </div>
  );
}

/* ─── 추천 설정  ─── */
function RecommendPage() {
  return (
    <div style={{ padding: 40 }}>
      <h3>추천 가중치 설정 (보류)</h3>
      <div style={{ 
        background: "white", 
        padding: 40, 
        borderRadius: 20, 
        textAlign: "center", 
        color: "#666" 
      }}>
        ⏸ 현재 보류된 기능입니다.
      </div>
    </div>
  );
}

/* ─── 메인 Admin ────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { if (user?.role !== 1) navigate("/dashboard"); }, []);

  const pages = {
    dashboard: <DashboardPage onAddClick={() => setActive("content")} />,
    content: <ContentPage />,
    users: <UsersPage />,
    review: <ReviewPage />,
    community: <CommunityPage />,
    analytics: <AnalyticsPage />,
    notification: <NotificationPage />,
    recommend: <RecommendPage />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6", display: "flex" }}>
      <aside style={{ background: G.white, width: 260, borderRight: "1px solid #eee", padding: 16, position: "fixed", height: "100vh", display: "flex", 
  flexDirection: "column"}}>
        <h2 style={{ padding: 20, fontSize: 18, fontWeight: 900 }}>관리자 페이지</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {MENU.map(item => <button key={item.key} onClick={() => setActive(item.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: active === item.key ? G.navy : "transparent", color: active === item.key ? G.white : G.gray, borderRadius: 12, cursor: "pointer", textAlign: "left" }}><item.icon size={16} />{item.label}</button>)}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, border: `1px solid ${G.border}`, flexShrink: 0, marginTop: 'auto' }}>
      <div style={{ width: 32, height: 32, borderRadius: 100, background: G.accent, display: "flex", alignItems: "center", justifyContent: "center", color: G.white, fontSize: 12, fontWeight: 700 }}>
        {user.nickname?.[0] || "A"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: G.black }}>{user.nickname || "관리자"}</div>
        <div style={{ fontSize: 11, color: G.gray }}>관리자</div>
      </div>
      <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: G.gray, padding: 4, borderRadius: 8 }}>
        <LogOut size={15} />
      </button>
    </div>
      </aside>
      <main style={{ marginLeft: 260, flex: 1, padding: 32 }}>{pages[active]}</main>
    </div>
  );
}