import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, BookMarked, ChevronDown, ChevronUp, Play, Hash } from 'lucide-react';
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";

const CATEGORIES = ["전체", "칭찬 / 긍정", "연애 / SNS", "일상 / 강조", "음식 / 긍정", "SNS / 일상", "연애"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

export default function SlangList() {
  const [slangs, setSlangs] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [expanded, setExpanded] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/slangs')
      .then(res => res.json())
      .then(response => {
        if (response.success && Array.isArray(response.data)) {
          setSlangs(response.data);
        }
      })
      .catch(err => console.error("데이터 로딩 실패:", err));
  }, []);

  const filtered = slangs.filter(item => {
    const matchSearch = !query ||
      item.word?.toLowerCase().includes(query.toLowerCase()) ||
      item.definition_ko?.includes(query) ||
      item.definition_en?.toLowerCase().includes(query.toLowerCase());
    const matchCat = selectedCategory === '전체' || item.category === selectedCategory;
    const matchLetter = !activeLetter ||
      (activeLetter === '#'
        ? !/^[a-zA-Z]/.test(item.word)
        : item.word?.toUpperCase().startsWith(activeLetter));
    return matchSearch && matchCat && matchLetter;
  });

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  const handleLetterClick = (l) => {
    setActiveLetter(prev => prev === l ? null : l);
    setQuery('');
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ flex: 1, height: "100vh", overflow: "hidden", background: G.pageBg, display: "flex", flexDirection: "column" }}>

        <PageHeader title="슬랭 사전" icon={BookMarked} />

        {/* Search hero */}
        <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "16px 40px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={17}
                color={G.gray}
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveLetter(null); }}
                placeholder="단어나 뜻으로 검색..."
                style={{
                  width: "100%", padding: "12px 44px 12px 46px",
                  background: G.pageBg, border: "1.5px solid rgba(0,0,0,0.1)",
                  borderRadius: 10, fontSize: 14, color: G.black, outline: "none",
                  boxSizing: "border-box", fontFamily: "'Noto Sans KR', sans-serif",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = G.accent}
                onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.07)", border: "none", borderRadius: "50%",
                    width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={12} color={G.gray} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alphabet quick-jump */}
        <div style={{
          background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "10px 40px", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: G.gray, letterSpacing: 0.5, textTransform: "uppercase" }}>Quick</span>
          <div style={{ width: 1, height: 16, background: "rgba(0,0,0,0.12)", marginLeft: 10, marginRight: 8, flexShrink: 0 }} />
          {ALPHABET.map(l => (
            <button
              key={l}
              onClick={() => handleLetterClick(l)}
              style={{
                width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
                background: activeLetter === l ? G.accent : "transparent",
                color: activeLetter === l ? G.white : "rgba(0,0,0,0.4)",
                fontSize: 11, fontWeight: 700, fontFamily: "'Unbounded', sans-serif",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { if (activeLetter !== l) e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={e => { if (activeLetter !== l) e.currentTarget.style.background = "transparent"; }}
            >{l}</button>
          ))}
        </div>

        {/* Category filters */}
        <div style={{
          background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "10px 40px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: G.gray, letterSpacing: 0.5, textTransform: "uppercase" }}>Category</span>
          <div style={{ width: 1, height: 16, background: "rgba(0,0,0,0.12)", marginLeft: 10, marginRight: 4, flexShrink: 0 }} />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "5px 14px", borderRadius: 100, border: "none", cursor: "pointer",
                background: selectedCategory === cat ? G.accent : "rgba(0,0,0,0.05)",
                color: selectedCategory === cat ? G.white : G.gray,
                fontSize: 12, fontWeight: 600, fontFamily: "'Noto Sans KR', sans-serif",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { if (selectedCategory !== cat) e.currentTarget.style.background = "rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { if (selectedCategory !== cat) e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
            >{cat}</button>
          ))}
        </div>

        {/* Main content - scrollable */}
        <div style={{ padding: "16px 20px 32px", flex: 1, overflowY: "auto" }}>
          <div>

            {/* Result count */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <Hash size={13} color={G.gray} strokeWidth={2} />
              <span style={{ fontSize: 13, color: G.gray }}>
                {query
                  ? <><strong style={{ color: G.black }}>"{query}"</strong> 검색 결과 ·</>
                  : activeLetter
                    ? <><strong style={{ color: G.black }}>{activeLetter}</strong>로 시작하는 단어 ·</>
                    : "전체 단어 ·"
                }
                {" "}<strong style={{ color: G.accent }}>{filtered.length}</strong>개
              </span>
            </div>

            {/* Dictionary entries list */}
            {filtered.length > 0 ? (
              <div style={{
                background: G.white,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              }}>
                {filtered.map((item, idx) => {
                  const isExpanded = expanded === item.slang_id;
                  const firstChar = item.word?.[0]?.toUpperCase() ?? '?';

                  return (
                    <div
                      key={item.slang_id}
                      style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                    >
                      {/* Entry row */}
                      <div
                        onClick={() => toggleExpand(item.slang_id)}
                        style={{
                          padding: "12px 20px", cursor: "pointer",
                          display: "flex", alignItems: "flex-start", gap: 14,
                          background: isExpanded ? "rgba(255,77,0,0.025)" : "transparent",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "rgba(0,0,0,0.015)"; }}
                        onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = isExpanded ? "rgba(255,77,0,0.025)" : "transparent"; }}
                      >
                        {/* First-letter badge */}
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 1,
                          background: isExpanded ? G.accent : "rgba(0,0,0,0.045)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "background 0.12s",
                        }}>
                          <span style={{
                            fontFamily: "'Unbounded', sans-serif", fontSize: 11, fontWeight: 900,
                            color: isExpanded ? G.white : "rgba(0,0,0,0.35)",
                          }}>{firstChar}</span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Word + badges */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                            <span style={{
                              fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900,
                              color: isExpanded ? G.accent : G.black, letterSpacing: -0.3, transition: "color 0.12s",
                            }}>{item.word}</span>
                            {item.category && (
                              <span style={{
                                padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                                background: isExpanded ? "rgba(255,77,0,0.1)" : "rgba(0,0,0,0.05)",
                                color: isExpanded ? G.accent : G.gray,
                                transition: "all 0.12s",
                              }}>{item.category}</span>
                            )}
                            {item.shorts_url && (
                              <span style={{
                                display: "flex", alignItems: "center", gap: 3,
                                padding: "2px 9px", borderRadius: 100,
                                background: "rgba(0,0,0,0.05)", color: G.gray,
                                fontSize: 11, fontWeight: 600,
                              }}>
                                <Play size={9} strokeWidth={2} /> 영상
                              </span>
                            )}
                          </div>
                          {/* Korean definition preview */}
                          <p style={{
                            margin: 0, fontSize: 13, color: "#555", lineHeight: 1.6,
                            overflow: "hidden", textOverflow: "ellipsis",
                            display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: isExpanded ? "unset" : 2,
                          }}>{item.definition_ko}</p>
                        </div>

                        <div style={{ flexShrink: 0, marginTop: 6 }}>
                          {isExpanded
                            ? <ChevronUp size={16} color={G.accent} strokeWidth={2} />
                            : <ChevronDown size={16} color="rgba(0,0,0,0.25)" strokeWidth={2} />
                          }
                        </div>
                      </div>

                      {/* Expanded detail panel */}
                      {isExpanded && (
                        <div style={{
                          padding: "4px 20px 16px 64px",
                          borderTop: "1px solid rgba(255,77,0,0.08)",
                          background: "rgba(255,77,0,0.015)",
                        }}>
                          {/* English definition */}
                          {item.definition_en && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{
                                fontSize: 10, fontWeight: 700, color: G.gray, letterSpacing: 1.2,
                                textTransform: "uppercase", marginBottom: 6,
                              }}>English Definition</div>
                              <p style={{
                                margin: 0, fontSize: 14, color: "#666",
                                fontStyle: "italic", lineHeight: 1.75,
                                borderLeft: `3px solid ${G.accent}`, paddingLeft: 14,
                              }}>{item.definition_en}</p>
                            </div>
                          )}

                          {/* Example sentences */}
                          {item.example_en && (
                            <div style={{
                              background: G.white, borderRadius: 10,
                              padding: "12px 16px", border: "1px solid rgba(0,0,0,0.06)",
                              marginBottom: item.shorts_url ? 14 : 0,
                            }}>
                              <div style={{
                                fontSize: 10, fontWeight: 700, color: G.gray, letterSpacing: 1.2,
                                textTransform: "uppercase", marginBottom: 8,
                              }}>Example</div>
                              <p style={{ margin: "0 0 5px", fontSize: 14, fontWeight: 600, color: G.black, lineHeight: 1.65 }}>
                                {item.example_en}
                              </p>
                              {item.example_ko && (
                                <p style={{ margin: 0, fontSize: 13, color: G.gray, lineHeight: 1.65 }}>
                                  → {item.example_ko}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Video */}
                          {item.shorts_url && (
                            <video
                              src={item.shorts_url}
                              loop playsInline controls
                              style={{ width: "100%", maxWidth: 300, borderRadius: 10, marginTop: 12, display: "block" }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <Search size={48} color="rgba(0,0,0,0.1)" strokeWidth={1.4} style={{ marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: G.black, marginBottom: 6 }}>검색 결과가 없어요</div>
                <div style={{ fontSize: 13, color: G.gray }}>다른 단어나 뜻으로 검색해보세요</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
