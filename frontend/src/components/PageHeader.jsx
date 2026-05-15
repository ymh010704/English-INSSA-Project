import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import useBreakpoint from "../hooks/useBreakpoint";

export default function PageHeader({ title, emoji, icon: Icon, right, dark = false, noSeparator = false }) {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  return (
    <div>
      <div style={{
        background: dark ? "transparent" : G.white,
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
        height: isMobile ? 52 : 61,
        padding: isMobile ? "0 16px" : "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
        flexShrink: 0,
        boxSizing: "border-box",
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        {!isMobile && (
          <button onClick={() => navigate(-1)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 500,
            color: dark ? "rgba(255,255,255,0.5)" : G.gray,
            fontFamily: "'Noto Sans KR', sans-serif",
            minWidth: 80, textAlign: "left",
          }}>← 뒤로가기</button>
        )}

        <div style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: isMobile ? 16 : 20,
          fontWeight: 900,
          color: dark ? G.white : G.black,
          display: "flex", alignItems: "center", gap: 8,
          flex: isMobile ? 1 : "unset",
        }}>
          {Icon && <Icon size={isMobile ? 16 : 20} color={G.accent} strokeWidth={2.5} />}
          {!Icon && emoji && `${emoji} `}
          <span style={{ color: G.accent }}>{title}</span>
        </div>

        <div style={{ minWidth: isMobile ? "auto" : 80, display: "flex", justifyContent: "flex-end" }}>
          {right ?? null}
        </div>
      </div>
      {!noSeparator && <div style={{ height: 5, background: "#e5e0d8", flexShrink: 0 }} />}
    </div>
  );
}
