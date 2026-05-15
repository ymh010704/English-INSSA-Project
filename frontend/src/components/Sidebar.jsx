import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  LayoutDashboard, Bookmark, GraduationCap, PenLine,
  Globe, Bot, RotateCcw, BarChart2, BookMarked,
  PlaySquare, CircleUser, Settings, ShieldCheck, LogOut,
} from "lucide-react";
import G from "../constants/colors";

const menus = [
  { id: "home",      icon: LayoutDashboard, label: "홈",         path: "/dashboard"     },
  { id: "bookmark",  icon: Bookmark,        label: "북마크",      path: "/bookmark"      },
  { id: "today",     icon: GraduationCap,   label: "오늘의 학습", path: "/learning-intro"},
  { id: "practice",  icon: PenLine,         label: "연습",        path: "/practice"      },
  { id: "community", icon: Globe,           label: "커뮤니티",    path: "/community"     },
  { id: "ai",        icon: Bot,             label: "AI 회화",     path: "/ai-chat"       },
  { id: "review",    icon: RotateCcw,       label: "복습",        path: "/review"        },
  { id: "progress",  icon: BarChart2,       label: "진도 관리",   path: "/progress"      },
  { id: "slangs",    icon: BookMarked,      label: "슬랭 사전",   path: "/slangs"        },
  { id: "shorts",    icon: PlaySquare,      label: "슬랭 쇼츠",   path: "/shorts"        },
  { id: "mypage",    icon: CircleUser,      label: "마이페이지",  path: "/mypage"        },
];

const PUBLIC_PATHS = ["/community"];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: "인싸", nickname: "인" });
  const [displayMenus, setDisplayMenus] = useState(menus);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      if (PUBLIC_PATHS.includes(location.pathname)) {
        setIsGuest(true);
        return;
      }
      navigate("/login");
      return;
    }
    setIsGuest(false);
    try {
      const parsedUser = JSON.parse(savedUser);
      setUser({
        name: parsedUser.nickname || parsedUser.name || "인싸",
        nickname: (parsedUser.nickname || parsedUser.name || "인").substring(0, 1),
      });
      if (parsedUser.role === 1) {
        setDisplayMenus([
          ...menus,
          { id: "admin", icon: ShieldCheck, label: "관리자 페이지", path: "/admin", isAdmin: true },
        ]);
      }
    } catch (e) {
      console.error("유저 정보 파싱 에러:", e);
    }
  }, [navigate]);

  if (isGuest) return null;

  const active = displayMenus.find(m => location.pathname === m.path)?.id ?? "";

  const handleLogout = () => {
    Swal.fire({
      title: "로그아웃 하시겠어요?",
      text: "공부한 내용들은 안전하게 저장되어 있어요!",
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
        }).fire({ icon: "success", title: "다음에 또 만나요!", background: "#ffffff", iconColor: G.accent });
        navigate("/");
      }
    });
  };

  const isSettings = location.pathname === "/settings";

  return (
    <aside style={{
      width: 220, background: G.black, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      padding: "28px 16px", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div
        onClick={() => navigate("/dashboard")}
        style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.white, padding: "0 12px", marginBottom: 36, cursor: "pointer" }}
      >
        영어<span style={{ color: G.accent }}>인싸</span>되기
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
        {displayMenus.map(m => {
          const Icon = m.icon;
          const isActive = active === m.id;
          return (
            <button
              key={m.id}
              onClick={() => navigate(m.path)}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "11px 14px", borderRadius: 12,
                border: "none", cursor: "pointer",
                background: isActive ? "rgba(255,77,0,0.12)" : "transparent",
                color: isActive ? G.accent : "rgba(255,255,255,0.45)",
                fontSize: 13, fontWeight: isActive ? 700 : 400,
                fontFamily: "'Noto Sans KR', sans-serif",
                textAlign: "left", transition: "all 0.15s", width: "100%",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.2 : 1.8}
                color={isActive ? G.accent : "rgba(255,255,255,0.4)"}
              />
              {m.label}
              {isActive && <span style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: G.accent, flexShrink: 0 }} />}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => navigate("/settings")}
        style={{
          display: "flex", alignItems: "center", gap: 11,
          padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: isSettings ? "rgba(255,77,0,0.12)" : "transparent",
          color: isSettings ? G.accent : "rgba(255,255,255,0.45)",
          fontSize: 13, fontWeight: isSettings ? 700 : 400,
          fontFamily: "'Noto Sans KR', sans-serif",
          textAlign: "left", width: "100%", marginBottom: 8, transition: "all 0.15s",
        }}
        onMouseEnter={e => { if (!isSettings) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { if (!isSettings) e.currentTarget.style.background = "transparent"; }}
      >
        <Settings size={17} strokeWidth={isSettings ? 2.2 : 1.8} color={isSettings ? G.accent : "rgba(255,255,255,0.4)"} />
        설정
      </button>

      {/* 유저 & 로그아웃 */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
        <div
          onClick={() => navigate("/mypage")}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer", borderRadius: 10, padding: "6px 8px", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: G.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: G.white, flexShrink: 0,
          }}>
            {user.nickname}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: G.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)" }}>중급 · 프로필 보기</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", padding: "9px 14px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent", fontSize: 12, fontWeight: 500, cursor: "pointer",
            transition: "all 0.2s", fontFamily: "'Noto Sans KR', sans-serif",
            display: "flex", alignItems: "center", gap: 8,
            color: "rgba(255,255,255,0.4)",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = G.accent; e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.background = "rgba(255,77,0,0.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={14} strokeWidth={1.8} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
