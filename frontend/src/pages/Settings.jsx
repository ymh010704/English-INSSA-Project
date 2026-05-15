import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBreakpoint from "../hooks/useBreakpoint";
import { Cog, Calendar, Bell, Lock, Target, AlertTriangle, Key, Smartphone, BarChart2, Trash2, Pencil, Zap, CircleUser, Camera, CheckCircle, Flame, RotateCcw } from "lucide-react";

import G from "../constants/colors";
import PageHeader from "../components/PageHeader";

/* ── 섹션 래퍼 ── */
function Section({ title, children, icon: Icon }) {
  return (
    <div style={{ background: G.white, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", marginBottom: 16 }}>
      <div style={{ padding: "20px 28px 14px", borderBottom: "1px solid #f3f0ea" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: G.gray, display: "flex", alignItems: "center", gap: 6 }}>
          {Icon && <Icon size={11} color={G.gray} strokeWidth={2.5} />}
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── 설정 행 ── */
function Row({ icon: Icon, label, sub, right, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "16px 28px", cursor: onClick ? "pointer" : "default",
      borderBottom: "1px solid #f7f4ef", transition: "background 0.15s",
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = G.lightGray)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 38, height: 38, borderRadius: 12, background: danger ? "#fef2f2" : G.lightGray, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {Icon && <Icon size={18} color={danger ? G.red : G.gray} strokeWidth={1.8} />}
      </div>
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
function Modal({ title, children, onClose, icon: Icon }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.white, borderRadius: 28, padding: "32px 32px 28px", width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: G.black, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          {Icon && <Icon size={16} color={G.black} strokeWidth={2} />}
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const fileRef = useRef(null);

  // 유저 데이터 로드 (이름 등)
  // 프로필
  const [user, setUser] = useState({email:"", nickname:"", provider:"local"})
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if(storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.error("유저 데이터 parse error", e);
      }
    } else {
      // 로그인이 안 되어 있다면, 로그인으로 보내기
      navigate("/login")
    }
  }, [navigate]);

  // 알림 / 학습 목표 (이건 나중에 DB 연동 전까지 로컬스토리지 활용할 예정 -> 이후에 바꾸자)
  const [dailyGoal, setDailyGoal] = useState(Number(localStorage.getItem("dailyGoal")) || 5);
  const [notiDaily, setNotiDaily] = useState(true);

  const [notiStreak, setNotiStreak] = useState(true);  
  const [notiReview, setNotiReview] = useState(false);

  // 모달
  const [modal, setModal] = useState(null); // "profile" | "password" | "reset" | "delete"
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  
  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  }

  function handleSaveProfile() {
    // 실제로는 API 호출이 들어가야 함 (PATCH /api/auth/profile)
    const updatedUser = { ...user, nickname: name };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); }, 1000);
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
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif", background: G.pageBg }}>

      {/* 헤더 */}
      <PageHeader title="설정" icon={Cog} />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: isMobile ? "16px" : "32px 24px" }}>

        {/* 프로필 카드 */}
        <div style={{ background: `linear-gradient(145deg, ${G.navy}, #1e3a5f)`, borderRadius: 24, padding: isMobile ? "20px" : "28px 32px", marginBottom: 16, display: "flex", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: 20, position: "relative", overflow: "hidden", textAlign: isMobile ? "center" : "left" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(255,77,0,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: avatar ? "transparent" : G.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontFamily: "'Unbounded', sans-serif", fontWeight: 900, color: G.white, overflow: "hidden", border: "3px solid rgba(255,255,255,0.2)" }}>
              {avatar ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.nickname[0]}
            </div>
            <button onClick={() => fileRef.current.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: G.accent2, border: "2px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Pencil size={11} color="#fff" strokeWidth={2.5} /></button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: G.white, marginBottom: 4 }}>{user.nickname}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{user.email}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 100, padding: "4px 12px" }}>
              <Zap size={11} color="rgba(255,255,255,0.7)" strokeWidth={2} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>중급 · 1,240 XP</span>
            </div>
          </div>
          <button onClick={() => setModal("profile")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: G.white, fontFamily: "'Noto Sans KR', sans-serif", flexShrink: 0 }}>
            수정
          </button>
        </div>

        {/* 학습 목표 */}
        <Section icon={Target} title="학습 목표">
          <div style={{ padding: "20px 28px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: G.black, marginBottom: 16 }}>
              하루 목표: <span style={{ color: G.accent, fontFamily: "'Unbounded', sans-serif", fontWeight: 900 }}>{dailyGoal}개</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
        <Section icon={Bell} title="알림 설정">
          <Row icon={Calendar} label="매일 학습 알림" sub="오전 9시에 알려드려요" right={<Toggle value={notiDaily} onChange={setNotiDaily} />} />
          <Row icon={Flame} label="스트릭 알림" sub="연속 학습을 놓치지 않도록" right={<Toggle value={notiStreak} onChange={setNotiStreak} />} />
          <Row icon={RotateCcw} label="복습 알림" sub="복습할 카드가 있을 때" right={<Toggle value={notiReview} onChange={setNotiReview} />} />
        </Section>

        {/* 계정 설정 (소셜 로그인 시 비밀번호 변경 숨김) */}
        <Section icon={Lock} title="계정">
          {user.provider === 'local' ? (
            <Row icon={Key} label="비밀번호 변경" sub="정기적으로 변경을 권장해요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("password")} />
          ) : (
            <Row
              icon={Smartphone}
              label="소셜 로그인 이용 중"
              sub={`${user.provider || "SNS"} 계정으로 연결되어 있습니다`}
            />
          )}
        </Section>

        {/* 위험 구역 */}
        <Section icon={AlertTriangle} title="위험 구역">
          <Row icon={BarChart2} label="학습 데이터 초기화" sub="북마크, 검색 기록이 삭제돼요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("reset")} danger />
          <Row icon={Trash2} label="계정 탈퇴" sub="계정과 모든 데이터가 삭제돼요" right={<span style={{ fontSize: 16, color: G.gray }}>›</span>} onClick={() => setModal("delete")} danger />
        </Section>

        {/* 앱 정보 */}
        <div style={{ textAlign: "center", padding: "8px 0 24px", fontSize: 12, color: G.gray }}>
          영어인싸되기 v1.0.0 · Made with 🧡 by Engssa Team
        </div>
      </div>

      {/* ── 모달들 ── */}

      {/* 프로필 수정 */}
      {modal === "profile" && (
        <Modal icon={CircleUser} title="프로필 수정" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>새 닉네임</label>
              <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${G.border}`, fontSize: 14, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = G.accent}
                onBlur={e => e.target.style.borderColor = G.border}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>프로필 사진</label>
              <button onClick={() => fileRef.current.click()} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed ${G.border}`, background: G.lightGray, fontSize: 13, color: G.gray, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Camera size={14} strokeWidth={2} /> 사진 변경하기
              </button>
            </div>
            {saved ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "12px", textAlign: "center", fontSize: 14, fontWeight: 700, color: G.green, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><CheckCircle size={14} color={G.green} strokeWidth={2.5} /> 저장됐어요!</div>
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
        <Modal icon={Key} title="비밀번호 변경" onClose={() => setModal(null)}>
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
            {pwError && <div style={{ fontSize: 12, color: G.red, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={12} color={G.red} strokeWidth={2.5} /> {pwError}</div>}
            {saved ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "12px", textAlign: "center", fontSize: 14, fontWeight: 700, color: G.green, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><CheckCircle size={14} color={G.green} strokeWidth={2.5} /> 변경됐어요!</div>
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
        <Modal icon={BarChart2} title="학습 데이터 초기화" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "#7f1d1d", lineHeight: 1.7, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertTriangle size={14} color="#b91c1c" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
              북마크, 최근 검색어 등 학습 기록이 모두 삭제돼요. 이 작업은 되돌릴 수 없어요.
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
        <Modal icon={Trash2} title="계정 탈퇴" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "#7f1d1d", lineHeight: 1.7, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertTriangle size={14} color="#b91c1c" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
              계정과 모든 학습 데이터가 영구 삭제돼요. 탈퇴 후에는 복구가 불가능해요.
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