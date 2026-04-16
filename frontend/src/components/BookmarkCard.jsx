import G from "../constants/colors";

export default function BookmarkItem({ b, viewMode, flipped, onFlip, onUnbookmark }) {
  const id = b.bookmark_id;
  const word = b.word;
  const meaning = b.definition_ko; 
  const tag = b.category || "Etc."; 
  const example = b.example_en || "예문이 준비 중입니다."; 

  // 별 클릭 시 카드 뒤집힘 방지 및 해제 실행
  const handleUnbookmarkClick = (e) => {
    e.stopPropagation(); // 카드 뒤집힘 방지
    onUnbookmark(b.slang_id);
  };

  if (viewMode === "grid") {
    return (
      <div onClick={() => onFlip(id)} style={{ height: 240, cursor: "pointer", perspective: 1000 }}>
        <div style={{ 
          position: "relative", width: "100%", height: "100%", 
          transformStyle: "preserve-3d", 
          transform: flipped === id ? "rotateY(180deg)" : "rotateY(0deg)", 
          transition: "transform 0.5s ease" 
        }}>
          {/* 앞면 */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "#ffffff", borderRadius: 20, padding: 24, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: "#ff4d00", padding: "3px 10px", borderRadius: 100 }}>{tag}</span>
              <span onClick={handleUnbookmarkClick} style={{ fontSize: 20 }}>⭐</span>
            </div>
            <div style={{
                flex: 1, 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center"
            }}>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, fontWeight: 900, color: "#0a0a0a" }}>{word}</div>
              
            </div>
            <div style={{ fontSize: 11, color: "#8f9092", marginTop: 8 }}>탭해서 뜻 보기 </div>
          </div>

          {/* 뒷면 */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "#0d1b2a", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>{meaning}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic", lineHeight: 1.7 }}>"{example}"</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "right" }}>탭해서 닫기 ←</div>
          </div>
        </div>
      </div>
    );
  }

  // 리스트 모드
  return (
    <div style={{ background: G.white, borderRadius: 16, padding: "18px 24px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: G.black }}>{word}</span>
          <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "2px 10px", borderRadius: 100 }}>{tag}</span>
        </div>
        <div style={{ fontSize: 13, color: G.gray }}>{meaning}</div>
      </div>
      <div style={{ fontSize: 12, color: "#d1d5db", maxWidth: 240, fontStyle: "italic", textAlign: "right" }}>"{example}"</div>
      <span onClick={handleUnbookmarkClick} style={{ fontSize: 20 }}>⭐</span>
    </div>
  );
}