// 퀴즈 컴포넌트에 사용될 추가 컴포넌트
// 사이드바 // 퀴즈 우측에 신고, 북마크, 힌트 등을 붙여줄 것임.
import React from "react";
import "./Quiz.css"

const G = { accent: "#ff4d00" };

export default function SideButton({ onClick, icon, label, active }) {
  return (
    <button 
      onClick={onClick}
      style={{
        width: "54px",
        height: "54px",
        borderRadius: "16px",
        background: "white",
        border: active ? `2px solid ${G.accent}` : "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "cente+r",
        cursor: "pointer",
        transition: "all 0.2s ease",
        gap: "2px",
        padding: 0
      }}
      className="side-button-hover" // Quiz.css에 호버 효과를 넣었다면 클래스 사용
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontSize: "10px", fontWeight: 700, color: active ? G.accent : "#999" }}>{label}</span>
    </button>
  );
}