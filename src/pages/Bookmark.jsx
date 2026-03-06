import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const G = {
  black: "#0a0a0a", white: "#ffffff",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981",
};

// 임시 북마크 데이터 (실제로는 localStorage or 백엔드)
const DEFAULT_BOOKMARKS = [
  { id: 1, word: "No cap", meaning: "진심으로, 거짓말 아님", korean: "ㄹㅇ (리얼)", category: "SNS / 일상", emoji: "🔥", exampleEn: ["That movie was amazing, ", "no cap", ". You gotta watch it."], exampleKr: "그 영화 진짜 대박이야, ㄹㅇ. 꼭 봐봐.", nuance: "자신이 한 말이 사실임을 강조할 때 써요." },
  { id: 2, word: "Slay", meaning: "완전 잘해냈어, 멋지다", korean: "완전 킬링이야", category: "칭찬 / 긍정", emoji: "👑", exampleEn: ["She walked in and ", "slayed", " the whole room."], exampleKr: "그녀가 들어오자마자 완전 킬링이었어.", nuance: "누군가 굉장히 잘했거나 멋질 때 쓰는 칭찬 표현." },
  { id: 3, word: "Ghosted", meaning: "갑자기 연락을 끊다", korean: "잠수탔어", category: "연애 / SNS", emoji: "👻", exampleEn: ["We were texting every day, then he just ", "ghosted", " me."], exampleKr: "매일 문자했는데 그가 갑자기 잠수탔어.", nuance: "연애 또는 친구 사이에서 갑자기 연락이 없어질 때." },
  { id: 4, word: "Lowkey", meaning: "은근히, 살짝, 솔직히", korean: "은근 ~", category: "일상 / 강조", emoji: "🤫", exampleEn: ["I ", "lowkey", " love this song but don't tell anyone."], exampleKr: "이 노래 은근 좋은데 아무한테도 말하지 마.", nuance: "뭔가를 살짝 인정하거나 강조할 때." },
  { id: 5, word: "Bussin", meaning: "완전 맛있다, 대박이다", korean: "존맛탱", category: "음식 / 긍정", emoji: "🤤", exampleEn: ["This ramen is literally ", "bussin", ", no cap."], exampleKr: "이 라멘 진짜 존맛탱이야, ㄹㅇ.", nuance: "주로 음식이 엄청 맛있을 때 쓰지만, 전반적으로 좋을 때도 써요." },
];

export default function Bookmark() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("bookmarks");
    return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS;
  });
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [flippedId, setFlippedId] = useState(null);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  function removeBookmark(id) {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    if (flippedId === id) setFlippedId(null);
  }

  if (bookmarks.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500 }}>← 뒤로가기</button>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black }}>⭐ <span style={{ color: G.accent }}>북마크</span></div>
          <div style={{ width: 80 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 16 }}>
          <div style={{ fontSize: 64 }}>⭐</div>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.black }}>북마크가 없어요!</div>
          <div style={{ fontSize: 14, color: G.gray }}>카드 학습 중 ⭐ 버튼을 눌러 저장해보세요</div>
          <button onClick={() => navigate("/card-study")} style={{ marginTop: 8, padding: "13px 28px", borderRadius: 100, border: "none", background: G.accent, color: G.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 8px 24px rgba(255,77,0,0.3)" }}>
            카드 학습 시작하기 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* 헤더 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500 }}>← 뒤로가기</button>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black }}>⭐ <span style={{ color: G.accent }}>북마크</span></div>
        {/* 뷰 전환 */}
        <div style={{ display: "flex", gap: 6, background: G.lightGray, borderRadius: 10, padding: 4 }}>
          {[["grid", "⊞"], ["list", "☰"]].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: view === v ? G.white : "transparent",
              color: view === v ? G.black : G.gray,
              fontSize: 14, fontWeight: 700,
              boxShadow: view === v ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}>{icon}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* 요약 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 900, color: G.black, letterSpacing: -0.5 }}>
              저장한 표현 <span style={{ color: G.accent }}>{bookmarks.length}개</span>
            </div>
            <div style={{ fontSize: 13, color: G.gray, marginTop: 4 }}>카드를 탭하면 뜻을 볼 수 있어요</div>
          </div>
          <button onClick={() => navigate("/card-study")} style={{
            padding: "12px 22px", borderRadius: 100, border: "none",
            background: G.accent, color: G.white, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
            boxShadow: "0 6px 20px rgba(255,77,0,0.3)",
          }}>북마크로 학습 →</button>
        </div>

        {/* 그리드 뷰 */}
        {view === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {bookmarks.map(b => (
              <div key={b.id} style={{ position: "relative" }}>
                {/* 북마크 삭제 버튼 */}
                <button onClick={() => removeBookmark(b.id)} style={{
                  position: "absolute", top: 12, right: 12, zIndex: 2,
                  width: 30, height: 30, borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)", border: "none",
                  cursor: "pointer", fontSize: 14, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }} title="북마크 삭제">⭐</button>

                {/* 카드 앞면 */}
                {flippedId !== b.id ? (
                  <div onClick={() => setFlippedId(b.id)} style={{
                    background: `linear-gradient(145deg, ${G.navy}, #1e3a5f)`,
                    borderRadius: 24, padding: "36px 28px",
                    cursor: "pointer", minHeight: 200,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 12,
                    position: "relative", overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  }}>
                    <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle, rgba(255,77,0,0.2) 0%, transparent 70%)" }} />
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{b.emoji} {b.category}</div>
                    <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 28, fontWeight: 900, color: G.white, letterSpacing: -0.5, textAlign: "center" }}>{b.word}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>탭해서 뜻 보기 👆</div>
                  </div>
                ) : (
                  /* 카드 뒷면 */
                  <div onClick={() => setFlippedId(null)} style={{
                    background: G.white, borderRadius: 24, padding: "24px 24px",
                    cursor: "pointer", minHeight: 200,
                    display: "flex", flexDirection: "column", gap: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.black }}>{b.word}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: G.black }}>{b.meaning}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: G.black, color: "#63b3ed", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 100, width: "fit-content" }}>
                      🇰🇷 {b.korean}
                    </div>
                    <div style={{ background: "#f7f4ef", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: G.black, lineHeight: 1.7 }}>
                      {b.exampleEn.map((t, i) =>
                        i === 1 ? <span key={i} style={{ color: G.accent, fontWeight: 800 }}>{t}</span> : <span key={i}>{t}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: "auto" }}>탭해서 닫기</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 리스트 뷰 */}
        {view === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bookmarks.map(b => (
              <div key={b.id} style={{
                background: G.white, borderRadius: 18, padding: "18px 24px",
                display: "flex", alignItems: "center", gap: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.04)",
              }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{b.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: G.black, marginBottom: 2 }}>{b.word}</div>
                  <div style={{ fontSize: 13, color: G.gray }}>{b.meaning}</div>
                </div>
                <div style={{ fontSize: 11, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "4px 12px", borderRadius: 100, fontWeight: 600, flexShrink: 0 }}>{b.category}</div>
                <button onClick={() => removeBookmark(b.id)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 18, color: G.accent2, flexShrink: 0,
                }} title="북마크 삭제">⭐</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}