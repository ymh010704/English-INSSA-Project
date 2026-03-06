import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const G = {
  black: "#0a0a0a", white: "#ffffff",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981", red: "#ef4444", border: "#e5e0d8",
};

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

  // 프로필
  const [name, setName] = useState("이경현");
  const [email] = useState("kyoung@engssa.kr");
  const [avatar, setAvatar] = useState(null);

  // 알림
  const [notiDaily, setNotiDaily] = useState(true);
  const [notiStreak, setNotiStreak] = useState(true);
  const [notiReview, setNotiReview] = useState(false);

  // 학습 목표
  const [dailyGoal, setDailyGoal] = useState(5);

  // 모달
  const [modal, setModal] = useState(null); // "profile" | "password" | "reset" | "delete"
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [saved, setSaved] = useState(false);

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
    if (!newPw) { setPwError("새 비밀번호를 입력해주세요."); return; }
    if (newPw.length < 8) { setPwError("8자 이상 입력해주세요."); return; }
    if (newPw !== confirmPw) { setPwError("비밀번호가 일치하지 않아요."); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); setNewPw(""); setConfirmPw(""); }, 1500);
  }

  function handleResetData() {
    localStorage.removeItem("bookmarks");
    localStorage.removeItem("recentSearch");
    setModal(null);
    alert("학습 데이터가 초기화됐어요!");
  }

  function handleDeleteAccount() {
    setModal(null);
    navigate("/");
  }

  return (
    <div style={{ minHeight: "100vh", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* 헤더 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500 }}>← 뒤로가기</button>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black }}>⚙️ <span style={{ color: G.accent }}>설정</span></div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>

        {/* 프로필 카드 */}
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
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Intermediate · 1,240 XP</span>
            </div>
          </div>
          <button onClick={() => setModal("profile")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: G.white, fontFamily: "'Noto Sans KR', sans-serif", flexShrink: 0 }}>
            수정
          </button>
        </div>

        {/* 학습 목표 */}
        <Section title="🎯 학습 목표">
          <div style={{ padding: "20px 28px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: G.black, marginBottom: 16 }}>
              하루 목표: <span style={{ color: G.accent, fontFamily: "'Unbounded', sans-serif", fontWeight: 900 }}>{dailyGoal}개</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[3, 5, 10, 15, 20].map(n => (
                <button key={n} onClick={() => setDailyGoal(n)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 12,
                  border: `2px solid ${dailyGoal === n ? G.accent : G.border}`,
                  background: dailyGoal === n ? "rgba(255,77,0,0.06)" : G.white,
                  color: dailyGoal === n ? G.accent : G.gray,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.15s",
                }}>{n}개</button>
              ))}
            </div>
          </div>
        </Section>

        {/* 알림 설정 */}
        <Section title="🔔 알림 설정">
          <Row icon="📅" label="매일 학습 알림" sub="오전 9시에 알려드려요" right={<Toggle value={notiDaily} onChange={setNotiDaily} />} />
          <Row icon="🔥" label="스트릭 알림" sub="연속 학습을 놓치지 않도록" right={<Toggle value={notiStreak} onChange={setNotiStreak} />} />
          <Row icon="🔁" label="복습 알림" sub="복습할 카드가 있을 때" right={<Toggle value={notiReview} onChange={setNotiReview} />} />
        </Section>

        {/* 계정 설정 */}
        <Section title="🔒 계정">
          <Row icon="🔑" label="비밀번호 변경" sub="정기적으로 변경을 권장해요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("password")} />
        </Section>

        {/* 위험 구역 */}
        <Section title="⚠️ 위험 구역">
          <Row icon="📊" label="학습 데이터 초기화" sub="북마크, 검색 기록이 삭제돼요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("reset")} danger />
          <Row icon="🗑️" label="계정 탈퇴" sub="계정과 모든 데이터가 삭제돼요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("delete")} danger />
        </Section>

        {/* 앱 정보 */}
        <div style={{ textAlign: "center", padding: "8px 0 24px", fontSize: 12, color: G.gray }}>
          영어인싸되기 v1.0.0 · Made with 🧡 by Engssa Team
        </div>
      </div>

      {/* ── 모달들 ── */}

      {/* 프로필 수정 */}
      {modal === "profile" && (
        <Modal title="👤 프로필 수정" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>이름</label>
              <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 14, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = G.accent}
                onBlur={e => e.target.style.borderColor = G.border}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>프로필 사진</label>
              <button onClick={() => fileRef.current.click()} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed ${G.border}`, background: G.lightGray, fontSize: 13, color: G.gray, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600 }}>
                📷 사진 변경하기
              </button>
            </div>
            {saved ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "12px", textAlign: "center", fontSize: 14, fontWeight: 700, color: G.green }}>✅ 저장됐어요!</div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setModal(null)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${G.border}`, background: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", color: G.gray }}>취소</button>
                <button onClick={handleSaveProfile} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 6px 20px rgba(255,77,0,0.3)" }}>저장</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 비밀번호 변경 */}
      {modal === "password" && (
        <Modal title="🔑 비밀번호 변경" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>새 비밀번호</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="8자 이상" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 14, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = G.accent}
                onBlur={e => e.target.style.borderColor = G.border}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>비밀번호 확인</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="비밀번호 재입력" style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 14, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = G.accent}
                onBlur={e => e.target.style.borderColor = G.border}
              />
            </div>
            {pwError && <div style={{ fontSize: 12, color: G.red, fontWeight: 600 }}>⚠️ {pwError}</div>}
            {saved ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "12px", textAlign: "center", fontSize: 14, fontWeight: 700, color: G.green }}>✅ 변경됐어요!</div>
            ) : (
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setModal(null)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${G.border}`, background: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", color: G.gray }}>취소</button>
                <button onClick={handleChangePw} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 6px 20px rgba(255,77,0,0.3)" }}>변경</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 데이터 초기화 */}
      {modal === "reset" && (
        <Modal title="📊 학습 데이터 초기화" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "#7f1d1d", lineHeight: 1.7 }}>
              ⚠️ 북마크, 최근 검색어 등 학습 기록이 모두 삭제돼요. 이 작업은 되돌릴 수 없어요.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${G.border}`, background: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", color: G.gray }}>취소</button>
              <button onClick={handleResetData} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: G.red, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>초기화</button>
            </div>
          </div>
        </Modal>
      )}

      {/* 계정 탈퇴 */}
      {modal === "delete" && (
        <Modal title="🗑️ 계정 탈퇴" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "#7f1d1d", lineHeight: 1.7 }}>
              ⚠️ 계정과 모든 학습 데이터가 영구 삭제돼요. 탈퇴 후에는 복구가 불가능해요.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${G.border}`, background: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", color: G.gray }}>취소</button>
              <button onClick={handleDeleteAccount} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: G.red, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>탈퇴하기</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}