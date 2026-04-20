import G from "../constants/colors";

const variants = {
  primary: {
    background: G.accent,
    color: G.white,
    border: "none",
    boxShadow: "0 6px 20px rgba(255,77,0,0.28)",
  },
  secondary: {
    background: "transparent",
    color: G.gray,
    border: "1.5px solid rgba(0,0,0,0.13)",
    boxShadow: "none",
  },
  ghost: {
    background: "transparent",
    color: G.gray,
    border: "none",
    boxShadow: "none",
  },
  danger: {
    background: "#ef4444",
    color: G.white,
    border: "none",
    boxShadow: "0 6px 20px rgba(239,68,68,0.28)",
  },
};

const sizes = {
  sm: { fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 100 },
  md: { fontSize: 14, fontWeight: 700, padding: "12px 24px", borderRadius: 100 },
  lg: { fontSize: 15, fontWeight: 700, padding: "15px 32px", borderRadius: 100 },
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  style = {},
  type = "button",
}) {
  const v = variants[variant] ?? variants.primary;
  const s = sizes[size] ?? sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        ...s,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "'Noto Sans KR', sans-serif",
        transition: "opacity 0.15s, transform 0.15s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
