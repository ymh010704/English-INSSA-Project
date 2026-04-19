import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Sidebar from "../components/Sidebar"; 

/* ── 섹션 래퍼 ── */
function Section({ title, children }) {
  return (
    <div style={{ background: G.white, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", marginBottom: 16 }}>
      <div style={{ padding: "20px 28px 14px", borderBottom: "1px solid #f3f0ea" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: G.gray }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

/* ── 설정 행 ── */
function Row({ icon, label, sub, right, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "16px 28px", cursor: onClick ? "pointer" : "default",
      borderBottom: "1px solid #f7f4ef", transition: "background 0.15s",
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = G.lightGray)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 38, height: 38, borderRadius: 12, background: danger ? "#fef2f2" : G.lightGray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? G.red : G.black }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ── 토글 ── */
function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 46, height: 26, borderRadius: 13,
      background: value ? G.accent : "#d1d5db",
      position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: G.white,
        position: "absolute", top: 3, left: value ? 23 : 3, transition: "left 0.2s",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

/* ── 모달 ── */
function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.white, borderRadius: 28, padding: "32px 32px 28px", width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: G.black, marginBottom: 24 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [active, setActive] = useState("settings"); // 사이드바 활성 상태

  // 프로필 정보 
  const [name, setName] = useState("인싸");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);

  // 알림 & 목표 설정 상태
  const [notiDaily, setNotiDaily] = useState(true);
  const [notiStreak, setNotiStreak] = useState(true);
  const [notiReview, setNotiReview] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(5);

  // 모달 제어
  const [modal, setModal] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setName(user.nickname || user.name || "인싸");
        setEmail(user.email || "");
      } catch (e) { console.error("유저 정보 파싱 에러:", e); }
    }
  }, []);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  }

  function handleSaveProfile() {
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); }, 1500);
  }

  function handleChangePw() {
    setPwError("");
    if (!newPw || newPw.length < 8) { setPwError("8자 이상 입력해주세요."); return; }
    if (newPw !== confirmPw) { setPwError("비밀번호가 일치하지 않아요."); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); setNewPw(""); setConfirmPw(""); }, 1500);
  }

  function handleResetData() {
    localStorage.removeItem("recentSearch");
    setModal(null);
    alert("학습 데이터가 초기화됐어요!");
  }

  function handleDeleteAccount() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* 사이드바 고정 */}
      <Sidebar active={active} setActive={setActive} />

      <div style={{ flex: 1, minHeight: "100vh", background: "#f0ede6", overflowY: "auto", fontFamily: "'Noto Sans KR', sans-serif" }}>
        
        <PageHeader title="설정" emoji="⚙️" />

        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ background: `linear-gradient(145deg, ${G.navy}, #1e3a5f)`, borderRadius: 24, padding: "28px 32px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(255,77,0,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: avatar ? "transparent" : G.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontFamily: "'Unbounded', sans-serif", fontWeight: 900, color: G.white, overflow: "hidden", border: "3px solid rgba(255,255,255,0.2)" }}>
                {avatar ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name[0]}
              </div>
              <button onClick={() => fileRef.current.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: G.accent2, border: "2px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11 }}>✏️</button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: G.white, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{email}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 100, padding: "4px 12px" }}>
                <span style={{ fontSize: 12 }}>⚡</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Intermediate</span>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setModal("profile")} size="sm" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: G.white, borderRadius: 12 }}>수정</Button>
          </div>

          {/* 설정 섹션들 */}
          <Section title="🎯 학습 목표">
            <div style={{ padding: "20px 28px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: G.black, marginBottom: 16 }}>하루 목표: <span style={{ color: G.accent }}>{dailyGoal}개</span></div>
              <div style={{ display: "flex", gap: 10 }}>
                {[3, 5, 10, 15, 20].map(n => (
                  <button key={n} onClick={() => setDailyGoal(n)} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: `2px solid ${dailyGoal === n ? G.accent : G.border}`, background: dailyGoal === n ? "rgba(255,77,0,0.06)" : G.white, color: dailyGoal === n ? G.accent : G.gray, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{n}개</button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="🔔 알림 설정">
            <Row icon="📅" label="매일 학습 알림" sub="오전 9시에 알려드려요" right={<Toggle value={notiDaily} onChange={setNotiDaily} />} />
            <Row icon="🔥" label="스트릭 알림" sub="연속 학습을 놓치지 않도록" right={<Toggle value={notiStreak} onChange={setNotiStreak} />} />
          </Section>

          <Section title="🔒 계정">
            <Row icon="🔑" label="비밀번호 변경" sub="정기적으로 변경을 권장해요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("password")} />
          </Section>

          <Section title="⚠️ 위험 구역">
            <Row icon="📊" label="학습 데이터 초기화" sub="검색 기록이 삭제돼요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("reset")} danger />
            <Row icon="🗑️" label="계정 탈퇴" sub="모든 데이터가 영구 삭제돼요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("delete")} danger />
          </Section>

          <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: G.gray }}>
            영어인싸되기 v1.0.0 · Made with 🧡 by Engssa Team
          </div>
        </div>
      </div>

      {/* ── 모달 렌더링 ── */}
      {modal === "profile" && (
        <Modal title="👤 프로필 수정" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>이름</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px", borderRadius: 12, border: `1.5px solid ${G.border}` }} />
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setModal(null)} style={{ flex: 1 }}>취소</Button>
              <Button onClick={handleSaveProfile} style={{ flex: 1 }}>저장</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}