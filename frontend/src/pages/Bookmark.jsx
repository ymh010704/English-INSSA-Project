import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";

const CATEGORIES = ["전체", "칭찬 / 긍정", "연애 / SNS", "일상 / 강조", "음식 / 긍정", "SNS / 일상", "연애"];

export default function Bookmark() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [viewMode, setViewMode] = useState("grid");
  const [flippedId, setFlippedId] = useState(null);

  // 백엔드에서 북마크 데이터 가져오기
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await fetch("/api/bookmarks");
        const data = await res.json();
        setBookmarks(data);
      } catch (error) {
        console.error("북마크 로딩 에러:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  // 북마크 삭제 기능 (백엔드 연동)
  async function removeBookmark(id) {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b.id !== id));
        if (flippedId === id) setFlippedId(null);
      }
    } catch (error) {
      alert("북마크 삭제에 실패했어요.");
    }
  }

  // 검색 및 카테고리 필터링 로직
  const filtered = bookmarks.filter(b => {
    const matchSearch = b.word.toLowerCase().includes(search.toLowerCase()) ||
                        b.meaning.includes(search);
    const matchCategory = activeCategory === "전체" || b.tag === activeCategory;
    return matchSearch && matchCategory;
  });

  if (loading) return <div style={{ minHeight: "100vh", background: G.lightGray }} />;

  if (bookmarks.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <PageHeader title="북마크" emoji="⭐" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 16 }}>
          <div style={{ fontSize: 64 }}>⭐</div>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.black }}>북마크가 없어요!</div>
          <div style={{ fontSize: 14, color: G.gray }}>카드 학습 중 ⭐ 버튼을 눌러 저장해보세요</div>
          <Button onClick={() => navigate("/card-study")}>카드 학습 시작하기 →</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif" }}>
      <PageHeader 
        title="북마크" emoji="⭐" 
        right={<Button onClick={() => navigate("/card-study")} size="sm">북마크로 학습 →</Button>}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* 검색창 */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="저장한 표현 검색..."
            style={{
              width: "100%", padding: "14px 16px 14px 44px", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.08)", background: G.white,
              fontSize: 14, outline: "none", boxSizing: "border-box"
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
                fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, background: G.white, borderRadius: 10, padding: 4 }}>
            {[{ mode: "grid", icon: "⊞" }, { mode: "list", icon: "☰" }].map(v => (
              <button key={v.mode} onClick={() => setViewMode(v.mode)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: viewMode === v.mode ? G.accent : "transparent",
                color: viewMode === v.mode ? G.white : G.gray,
                fontSize: 16,
              }}>{v.icon}</button>
            ))}
          </div>
        </div>

        {/* 결과 뷰 */}
        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map(b => (
              <div key={b.id} style={{ position: "relative", height: 200 }}>
                <button onClick={(e) => { e.stopPropagation(); removeBookmark(b.id); }} style={{
                  position: "absolute", top: 12, right: 12, zIndex: 10,
                  width: 30, height: 30, borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
                }}>⭐</button>

                <div onClick={() => setFlippedId(flippedId === b.id ? null : b.id)} style={{ height: "100%", cursor: "pointer", perspective: 1000 }}>
                  <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: flippedId === b.id ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.5s ease" }}>
                    {/* 앞면 */}
                    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: `linear-gradient(145deg, ${G.navy}, #1e3a5f)`, borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{b.emoji} {b.tag}</div>
                      <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: G.white, textAlign: "center" }}>{b.word}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>탭해서 뜻 보기 👆</div>
                    </div>
                    {/* 뒷면 */}
                    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: G.white, borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: G.black, marginBottom: 8 }}>{b.meaning}</div>
                      <div style={{ fontSize: 12, color: G.gray, fontStyle: "italic", lineHeight: 1.5 }}>"{b.example}"</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(b => (
              <div key={b.id} style={{ background: G.white, borderRadius: 18, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, border: "1px solid rgba(0,0,0,0.04)" }}>
                <span style={{ fontSize: 28 }}>{b.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: G.black }}>{b.word}</div>
                  <div style={{ fontSize: 13, color: G.gray }}>{b.meaning}</div>
                </div>
                <Button variant="ghost" onClick={() => removeBookmark(b.id)}>⭐</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}