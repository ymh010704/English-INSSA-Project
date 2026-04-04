import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import Button from "../components/Button";

/* ── 목 데이터 (백엔드 API 연동 시 교체) ── */
const MOCK_STATS = {
  totalUsers: 1284,
  todayUsers: 23,
  totalSlangs: 48,
  dailyActive: 312,
  avgQuizCount: 4.7,
};

const MOCK_DAILY_ACTIVE = [
  { d: "월", count: 210 }, { d: "화", count: 285 }, { d: "수", count: 320 },
  { d: "목", count: 298 }, { d: "금", count: 350 }, { d: "토", count: 180 }, { d: "일", count: 312 },
];

const MOCK_DAILY_SIGNUP = [
  { d: "월", count: 14 }, { d: "화", count: 21 }, { d: "수", count: 18 },
  { d: "목", count: 30 }, { d: "금", count: 25 }, { d: "토", count: 9 }, { d: "일", count: 23 },
];

const MOCK_QUIZ_AVG = [
  { d: "월", count: 3.8 }, { d: "화", count: 4.2 }, { d: "수", count: 5.1 },
  { d: "목", count: 4.6 }, { d: "금", count: 5.5 }, { d: "토", count: 3.2 }, { d: "일", count: 4.7 },
];

const MOCK_USED_SLANGS = [
  { word: "No cap", count: 892 },
  { word: "Slay", count: 741 },
  { word: "Rizz", count: 623 },
  { word: "Vibe check", count: 510 },
  { word: "Ghosting", count: 488 },
];

const MOCK_WRONG_SLANGS = [
  { word: "Rent free", count: 312 },
  { word: "Main character energy", count: 278 },
  { word: "Sus", count: 241 },
  { word: "Stan", count: 198 },
  { word: "Tea", count: 165 },
];

const MOCK_RIGHT_SLANGS = [
  { word: "Bet", count: 654 },
  { word: "Flex", count: 589 },
  { word: "No cap", count: 541 },
  { word: "Ghosting", count: 487 },
  { word: "Slay", count: 432 },
];

const MOCK_USERS = [
  { id: 1, email: "yun@google.com",    nickname: "윤민혁", role: 0, provider: "local",  created_at: "2025-12-01" },
  { id: 2, email: "doodoo@google.com", nickname: "김두현", role: 0, provider: "local",  created_at: "2025-12-03" },
  { id: 3, email: "lee@google.com",    nickname: "이경현", role: 0, provider: "google", created_at: "2026-01-10" },
  { id: 4, email: "kim@google.com",    nickname: "김민우", role: 0, provider: "local",  created_at: "2026-02-14" },
  { id: 5, email: "che@google.com",    nickname: "이채영", role: 0, provider: "kakao",  created_at: "2026-03-05" },
  { id: 6, email: "admin@engssa.kr",   nickname: "관리자", role: 1, provider: "local",  created_at: "2025-11-01" },
];

const MOCK_SLANGS = [
  { id: 1, word: "Ghosting",   definition_ko: "상대방의 연락을 갑자기 끊고 잠수 타는 것" },
  { id: 2, word: "Sus",        definition_ko: "수상쩍거나 의심스러울 때 쓰는 표현" },
  { id: 3, word: "No cap",     definition_ko: "진심으로, 거짓말 아니고 진짜라는 뜻" },
  { id: 4, word: "Rizz",       definition_ko: "이성을 끄는 매력이나 끼를 부리는 능력" },
  { id: 5, word: "Vibe check", definition_ko: "분위기 파악이나 기분 체크" },
  { id: 6, word: "Flex",       definition_ko: "자신의 부나 성공을 뽐낼 때" },
  { id: 7, word: "Slay",       definition_ko: "완전 죽여준다, 찢었다라는 뜻" },
  { id: 8, word: "Stan",       definition_ko: "누군가의 열렬한 팬, 덕질" },
];

const MOCK_REPORTS = [
  { id: 1, word: "Delulu",  definition_ko: "망상적인, 현실과 동떨어진", reporter: "이경현", status: "pending" },
  { id: 2, word: "Era",     definition_ko: "특정 시기나 단계를 뜻함 (ex. villain era)", reporter: "김민우", status: "pending" },
  { id: 3, word: "NPC",     definition_ko: "게임 속 비플레이어 캐릭터처럼 주체성 없이 행동하는 사람", reporter: "윤민혁", status: "pending" },
];

const MOCK_POSTS = [
  { id: 1, author: "이경현", title: "Rizz 진짜 자주 쓰이나요?",         comments: 4, created_at: "2026-03-20" },
  { id: 2, author: "김민우", title: "No cap 쓰는 상황 헷갈려요",         comments: 7, created_at: "2026-03-21" },
  { id: 3, author: "윤민혁", title: "AI 회화 연습 너무 재밌어요 ㅋㅋ",   comments: 2, created_at: "2026-03-22" },
  { id: 4, author: "이채영", title: "Delulu 신조어 제보했어요!",          comments: 1, created_at: "2026-03-23" },
];

const MOCK_COMMENTS = [
  { id: 1, author: "김두현", post: "Rizz 진짜 자주 쓰이나요?",      content: "네 요즘 엄청 많이 써요!", created_at: "2026-03-20" },
  { id: 2, author: "이채영", post: "No cap 쓰는 상황 헷갈려요",      content: "저도 처음엔 헷갈렸어요ㅋ", created_at: "2026-03-21" },
  { id: 3, author: "관리자", post: "AI 회화 연습 너무 재밌어요 ㅋㅋ", content: "감사합니다 :)",              created_at: "2026-03-22" },
];

/* ── 공통 섹션 카드 ── */
function Card({ title, sub, children, style = {} }) {
  return (
    <div style={{ background: G.white, borderRadius: 20, padding: "24px 28px", border: "1px solid rgba(0,0,0,0.05)", ...style }}>
      {(title || sub) && (
        <div style={{ marginBottom: 20 }}>
          {title && <div style={{ fontSize: 14, fontWeight: 700, color: G.black }}>{title}</div>}
          {sub && <div style={{ fontSize: 12, color: G.gray, marginTop: 3 }}>{sub}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── 세로 막대 차트 ── */
function BarChart({ data, color = G.accent, unit = "" }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const h = Math.max((d.count / max) * 90, 6);
        return (
          <div key={d.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: G.black }}>{d.count}{unit}</div>
            <div style={{ width: "100%", height: h, borderRadius: 6, background: isLast ? color : `${color}66`, transition: "height 0.4s ease" }} />
            <div style={{ fontSize: 11, color: isLast ? color : G.gray, fontWeight: isLast ? 700 : 400 }}>{d.d}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 가로 막대 차트 ── */
function HBarChart({ data, color = G.accent }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={d.word}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: G.black }}>{d.word}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color }}>{d.count.toLocaleString()}회</span>
          </div>
          <div style={{ height: 8, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(d.count / max) * 100}%`, background: color, borderRadius: 100, transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 대시보드 탭 ── */
function DashboardTab() {
  const stats = [
    { icon: "👥", label: "총 가입자",    value: MOCK_STATS.totalUsers.toLocaleString(), color: G.accent },
    { icon: "🆕", label: "오늘 가입자",  value: `+${MOCK_STATS.todayUsers}`,            color: G.green },
    { icon: "📚", label: "총 슬랭 수",   value: `${MOCK_STATS.totalSlangs}개`,          color: G.blue },
    { icon: "🔥", label: "오늘 접속자",  value: MOCK_STATS.dailyActive.toLocaleString(), color: G.purple },
    { icon: "📝", label: "평균 풀이 횟수", value: `${MOCK_STATS.avgQuizCount}회`,        color: "#f59e0b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: G.white, borderRadius: 18, padding: "20px 22px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: G.gray }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 차트 Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Card title="📈 일일 접속자" sub="최근 7일">
          <BarChart data={MOCK_DAILY_ACTIVE} color={G.accent} />
        </Card>
        <Card title="🆕 일일 신규 가입" sub="최근 7일">
          <BarChart data={MOCK_DAILY_SIGNUP} color={G.green} />
        </Card>
        <Card title="📝 평균 문제 풀이 횟수" sub="최근 7일">
          <BarChart data={MOCK_QUIZ_AVG} color={G.purple} unit="회" />
        </Card>
      </div>

      {/* 차트 Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Card title="🔥 수업에 많이 사용된 슬랭" sub="Top 5">
          <HBarChart data={MOCK_USED_SLANGS} color={G.accent} />
        </Card>
        <Card title="❌ 자주 틀린 슬랭" sub="Top 5">
          <HBarChart data={MOCK_WRONG_SLANGS} color={G.red} />
        </Card>
        <Card title="✅ 자주 맞힌 슬랭" sub="Top 5">
          <HBarChart data={MOCK_RIGHT_SLANGS} color={G.green} />
        </Card>
      </div>
    </div>
  );
}

/* ── 유저 관리 탭 ── */
function UserTab() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [confirm, setConfirm] = useState(null);

  function deleteUser(id) {
    // TODO: DELETE /api/admin/users/:id
    setUsers(prev => prev.filter(u => u.id !== id));
    setConfirm(null);
  }

  return (
    <Card title={`👥 유저 목록`} sub={`총 ${users.length}명`}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #f0ede6" }}>
            {["#", "이메일", "닉네임", "가입 경로", "권한", "가입일", ""].map(h => (
              <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray, letterSpacing: 1 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: "1px solid #f7f4ef" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <td style={{ padding: "12px 12px", color: G.gray }}>{u.id}</td>
              <td style={{ padding: "12px 12px", fontWeight: 500 }}>{u.email}</td>
              <td style={{ padding: "12px 12px", fontWeight: 600 }}>{u.nickname}</td>
              <td style={{ padding: "12px 12px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                  background: u.provider === "local" ? G.lightGray : u.provider === "google" ? "#dbeafe" : "#fef9c3",
                  color: u.provider === "local" ? G.gray : u.provider === "google" ? G.blue : "#92400e",
                }}>{u.provider}</span>
              </td>
              <td style={{ padding: "12px 12px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                  background: u.role === 1 ? "rgba(255,77,0,0.1)" : G.lightGray,
                  color: u.role === 1 ? G.accent : G.gray,
                }}>{u.role === 1 ? "관리자" : "일반"}</span>
              </td>
              <td style={{ padding: "12px 12px", color: G.gray }}>{u.created_at}</td>
              <td style={{ padding: "12px 12px" }}>
                {u.role !== 1 && (
                  confirm === u.id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button variant="danger" size="sm" onClick={() => deleteUser(u.id)} style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12 }}>확인</Button>
                      <Button variant="secondary" size="sm" onClick={() => setConfirm(null)} style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12 }}>취소</Button>
                    </div>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => setConfirm(u.id)} style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12, color: G.red, border: `1px solid ${G.red}` }}>강제 탈퇴</Button>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ── 슬랭 관리 탭 ── */
function SlangTab() {
  const [slangs, setSlangs] = useState(MOCK_SLANGS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ word: "", definition_ko: "" });

  function deleteSlang(id) {
    // TODO: DELETE /api/admin/slangs/:id
    setSlangs(prev => prev.filter(s => s.id !== id));
  }

  function saveEdit() {
    // TODO: PUT /api/admin/slangs/:id
    setSlangs(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
    setEditing(null);
    setForm({ word: "", definition_ko: "" });
  }

  function addSlang() {
    // TODO: POST /api/admin/slangs
    const newSlang = { id: Date.now(), ...form };
    setSlangs(prev => [newSlang, ...prev]);
    setShowAdd(false);
    setForm({ word: "", definition_ko: "" });
  }

  function approveReport(id) {
    // TODO: POST /api/admin/reports/:id/approve
    const report = reports.find(r => r.id === id);
    setSlangs(prev => [...prev, { id: Date.now(), word: report.word, definition_ko: report.definition_ko }]);
    setReports(prev => prev.filter(r => r.id !== id));
  }

  function rejectReport(id) {
    // TODO: POST /api/admin/reports/:id/reject
    setReports(prev => prev.filter(r => r.id !== id));
  }

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${G.border}`, fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 제보된 슬랭 */}
      {reports.length > 0 && (
        <Card title="📬 제보된 슬랭" sub={`승인 대기 ${reports.length}건`} style={{ border: "1.5px solid rgba(255,77,0,0.2)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reports.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,77,0,0.04)", borderRadius: 12 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 14, fontWeight: 900, color: G.black }}>{r.word}</span>
                  <span style={{ fontSize: 12, color: G.gray, marginLeft: 10 }}>{r.definition_ko}</span>
                </div>
                <span style={{ fontSize: 12, color: G.gray }}>제보: {r.reporter}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={() => approveReport(r.id)} size="sm" style={{ borderRadius: 8, padding: "6px 14px", fontSize: 12 }}>✅ 승인</Button>
                  <Button variant="secondary" onClick={() => rejectReport(r.id)} size="sm" style={{ borderRadius: 8, padding: "6px 14px", fontSize: 12, color: G.red, border: `1px solid ${G.red}` }}>❌ 거절</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 슬랭 목록 */}
      <Card title="📚 슬랭 목록" sub={`총 ${slangs.length}개`}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <Button onClick={() => { setShowAdd(true); setForm({ word: "", definition_ko: "" }); }} size="sm">+ 슬랭 추가</Button>
        </div>

        {/* 추가 폼 */}
        {showAdd && (
          <div style={{ background: "rgba(255,77,0,0.04)", border: "1.5px solid rgba(255,77,0,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: G.gray }}>영어 단어</div>
              <input value={form.word} onChange={e => setForm(f => ({ ...f, word: e.target.value }))} placeholder="ex) No cap" style={inputStyle} />
            </div>
            <div style={{ flex: 2 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: G.gray }}>한국어 설명</div>
              <input value={form.definition_ko} onChange={e => setForm(f => ({ ...f, definition_ko: e.target.value }))} placeholder="ex) 진심으로, 거짓말 아님" style={inputStyle} />
            </div>
            <Button onClick={addSlang} style={{ borderRadius: 10, padding: "10px 18px" }}>추가</Button>
            <Button variant="secondary" onClick={() => setShowAdd(false)} style={{ borderRadius: 10, padding: "10px 18px" }}>취소</Button>
          </div>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0ede6" }}>
              {["#", "영어", "한국어 설명", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray, letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slangs.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 12px", color: G.gray, width: 40 }}>{s.id}</td>
                <td style={{ padding: "12px 12px", width: 160 }}>
                  {editing?.id === s.id
                    ? <input value={form.word} onChange={e => setForm(f => ({ ...f, word: e.target.value }))} style={{ ...inputStyle, padding: "6px 10px" }} />
                    : <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 13, fontWeight: 700 }}>{s.word}</span>
                  }
                </td>
                <td style={{ padding: "12px 12px", color: G.gray }}>
                  {editing?.id === s.id
                    ? <input value={form.definition_ko} onChange={e => setForm(f => ({ ...f, definition_ko: e.target.value }))} style={{ ...inputStyle, padding: "6px 10px" }} />
                    : s.definition_ko
                  }
                </td>
                <td style={{ padding: "12px 12px" }}>
                  {editing?.id === s.id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button onClick={saveEdit} size="sm" style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12 }}>저장</Button>
                      <Button variant="secondary" onClick={() => setEditing(null)} size="sm" style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12 }}>취소</Button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button variant="secondary" size="sm" onClick={() => { setEditing(s); setForm({ word: s.word, definition_ko: s.definition_ko }); }} style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12 }}>수정</Button>
                      <Button variant="secondary" size="sm" onClick={() => deleteSlang(s.id)} style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12, color: G.red, border: `1px solid ${G.red}` }}>삭제</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ── 커뮤니티 관리 탭 ── */
function CommunityTab() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [comments, setComments] = useState(MOCK_COMMENTS);

  function deletePost(id) {
    // TODO: DELETE /api/admin/posts/:id
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  function deleteComment(id) {
    // TODO: DELETE /api/admin/comments/:id
    setComments(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card title="📝 게시글 목록" sub={`총 ${posts.length}개`}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0ede6" }}>
              {["#", "작성자", "제목", "댓글", "작성일", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 12px", color: G.gray }}>{p.id}</td>
                <td style={{ padding: "12px 12px", fontWeight: 600 }}>{p.author}</td>
                <td style={{ padding: "12px 12px" }}>{p.title}</td>
                <td style={{ padding: "12px 12px", color: G.gray }}>{p.comments}개</td>
                <td style={{ padding: "12px 12px", color: G.gray }}>{p.created_at}</td>
                <td style={{ padding: "12px 12px" }}>
                  <Button variant="secondary" size="sm" onClick={() => deletePost(p.id)} style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12, color: G.red, border: `1px solid ${G.red}` }}>삭제</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="💬 댓글 목록" sub={`총 ${comments.length}개`}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0ede6" }}>
              {["#", "작성자", "게시글", "내용", "작성일", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: G.gray }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comments.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f7f4ef" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafaf9"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 12px", color: G.gray }}>{c.id}</td>
                <td style={{ padding: "12px 12px", fontWeight: 600 }}>{c.author}</td>
                <td style={{ padding: "12px 12px", color: G.gray, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.post}</td>
                <td style={{ padding: "12px 12px" }}>{c.content}</td>
                <td style={{ padding: "12px 12px", color: G.gray }}>{c.created_at}</td>
                <td style={{ padding: "12px 12px" }}>
                  <Button variant="secondary" size="sm" onClick={() => deleteComment(c.id)} style={{ borderRadius: 8, padding: "5px 12px", fontSize: 12, color: G.red, border: `1px solid ${G.red}` }}>삭제</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ── 메인 Admin 페이지 ── */
const TABS = [
  { id: "dashboard", label: "📊 대시보드" },
  { id: "users",     label: "👥 유저 관리" },
  { id: "slangs",    label: "📚 슬랭 관리" },
  { id: "community", label: "💬 커뮤니티 관리" },
];

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.role !== 1) navigate("/dashboard");
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede6", fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* 헤더 */}
      <div style={{ background: G.navy, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: G.white }}>
            영어<span style={{ color: G.accent }}>인싸</span>되기
          </div>
          <div style={{ background: "rgba(255,77,0,0.2)", border: "1px solid rgba(255,77,0,0.4)", borderRadius: 100, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: G.accent }}>
            관리자
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{user.nickname}님</span>
          <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard")} style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>← 일반 페이지로</Button>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 40px", display: "flex", gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? G.accent : G.gray,
            borderBottom: `2.5px solid ${tab === t.id ? G.accent : "transparent"}`,
            fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* 구분선 */}
      <div style={{ height: 5, background: "#e5e0d8" }} />

      {/* 콘텐츠 */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "users"     && <UserTab />}
        {tab === "slangs"    && <SlangTab />}
        {tab === "community" && <CommunityTab />}
      </div>
    </div>
  );
}
