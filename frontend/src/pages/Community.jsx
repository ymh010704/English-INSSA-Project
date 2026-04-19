import { useState } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";

/* ── 더미 데이터 ── */
const INITIAL_POSTS = [
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
];

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
        <button onClick={() => setShowComments(!showComments)} style={{ border: "none", background: "none", cursor: "pointer" }}>💬 댓글 {post.comments.length}</button>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function Community() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [category, setCategory] = useState("전체");
  const [showSubmit, setShowSubmit] = useState(false);
  const [boardPosts, setBoardPosts] = useState(INITIAL_BOARD);
  const [showWrite, setShowWrite] = useState(false);

  const TABS = [
    { id: "feed", label: "슬랭 제보", emoji: "🆕" },
    { id: "board", label: "자유게시판", emoji: "💬" },
    { id: "hot", label: "이번 주 핫", emoji: "🔥" },
  ];

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

        {tab === "board" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {boardPosts.map(post => (
              <div key={post.id} style={{ background: G.white, borderRadius: 24, padding: 24, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{post.title}</div>
                <div style={{ fontSize: 13, color: G.gray }}>{post.content}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "hot" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {HOT_RANKING.map(r => (
              <div key={r.rank} style={{ background: G.white, borderRadius: 20, padding: 20, display: "flex", alignItems: "center", gap: 16, border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 24 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900 }}>{r.word}</div>
                  <div style={{ fontSize: 12, color: G.gray }}>{r.meaning}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} onSubmit={handleSubmit} />}
    </div>
  );
}