import { useState } from "react";
import { useNavigate } from "react-router-dom";

const G = {
  black: "#0a0a0a", white: "#ffffff", bg: "#f3f4f6",
  accent: "#ff4d00", gray: "#6b7280", lightGray: "#f3f4f6",
  cardBg: "#ffffff", navy: "#0d1b2a",
};

const BOOKMARKS = [
  { id: 1, word: "Slay", meaning: "완벽하게 해내다, 죽인다", example: "She absolutely slayed that presentation.", tag: "칭찬 / 긍정", emoji: "💅" },
  { id: 2, word: "Ghosted", meaning: "연락을 갑자기 끊다", example: "He ghosted me after our first date.", tag: "연애 / SNS", emoji: "👻" },
  { id: 3, word: "Lowkey", meaning: "은근히, 조용히", example: "I'm lowkey obsessed with this song.", tag: "일상 / 강조", emoji: "✨" },
  { id: 4, word: "Bussin", meaning: "진짜 맛있다, 최고다", example: "This pizza is bussin fr fr.", tag: "음식 / 긍정", emoji: "🍔" },
  { id: 5, word: "No cap", meaning: "진심으로, 거짓말 아님", example: "That was the best day ever, no cap.", tag: "SNS / 일상", emoji: "🔥" },
  { id: 6, word: "Rizz", meaning: "이성을 끄는 매력", example: "Bro has unlimited rizz.", tag: "연애", emoji: "👑" },
];

const CATEGORIES = ["전체", "칭찬 / 긍정", "연애 / SNS", "일상 / 강조", "음식 / 긍정", "SNS / 일상", "연애"];

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
    <div style={{ display: "flex", minHeight: "100vh", background: G.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 사이드바 */}
      <div style={{ width: 220, background: G.navy, display: "flex", flexDirection: "column", padding: "28px 16px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.white, marginBottom: 32, paddingLeft: 8 }}>
          영어<span style={{ color: G.accent }}>인싸</span>되기
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {[
            { icon: "🏠", label: "홈", path: "/dashboard" },
            { icon: "⭐", label: "북마크", path: "/bookmark", active: true },
            { icon: "📚", label: "오늘의 학습", path: "/learning-intro" },
            { icon: "🎯", label: "연습", path: "/practice" },
            { icon: "💬", label: "회화 학습", path: "/ai-chat" },
            { icon: "🌐", label: "커뮤니티", path: "/community" },
            { icon: "🤖", label: "AI 회화", path: "/ai-chat" },
            { icon: "🔁", label: "복습", path: "/review" },
            { icon: "📊", label: "진도 관리", path: "/progress" },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
              background: item.active ? "rgba(255,77,0,0.15)" : "transparent",
              color: item.active ? G.accent : "rgba(255,255,255,0.5)",
              fontSize: 13, fontWeight: item.active ? 700 : 400,
              fontFamily: "'Noto Sans KR', sans-serif", textAlign: "left",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
              {item.active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: G.accent }} />}
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: G.black, margin: 0, fontFamily: "'Unbounded', sans-serif" }}>
              ⭐ 북마크
            </h1>
            <p style={{ fontSize: 13, color: G.gray, margin: "4px 0 0" }}>저장한 표현 {BOOKMARKS.length}개</p>
          </div>
          <button onClick={() => navigate("/card-study")} style={{
            background: G.accent, color: G.white, border: "none",
            padding: "12px 24px", borderRadius: 100, fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
            boxShadow: "0 4px 16px rgba(255,77,0,0.3)",
          }}>북마크로 학습 →</button>
        </div>

        {/* 검색 */}
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

        {/* 카테고리 필터 + 뷰 토글 */}
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

        {/* 결과 수 */}
        <p style={{ fontSize: 13, color: G.gray, marginBottom: 16 }}>
          {filtered.length}개의 표현
        </p>

        {/* 그리드 뷰 */}
        {viewMode === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map((b, i) => (
              <div key={b.id} onClick={() => setFlipped(flipped === b.id ? null : b.id)} style={{
                height: 180, cursor: "pointer", perspective: 1000,
              }}>
                <div style={{
                  position: "relative", width: "100%", height: "100%",
                  transformStyle: "preserve-3d",
                  transform: flipped === b.id ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform 0.5s ease",
                }}>
                  {/* 앞면 */}
                  <div style={{
                    position: "absolute", inset: 0, backfaceVisibility: "hidden",
                    background: G.white, borderRadius: 20, padding: 24,
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)",
                        color: G.accent, padding: "3px 10px", borderRadius: 100,
                      }}>{b.tag}</span>
                      <button onClick={e => { e.stopPropagation(); }} style={{
                        background: "none", border: "none", cursor: "pointer", fontSize: 18,
                      }}>⭐</button>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: G.black }}>
                        {b.word}
                      </div>
                      <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 8 }}>탭해서 뜻 보기 👆</div>
                    </div>
                  </div>
                  {/* 뒷면 */}
                  <div style={{
                    position: "absolute", inset: 0, backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: G.navy, borderRadius: 20, padding: 24,
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: G.white }}>{b.meaning}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic", lineHeight: 1.7 }}>"{b.example}"</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "right" }}>탭해서 닫기 ←</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 리스트 뷰 */}
        {viewMode === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(b => (
              <div key={b.id} style={{
                background: G.white, borderRadius: 16, padding: "18px 24px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center", gap: 20,
                transition: "transform 0.15s, box-shadow 0.15s",
                cursor: "pointer",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: G.black }}>{b.word}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "2px 10px", borderRadius: 100 }}>{b.tag}</span>
                  </div>
                  <div style={{ fontSize: 13, color: G.gray }}>{b.meaning}</div>
                </div>
                <div style={{ fontSize: 12, color: "#d1d5db", maxWidth: 240, fontStyle: "italic", textAlign: "right" }}>"{b.example}"</div>
                <button onClick={e => e.stopPropagation()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>⭐</button>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: G.gray }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>검색 결과가 없어요</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>다른 검색어나 카테고리를 시도해보세요</div>
          </div>
        )}
      </div>
    </div>
  );
}