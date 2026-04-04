import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, ShieldAlert, Sparkles,
  BarChart3, CheckCircle2, Search, Plus, Filter,
  Settings, Flame, Clock3, Tag, Trash2, Pencil, Eye,
  LogOut, ChevronRight, MessageSquare, Bell, Star, Link,
  AlertTriangle, TrendingUp, ZapOff, BookMarked, UserCheck, UserPlus,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import G from "../constants/colors";
import Button from "../components/Button";

/* ─── 목 데이터 ──────────────────────────────────────── */
const STATS = [
  { title: "전체 슬랭",   value: "284",   delta: "+12 this week", icon: BookOpen,     color: G.accent  },
  { title: "활성 사용자", value: "1,842", delta: "+8.4%",         icon: Users,        color: G.blue    },
  { title: "검수 대기",   value: "17",    delta: "Need review",   icon: CheckCircle2, color: "#f59e0b" },
  { title: "신고 접수",   value: "6",     delta: "2 urgent",      icon: ShieldAlert,  color: G.red     },
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
  { name: "ate",    score: 88 },
  { name: "delulu", score: 81 },
  { name: "lowkey", score: 74 },
  { name: "rizz",   score: 71 },
];

const PIPELINE = [
  { label: "작성 완료",   value: 82 },
  { label: "검수 대기",   value: 46 },
  { label: "승인 완료",   value: 71 },
  { label: "공개 배포",   value: 64 },
];

const SLANGS = [
  { id: 1, term: "no cap",  meaning: "진짜, 거짓 없이",    origin: "African American Vernacular English", tags: ["SNS","Gen Z"], level: "중급", status: "공개",    validity: "트렌디",      trend: 94, source: "TikTok",  media: "https://youtube.com/shorts/abc" },
  { id: 2, term: "ate",     meaning: "완전 잘했다, 찢었다", origin: "Drag culture",                        tags: ["밈","Gen Z"], level: "초급", status: "검수 대기", validity: "트렌디",      trend: 88, source: "X",       media: "" },
  { id: 3, term: "delulu",  meaning: "망상에 빠진 상태",    origin: "K-pop fandom",                        tags: ["일상"],        level: "중급", status: "공개",    validity: "트렌디",      trend: 81, source: "Reddit",  media: "" },
  { id: 4, term: "sus",     meaning: "수상한",              origin: "Among Us (게임)",                     tags: ["게임"],        level: "초급", status: "비공개",  validity: "올드패션드",  trend: 67, source: "Discord", media: "" },
  { id: 5, term: "rizz",    meaning: "이성을 끄는 매력",    origin: "Charisma의 중간 음절",                tags: ["SNS","Gen Z"], level: "고급", status: "공개",    validity: "트렌디",      trend: 71, source: "TikTok",  media: "" },
  { id: 6, term: "lowkey",  meaning: "은근히, 솔직히 말하면", origin: "Hip-hop slang",                   tags: ["일상","힙합"], level: "초급", status: "공개",    validity: "보통",        trend: 74, source: "X",       media: "" },
  { id: 7, term: "slay",    meaning: "찢었다, 완전 멋지다", origin: "Drag/Ballroom culture",               tags: ["SNS","Gen Z"], level: "초급", status: "공개",    validity: "트렌디",      trend: 70, source: "Instagram", media: "" },
  { id: 8, term: "bussin",  meaning: "완전 맛있다/대박이다", origin: "African American Vernacular English", tags: ["음식","Gen Z"], level: "중급", status: "공개",   validity: "보통",        trend: 62, source: "TikTok",  media: "" },
];

const USERS = [
  { id: 1, name: "김민지", email: "minji@example.com",   streak: 14, accuracy: 89, status: "활성", role: "Expert",  joined: "2025-12-01", reports: 2 },
  { id: 2, name: "이도윤", email: "doyoon@example.com",  streak: 3,  accuracy: 72, status: "활성", role: "일반",    joined: "2026-01-10", reports: 0 },
  { id: 3, name: "박서연", email: "seoyeon@example.com", streak: 0,  accuracy: 48, status: "휴면", role: "일반",    joined: "2026-02-14", reports: 1 },
  { id: 4, name: "최준호", email: "junho@example.com",   streak: 26, accuracy: 91, status: "활성", role: "Expert",  joined: "2026-03-05", reports: 5 },
];

const REPORTS = [
  { id: 1, term: "smash", reason: "성적인 의미 오해 가능",   severity: "높음", reporter: "user_204", trust: 72 },
  { id: 2, term: "simp",  reason: "비하 표현 여부 검토",     severity: "중간", reporter: "user_150", trust: 88 },
  { id: 3, term: "dead",  reason: "문맥상 폭력적 의미 혼동", severity: "낮음", reporter: "user_031", trust: 55 },
];

const SUBMISSIONS = [
  { id: 1, term: "understood the assignment", meaning: "상황을 완벽히 파악하고 해낸 것", reporter: "김민지", trust: 89, status: "대기" },
  { id: 2, term: "it's giving",               meaning: "~한 느낌이 난다, ~같다",         reporter: "최준호", trust: 91, status: "대기" },
  { id: 3, term: "main character syndrome",   meaning: "자기가 주인공인 줄 아는 것",     reporter: "이도윤", trust: 72, status: "대기" },
];

const EXAMPLES = [
  { id: 1, term: "no cap", author: "김민지",  content: "This food is amazing, no cap!", likes: 34, isBest: true  },
  { id: 2, term: "no cap", author: "이도윤",  content: "She's the best singer, no cap.", likes: 18, isBest: false },
  { id: 3, term: "rizz",   author: "최준호",  content: "He's got so much rizz on the dance floor.", likes: 27, isBest: false },
  { id: 4, term: "slay",   author: "박서연",  content: "She absolutely slayed that presentation!", likes: 41, isBest: true  },
];

const AI_LOGS = [
  { id: 1, content: "wtf is this shit lol",       user: "user_099", filtered: "욕설", action: "숨김처리", time: "2026-04-04 14:22" },
  { id: 2, content: "this is so damn good",        user: "user_204", filtered: "경미한 욕설", action: "경고",    time: "2026-04-04 15:10" },
  { id: 3, content: "그 slur 써도 되는 거 아님?",  user: "user_031", filtered: "혐오표현", action: "숨김처리", time: "2026-04-04 16:45" },
];

const POPULAR_SEARCHES = [
  { name: "rizz",   count: 412 },
  { name: "no cap", count: 389 },
  { name: "slay",   count: 301 },
  { name: "ate",    count: 275 },
  { name: "delulu", count: 248 },
  { name: "NPC",    count: 201 },
  { name: "era",    count: 178 },
];

const ZERO_RESULTS = [
  { word: "understood the assignment", count: 87, date: "2026-04-04" },
  { word: "it's giving",               count: 64, date: "2026-04-03" },
  { word: "NPC energy",                count: 52, date: "2026-04-04" },
  { word: "roman empire",              count: 41, date: "2026-04-02" },
  { word: "very demure",               count: 38, date: "2026-04-01" },
];

const DROPOUT_DATA = [
  { name: "도입부",   rate: 8  },
  { name: "예시1",    rate: 12 },
  { name: "예시2",    rate: 19 },
  { name: "퀴즈1",    rate: 34 },
  { name: "퀴즈2",    rate: 28 },
  { name: "퀴즈3",    rate: 41 },
  { name: "결과화면", rate: 15 },
];

const AGE_GROUPS = [
  { name: "10대",  value: 38, color: G.accent  },
  { name: "20대",  value: 42, color: G.blue    },
  { name: "30대",  value: 13, color: G.purple  },
  { name: "40대+", value: 7,  color: G.green   },
];

const DAILY_ACTIVE = [
  { name: "재방문",  value: 289, color: G.blue   },
  { name: "신규방문", value: 23,  color: G.accent },
];

const SIGNUP_SOURCE = [
  { name: "일반가입", value: 11, color: G.navy   },
  { name: "Google",  value: 8,  color: G.blue   },
  { name: "Kakao",   value: 4,  color: "#f59e0b" },
];

const WEIGHTS = [
  { label: "인기 점수",   value: 30 },
  { label: "개인화 점수", value: 40 },
  { label: "최신성",      value: 20 },
  { label: "학습 부족도", value: 10 },
];

const MENU = [
  { key: "dashboard",    label: "대시보드",          icon: LayoutDashboard },
  { key: "content",      label: "콘텐츠 관리",        icon: BookOpen        },
  { key: "users",        label: "유저 관리",          icon: Users           },
  { key: "review",       label: "검수 / 신고",        icon: ShieldAlert     },
  { key: "community",    label: "커뮤니티",           icon: MessageSquare   },
  { key: "analytics",    label: "통계",               icon: BarChart3       },
  { key: "notification", label: "공지사항",             icon: Bell            },
  { key: "recommend",    label: "추천 설정 (보류)",   icon: Sparkles        },
];

/* ─── 공통 컴포넌트 ──────────────────────────────────── */
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

/* ─── 대시보드 ──────────────────────────────────────── */
function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle
        title="슬랭 학습 관리자"
        subtitle="콘텐츠, 유저, 검수, 통계를 한 화면에서 관리합니다."
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" size="sm"><Bell size={14} style={{ marginRight: 6 }} />알림</Button>
            <Button size="sm"><Plus size={14} style={{ marginRight: 6 }} />새 슬랭 등록</Button>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {STATS.map(s => {
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
          { title: "일일 접속자",  sub: "오늘 기준 총 312명", data: DAILY_ACTIVE,  isPercent: false },
          { title: "일일 신규가입", sub: "오늘 기준 총 23명",  data: SIGNUP_SOURCE, isPercent: false },
          { title: "연령대 분포",  sub: "전체 사용자 기준",   data: AGE_GROUPS,    isPercent: true  },
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
              { icon: Flame,  color: G.accent, title: "트렌딩 슬랭 업데이트", desc: "급상승 표현 4개가 자동 후보로 등록되었습니다." },
              { icon: Clock3, color: G.blue,   title: "검수 대기",             desc: "17건 중 5건이 48시간 이상 지연 중입니다." },
              { icon: ZapOff, color: G.red,    title: "Zero Result",           desc: "오늘 미등록 검색어 5건이 수집되었습니다." },
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

/* ─── 콘텐츠 관리 ───────────────────────────────────── */
function ContentPage() {
  const [tab, setTab] = useState("list");
  const [query, setQuery] = useState("");
  const [slangs, setSlangs] = useState(SLANGS);

  const filtered = useMemo(() =>
    slangs.filter(s =>
      [s.term, s.meaning, s.origin, ...s.tags].join(" ").toLowerCase().includes(query.toLowerCase())
    ), [slangs, query]);

  function deleteSlang(id) {
    if (window.confirm("삭제할까요?")) setSlangs(prev => prev.filter(s => s.id !== id));
  }

  const statusColor  = { "공개": G.green, "검수 대기": "#f59e0b", "비공개": G.gray };
  const validityColor = { "트렌디": G.accent, "올드패션드": G.gray, "보통": G.blue };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle
        title="콘텐츠 관리"
        subtitle="슬랭 카드, 어원, 태그, 멀티미디어, 유효기간을 관리합니다."
        action={<Button size="sm"><Plus size={14} style={{ marginRight: 6 }} />슬랭 추가</Button>}
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
                  {["슬랭", "뜻", "어원", "태그", "상태", "유효기간", "트렌드", ""].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray, letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 12 }}>{s.term}</td>
                    <td style={{ padding: "14px 16px", color: G.gray, maxWidth: 160 }}>{s.meaning}</td>
                    <td style={{ padding: "14px 16px", color: G.gray, fontSize: 12, maxWidth: 140 }}>{s.origin}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {s.tags.map(t => <Badge key={t} color={G.purple}>{t}</Badge>)}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge color={statusColor[s.status] || G.gray}>{s.status}</Badge>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge color={validityColor[s.validity] || G.gray}>{s.validity}</Badge>
                    </td>
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
                <tr key={s.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 12 }}>{s.term}</td>
                  <td style={{ padding: "14px 16px", flex: 1 }}>
                    {s.media
                      ? <a href={s.media} target="_blank" rel="noreferrer" style={{ color: G.blue, fontSize: 12, textDecoration: "none" }}>
                          <Link size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{s.media}
                        </a>
                      : <span style={{ color: G.gray, fontSize: 12 }}>— 미연결</span>
                    }
                  </td>
                  <td style={{ padding: "14px 16px", color: G.gray }}>{s.source}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <Button variant="secondary" size="sm"><Link size={12} style={{ marginRight: 4 }} />URL 연결</Button>
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

/* ─── 유저 관리 ─────────────────────────────────────── */
function UsersPage() {
  const [users, setUsers] = useState(USERS);
  const [confirm, setConfirm] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() =>
    users.filter(u => [u.name, u.email].join(" ").toLowerCase().includes(query.toLowerCase())),
    [users, query]);

  function deleteUser(id) {
    setUsers(prev => prev.filter(u => u.id !== id));
    setConfirm(null);
  }
  function toggleExpert(id) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: u.role === "Expert" ? "일반" : "Expert" } : u));
  }

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
              {["#", "이름", "이메일", "연속 학습", "정답률", "권한", "신고누적", "상태", "가입일", ""].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray, letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px", color: G.gray }}>{u.id}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700 }}>{u.name}</td>
                <td style={{ padding: "14px 16px", color: G.gray }}>{u.email}</td>
                <td style={{ padding: "14px 16px" }}>{u.streak}일</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 50, height: 6, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${u.accuracy}%`, borderRadius: 100,
                        background: u.accuracy >= 80 ? G.green : u.accuracy >= 60 ? "#f59e0b" : G.red }} />
                    </div>
                    <span style={{ color: G.gray, fontSize: 12 }}>{u.accuracy}%</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge color={u.role === "Expert" ? G.accent : G.gray}>
                    {u.role === "Expert" ? "⭐ Expert" : "일반"}
                  </Badge>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ color: u.reports >= 3 ? G.red : G.gray, fontWeight: u.reports >= 3 ? 700 : 400 }}>{u.reports}회</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge color={u.status === "활성" ? G.green : G.gray}>{u.status}</Badge>
                </td>
                <td style={{ padding: "14px 16px", color: G.gray }}>{u.joined}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button variant="secondary" size="sm" onClick={() => toggleExpert(u.id)}
                      style={{ fontSize: 11 }}>{u.role === "Expert" ? "Expert 해제" : "Expert 부여"}</Button>
                    {confirm === u.id ? (
                      <>
                        <Button variant="danger" size="sm" onClick={() => deleteUser(u.id)}>확인</Button>
                        <Button variant="secondary" size="sm" onClick={() => setConfirm(null)}>취소</Button>
                      </>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => setConfirm(u.id)}
                        style={{ color: G.red, border: `1px solid ${G.red}40` }}>탈퇴</Button>
                    )}
                  </div>
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
  const [reports, setReports] = useState(REPORTS);

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
                {["신조어", "뜻", "제보자", "신뢰도 점수", ""].map(h => (
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

      {tab === "reports" && (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0ede6" }}>
                {["표현", "신고 사유", "심각도", "신고자", "신뢰도", ""].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", fontWeight: 700 }}>{r.term}</td>
                  <td style={{ padding: "14px 16px", color: G.gray }}>{r.reason}</td>
                  <td style={{ padding: "14px 16px" }}><Badge color={severityColor[r.severity] || G.gray}>{r.severity}</Badge></td>
                  <td style={{ padding: "14px 16px", color: G.gray }}>{r.reporter}</td>
                  <td style={{ padding: "14px 16px" }}><TrustBadge score={r.trust} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <Button variant="secondary" size="sm" onClick={() => setReports(p => p.filter(x => x.id !== r.id))}>검토 완료</Button>
                      <Button size="sm" onClick={() => setReports(p => p.filter(x => x.id !== r.id))}>숨김</Button>
                    </div>
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
      <SectionTitle title="통계" subtitle="사용 추이, 인기 검색어, 이탈 구간, Zero Result를 추적합니다." />

      <SubTabs
        tabs={[
          { key: "usage",   label: "사용 추이"    },
          { key: "search",  label: "인기 검색어"  },
          { key: "dropout", label: "이탈 구간"    },
          { key: "zero",    label: "Zero Result"  },
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
              <div style={{ fontSize: 14, fontWeight: 700 }}>Zero Result 로그</div>
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

/* ─── 추천 설정 (보류) ──────────────────────────────── */
function RecommendPage() {
  const [weights, setWeights] = useState(WEIGHTS);
  const total = weights.reduce((s, w) => s + w.value, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle title="추천 설정 (보류)" subtitle="인기, 개인화, 최신성, 학습 부족도 가중치를 관리합니다." />
      <Card style={{ padding: "20px 24px", border: "1.5px dashed #e5e0d8" }}>
        <div style={{ fontSize: 13, color: G.gray }}>⏸ 추천 알고리즘 백엔드 구현 전까지 보류된 기능입니다.</div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {weights.map((w, i) => (
          <Card key={w.label} style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              <span>{w.label}</span>
              <span style={{ color: G.accent, fontWeight: 800 }}>{w.value}%</span>
            </div>
            <ProgressBar value={w.value} />
            <input type="range" min={0} max={100} value={w.value}
              onChange={e => setWeights(prev => prev.map((p, idx) => idx === i ? { ...p, value: Number(e.target.value) } : p))}
              style={{ width: "100%", marginTop: 12, accentColor: G.accent }} />
          </Card>
        ))}
      </div>
      <Card style={{ padding: "22px 26px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>추천 공식 미리보기</div>
        <div style={{ background: G.navy, borderRadius: 14, padding: "14px 18px", fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
          추천 점수 = (인기 × {(weights[0].value / 100).toFixed(2)}) + (개인화 × {(weights[1].value / 100).toFixed(2)}) + (최신성 × {(weights[2].value / 100).toFixed(2)}) + (학습 부족도 × {(weights[3].value / 100).toFixed(2)})
        </div>
        {total !== 100 && <div style={{ marginTop: 10, fontSize: 12, color: G.red, fontWeight: 700 }}>⚠ 합계가 {total}%입니다 (100%여야 합니다)</div>}
      </Card>
    </div>
  );
}

/* ─── 메인 Admin ────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.role !== 1) navigate("/dashboard");
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const pages = {
    dashboard:    <DashboardPage />,
    content:      <ContentPage />,
    users:        <UsersPage />,
    review:       <ReviewPage />,
    community:    <CommunityPage />,
    analytics:    <AnalyticsPage />,
    notification: <NotificationPage />,
    recommend:    <RecommendPage />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6", fontFamily: "'Noto Sans KR', sans-serif", display: "grid", gridTemplateColumns: "260px 1fr" }}>

      {/* Sidebar */}
      <aside style={{ background: G.white, borderRight: "1px solid rgba(0,0,0,0.06)", padding: 16, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ background: G.navy, borderRadius: 18, padding: "14px 18px", color: G.white, marginBottom: 24, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Unbounded', sans-serif", fontSize: 11, fontWeight: 900 }}>IN</div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Admin Panel</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>영어인싸되기</div>
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, overflowY: "auto" }}>
          {MENU.map(item => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button key={item.key} onClick={() => setActive(item.key)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 14,
                border: "none", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s",
                background: isActive ? G.navy : "transparent",
                color: isActive ? G.white : G.gray,
                fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, fontWeight: isActive ? 700 : 500,
                flexShrink: 0,
              }}>
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>

        <div style={{ background: G.lightGray, borderRadius: 14, padding: "14px 16px", margin: "16px 0 12px", flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: G.black, marginBottom: 6 }}>운영 팁</div>
          <div style={{ fontSize: 12, color: G.gray, lineHeight: 1.6 }}>트렌드 점수와 신고 항목을 함께 관리하세요.</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, border: `1px solid ${G.border}`, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 100, background: G.accent, display: "flex", alignItems: "center", justifyContent: "center", color: G.white, fontSize: 12, fontWeight: 700 }}>
            {user.nickname?.[0] || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: G.black }}>{user.nickname || "관리자"}</div>
            <div style={{ fontSize: 11, color: G.gray }}>관리자</div>
          </div>
          <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: G.gray, padding: 4, borderRadius: 8 }} title="일반 페이지로">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: "28px 32px", overflow: "auto" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 28 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={14} color={G.gray} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input placeholder="관리자 기능 검색" style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 100, border: "none", background: G.white, fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", boxSizing: "border-box" }} />
          </div>
          <Button variant="secondary" size="sm"><Settings size={14} style={{ marginRight: 6 }} />설정</Button>
        </div>

        {pages[active]}
      </main>
    </div>
  );
}
