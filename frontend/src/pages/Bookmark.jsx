import { useState } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";

const BOOKMARKS = [
  { id: 1, word: "Slay", meaning: "완벽하게 해내다, 죽인다", example: "She absolutely slayed that presentation.", tag: "칭찬 / 긍정", emoji: "💅" },
  { id: 2, word: "Ghosted", meaning: "연락을 갑자기 끊다", example: "He ghosted me after our first date.", tag: "연애 / SNS", emoji: "👻" },
  { id: 3, word: "Lowkey", meaning: "은근히, 조용히", example: "I'm lowkey obsessed with this song.", tag: "일상 / 강조", emoji: "✨" },
  { id: 4, word: "Bussin", meaning: "진짜 맛있다, 최고다", example: "This pizza is bussin fr fr.", tag: "음식 / 긍정", emoji: "🍔" },
  { id: 5, word: "No cap", meaning: "진심으로, 거짓말 아님", example: "That was the best day ever, no cap.", tag: "SNS / 일상", emoji: "🔥" },
  { id: 6, word: "Rizz", meaning: "이성을 끄는 매력", example: "Bro has unlimited rizz.", tag: "연애", emoji: "👑" },
];

const CATEGORIES = ["전체", "칭찬 / 긍정", "연애 / SNS", "일상 / 강조", "음식 / 긍정", "SNS / 일상", "연애"];


/* ── MAIN BOOKMARK PAGE ── */
export default function Bookmark() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [viewMode, setViewMode] = useState("grid");
  const [flipped, setFlipped] = useState(null);
  const filtered = BOOKMARKS.filter(b => {
    const matchSearch = b.word.toLowerCase().includes(search.toLowerCase()) ||
      b.meaning.includes(search);
    const matchCategory = activeCategory === "전체" || b.tag === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ flex: 1, fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>
      <PageHeader
        title="북마크" emoji="⭐"
        right={
          <button onClick={() => navigate("/card-study")} style={{
            background: G.accent, color: G.white, border: "none",
            padding: "9px 18px", borderRadius: 100, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
            boxShadow: "0 4px 16px rgba(255,77,0,0.3)",
          }}>북마크로 학습 →</button>
        }
      />
      <div style={{ padding: "36px 40px" }}>

        {/* 검색창 */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="저장한 표현 검색... (예: Slay, 은근히)"
            style={{
              width: "100%", padding: "14px 16px 14px 44px", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.08)", background: G.white,
              fontSize: 14, color: G.black, outline: "none", boxSizing: "border-box",
              fontFamily: "'Noto Sans KR', sans-serif",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          />
        </div>

        {/* 필터 및 뷰 토글 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "7px 16px", borderRadius: 100, border: "none", cursor: "pointer",
                background: activeCategory === cat ? G.accent : G.white,
                color: activeCategory === cat ? G.white : G.gray,
                fontSize: 12, fontWeight: 600, fontFamily: "'Noto Sans KR', sans-serif",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)", transition: "all 0.15s",
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, background: G.white, borderRadius: 10, padding: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
            {[{ mode: "grid", icon: "⊞" }, { mode: "list", icon: "☰" }].map(v => (
              <button key={v.mode} onClick={() => setViewMode(v.mode)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: viewMode === v.mode ? G.accent : "transparent",
                color: viewMode === v.mode ? G.white : G.gray,
                fontSize: 16, transition: "all 0.15s",
              }}>{v.icon}</button>
            ))}
          </div>
        </div>

        {/* 결과 리스트 (기존 로직 유지) */}
        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map((b) => (
              <div key={b.id} onClick={() => setFlipped(flipped === b.id ? null : b.id)} style={{ height: 180, cursor: "pointer", perspective: 1000 }}>
                <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: flipped === b.id ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.5s ease" }}>
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: G.white, borderRadius: 20, padding: 24, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "3px 10px", borderRadius: 100 }}>{b.tag}</span>
                      <span>⭐</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: G.black }}>{b.word}</div>
                      <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 8 }}>탭해서 뜻 보기 👆</div>
                    </div>
                  </div>
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: G.navy, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: G.white }}>{b.meaning}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic", lineHeight: 1.7 }}>"{b.example}"</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "right" }}>탭해서 닫기 ←</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(b => (
              <div key={b.id} style={{ background: G.white, borderRadius: 16, padding: "18px 24px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: G.black }}>{b.word}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "2px 10px", borderRadius: 100 }}>{b.tag}</span>
                  </div>
                  <div style={{ fontSize: 13, color: G.gray }}>{b.meaning}</div>
                </div>
                <div style={{ fontSize: 12, color: "#d1d5db", maxWidth: 240, fontStyle: "italic", textAlign: "right" }}>"{b.example}"</div>
                <span>⭐</span>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: G.gray }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>검색 결과가 없어요</div>
          </div>
        )}
      </div>
    </div>
  );
}