import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import G from "../constants/colors";

const menus = [
  { id: "home",         icon: "🏠", label: "홈",         path: "/dashboard" },
  { id: "bookmark",     icon: "⭐", label: "북마크",      path: "/bookmark" },
  { id: "today",        icon: "🃏", label: "오늘의 학습", path: "/learning-intro" },
  { id: "practice",     icon: "✍️", label: "연습",        path: "/practice" },
  { id: "conversation", icon: "💬", label: "회화 학습",   path: "/conversation" },
  { id: "community",    icon: "🌐", label: "커뮤니티",    path: "/community" },
  { id: "ai",           icon: "🤖", label: "AI 회화",     path: "/ai-chat" },
  { id: "review",       icon: "🔁", label: "복습",        path: "/review" },
  { id: "progress",     icon: "📊", label: "진도 관리",   path: "/progress" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: "인싸", nickname: "인" });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      navigate("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(savedUser);
      setUser({
        name: parsedUser.nickname || parsedUser.name || "인싸",
        nickname: (parsedUser.nickname || parsedUser.name || "경").substring(0, 1),
      });
    } catch (e) {
      console.error("유저 정보 파싱 에러:", e);
    }
  }, [navigate]);

  const active = menus.find(m => location.pathname === m.path)?.id ?? "";

  const handleLogout = () => {
    Swal.fire({
      title: "로그아웃 하시겠어요?",
      text: "공부한 내용들은 안전하게 저장되어 있어요! 🔥",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: G.accent,
      cancelButtonColor: G.gray,
      confirmButtonText: "네, 나갈래요",
      cancelButtonText: "아니요!",
      background: G.white,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        Swal.mixin({
          toast: true, position: "top-end",
          showConfirmButton: false, timer: 1000, timerProgressBar: true,
        }).fire({ icon: "success", title: "다음에 또 만나요~! 👋", background: "#ffffff", iconColor: G.accent });
        navigate("/");
      }
    });
  };

  return (
    <aside style={{
      width: 220, background: G.black, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      padding: "28px 16px", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div onClick={() => navigate("/dashboard")} style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.white, padding: "0 12px", marginBottom: 36, cursor: "pointer" }}>
        영어<span style={{ color: G.accent }}>인싸</span>되기
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {menus.map(m => (
          <button key={m.id} onClick={() => navigate(m.path)} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 12,
            border: "none", cursor: "pointer",
            background: active === m.id ? "rgba(255,77,0,0.12)" : "transparent",
            color: active === m.id ? G.accent : "rgba(255,255,255,0.5)",
            fontSize: 14, fontWeight: active === m.id ? 700 : 400,
            fontFamily: "'Noto Sans KR', sans-serif",
            textAlign: "left", transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 18 }}>{m.icon}</span>
            {m.label}
            {active === m.id && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: G.accent }} />}
          </button>
        ))}
      </nav>

      <button onClick={() => navigate("/settings")} style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
        background: location.pathname === "/settings" ? "rgba(255,77,0,0.12)" : "transparent",
        color: location.pathname === "/settings" ? G.accent : "rgba(255,255,255,0.5)",
        fontSize: 14, fontWeight: location.pathname === "/settings" ? 700 : 400,
        fontFamily: "'Noto Sans KR', sans-serif",
        textAlign: "left", width: "100%", marginBottom: 8, transition: "all 0.15s",
      }}>
        <span style={{ fontSize: 18 }}>⚙️</span> 설정
      </button>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: G.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: G.white, flexShrink: 0,
          }}>
            {user.nickname}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: G.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Intermediate</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500, cursor: "pointer",
          transition: "all 0.2s", fontFamily: "'Noto Sans KR', sans-serif",
        }}
          onMouseEnter={e => { e.currentTarget.style.color = G.accent; e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.background = "rgba(255,77,0,0.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "transparent"; }}
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
