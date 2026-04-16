import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
import Button from "../components/Button";
import G from "../constants/colors";

// 기본 설정 정의 
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const inputStyle = {
  width: "100%", padding: "13px 16px", borderRadius: 12,
  border: "1.5px solid #e5e0d8", fontSize: 14, outline: "none",
  fontFamily: "'Noto Sans KR', sans-serif", background: "#f9f8f5",
  color: "#0a0a0a", boxSizing: "border-box", transition: "border-color 0.2s",
};

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // 소셜 로그인 토큰 처리 로직 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userData = params.get("user");

    if (token) {
      localStorage.setItem("token", token);
      if (userData) localStorage.setItem("user", userData);
      
      Toast.fire({
        icon: 'success',
        title: '소셜 로그인에 성공했습니다!',
      });
      navigate("/dashboard");
    }
  }, [navigate]);

  async function handleSubmit() {
    setError("");
    
    try {
      if (mode === "login") {
        if (!email || !pw) return setError("이메일과 비밀번호를 입력해주세요.");
        
        // 로그인 API 호출 
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, pw }),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "로그인에 실패했습니다.");

        // 성공 시 토큰 및 유저 정보 저장
        if (data.token) localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        Toast.fire({
          icon: 'success',
          title: `<span style="font-family: 'Noto Sans KR'; font-weight: 600;">${data.user.nickname}님, 환영합니다!</span>`,
          background: '#ffffff',
          iconColor: G.accent,
        });

        navigate("/dashboard");

      } else if (mode === "signup") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError("올바른 이메일 형식을 입력해주세요.");
        if (!name || !email || !pw) return setError("모든 항목을 입력해주세요.");
        if (pw.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");

        // 회원가입 API 호출 
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, pw, name }),
        });

        const data = await response.json();
        if (!response.ok) {
          const errorMsg = typeof data.error === 'object' ? data.error.message : data.error;
          throw new Error(errorMsg || "회원가입에 실패했습니다.");
        }

        Swal.fire({
          title: '🎉 환영합니다!',
          text: '인싸가 될 준비가 되셨나요? 이제 로그인을 진행해 주세요.',
          icon: 'success',
          confirmButtonText: '확인',
          confirmButtonColor: G.accent,
          background: G.light,
          borderRadius: '20px',
        });

        switchMode("login");
      } else {
        if (!email) return setError("이메일을 입력해주세요.");
        setSent(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  function switchMode(m) {
    setMode(m);
    setError(""); setEmail(""); setPw(""); setPw2(""); setName(""); setSent(false);
  }

  const t = {
    login:  { emoji: "👋", main: "어서오세요!",   sub: "오늘도 원어민처럼 말해봐요 🔥" },
    signup: { emoji: "🎉", main: "인싸 되러 왔나요?",  sub: "지금 가입하면 무료로 시작할 수 있어요" },
    forgot: { emoji: "🔑", main: "비밀번호 찾기",      sub: "가입한 이메일로 재설정 링크를 보내드려요" },
  }[mode];

  return (
    <div style={{ minHeight: "100vh", background: G.light, display: "flex", flexDirection: "column", fontFamily: "'Noto Sans KR', sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: -100, right: -100, width: 500, height: 500, background: `radial-gradient(circle, ${G.accent}11 0%, transparent 65%)`, pointerEvents: "none" }} />

      <nav style={{ padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div onClick={() => navigate("/")} style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, cursor: "pointer", color: G.black }}>
          영어<span style={{ color: G.accent }}>인싸</span>되기
        </div>
        <Button variant="ghost" onClick={() => navigate("/")} style={{ fontSize: 13, fontWeight: 500 }}>← 홈으로</Button>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{t.emoji}</div>
            <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: G.black, letterSpacing: -0.8, marginBottom: 8 }}>{t.main}</h1>
            <p style={{ fontSize: 14, color: G.gray, fontWeight: 300 }}>{t.sub}</p>
          </div>

          <div style={{ background: G.white, borderRadius: 28, padding: "36px 36px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)" }}>
            {mode !== "forgot" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                <button onClick={() => window.location.href = "/api/auth/google"} style={{ width: "100%", padding: "13px", borderRadius: 14, border: "1.5px solid #e5e7eb", background: G.white, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/></svg>
                  Google로 {mode === "login" ? "로그인" : "가입"}
                </button>
                <button onClick={() => window.location.href = "/api/auth/kakao"} style={{ width: "100%", padding: "13px", borderRadius: 14, border: "none", background: "#FEE500", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#3C1E1E" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M9 1.5C4.86 1.5 1.5 4.1 1.5 7.3c0 2.07 1.37 3.88 3.43 4.92l-.87 3.23a.28.28 0 00.43.3L8.4 13.4c.19.01.4.02.6.02 4.14 0 7.5-2.6 7.5-5.8S13.14 1.5 9 1.5z" fill="#3C1E1E"/></svg>
                  카카오로 {mode === "login" ? "로그인" : "가입"}
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#f0ece5" }} /><span style={{ fontSize: 12, color: "#bbb5a8" }}>또는 이메일로</span><div style={{ flex: 1, height: 1, background: "#f0ece5" }} />
                </div>
              </div>
            )}

            {mode === "forgot" && sent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>이메일을 확인해주세요!</div>
                <Button onClick={() => switchMode("login")}>로그인으로 돌아가기</Button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {mode === "signup" && (
                  <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>이름</label><input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" style={inputStyle} /></div>
                )}
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>이메일</label><input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="hello@example.com" style={inputStyle} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
                {mode !== "forgot" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><label style={{ fontSize: 12, fontWeight: 700 }}>비밀번호</label>{mode === "login" && <button onClick={() => switchMode("forgot")} style={{ fontSize: 11, color: G.accent, background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>비밀번호 찾기</button>}</div>
                    <div style={{ position: "relative" }}><input value={pw} onChange={e => setPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="6자 이상 입력" style={{ ...inputStyle, paddingRight: 44 }} onKeyDown={e => e.key === "Enter" && handleSubmit()} /><button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", fontSize: 16 }}>{showPw ? "🙈" : "👁️"}</button></div>
                  </div>
                )}
                {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px", fontSize: 13, color: G.red, fontWeight: 600 }}>⚠️ {error}</div>}
                <Button onClick={handleSubmit} style={{ width: "100%", borderRadius: 14, padding: "15px", fontSize: 15, marginTop: 4 }}>{mode === "login" ? "로그인" : mode === "signup" ? "가입하고 시작하기 🚀" : "재설정 링크 보내기 📨"}</Button>
              </div>
            )}
          </div>
          {!sent && (
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: G.gray }}>
              {mode === "login" ? (<>계정이 없으신가요? <Button variant="ghost" onClick={() => switchMode("signup")} style={{ color: G.accent, fontWeight: 700 }}>무료 가입하기</Button></>) : (<>이미 계정이 있으신가요? <Button variant="ghost" onClick={() => switchMode("login")} style={{ color: G.accent, fontWeight: 700 }}>로그인</Button></>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}