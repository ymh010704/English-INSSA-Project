import { useState } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";

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
    status: "verified", // verified | pending | rejected
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
  {
    id: 3, user: "미드덕후", avatar: "🎬", time: "1일 전",
    word: "Rizz", category: "SNS / 연애",
    meaning: "이성을 끌어당기는 매력, 카리스마",
    example: "Bro has no rizz, he just stood there awkwardly.",
    exampleKr: "얘 매력이 없어, 그냥 어색하게 서 있었잖아.",
    likes: 134, liked: false,
    correct: 118, wrong: 7,
    comments: [
      { id: 1, user: "슬랭박사", avatar: "🎓", text: "2023년 옥스퍼드 올해의 단어로 선정됐어요!", likes: 45 },
      { id: 2, user: "영어고수", avatar: "🧑‍🎓", text: "동사로도 써요. 'He rizzed her up' = 그가 그녀를 꼬셨어", likes: 31 },
    ],
    status: "verified",
  },
  {
    id: 4, user: "유학생김철수", avatar: "🎒", time: "2일 전",
    word: "Understood the assignment",
    category: "칭찬",
    meaning: "완벽히 해냈어, 딱 맞게 했어",
    example: "She wore the perfect outfit. She understood the assignment.",
    exampleKr: "완벽한 옷을 입었어. 딱 맞게 했네.",
    likes: 56, liked: false,
    correct: 48, wrong: 2,
    comments: [],
    status: "pending",
  },
];

const HOT_RANKING = [
  { rank: 1, word: "Rizz", meaning: "이성을 끌어당기는 매력", count: 134, up: true, emoji: "🏆" },
  { rank: 2, word: "Delulu", meaning: "망상, 현실과 동떨어진 생각", count: 87, up: true, emoji: "🥈" },
  { rank: 3, word: "Roman Holiday", meaning: "남의 불행을 즐기는 것", count: 42, up: false, emoji: "🥉" },
  { rank: 4, word: "Understood the assignment", meaning: "완벽히 해냈어", count: 56, up: true, emoji: "4️⃣" },
  { rank: 5, word: "NPC", meaning: "생각 없이 행동하는 사람", count: 38, up: false, emoji: "5️⃣" },
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.white, borderRadius: 28, padding: "32px", width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: G.black, marginBottom: 6 }}>📝 슬랭 제보하기</div>
        <div style={{ fontSize: 13, color: G.gray, marginBottom: 24 }}>알고 있는 새로운 슬랭을 공유해주세요!</div>

        {done ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: G.black }}>제보해주셔서 감사해요!</div>
            <div style={{ fontSize: 13, color: G.gray, marginTop: 6 }}>검수 후 등록될 예정이에요</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "슬랭 단어 *", value: word, set: setWord, placeholder: "예: No cap" },
              { label: "뜻 *", value: meaning, set: setMeaning, placeholder: "예: 진심으로, 거짓말 아님" },
              { label: "예문 (영어)", value: example, set: setExample, placeholder: "예: That movie was amazing, no cap." },
              { label: "예문 (한국어)", value: exampleKr, set: setExampleKr, placeholder: "예: 그 영화 진짜 대박이야, ㄹㅇ." },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e0d8", fontSize: 14, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = G.accent}
                  onBlur={e => e.target.style.borderColor = "#e5e0d8"}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 8 }}>카테고리</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Gen Z", "SNS / 연애", "칭찬", "유행어", "일상"].map(c => (
                  <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 14px", borderRadius: 100, border: `1.5px solid ${category === c ? G.accent : "#e5e0d8"}`, background: category === c ? "rgba(255,77,0,0.06)" : G.white, color: category === c ? G.accent : G.gray, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #e5e0d8", background: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", color: G.gray }}>취소</button>
              <button onClick={handleSubmit} disabled={!word || !meaning} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: word && meaning ? G.accent : "#e5e0d8", color: word && meaning ? G.white : G.gray, fontSize: 14, fontWeight: 700, cursor: word && meaning ? "pointer" : "default", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: word && meaning ? "0 6px 20px rgba(255,77,0,0.3)" : "none" }}>제보하기 →</button>
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
  const [newComment, setNewComment] = useState("");
  const total = post.correct + post.wrong;
  const correctPct = Math.round((post.correct / total) * 100);

  return (
    <div style={{ background: G.white, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
      {/* 헤더 */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: G.lightGray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{post.avatar}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: G.black }}>{post.user}</div>
            <div style={{ fontSize: 11, color: G.gray }}>{post.time}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, background: post.status === "verified" ? "#d1fae5" : "#fef3c7", color: post.status === "verified" ? G.green : "#92400e", padding: "4px 10px", borderRadius: 100 }}>
            {post.status === "verified" ? "✅ 검수완료" : "⏳ 검수중"}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "4px 10px", borderRadius: 100 }}>{post.category}</span>
        </div>
      </div>

      {/* 단어 */}
      <div style={{ padding: "16px 24px 0" }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 24, fontWeight: 900, color: G.black, marginBottom: 6 }}>{post.word}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: G.black, marginBottom: 10 }}>{post.meaning}</div>
        {post.example && (
          <div style={{ background: "#f7f4ef", borderRadius: 14, padding: "14px 16px", marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: G.black, marginBottom: 4 }}>{post.example}</div>
            <div style={{ fontSize: 12, color: G.gray }}>{post.exampleKr}</div>
          </div>
        )}
      </div>

      {/* 검수 투표 */}
      <div style={{ padding: "14px 24px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: G.gray, marginBottom: 8, letterSpacing: 1 }}>실제로 쓰이는 표현인가요?</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button onClick={() => onVote(post.id, "correct")} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "#d1fae5", color: G.green, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
            ✅ 맞아요 {post.correct}
          </button>
          <button onClick={() => onVote(post.id, "wrong")} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "#fef2f2", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
            ❌ 틀려요 {post.wrong}
          </button>
        </div>
        <div style={{ height: 6, background: G.lightGray, borderRadius: 100, overflow: "hidden", marginBottom: 4 }}>
          <div style={{ height: "100%", width: `${correctPct}%`, background: G.green, borderRadius: 100, transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: 11, color: G.gray, textAlign: "right" }}>정확도 {correctPct}% ({total}명 참여)</div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ padding: "12px 24px 16px", display: "flex", gap: 8, borderTop: "1px solid #f3f0ea", marginTop: 14 }}>
        <button onClick={() => onLike(post.id)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100,
          border: `1.5px solid ${post.liked ? G.accent : "#e5e0d8"}`,
          background: post.liked ? "rgba(255,77,0,0.06)" : G.white,
          color: post.liked ? G.accent : G.gray, fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.15s",
        }}>
          {post.liked ? "❤️" : "🤍"} {post.likes}
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100,
          border: "1.5px solid #e5e0d8", background: G.white,
          color: G.gray, fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
        }}>
          💬 댓글 {post.comments.length}
        </button>
      </div>

      {/* 댓글 */}
      {showComments && (
        <div style={{ borderTop: "1px solid #f3f0ea", padding: "16px 24px" }}>
          {post.comments.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
              {post.comments.map(c => (
                <div key={c.id} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: G.lightGray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{c.avatar}</div>
                  <div style={{ flex: 1, background: G.lightGray, borderRadius: 14, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: G.black, marginBottom: 3 }}>{c.user}</div>
                    <div style={{ fontSize: 13, color: G.black, lineHeight: 1.5 }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: G.gray, textAlign: "center", marginBottom: 14 }}>첫 댓글을 남겨보세요! 💬</div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newComment.trim()) { onComment(post.id, newComment); setNewComment(""); }}}
              placeholder="댓글을 입력하세요..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e5e0d8", fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", background: G.lightGray }}
              onFocus={e => e.target.style.borderColor = G.accent}
              onBlur={e => e.target.style.borderColor = "#e5e0d8"}
            />
            <button onClick={() => { if (newComment.trim()) { onComment(post.id, newComment); setNewComment(""); }}} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: G.accent, color: G.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 자유게시판 데이터 ── */
const INITIAL_BOARD = [
  {
    id: 1, user: "유학준비생", avatar: "✈️", time: "1시간 전", tag: "질문",
    title: "미국 친구한테 'I'm so dead' 라고 했더니 왜 웃었을까요?",
    content: "오늘 대화하다가 너무 재밌다고 'I'm so dead' 했는데 친구가 막 웃더라고요. 뭔가 잘못 쓴 건가요..?",
    likes: 23, liked: false,
    comments: [
      { id: 1, user: "원어민친구", avatar: "🌏", text: "ㅋㅋㅋ 잘못 쓴 게 아니에요! 'I'm dead'는 '너무 웃겨서 죽겠다'는 표현이에요. 완전 맞게 쓰셨어요!", likes: 15 },
      { id: 2, user: "영어고수", avatar: "🧑‍🎓", text: "친구가 웃은 건 잘 써서 웃은 거예요 😂 슬랭 잘 아신다고 생각했을 거예요!", likes: 8 },
    ],
  },
  {
    id: 2, user: "GenZ탐구자", avatar: "🔬", time: "3시간 전", tag: "정보",
    title: "요즘 틱톡에서 'Brat'이 엄청 유행하던데 무슨 뜻이에요?",
    content: "Charli XCX 노래 이후로 brat summer라는 말이 엄청 많이 보이는데, 정확히 어떤 뉘앙스인지 모르겠어요.",
    likes: 41, liked: false,
    comments: [
      { id: 1, user: "트렌드워처", avatar: "📱", text: "'Brat'은 자신감 넘치고 거침없는, 약간 반항적인 느낌의 라이프스타일을 뜻해요. 부정적인 단어였는데 긍정적으로 재해석된 케이스!", likes: 28 },
    ],
  },
  {
    id: 3, user: "영어인싸지망생", avatar: "😎", time: "어제", tag: "후기",
    title: "이 앱 덕분에 외국인 친구 사귀었어요 ㅠㅠ",
    content: "교환학생 왔을 때 슬랭 몰라서 항상 어색했는데, 여기서 배운 표현들 써봤더니 친구들이 되게 신기해하면서 친해졌어요. 'no cap', 'lowkey' 이런 거 자연스럽게 쓰니까 완전 달라지더라고요!",
    likes: 87, liked: false,
    comments: [
      { id: 1, user: "슬랭헌터", avatar: "🕵️", text: "완전 공감해요!! 슬랭 하나 알면 대화가 달라지죠 ㅠㅠ", likes: 12 },
      { id: 2, user: "유학준비생", avatar: "✈️", text: "저도 이렇게 되고 싶어요 ㅜㅜ 어떤 표현이 제일 반응 좋았나요?", likes: 5 },
    ],
  },
  {
    id: 4, user: "미드덕후", avatar: "🎬", time: "2일 전", tag: "질문",
    title: "'That hits different'랑 'That slaps' 차이가 있나요?",
    content: "둘 다 좋다는 표현 같은데, 어떤 상황에서 어떻게 구분해서 쓰는지 궁금해요!",
    likes: 34, liked: false,
    comments: [
      { id: 1, user: "영어고수", avatar: "🧑‍🎓", text: "'That slaps'는 주로 음악에 써요. 'That hits different'는 음악 외에도 음식, 순간 등 감성적인 상황에 더 넓게 써요!", likes: 19 },
    ],
  },
];

/* ── 자유게시판 글쓰기 모달 ── */
function WriteBoardModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("질문");
  const [done, setDone] = useState(false);

  function handleSubmit() {
    if (!title || !content) return;
    setDone(true);
    setTimeout(() => { onSubmit({ title, content, tag }); onClose(); }, 1200);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.white, borderRadius: 28, padding: "32px", width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: G.black, marginBottom: 6 }}>✏️ 글쓰기</div>
        <div style={{ fontSize: 13, color: G.gray, marginBottom: 24 }}>자유롭게 질문하거나 경험을 공유해보세요!</div>
        {done ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>게시됐어요!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 8 }}>태그</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["질문", "정보", "후기", "잡담"].map(t => (
                  <button key={t} onClick={() => setTag(t)} style={{ padding: "7px 16px", borderRadius: 100, border: `1.5px solid ${tag === t ? G.accent : "#e5e0d8"}`, background: tag === t ? "rgba(255,77,0,0.06)" : G.white, color: tag === t ? G.accent : G.gray, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>제목 *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력해주세요"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e0d8", fontSize: 14, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = G.accent}
                onBlur={e => e.target.style.borderColor = "#e5e0d8"}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: G.black, display: "block", marginBottom: 6 }}>내용 *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="자유롭게 작성해보세요 😊" rows={5}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e0d8", fontSize: 14, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box", resize: "none", lineHeight: 1.7 }}
                onFocus={e => e.target.style.borderColor = G.accent}
                onBlur={e => e.target.style.borderColor = "#e5e0d8"}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #e5e0d8", background: G.white, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", color: G.gray }}>취소</button>
              <button onClick={handleSubmit} disabled={!title || !content} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: title && content ? G.accent : "#e5e0d8", color: title && content ? G.white : G.gray, fontSize: 14, fontWeight: 700, cursor: title && content ? "pointer" : "default", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: title && content ? "0 6px 20px rgba(255,77,0,0.3)" : "none" }}>게시하기 →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 자유게시판 카드 ── */
function BoardCard({ post, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const TAG_COLORS = { 질문: { bg: "#dbeafe", color: "#1e40af" }, 정보: { bg: "#d1fae5", color: "#065f46" }, 후기: { bg: "rgba(255,77,0,0.1)", color: G.accent }, 잡담: { bg: "#f3e8ff", color: "#7e22ce" } };
  const tc = TAG_COLORS[post.tag] || TAG_COLORS["잡담"];

  return (
    <div style={{ background: G.white, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
      <div style={{ padding: "20px 24px" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: G.lightGray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{post.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: G.black }}>{post.user}</div>
            <div style={{ fontSize: 11, color: G.gray }}>{post.time}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.color, padding: "4px 10px", borderRadius: 100 }}>{post.tag}</span>
        </div>
        {/* 내용 */}
        <div style={{ fontSize: 15, fontWeight: 700, color: G.black, marginBottom: 8, lineHeight: 1.5 }}>{post.title}</div>
        <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7 }}>{post.content}</div>
      </div>
      {/* 액션 */}
      <div style={{ padding: "12px 24px 14px", display: "flex", gap: 8, borderTop: "1px solid #f3f0ea" }}>
        <button onClick={() => onLike(post.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, border: `1.5px solid ${post.liked ? G.accent : "#e5e0d8"}`, background: post.liked ? "rgba(255,77,0,0.06)" : G.white, color: post.liked ? G.accent : G.gray, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.15s" }}>
          {post.liked ? "❤️" : "🤍"} {post.likes}
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 100, border: "1.5px solid #e5e0d8", background: G.white, color: G.gray, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
          💬 댓글 {post.comments.length}
        </button>
      </div>
      {/* 댓글 */}
      {showComments && (
        <div style={{ borderTop: "1px solid #f3f0ea", padding: "16px 24px" }}>
          {post.comments.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {post.comments.map(c => (
                <div key={c.id} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: G.lightGray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{c.avatar}</div>
                  <div style={{ flex: 1, background: G.lightGray, borderRadius: 12, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: G.black, marginBottom: 3 }}>{c.user}</div>
                    <div style={{ fontSize: 13, color: G.black, lineHeight: 1.5 }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: G.gray, textAlign: "center", marginBottom: 14 }}>첫 댓글을 남겨보세요! 💬</div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newComment.trim()) { onComment(post.id, newComment); setNewComment(""); }}}
              placeholder="댓글을 입력하세요..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e5e0d8", fontSize: 13, outline: "none", fontFamily: "'Noto Sans KR', sans-serif", background: G.lightGray }}
              onFocus={e => e.target.style.borderColor = G.accent}
              onBlur={e => e.target.style.borderColor = "#e5e0d8"}
            />
            <button onClick={() => { if (newComment.trim()) { onComment(post.id, newComment); setNewComment(""); }}} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: G.accent, color: G.white, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 메인 ── */
const TABS = [
  { id: "feed", label: "슬랭 제보", emoji: "🆕" },
  { id: "board", label: "자유게시판", emoji: "💬" },
  { id: "hot", label: "이번 주 핫", emoji: "🔥" },
];

export default function Community() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [category, setCategory] = useState("전체");
  const [showSubmit, setShowSubmit] = useState(false);
  const [boardPosts, setBoardPosts] = useState(INITIAL_BOARD);
  const [showWrite, setShowWrite] = useState(false);

  function handleBoardLike(id) {
    setBoardPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  }
  function handleBoardComment(id, text) {
    setBoardPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, { id: Date.now(), user: "이경현", avatar: "🙋", text, likes: 0 }] } : p));
  }
  function handleBoardWrite(data) {
    const newPost = { id: Date.now(), user: "이경현", avatar: "🙋", time: "방금", ...data, likes: 0, liked: false, comments: [] };
    setBoardPosts(prev => [newPost, ...prev]);
  }

  const filtered = posts.filter(p => category === "전체" || p.category === category);

  function handleLike(id) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  }

  function handleVote(id, type) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, [type]: p[type] + 1 } : p));
  }

  function handleComment(id, text) {
    setPosts(prev => prev.map(p => p.id === id ? {
      ...p,
      comments: [...p.comments, { id: Date.now(), user: "이경현", avatar: "🙋", text, likes: 0 }]
    } : p));
  }

  function handleSubmit(data) {
    const newPost = {
      id: Date.now(), user: "이경현", avatar: "🙋", time: "방금",
      ...data, likes: 0, liked: false,
      correct: 0, wrong: 0, comments: [], status: "pending",
    };
    setPosts(prev => [newPost, ...prev]);
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif" }}>

      <PageHeader
        title="커뮤니티" emoji="🌐"
        right={
          tab === "feed" ? <button onClick={() => setShowSubmit(true)} style={{ padding: "9px 18px", borderRadius: 100, border: "none", background: G.accent, color: G.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 4px 14px rgba(255,77,0,0.3)" }}>+ 제보하기</button>
          : tab === "board" ? <button onClick={() => setShowWrite(true)} style={{ padding: "9px 18px", borderRadius: 100, border: "none", background: G.accent, color: G.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", boxShadow: "0 4px 14px rgba(255,77,0,0.3)" }}>✏️ 글쓰기</button>
          : null
        }
      />

      {/* 탭 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 40px", display: "flex", gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? G.accent : G.gray,
            borderBottom: `2.5px solid ${tab === t.id ? G.accent : "transparent"}`,
            fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.15s",
          }}>{t.emoji} {t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>

        {/* 🔥 핫 랭킹 */}
        {tab === "hot" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: G.black, marginBottom: 8 }}>
              🔥 이번 주 핫한 슬랭
            </div>
            {HOT_RANKING.map((r, i) => (
              <div key={r.rank} style={{
                background: i === 0 ? `linear-gradient(135deg, ${G.navy}, #1e3a5f)` : G.white,
                borderRadius: 20, padding: "18px 24px",
                display: "flex", alignItems: "center", gap: 16,
                border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: i === 0 ? G.white : G.black }}>{r.word}</div>
                  <div style={{ fontSize: 12, color: i === 0 ? "rgba(255,255,255,0.5)" : G.gray, marginTop: 2 }}>{r.meaning}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: i === 0 ? G.accent : G.black }}>❤️ {r.count}</div>
                  <div style={{ fontSize: 11, color: r.up ? G.green : "#ef4444", fontWeight: 700, marginTop: 2 }}>{r.up ? "▲ 상승" : "▼ 하락"}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 📰 피드 */}
        {tab === "feed" && (
          <>
            {/* 카테고리 필터 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  padding: "7px 16px", borderRadius: 100, whiteSpace: "nowrap",
                  border: `1.5px solid ${category === c ? G.accent : "#e5e0d8"}`,
                  background: category === c ? "rgba(255,77,0,0.06)" : G.white,
                  color: category === c ? G.accent : G.gray,
                  fontSize: 12, fontWeight: category === c ? 700 : 500,
                  cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.15s",
                }}>{c}</button>
              ))}
            </div>

            {/* 게시물 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} onVote={handleVote} onComment={handleComment} />
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: G.gray, fontSize: 14 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  이 카테고리엔 아직 제보가 없어요!
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 자유게시판 탭 */}
      {tab === "board" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {boardPosts.map(post => (
            <BoardCard key={post.id} post={post} onLike={handleBoardLike} onComment={handleBoardComment} />
          ))}
        </div>
      )}

      {/* 제보 모달 */}
      {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} onSubmit={handleSubmit} />}
      {showWrite && <WriteBoardModal onClose={() => setShowWrite(false)} onSubmit={handleBoardWrite} />}
    </div>
  );
}