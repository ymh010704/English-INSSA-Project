import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";


/* ── 더미 데이터 ── */
/*const INITIAL_POSTS = [
  {
    id: 1, user: "슬랭헌터", avatar: "🕵️", time: "2시간 전",
    word: "Roman Holiday", category: "유행어",
    meaning: "남의 불행을 즐기는 것",
    example: "Don't have a Roman Holiday watching others fail.",
    exampleKr: "남이 실패하는 걸 즐기지 마.",
    likes: 42, liked: false,
    correct: 38, wrong: 4,
    comments: [
      { id: 1, user: "영어고수", avatar: "🧑‍🎓", text: "Taylor Swift 노래에서 유명해진 표현이에요!", likes: 12 },
      { id: 2, user: "원어민친구", avatar: "🌏", text: "맞아요! 영국식 표현인데 요즘 SNS에서 많이 써요.", likes: 8 },
    ],
    status: "verified",
  },
  {
    id: 2, user: "GenZ마스터", avatar: "✨", time: "5시간 전",
    word: "Delulu", category: "Gen Z",
    meaning: "망상, 현실과 동떨어진 생각 (delusional의 줄임말)",
    example: "She thinks he likes her back? That's so delulu.",
    exampleKr: "걔가 자기 좋아한다고 생각한다고? 완전 망상이네.",
    likes: 87, liked: false,
    correct: 91, wrong: 3,
    comments: [
      { id: 1, user: "트렌드워처", avatar: "📱", text: "'delulu is the solulu'라는 표현도 있어요 ㅋㅋ", likes: 24 },
    ],
    status: "verified",
  },
];*/

const HOT_RANKING = [
  { rank: 1, word: "Rizz", meaning: "이성을 끌어당기는 매력", count: 134, up: true, emoji: "🏆" },
  { rank: 2, word: "Delulu", meaning: "망상, 현실과 동떨어진 생각", count: 87, up: true, emoji: "🥈" },
];

const INITIAL_BOARD = [
  {
    id: 1, user: "유학준비생", avatar: "✈️", time: "1시간 전", tag: "질문",
    title: "미국 친구한테 'I'm so dead' 라고 했더니 왜 웃었을까요?",
    content: "오늘 대화하다가 너무 재밌다고 'I'm so dead' 했는데 친구가 막 웃더라고요. 뭔가 잘못 쓴 건가요..?",
    likes: 23, liked: false,
    comments: [],
  },
];

const CATEGORIES = ["전체", "Gen Z", "SNS / 연애", "칭찬", "유행어", "일상", "연애"];

/* ── 제보 모달 ── */
function SubmitModal({ onClose, onSubmit }) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [exampleKr, setExampleKr] = useState("");
  const [category, setCategory] = useState("Gen Z");
  const [done, setDone] = useState(false);

  function handleSubmit() {
    if (!word || !meaning) return;
    setDone(true);
    setTimeout(() => {
      onSubmit({ word, meaning, example, exampleKr, category });
      onClose();
    }, 1500);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.white, borderRadius: 28, padding: "32px", width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: G.black, marginBottom: 6 }}>📝 슬랭 제보하기</div>
        {done ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: G.black }}>제보해주셔서 감사해요!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input value={word} onChange={e => setWord(e.target.value)} placeholder="슬랭 단어" style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid #eee" }} />
            <input value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="뜻" style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid #eee" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>취소</Button>
              <Button onClick={handleSubmit} style={{ flex: 1 }}>제보하기 →</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 게시물 카드 ── */
function PostCard({ post, onLike, onVote, onComment }) {
  const [showComments, setShowComments] = useState(false);
  return (
    <div style={{ background: G.white, borderRadius: 24, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 16 }}>
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: G.lightGray, display: "flex", alignItems: "center", justifyContent: "center" }}>{post.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{post.user}</div>
            <div style={{ fontSize: 11, color: G.gray }}>{post.time}</div>
          </div>
          <span style={{ fontSize: 10, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "4px 10px", borderRadius: 100 }}>{post.category}</span>
        </div>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{post.word}</div>
        <div style={{ fontSize: 15, color: G.black }}>{post.meaning}</div>
      </div>
      <div style={{ padding: "12px 24px", display: "flex", gap: 8, borderTop: "1px solid #f3f0ea" }}>
        <button onClick={() => onLike(post.id)} style={{ border: "none", background: "none", cursor: "pointer" }}>{post.liked ? "❤️" : "🤍"} {post.likes}</button>
        <button onClick={() => setShowComments(!showComments)} style={{ border: "none", background: "none", cursor: "pointer" }}>💬 댓글 {post.comments?.length || 0}</button>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function Community() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState([]); 
  const [category, setCategory] = useState("전체");
  const [showSubmit, setShowSubmit] = useState(false);
  const [boardPosts, setBoardPosts] = useState([]);
  const [showWrite, setShowWrite] = useState(false);
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");

  const userRawData = localStorage.getItem("user");
  let currentUser = "미인증유저";

  if (userRawData) {
    try {
      const parsedUser = JSON.parse(userRawData);
      currentUser = parsedUser.nickname || "미인증유저";
    } catch (e) {
      console.error("유저 데이터 파싱 에러:", e);
      currentUser = userRawData; 
    }
  }

  // 2. 서버에서 데이터를 가져오는 useEffect 
  useEffect(() => {
      // 백엔드 8000번 포트에서 자유게시판 목록 받아오기
      fetch('/api/board')
          .then((res) => res.json())
          .then((data) => {
              setBoardPosts(data); 
          })
          .catch((err) => console.error("데이터 로딩 실패:", err));
  }, []);

  const TABS = [
    { id: "feed", label: "슬랭 제보", emoji: "🆕" },
    { id: "board", label: "자유게시판", emoji: "💬" },
    { id: "hot", label: "이번 주 핫", emoji: "🔥" },
  ];

  const handleWriteSubmit = async (titleInput, contentInput) => {
    try {
        // 백엔드의 글쓰기 API 주소로 데이터 전송
        const response = await fetch('/api/board/write', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: titleInput,
                content: contentInput,
                user: currentUser 
            }),
        });

        if (response.ok) {
            const result = await response.json();
            
            // 서버에서 저장하고 돌려준 새 글(result.data)을 
            // 기존 자유게시판 바구니(boardPosts) 맨 앞에 넣어주기
            setBoardPosts((prev) => [result.data, ...prev]);
            
            // 글쓰기 창 닫기
            setShowWrite(false); 
            alert("글이 성공적으로 등록되었습니다! ");
        } else {
            alert("글 등록에 실패했습니다. 서버를 확인해 주세요. ");
        }
    } catch (err) {
        console.error("글 등록 에러:", err);
    }
  };

  const handleReaction = async (id, type) => {
    try {
        const response = await fetch(`/api/board/${id}/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: currentUser }) 
        });

        if (response.ok) {
            const result = await response.json();
            setBoardPosts((prev) => 
                prev.map(post => post.id === id ? result.data : post)
            );
        } else {
            const errorData = await response.json();
            alert(errorData.message); // "이미 싫어요를 누른 게시글입니다." 등 경고창 띄우기
        }
    } catch (err) {
        console.error("반응 등록 에러:", err);
    }
  };

  const handleCommentSubmit = async (postId, commentContent) => {
    if (!commentContent.trim()) return alert("댓글 내용을 입력해주세요!");

    try {
        const response = await fetch(`/api/board/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: commentContent,
                user: currentUser 
            }),
        });

        if (response.ok) {
            const result = await response.json();
            setBoardPosts((prev) =>
                prev.map(post => post.id === postId ? result.data : post)
            );
        }
    } catch (err) {
        console.error("댓글 등록 에러:", err);
    }
  };

  function handleLike(id) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  }
  function handleVote(id, type) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, [type]: p[type] + 1 } : p));
  }
  function handleComment(id, text) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, { id: Date.now(), user: "두두현", avatar: "🙋", text }] } : p));
  }
  function handleSubmit(data) {
    const newPost = { id: Date.now(), user: "민혁", avatar: "🙋", time: "방금", ...data, likes: 0, liked: false, correct: 0, wrong: 0, comments: [], status: "pending" };
    setPosts(prev => [newPost, ...prev]);
  }

  return (
    <div style={{ minHeight: "100vh", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif" }}>

      {showWrite && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000}}>
          <div style={{ background: "#fff", padding: 32, borderRadius: 24, width: "90%", maxWidth: 500, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>✏️ 자유게시판 글쓰기</h3>
            
            {/* 제목 입력란 */}
            <input 
              type="text" 
              placeholder="제목을 입력하세요" 
              value={writeTitle}
              onChange={(e) => setWriteTitle(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #eee", marginBottom: 12, fontSize: 14, boxSizing: "border-box" }}
            />
            
            {/* 내용 입력란 */}
            <textarea 
              placeholder="따뜻한 커뮤니티를 위한 글을 작성해주세요." 
              value={writeContent}
              onChange={(e) => setWriteContent(e.target.value)}
              style={{ width: "100%", height: 150, padding: "12px 16px", borderRadius: 12, border: "1px solid #eee", marginBottom: 20, fontSize: 14, resize: "none", boxSizing: "border-box" }}
            />
            
            {/* 버튼 구역 */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowWrite(false)} 
                style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid #eee", background: "#fff", cursor: "pointer" }}
              >
                취소
              </button>
              <button 
                onClick={() => {
                  if(!writeTitle || !writeContent) return alert("제목과 내용을 모두 써주세요!");
                  handleWriteSubmit(writeTitle, writeContent); 
                  setWriteTitle(""); // 등록 후 입력창 비우기
                  setWriteContent("");
                }} 
                style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: G.orange || "#ff6b6b", color: "#fff", fontWeight: 600, cursor: "pointer" }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title="커뮤니티" emoji="🌐"
        right={
          tab === "feed" ? <Button onClick={() => setShowSubmit(true)} size="sm">+ 제보하기</Button>
          : tab === "board" ? <Button onClick={() => setShowWrite(true)} size="sm">✏️ 글쓰기</Button>
          : null
        }
      />

      {/* 탭 메뉴 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 40px", display: "flex", gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer", color: tab === t.id ? G.accent : G.gray, borderBottom: `2.5px solid ${tab === t.id ? G.accent : "transparent"}`, fontWeight: tab === t.id ? 700 : 500 }}>{t.emoji} {t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
        {tab === "feed" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 16px", borderRadius: 100, border: `1.5px solid ${category === c ? G.accent : "#eee"}`, background: category === c ? "rgba(255,77,0,0.06)" : G.white, color: category === c ? G.accent : G.gray, fontSize: 12, whiteSpace: "nowrap" }}>{c}</button>
              ))}
            </div>
            {posts.filter(p => category === "전체" || p.category === category).map(post => (
              <PostCard key={post.id} post={post} onLike={handleLike} onVote={handleVote} onComment={handleComment} />
            ))}
          </>
        )}

        {/* 자유게시판 탭 디자인 완벽 복구 구역 */}
        {tab === "board" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {boardPosts && boardPosts.length > 0 ? (
              boardPosts.map((post) => (
                <div key={post.id} style={{ background: G.white, borderRadius: 24, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 16 }}>
                  
                  {/* 상단 헤더 유저 정보 디자인 복구 */}
                  <div style={{ padding: "20px 24px 0px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: G.lightGray, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {post.avatar || "📝"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{post.user}</div>
                        <div style={{ fontSize: 11, color: G.gray }}>{post.date || "방금 전"}</div>
                      </div>
                      {post.tag && <span style={{ fontSize: 10, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "4px 10px", borderRadius: 100 }}>{post.tag}</span>}
                    </div>
                    
                    {/* 게시글 제목 및 본문 디자인 */}
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: G.black }}>{post.title}</div>
                    <div style={{ fontSize: 14, color: "#444", lineHeight: "1.5", marginBottom: 14 }}>{post.content}</div>
                  </div>

                  {/* 👍 👎 좋아요 / 싫어요 / 댓글 개수 버튼 인터페이스 복구 */}
                  <div style={{ padding: "12px 24px", display: "flex", gap: 16, borderTop: "1px solid #f3f0ea", borderBottom: "1px solid #f3f0ea" }}>
                    <button onClick={() => handleReaction(post.id, 'like')} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14 }}>
                      👍 {post.likes || 0}
                    </button>
                    <button onClick={() => handleReaction(post.id, 'dislike')} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14 }}>
                      👎 {post.dislikes || 0}
                    </button>
                    <div style={{ fontSize: 14, color: G.gray, display: "flex", alignItems: "center" }}>
                      💬 댓글 {post.comments?.length || 0}개
                    </div>
                  </div>

                  {/* 내부에 뚫어놓은 실시간 댓글 목록 */}
                  <div style={{ padding: "16px 24px", background: "#fafafa", borderRadius: "0 0 24px 24px" }}>
                    {post.comments && post.comments.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                        {post.comments.map((comment) => (
                          <div key={comment.id} style={{ fontSize: 13, lineHeight: "1.4" }}>
                            <strong style={{ color: G.black, marginRight: 6 }}>{comment.user}</strong>
                            <span style={{ color: "#555" }}>{comment.content}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 실시간 댓글 입력 트레이 구역 */}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input 
                        type="text"
                        placeholder="댓글을 대댓대댓 남겨보세요..."
                        id={`comment-input-${post.id}`}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 13, background: G.white }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const inputEl = document.getElementById(`comment-input-${post.id}`);
                            handleCommentSubmit(post.id, inputEl.value);
                            inputEl.value = "";
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const inputEl = document.getElementById(`comment-input-${post.id}`);
                          handleCommentSubmit(post.id, inputEl.value);
                          inputEl.value = "";
                        }}
                        style={{ padding: "0 18px", borderRadius: 12, background: G.black, color: G.white, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                      >
                        등록
                      </button>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                등록된 게시글이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 🚀 이번 주 핫 랭킹 탭 컨텐츠 영역 */}
        {tab === "hot" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {HOT_RANKING && HOT_RANKING.map((r) => (
              <div key={r.rank} style={{ background: "#fff", borderRadius: 20, padding: 20, display: "flex", gap: 16 }}>
                <div style={{ fontSize: 24 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900 }}>{r.word}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>{r.meaning}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 모달 레이어 구역 */}
        {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} onSubmit={handleSubmit} />}
      </div>
    </div>
  );
}