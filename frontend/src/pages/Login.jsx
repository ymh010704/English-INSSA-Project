import { useState } from "react";
import { useNavigate } from "react-router-dom";

const G = {
  black: "#0a0a0a", white: "#ffffff",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981", red: "#ef4444",
};

const inputStyle = {
  width: "100%", padding: "13px 16px", borderRadius: 12,
  border: "1.5px solid #e5e0d8", fontSize: 14, outline: "none",
  fontFamily: "'Noto Sans KR', sans-serif", background: "#f9f8f5",
  color: "#0a0a0a", boxSizing: "border-box", transition: "border-color 0.2s",
};

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    setError("");
    if (mode === "login") {
      if (!email || !pw) { setError("이메일과 비밀번호를 입력해주세요."); return; }
      navigate("/dashboard");
    } else if (mode === "signup") {
      if (!name || !email || !pw || !pw2) { setError("모든 항목을 입력해주세요."); return; }
      if (pw !== pw2) { setError("비밀번호가 일치하지 않아요."); return; }
      if (pw.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }
      navigate("/dashboard");
    } else {
      if (!email) { setError("이메일을 입력해주세요."); return; }
      setSent(true);
    }
  }

  function switchMode(m) {
    setMode(m);
    setError("");
    setEmail("");
    setPw("");
    setPw2("");
    setName("");
    setSent(false);
  }

  const titles = {
    login:  { emoji: "👋", main: "어서오세요!",   sub: "오늘도 원어민처럼 말해봐요 🔥" },
    signup: { emoji: "🎉", main: "인싸 되러 왔나요?",  sub: "지금 가입하면 무료로 시작할 수 있어요" },
    forgot: { emoji: "🔑", main: "비밀번호 찾기",      sub: "가입한 이메일로 재설정 링크를 보내드려요" },
  };
  const t = titles[mode];

  return (
    <div style={{ minHeight: "100vh", background: G.light, display: "flex", flexDirection: "column", fontFamily: "'Noto Sans KR', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* 배경 데코 */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(255,77,0,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(255,204,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* 네비 */}
      <nav style={{ padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div onClick={() => navigate("/")} style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, cursor: "pointer", color: G.black }}>
          영어<span style={{ color: G.accent }}>인싸</span>되기
        </div>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", fontSize: 13, color: G.gray, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500 }}>
          ← 홈으로
        </button>
      </nav>

      {/* 메인 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* 헤더 */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{t.emoji}</div>
            <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: G.black, letterSpacing: -0.8, marginBottom: 8, lineHeight: 1.2 }}>
              {t.main}
            </h1>
            <p style={{ fontSize: 14, color: G.gray, fontWeight: 300 }}>{t.sub}</p>
          </div>

          {/* 카드 */}
          <div style={{ background: G.white, borderRadius: 28, padding: "36px 36px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)" }}>

            {/* 소셜 로그인 */}
            {mode !== "forgot" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {/* 구글 */}
                  <button style={{
                    width: "100%", padding: "13px 20px", borderRadius: 14,
                    border: "1.5px solid #e5e7eb", background: G.white,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    fontSize: 14, fontWeight: 600, cursor: "pointer", color: G.black,
                    fontFamily: "'Noto Sans KR', sans-serif",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
                    </svg>
                    Google로 {mode === "login" ? "로그인" : "가입"}
                  </button>

                  {/* 카카오 */}
                  <button style={{
                    width: "100%", padding: "13px 20px", borderRadius: 14,
                    border: "none", background: "#FEE500",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#3C1E1E",
                    fontFamily: "'Noto Sans KR', sans-serif",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M9 1.5C4.86 1.5 1.5 4.1 1.5 7.3c0 2.07 1.37 3.88 3.43 4.92l-.87 3.23a.28.28 0 00.43.3L8.4 13.4c.19.01.4.02.6.02 4.14 0 7.5-2.6 7.5-5.8S13.14 1.5 9 1.5z" fill="#3C1E1E"/>
                    </svg>
                    카카오로 {mode === "login" ? "로그인" : "가입"}
                  </button>
                </div>

                {/* 구분선 */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: "#f0ece5" }} />
                  <span style={{ fontSize: 12, color: "#bbb5a8", fontWeight: 500 }}>또는 이메일로</span>
                  <div style={{ flex: 1, height: 1, background: "#f0ece5" }} />
                </div>
              </>
            )}

            {/* 비밀번호 찾기 완료 */}
            {mode === "forgot" && sent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: G.black, marginBottom: 8 }}>이메일을 확인해주세요!</div>
                <div style={{ fontSize: 13, color: G.gray, lineHeight: 1.6, marginBottom: 24 }}>
                  <b>{email}</b>로 비밀번호 재설정 링크를 보냈어요.
                </div>
                <button onClick={() => switchMode("login")} style={{ padding: "12px 28px", borderRadius: 100, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 6px 20px rgba(255,77,0,0.3)" }}>
                  로그인으로 돌아가기
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* 이름 (회원가입만) */}
                {mode === "signup" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>이름</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" style={inputStyle} />
                  </div>
                )}

                {/* 이메일 */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>이메일</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="hello@example.com" style={inputStyle} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                </div>

                {/* 비밀번호 */}
                {mode !== "forgot" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: G.black }}>비밀번호</label>
                      {mode === "login" && (
                        <button onClick={() => switchMode("forgot")} style={{ fontSize: 11, color: G.accent, background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600 }}>
                          비밀번호 찾기
                        </button>
                      )}
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        value={pw} onChange={e => setPw(e.target.value)}
                        type={showPw ? "text" : "password"} placeholder="6자 이상 입력"
                        style={{ ...inputStyle, paddingRight: 44 }}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      />
                      <button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", fontSize: 16, color: G.gray }}>
                        {showPw ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 비밀번호 확인 (회원가입만) */}
                {mode === "signup" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>비밀번호 확인</label>
                    <input
                      value={pw2} onChange={e => setPw2(e.target.value)}
                      type={showPw ? "text" : "password"} placeholder="비밀번호 다시 입력"
                      style={{ ...inputStyle, borderColor: pw2 && pw !== pw2 ? G.red : "#e5e0d8" }}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    />
                    {pw2 && pw !== pw2 && <div style={{ fontSize: 11, color: G.red, marginTop: 4 }}>비밀번호가 일치하지 않아요.</div>}
                  </div>
                )}

                {/* 에러 */}
                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: G.red, fontWeight: 600 }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* 제출 버튼 */}
                <button onClick={handleSubmit} style={{
                  width: "100%", padding: "15px", borderRadius: 14,
                  border: "none", background: G.accent, color: G.white,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  boxShadow: "0 8px 24px rgba(255,77,0,0.3)", marginTop: 4,
                }}>
                  {mode === "login" ? "로그인" : mode === "signup" ? "가입하고 시작하기 🚀" : "재설정 링크 보내기 📨"}
                </button>
              </div>
            )}
          </div>

          {/* 하단 링크 */}
          {!sent && (
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: G.gray }}>
              {mode === "login" ? (
                <>계정이 없으신가요?{" "}
                  <button onClick={() => switchMode("signup")} style={{ color: G.accent, fontWeight: 700, background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>무료 가입하기</button>
                </>
              ) : (
                <>이미 계정이 있으신가요?{" "}
                  <button onClick={() => switchMode("login")} style={{ color: G.accent, fontWeight: 700, background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>로그인</button>
                </>
              )}
            </div>
          )}

          {/* 약관 */}
          {mode === "signup" && (
            <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "#bbb5a8", lineHeight: 1.6 }}>
              가입하면{" "}
              <span style={{ textDecoration: "underline", cursor: "pointer" }}>이용약관</span> 및{" "}
              <span style={{ textDecoration: "underline", cursor: "pointer" }}>개인정보처리방침</span>에 동의하는 것으로 간주해요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}