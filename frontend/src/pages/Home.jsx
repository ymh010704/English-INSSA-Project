import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useBreakpoint from "../hooks/useBreakpoint";
import Mascot from "../components/Mascot";

import G from "../constants/colors";

// 공통 레이아웃 스타일 (중앙 정렬 컨테이너)
const containerStyle = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 20px",
  boxSizing: "border-box",
};

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Nav({ scrolled, onLearningClick }) {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const NAV_LINKS = [
    { label: "학습", action: () => onLearningClick?.() },
    { label: "커뮤니티", action: () => navigate("/community") },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,253,249,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      transition: "all 0.3s",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "space-between", height: isMobile ? 56 : scrolled ? 64 : 80 }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 17, fontWeight: 900, color: G.black, cursor: "pointer" }} onClick={() => navigate("/")}>
          영어<span style={{ color: G.accent }}>인싸</span>되기
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {!isMobile && (
            <div style={{ display: "flex", gap: 32 }}>
              {NAV_LINKS.map(({ label, action }) => (
                <span
                  key={label}
                  onClick={action}
                  style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = G.black}
                  onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
                >{label}</span>
              ))}
            </div>
          )}
          <button onClick={() => navigate("/login")} style={{
            background: "transparent", border: "1px solid rgba(0,0,0,0.15)", color: G.gray,
            padding: "9px 22px", borderRadius: 100, fontSize: 13, cursor: "pointer",
            fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = G.black; e.currentTarget.style.color = G.white; e.currentTarget.style.borderColor = G.black; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = G.gray; e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; }}
          >로그인</button>
        </div>
      </div>
    </nav>
  );
}

const SLANG_CHIPS = [
  { word: "No cap 🔥", hot: true },
  { word: "Slay 👑", hot: true },
  { word: "Lowkey", hot: false },
  { word: "It's giving", hot: false },
  { word: "Rizz", hot: false },
];

function Hero() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  return (
    <section style={{
      minHeight: "100vh", background: G.bg, position: "relative",
      overflow: "hidden", padding: isMobile ? "100px 0 60px" : "140px 0 80px",
      fontFamily: "'Noto Sans KR', sans-serif",
      display: "flex", alignItems: "center",
    }}>
      {/* 배경 데코레이션 - 화면 끝에 고정 */}
      <div style={{ position: "absolute", top: -100, left: -100, width: 600, height: 600, background: "radial-gradient(circle, rgba(255,77,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 600, height: 600, background: "radial-gradient(circle, rgba(255,204,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "space-between", flexDirection: isMobile ? "column-reverse" : "row", position: "relative", zIndex: 1, textAlign: isMobile ? "center" : "left" }}>
        {/* 왼쪽 텍스트 */}
        <div style={{ flex: 1, maxWidth: 600 }}>
          <Reveal delay={0}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,77,0,0.08)", border: "1px solid rgba(255,77,0,0.2)",
              color: G.accent, padding: "6px 16px", borderRadius: 100,
              fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 32,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.accent, display: "inline-block", animation: "blink 1.5s infinite" }} />
              🔥 Gen Z 슬랭 학습
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: "clamp(40px, 5vw, 72px)", // 대화면 대응 상향 조정
              fontWeight: 900, lineHeight: 1.1, letterSpacing: -2,
              marginBottom: 24, color: G.black,
            }}>
              교과서 영어는<br />
              <span style={{ color: G.accent }}>그만.</span>
            </h1>
            <p style={{ fontSize: "clamp(20px, 2.5vw, 32px)", color: "rgba(0,0,0,0.6)", fontWeight: 600, marginBottom: 20, letterSpacing: -0.5, lineHeight: 1.4 }}>
              진짜 원어민처럼 말하고 싶다면
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p style={{ fontSize: 16, color: "#9ca3af", lineHeight: 2, maxWidth: 480, marginBottom: 40, fontWeight: 300 }}>
              슬랭 카드 학습 + AI 원어민 회화 연습으로<br />
              <span style={{ color: G.black, fontWeight: 600 }}>No cap, Slay, Rizz</span> — 교과서엔 없는 진짜 표현을<br />
              매일 5분씩 익히면 말문이 트여요.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div style={{ display: "flex", gap: 12, marginBottom: 52, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              <button onClick={() => navigate("/login")} style={{
                background: G.accent, color: G.white, border: "none",
                padding: "16px 36px", borderRadius: 100, fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
                boxShadow: "0 0 40px rgba(255,77,0,0.35)", transition: "transform 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >무료로 시작하기 →</button>
              <button onClick={() => navigate("/login")} style={{
                background: "transparent", color: G.gray, border: "1px solid rgba(0,0,0,0.12)",
                padding: "16px 28px", borderRadius: 100, fontSize: 15, fontWeight: 500,
                cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >미리보기</button>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SLANG_CHIPS.map(c => (
                <div key={c.word} style={{
                  background: c.hot ? "rgba(255,77,0,0.06)" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${c.hot ? "rgba(255,77,0,0.2)" : "rgba(0,0,0,0.08)"}`,
                  color: c.hot ? G.accent : "#9ca3af",
                  padding: "8px 18px", borderRadius: 100,
                  fontSize: 12, fontFamily: "'Unbounded', sans-serif", fontWeight: 700,
                }}>{c.word}</div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* 오른쪽 캐릭터 */}
        <div style={{ flex: "0 0 auto", paddingLeft: isMobile ? 0 : 60, paddingTop: isMobile ? 24 : 0, display: "flex", justifyContent: "center" }}>
          <Mascot size={isMobile ? 200 : 400} mode="home" />
        </div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </section>
  );
}

const FEATURES = [
  { icon: "📱", title: "매일 5개 슬랭", desc: "SNS, 유튜브, 틱톡에서 실제로 쓰이는 표현만 골라 매일 업데이트해요." },
  { icon: "🤖", title: "AI 회화 연습", desc: "원어민 AI와 1:1 대화 연습. 어색함 없이 실전처럼 연습할 수 있어요." },
  { icon: "🌐", title: "커뮤니티", desc: "새로운 슬랭 제보, 좋아요, 댓글로 함께 만들어가는 살아있는 사전." },
  { icon: "🔥", title: "이번 주 핫 랭킹", desc: "지금 가장 많이 쓰이는 슬랭 TOP 5를 매주 업데이트해요." },
];

function Features() {
  return (
    <section style={{ background: G.white, padding: "120px 0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={containerStyle}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 11, fontWeight: 700, color: G.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>영어인싸되기!</div>
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 900, color: G.black, letterSpacing: -1.5 }}>다른 앱과 뭐가 다를까요?</h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div style={{
                background: G.bg, borderRadius: 24, padding: "40px 32px", height: "100%", boxSizing: "border-box",
                border: "1px solid rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black, marginBottom: 12, letterSpacing: -0.5 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.8 }}>{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const PREVIEW_SLANGS = [
  { word: "No cap", meaning: "진심으로, 거짓말 아님 (ㄹㅇ)", example: "That movie was insane, no cap.", tag: "SNS / 일상", emoji: "🔥" },
  { word: "Rizz", meaning: "이성을 끄는 매력, 카리스마", example: "Bro has no rizz whatsoever.", tag: "연애", emoji: "👑" },
  { word: "Delulu", meaning: "망상, 현실과 동떨어진 생각", example: "She's so delulu if she thinks that.", tag: "Gen Z", emoji: "✨" },
];

function SlangPreview() {
  const [flipped, setFlipped] = useState(null);
  return (
    <section style={{ background: G.bg, padding: "120px 0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={containerStyle}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 11, fontWeight: 700, color: G.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>SLANG PREVIEW</div>
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 900, color: G.black, letterSpacing: -1.5 }}>오늘의 슬랭</h2>
            <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 12 }}>카드를 눌러보세요 👆</p>
          </div>
        </Reveal>
        <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
          {PREVIEW_SLANGS.map((s, i) => (
            <Reveal key={s.word} delay={i * 0.1} style={{ perspective: 1000 }}>
              <div onClick={() => setFlipped(flipped === i ? null : i)} style={{
                width: 300, height: 220, cursor: "pointer",
                position: "relative", transformStyle: "preserve-3d",
                transform: flipped === i ? "rotateY(180deg)" : "rotateY(0deg)",
                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}>
                {/* Front */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  background: G.white, borderRadius: 28, padding: "32px",
                  border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,77,0,0.08)", color: G.accent, padding: "4px 12px", borderRadius: 100 }}>{s.tag}</span>
                    <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 900, color: G.black, marginTop: 16 }}>{s.word} {s.emoji}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#d1d5db", textAlign: "right" }}>탭해서 뜻 보기 →</div>
                </div>
                {/* Back */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: G.black, borderRadius: 28, padding: "32px",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: G.white, marginBottom: 12 }}>{s.meaning}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontStyle: "italic" }}>"{s.example}"</div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>탭해서 닫기 ←</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const REVIEWS = [
  { name: "윤민혁", school: "컴퓨터공학과", avatar: "🙋", text: "교환학생 가서 'no cap' 한 마디 했더니 친구들이 완전 친해졌어요. 진짜 슬랭 아는 게 이렇게 다를 줄 몰랐어요!", stars: 5 },
  { name: "김민우", school: "컴퓨터공학과", avatar: "😎", text: "스픽이나 듀오링고로는 배울 수 없는 표현들을 여기서 배웠어요. 원어민 친구가 쓰는 말투 그대로예요.", stars: 5 },
  { name: "김두현", school: "컴퓨터공학과", avatar: "✨", text: "AI 회화 연습이 진짜 도움 됐어요. 실제 대화처럼 연습하니까 긴장감 없이 영어로 말하는 게 편해졌어요.", stars: 5 },
];

function ReviewSection() {
  return (
    <section style={{ background: G.white, padding: "120px 0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={containerStyle}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 11, fontWeight: 700, color: G.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>REVIEWS</div>
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 900, color: G.black, letterSpacing: -1.5 }}>실제 후기</h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.1}>
              <div style={{ background: G.bg, borderRadius: 28, padding: "36px", border: "1px solid rgba(0,0,0,0.05)", height: "100%", boxSizing: "border-box" }}>
                <div style={{ fontSize: 14, color: G.accent, marginBottom: 18, letterSpacing: 2 }}>{"★".repeat(r.stars)}</div>
                <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.8, marginBottom: 28 }}>"{r.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: G.lightGray, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G.black }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.school}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const DEMO_QUIZ = [
  {
    word: "No cap", emoji: "🔥", category: "SNS / 일상",
    options: ["완전히 실패하다", "거짓말 아님, 진심으로", "무시하다, 차단하다", "엄청 피곤하다"],
    answer: 1,
  },
  {
    word: "Slay", emoji: "👑", category: "칭찬 / 긍정",
    options: ["겁쟁이가 되다", "숨겨두다", "완벽하게 잘하다", "조용히 있다"],
    answer: 2,
  },
  {
    word: "Rizz", emoji: "✨", category: "연애",
    options: ["이성을 끄는 매력", "거짓말을 하다", "화가 많이 나다", "완전히 지쳐있다"],
    answer: 0,
  },
];

function LearningPreview({ sectionRef }) {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = DEMO_QUIZ[qIdx];

  function select(i) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setScore(s => s + 1);
  }

  function handleNext() {
    if (qIdx + 1 >= DEMO_QUIZ.length) setDone(true);
    else { setQIdx(i => i + 1); setSelected(null); }
  }

  return (
    <section ref={sectionRef} style={{ background: G.navy, padding: "120px 0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={containerStyle}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 11, fontWeight: 700, color: G.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>LEARNING PREVIEW</div>
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 900, color: G.white, letterSpacing: -1.5, marginBottom: 12 }}>직접 체험해보세요</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>실제 앱과 똑같은 방식으로 배워요</p>
          </div>
        </Reveal>

        {done ? (
          <Reveal>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
              <h3 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, color: G.white, marginBottom: 12 }}>
                {score}/{DEMO_QUIZ.length} <span style={{ color: G.accent }}>맞혔어요!</span>
              </h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, marginBottom: 40 }}>
                500개 이상의 슬랭이 기다려요. 지금 시작해보세요!
              </p>
              <button onClick={() => navigate("/login")} style={{
                background: G.accent, color: G.white, border: "none",
                padding: "18px 48px", borderRadius: 100, fontSize: 16, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
                boxShadow: "0 0 48px rgba(255,77,0,0.45)", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 0 64px rgba(255,77,0,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 48px rgba(255,77,0,0.45)"; }}
              >학습 시작하기 →</button>
            </div>
          </Reveal>
        ) : (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            {/* 진행 도트 */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}>
              {DEMO_QUIZ.map((_, i) => (
                <div key={i} style={{ width: i === qIdx ? 28 : 8, height: 8, borderRadius: 4, background: i < qIdx ? "rgba(255,77,0,0.5)" : i === qIdx ? G.accent : "rgba(255,255,255,0.15)", transition: "all 0.3s" }} />
              ))}
            </div>

            {/* 단어 카드 */}
            <div style={{ background: "linear-gradient(145deg, #1e3a5f, #0f2244)", borderRadius: 28, padding: isMobile ? "32px 24px" : "40px 40px", textAlign: "center", marginBottom: 20, boxShadow: "0 20px 56px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 14 }}>이 단어의 뜻은?</div>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: isMobile ? 38 : 52, fontWeight: 900, color: G.white, letterSpacing: -2, marginBottom: 14 }}>{q.word} {q.emoji}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,77,0,0.12)", border: "1px solid rgba(255,77,0,0.25)", borderRadius: 100, padding: "5px 16px" }}>
                <span style={{ fontSize: 11, color: G.accent, fontWeight: 700 }}>{q.category}</span>
              </div>
            </div>

            {/* 선택지 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {q.options.map((opt, i) => {
                const isCorrectOpt = i === q.answer;
                const isSelectedOpt = selected === i;
                let bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)", color = "rgba(255,255,255,0.85)";
                if (selected !== null) {
                  if (isCorrectOpt) { bg = "rgba(16,185,129,0.15)"; border = "#10b981"; color = "#6ee7b7"; }
                  else if (isSelectedOpt) { bg = "rgba(239,68,68,0.15)"; border = "#ef4444"; color = "#fca5a5"; }
                }
                return (
                  <button key={i} onClick={() => select(i)} style={{
                    padding: "15px 20px", borderRadius: 16,
                    background: bg, border: `1.5px solid ${border}`, color,
                    cursor: selected !== null ? "default" : "pointer",
                    fontSize: 14, fontWeight: 600, textAlign: "left",
                    display: "flex", alignItems: "center", gap: 14,
                    fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.15s",
                  }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: selected !== null && isCorrectOpt ? "#10b981" : selected !== null && isSelectedOpt ? "#ef4444" : "rgba(255,255,255,0.1)" }}>
                      {selected !== null && isCorrectOpt ? "✓" : selected !== null && isSelectedOpt ? "✗" : ["A","B","C","D"][i]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* 피드백 + 다음 버튼 */}
            {selected !== null && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: selected === q.answer ? "#6ee7b7" : "#fca5a5", marginBottom: 16 }}>
                  {selected === q.answer ? "🎉 정답이에요!" : `😅 아쉬워요! 정답: "${q.options[q.answer]}"`}
                </div>
                <button onClick={handleNext} style={{
                  background: G.accent, color: G.white, border: "none",
                  padding: "14px 36px", borderRadius: 100, fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
                  boxShadow: "0 4px 24px rgba(255,77,0,0.4)", transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  {qIdx + 1 >= DEMO_QUIZ.length ? "결과 보기 →" : "다음 문제 →"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function CTASection() {
  const navigate = useNavigate();
  return (
    <section style={{ background: G.black, padding: "140px 0", textAlign: "center", fontFamily: "'Noto Sans KR', sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 500, background: "radial-gradient(circle, rgba(255,77,0,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={containerStyle}>
        <Reveal>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 11, fontWeight: 700, color: G.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 24 }}>GET STARTED</div>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "clamp(32px, 4vw, 60px)", fontWeight: 900, color: G.white, letterSpacing: -2, marginBottom: 24, lineHeight: 1.2 }}>
            지금 바로 시작해요.<br /><span style={{ color: G.accent }}>무료로.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginBottom: 48, lineHeight: 1.8 }}>
            회원가입 30초면 충분해요.<br />오늘부터 진짜 영어 인싸 되기 시작!
          </p>
          <button onClick={() => navigate("/login")} style={{
            background: G.accent, color: G.white, border: "none",
            padding: "20px 56px", borderRadius: 100, fontSize: 17, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
            boxShadow: "0 0 60px rgba(255,77,0,0.4)", transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 0 80px rgba(255,77,0,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 60px rgba(255,77,0,0.4)"; }}
          >무료로 시작하기 →</button>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: G.black, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "60px 0" }}>
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>
          영어<span style={{ color: G.accent }}>인싸</span>되기
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: 0.5 }}>© 2025 Engssa. 졸업작품 프로젝트.</div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const learningRef = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ background: G.bg }}>
      <Nav scrolled={scrolled} onLearningClick={() => learningRef.current?.scrollIntoView({ behavior: "smooth" })} />
      <Hero />
      <LearningPreview sectionRef={learningRef} />
      <Features />
      <SlangPreview />
      <ReviewSection />
      <CTASection />
      <Footer />
    </div>
  );
}