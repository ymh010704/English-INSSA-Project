import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import BookmarkItem from "../components/BookmarkCard";

const CATEGORIES = ["전체", "칭찬 / 긍정", "연애 / SNS", "일상 / 강조", "음식 / 긍정", "SNS / 일상", "연애"];


/* ── MAIN BOOKMARK PAGE ── */
export default function Bookmark() {
  const navigate = useNavigate();

  // 상태 관리
  const [bookmarks, setBookmarks] = useState([]); // 북마크
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [viewMode, setViewMode] = useState("grid");
  const [flipped, setFlipped] = useState(null);

  // api 호출 / 북마크 관련
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); // 토큰 가져오기 << 나중에 수정하면 될듯>?

        const response = await axios.get("/api/bookmarks/list", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setBookmarks(response.data.data);
        }
      } catch (error) {
        console.log("데이터 불러오기 실패 : ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarks();
  }, []);

  // 카드 뒤집기 토글 함수 (앞면만 됐었어서 함수로 넣어버림)
  const handleFlip = (id) => {
    setFlipped(prev => (prev === id ? null : id)); // 🚩 같은 거 누르면 다시 앞으로!
  };

  // 북마크 해제 함수
  const handleUnbookmark = async (slangId) => {
    // 먼저 물어보기(혹시나 잘못 눌렀을 때 방지)
    const result = await Swal.fire({
      title: '정말로 북마크를 해제하시겠습니까?',
      text: "해제하면 나의 북마크 목록에서 사라집니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: G.accent,
      cancelButtonColor: '#d33',
      confirmButtonText: '해제할래요',
      cancelButtonText: '안 할래요',
    });

    // 사용자가 해제한다 하면 아래 실행
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/bookmarks/toggle', 
          { slangId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 백엔드에서 해제 성공(false) 응답이 왔을 때 UI 업데이트 // 즉시 업뎃해서 자연스럽게 사라지게함
        if (res.data.success && res.data.isBookmarked === false) {
          setBookmarks(prev => prev.filter(b => b.slang_id !== slangId));

          // 성공 토스트 알림
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
          
          Toast.fire({
            icon: 'success',
            title: '북마크 해제 완료! 👋',
            background: '#ffffff',
            iconColor: G.accent,
          });
          console.log("북마크 해제 완료");
        }
      } catch (err) {
        console.error("해제 실패:", err);
        Swal.fire({
          icon: 'error',
          title: '오류 발생',
          text: '북마크를 해제하는 중 문제가 발생했습니다.',
        });
      }
    }
  };


  const filtered = bookmarks.filter(b => {
    const matchSearch = 
      (b.word?.toLowerCase().includes(search.toLowerCase())) ||
      (b.definition_ko?.includes(search));
    const matchCategory = activeCategory === "전체" || b.category === activeCategory;
    
    return matchSearch && matchCategory;
  });

  if(loading)
    return <div style={{ padding : 40, textAlign: "center"}}>로딩 중..</div>;

  return (
    <div style={{ flex: 1, fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>
      <PageHeader
        title="북마크" emoji="⭐"
        right={<Button onClick={() => navigate("/card-study")} size="sm">북마크로 학습 →</Button>}
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
        <div style={viewMode === "grid" 
          ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }
          : { display: "flex", flexDirection: "column", gap: 10 }
        }>
          {filtered.map((b) => (
            <BookmarkItem 
              key={b.bookmark_id} 
              b={b} 
              viewMode={viewMode} 
              flipped={flipped} 
              onFlip={handleFlip}
              onUnbookmark={handleUnbookmark} 
            />
          ))}
        </div>

        {/* 데이터가 없을 때 처리 */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: G.gray }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>아직 저장된 단어가 없어요!</div>
          </div>
        )}
      </div>
    </div>
  );
}