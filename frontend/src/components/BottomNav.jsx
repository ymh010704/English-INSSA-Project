import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, Bot, BookMarked,
  MoreHorizontal, CircleUser, Bookmark, PenLine, Globe,
  RotateCcw, BarChart2, PlaySquare, Settings, X,
} from "lucide-react";
import G from "../constants/colors";

const NAV_ITEMS = [
  { id: "home",   icon: LayoutDashboard, label: "홈",      path: "/dashboard"     },
  { id: "today",  icon: GraduationCap,   label: "학습",    path: "/learning-intro"},
  { id: "slangs", icon: BookMarked,      label: "사전",    path: "/slangs"        },
  { id: "ai",     icon: Bot,             label: "AI 회화", path: "/ai-chat"       },
];

const MORE_ITEMS = [
  { icon: CircleUser, label: "마이페이지", path: "/mypage"        },
  { icon: Bookmark,   label: "북마크",     path: "/bookmark"      },
  { icon: Globe,      label: "커뮤니티",   path: "/community"     },
  { icon: PenLine,    label: "연습",       path: "/practice"      },
  { icon: RotateCcw,  label: "복습",       path: "/review"        },
  { icon: BarChart2,  label: "진도 관리",  path: "/progress"      },
  { icon: PlaySquare, label: "슬랭 쇼츠",  path: "/shorts"        },
  { icon: Settings,   label: "설정",       path: "/settings"      },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const active = NAV_ITEMS.find(m => location.pathname === m.path)?.id ?? "";

  function handleMore(path) {
    setOpen(false);
    navigate(path);
  }

  return (
    <>
      {/* 더보기 드로어 오버레이 */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.5)",
          }}
        />
      )}

      {/* 더보기 슬라이드 패널 */}
      <div style={{
        position: "fixed", left: 0, right: 0, zIndex: 201,
        bottom: open ? 60 : -320,
        background: "#1a1a1a",
        borderRadius: "20px 20px 0 0",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "bottom 0.3s cubic-bezier(0.4,0,0.2,1)",
        padding: "20px 20px 12px",
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        {/* 핸들 바 */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.15)",
          margin: "0 auto 20px",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>더보기</span>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} color="rgba(255,255,255,0.4)" strokeWidth={2} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {MORE_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleMore(item.path)}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "16px 8px", borderRadius: 14,
                  border: "none", cursor: "pointer",
                  background: isActive ? "rgba(255,77,0,0.12)" : "rgba(255,255,255,0.04)",
                  color: isActive ? G.accent : "rgba(255,255,255,0.6)",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? G.accent : "rgba(255,255,255,0.6)"} />
                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 탭 바 */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 202,
        background: G.black,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        height: 60,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {NAV_ITEMS.map(m => {
          const Icon = m.icon;
          const isActive = active === m.id;
          return (
            <button
              key={m.id}
              onClick={() => { setOpen(false); navigate(m.path); }}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3,
                background: "transparent", border: "none", cursor: "pointer",
                color: isActive ? G.accent : "rgba(255,255,255,0.4)",
                fontFamily: "'Noto Sans KR', sans-serif",
                transition: "color 0.15s",
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{m.label}</span>
            </button>
          );
        })}

        {/* 더보기 탭 */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 3,
            background: "transparent", border: "none", cursor: "pointer",
            color: open ? G.accent : "rgba(255,255,255,0.4)",
            fontFamily: "'Noto Sans KR', sans-serif",
            transition: "color 0.15s",
          }}
        >
          <MoreHorizontal size={20} strokeWidth={open ? 2.2 : 1.8} />
          <span style={{ fontSize: 10, fontWeight: open ? 700 : 400 }}>더보기</span>
        </button>
      </nav>
    </>
  );
}
