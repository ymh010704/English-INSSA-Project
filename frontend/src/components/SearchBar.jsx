// 대시보드 내 검색바 컴포넌트
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 추가
import axios from "axios"; 
import G from "../constants/colors";


export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]); // 검색 결과를 담을 state
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState(JSON.parse(localStorage.getItem("recentSearch") || "[]"));
  const ref = useRef(null);

  // 검색 로직: query가 바뀔 때마다 백엔드 호출 (Debounce 적용하면 더 좋음)
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }
      try {
        const response = await axios.get(`/api/slangs/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (err) {
        console.error("검색 에러:", err);
      }
    };

    const timer = setTimeout(fetchResults, 300); // 0.3초 딜레이 (서버 과부하 방지)
    return () => clearTimeout(timer);
  }, [query]);
  
  const saveRecent = (word) => {
    const updated = [word, ...recent.filter(r => r !== word)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("recentSearch", JSON.stringify(updated));
  };

  function handleSelect(word) {
    saveRecent(word);
    setQuery("");
    setFocused(false);
    navigate("/card-study");
  }

  function removeRecent(word, e) {
    e.stopPropagation();
    const updated = recent.filter(r => r !== word);
    setRecent(updated);
    localStorage.setItem("recentSearch", JSON.stringify(updated));
  }

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setFocused(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showDropdown = focused && (results.length > 0 || (query === "" && recent.length > 0));

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 800 }}>
      {/* 검색 바 영역 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#ffffff", borderRadius: 14,
        border: `1.5px solid ${focused ? G.accent : "rgba(0,0,0,0.08)"}`,
        padding: "11px 16px", transition: "border-color 0.2s",
        boxShadow: focused ? "0 4px 20px rgba(255,77,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="슬랭 단어 검색... (예: No cap, 은근히)"
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif", background: "transparent", color: G.black }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, flexShrink: 0 }}>✕</button>
        )}
      </div>

      {/* 드롭다운 */}
      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: "#ffffff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden",
        }}>
          {/* 검색 결과 */}
          {results.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: G.gray, padding: "12px 16px 6px", textTransform: "uppercase" }}>검색 결과</div>
              {results.map(s => (
                <div key={s.word} onClick={() => handleSelect(s.word)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 16px", cursor: "pointer", transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = G.lightGray}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G.black }}>{s.word}</div>
                    <div style={{ fontSize: 12, color: G.gray }}>{s.meaning}</div>
                  </div>
                  <div style={{ fontSize: 10, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "3px 8px", borderRadius: 100, fontWeight: 600, whiteSpace: "nowrap" }}>{s.category}</div>
                </div>
              ))}
            </div>
          )}

          {/* 검색 결과 없음 */}
          {query && results.length === 0 && (
            <div style={{ padding: "20px 16px", textAlign: "center", fontSize: 13, color: G.gray }}>
              '{query}' 검색 결과가 없어요 😅
            </div>
          )}

          {/* 최근 검색어 */}
          {query === "" && recent.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: G.gray, padding: "12px 16px 6px", textTransform: "uppercase" }}>최근 검색어</div>
              {recent.map(r => (
                <div key={r} onClick={() => { setQuery(r); }} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", cursor: "pointer", transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = G.lightGray}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 14, color: G.gray }}>🕐</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: G.black }}>{r}</span>
                  <button onClick={(e) => removeRecent(r, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: G.gray }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}