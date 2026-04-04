// @ts-ignore
export default function Mascot({ size = 200, mode = "default" }) {
  const isHome = mode === "home";
  const bodyClass = mode==="dance" ? "m-body-dance" : mode==="study" ? "m-body-study" : mode==="cheer" ? "m-body-cheer" : "m-body-float";
  const armClass = mode==="cheer" ? "m-arm-up" : "m-arm";
  const bubbleText = mode==="dance" ? "LET'S GO!" : mode==="study" ? "NO CAP!" : mode==="cheer" ? "SLAY!" : "SLAY!";
  const BADGES = [
    { text: "no cap 🔥", color: "#ff4d00", top: "5%",  left: "-18%", bg: "white" },
    { text: "rizz 👑",   color: "#8b5cf6", top: "75%", left: "-22%", bg: "white" },
    { text: "lowkey ✨", color: "#10b981", top: "5%",  left: "80%",  bg: "white" },
    { text: "slay! 💅",  color: "white",   top: "75%", left: "82%",  bg: "#ff4d00" },
  ];
  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      <style>{`
        @keyframes m-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes m-blink  { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.08)} }
        @keyframes m-wave   { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(22deg)} 40%{transform:rotate(-10deg)} 60%{transform:rotate(22deg)} }
        @keyframes m-shadow { 0%,100%{transform:scaleX(1);opacity:.12} 50%{transform:scaleX(.7);opacity:.06} }
        @keyframes m-bubble { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes m-dance  { 0%,100%{transform:rotate(0deg) translateY(0)} 25%{transform:rotate(-8deg) translateY(-4px)} 75%{transform:rotate(8deg) translateY(-4px)} }
        @keyframes m-study  { 0%,100%{transform:rotate(0deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(10deg)} }
        @keyframes m-cheer  { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-20px)} 80%{transform:translateY(4px)} }
        @keyframes m-arm-up { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-60deg)} }
        .m-body-float { animation: m-float 3s ease-in-out infinite }
        .m-body-dance { animation: m-dance 0.7s ease-in-out infinite }
        .m-body-study { animation: m-study 2s ease-in-out infinite }
        .m-body-cheer { animation: m-cheer 1s ease-in-out infinite }
        .m-eyes   { animation: m-blink  4s ease-in-out infinite }
        .m-arm    { animation: m-wave   2.5s ease-in-out infinite; transform-origin: 68% 52% }
        .m-arm-up { animation: m-arm-up 1s ease-in-out infinite; transform-origin: 68% 52% }
        .m-shadow { animation: m-shadow 3s ease-in-out infinite }
        .m-bubble { animation: m-bubble 2s ease-in-out infinite }
      `}</style>
      {isHome && (<>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: size*1.6, height: size*1.6, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,77,0,0.08) 0%, rgba(255,204,0,0.06) 50%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <svg style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: size*1.5, height: size*1.5, zIndex: 0, pointerEvents: "none" }} viewBox="0 0 360 360">
          <circle cx="180" cy="180" r="170" fill="none" stroke="rgba(255,77,0,0.12)" strokeWidth="1.5" strokeDasharray="8 6" />
          <circle cx="180" cy="180" r="140" fill="none" stroke="rgba(255,204,0,0.1)" strokeWidth="1" strokeDasharray="4 8" />
        </svg>
        {BADGES.map(b => (<div key={b.text} style={{ position: "absolute", top: b.top, left: b.left, background: b.bg, borderRadius: 100, padding: "7px 14px", fontSize: size*0.038, fontWeight: 700, color: b.color, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", border: b.bg==="white" ? "1px solid rgba(0,0,0,0.08)" : "none", fontFamily: "Unbounded, sans-serif", whiteSpace: "nowrap", zIndex: 3 }}>{b.text}</div>))}
      </>)}
      <div style={{ position: "relative", zIndex: 1 }}>
        <svg viewBox="0 0 200 220" width={size} height={size*1.1} xmlns="http://www.w3.org/2000/svg">
          <ellipse className="m-shadow" cx="100" cy="212" rx="45" ry="7" fill="#000" opacity="0.1" />
          <g className={bodyClass}>
            <ellipse cx="100" cy="145" rx="38" ry="42" fill="#ff4d00" />
            <ellipse cx="100" cy="150" rx="22" ry="28" fill="#fff5f0" />
            <ellipse cx="55" cy="148" rx="13" ry="10" fill="#ff4d00" transform="rotate(-20 55 148)" />
            <circle cx="48" cy="155" r="9" fill="#ff6b35" />
            <g className={armClass}>
              <ellipse cx="145" cy="140" rx="13" ry="10" fill="#ff4d00" transform="rotate(20 145 140)" />
              <circle cx="152" cy="133" r="9" fill="#ff6b35" />
            </g>
            <ellipse cx="83" cy="185" rx="14" ry="9" fill="#e63d00" />
            <ellipse cx="117" cy="185" rx="14" ry="9" fill="#e63d00" />
            <circle cx="100" cy="100" r="46" fill="#ff6b35" />
            <ellipse cx="63" cy="68" rx="12" ry="16" fill="#ff6b35" />
            <ellipse cx="137" cy="68" rx="12" ry="16" fill="#ff6b35" />
            <ellipse cx="63" cy="68" rx="7" ry="10" fill="#ffb399" />
            <ellipse cx="137" cy="68" rx="7" ry="10" fill="#ffb399" />
            <ellipse cx="85" cy="98" rx="13" ry="14" fill="white" />
            <ellipse cx="115" cy="98" rx="13" ry="14" fill="white" />
            <g className="m-eyes">
              <circle cx="87" cy="100" r="7" fill="#1a1a1a" />
              <circle cx="117" cy="100" r="7" fill="#1a1a1a" />
              <circle cx="90" cy="97" r="2.5" fill="white" />
              <circle cx="120" cy="97" r="2.5" fill="white" />
            </g>
            <ellipse cx="74" cy="112" rx="9" ry="6" fill="#ff9070" opacity="0.5" />
            <ellipse cx="126" cy="112" rx="9" ry="6" fill="#ff9070" opacity="0.5" />
            <path d="M 88 118 Q 100 130 112 118" stroke="#c0392b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <g className="m-bubble">
              <rect x="66" y="42" width="68" height="22" rx="11" fill="white" style={{filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.1))"}} />
              <polygon points="96,64 104,64 100,72" fill="white" />
              <text x="100" y="57" fontSize="10" fontWeight="700" textAnchor="middle" fill="#ff4d00" fontFamily="Unbounded, sans-serif">{bubbleText}</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}