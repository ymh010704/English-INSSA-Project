import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const G = {
  black: "#0a0a0a", white: "#ffffff", cream: "#f5f2eb",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5",
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
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── NAV ── */
function Nav({ scrolled }) {
  const navigate = useNavigate();
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: scrolled ? "14px 60px" : "20px 60px",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      transition: "padding 0.3s",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div onClick={() => navigate("/")} style={{
        fontSize: 20, fontWeight: 900, cursor: "pointer",
        fontFamily: "'Unbounded', sans-serif", letterSpacing: -0.5,
        color: G.black,
      }}>
        영어<span style={{ color: G.accent }}>인싸</span>되기
      </div>
      <ul style={{ display: "flex", gap: 36, listStyle: "none", margin: 0, padding: 0 }}>
        {["학습 방법", "기능", "후기", "가격"].map(l => (
          <li key={l}>
            <a href="#" style={{ fontSize: 14, fontWeight: 500, color: "#444", textDecoration: "none" }}>{l}</a>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => navigate("/login")} style={{
          padding: "10px 22px", borderRadius: 100, border: "1.5px solid #ddd",
          background: "transparent", fontSize: 13, fontWeight: 600, cursor: "pointer",
          fontFamily: "'Noto Sans KR', sans-serif", color: G.black,
        }}>로그인</button>
        <button onClick={() => navigate("/login")} style={{
          padding: "10px 24px", borderRadius: 100, border: "none",
          background: G.black, color: G.white, fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
        }}>무료로 시작하기</button>
      </div>
    </nav>
  );
}

/* ── PHONE MOCKUP ── */
function PhoneMockup() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", padding: "40px 10px" }}>
      {/* Float Left */}
      <div style={{
        position: "absolute", left: 10, top: "28%",
        background: G.white, borderRadius: 16, padding: "10px 16px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
        animation: "floatBadge 3s ease-in-out infinite",
        fontFamily: "'Noto Sans KR', sans-serif",
        zIndex: 10,
      }}>
        <span style={{ fontSize: 18 }}>🔥</span> 14일 연속 학습 중!
      </div>

      <div style={{
        width: 280, background: G.navy, borderRadius: 38,
        padding: 14, boxShadow: "0 40px 80px rgba(0,0,0,0.2)",
        position: "relative", zIndex: 5,
      }}>
        <div style={{
          background: "#111827", borderRadius: 26,
          padding: "24px 20px", minHeight: 460,
          display: "flex", flexDirection: "column", gap: 18,
          fontFamily: "'Noto Sans KR', sans-serif",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 13, fontWeight: 900, color: G.white }}>
              영어<span style={{ color: G.accent }}>인싸</span>
            </div>
            <div style={{ background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.3)", color: G.accent, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>🔥 Day 14</div>
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>오늘의 학습</div>
          <div onClick={() => setFlipped(f => !f)} style={{
            background: "linear-gradient(145deg,#1a2744,#0d1b2a)",
            borderRadius: 18, padding: "28px 18px", textAlign: "center",
            border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer",
            minHeight: 130, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {!flipped ? (
              <>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 32, fontWeight: 900, color: G.white, letterSpacing: -1, lineHeight: 1 }}>No cap</div>
                <div style={{ fontSize: 10, color: "rgba(255,204,0,0.8)", letterSpacing: 1, textTransform: "uppercase" }}>SNS / 일상 표현</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>탭해서 뒤집기 👆</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: G.white }}>진심으로, 거짓말 아님</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>🇰🇷 한국어로: ㄹㅇ</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>"That's fire, <span style={{ color: G.accent }}>no cap</span>."</div>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: 10, borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>🔁 다시볼게요</button>
            <button style={{ flex: 1.6, padding: 10, borderRadius: 12, border: "none", background: G.accent, color: G.white, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>알겠어요 ✅</button>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {[true, true, false, false, false].map((done, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i === 2 ? G.accent : done ? "rgba(255,77,0,0.4)" : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Float Right */}
      <div style={{
        position: "absolute", right: 10, bottom: "28%",
        background: G.white, borderRadius: 16, padding: "10px 16px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
        animation: "floatBadge 3s 1.5s ease-in-out infinite",
        fontFamily: "'Noto Sans KR', sans-serif",
        zIndex: 10,
      }}>
        <span style={{ fontSize: 18 }}>💬</span> AI 피드백 받는 중
      </div>
    </div>
  );
}

/* ── HERO ── */
function Hero() {
  const navigate = useNavigate();
  return (
    <section style={{
      minHeight: "100vh", padding: "140px 60px 80px",
      display: "flex", alignItems: "center",
      background: G.light, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -100, right: -200, width: 700, height: 700, background: "radial-gradient(circle,rgba(255,77,0,0.08) 0%,transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: "20%", width: 500, height: 500, background: "radial-gradient(circle,rgba(255,204,0,0.1) 0%,transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
        <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff3ee", border: "1px solid rgba(255,77,0,0.2)", color: G.accent, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 16px", borderRadius: 100, marginBottom: 24 }}>
            🔥 AI 기반 슬랭 학습
          </div>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 48, fontWeight: 900, lineHeight: 1.15, letterSpacing: -1.5, marginBottom: 24, color: G.black }}>
            교과서 말고,<br />
            <span style={{ color: G.accent }}>진짜 원어민</span><br />
            <span style={{ fontSize: 38 }}>영어를 배워요</span>
          </h1>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 36, maxWidth: 420, fontWeight: 300 }}>
            한국에서 "ㄹㅇ", "갑분싸"처럼 쓰는 캐주얼 표현—<br />
            원어민들도 똑같이 있어요. AI와 함께 자연스럽게 익혀보세요.
          </p>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 44 }}>
            <button onClick={() => navigate("/login")} style={{
              padding: "16px 32px", borderRadius: 100, fontSize: 15, fontWeight: 700,
              border: "none", cursor: "pointer", background: G.accent, color: G.white,
              boxShadow: "0 8px 30px rgba(255,77,0,0.3)", fontFamily: "'Noto Sans KR', sans-serif",
            }}>지금 무료로 시작하기 →</button>
            <button style={{
              padding: "16px 32px", borderRadius: 100, fontSize: 15, fontWeight: 600,
              border: `2px solid ${G.black}`, cursor: "pointer", background: "transparent",
              fontFamily: "'Noto Sans KR', sans-serif", color: G.black,
            }}>▶ 미리보기</button>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {[["4.8", "앱 평점"], ["12만+", "누적 학습자"], ["3,000+", "검수된 표현"]].map(([num, label], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {i > 0 && <div style={{ width: 1, height: 36, background: "#ddd" }} />}
                <div>
                  <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 24, fontWeight: 900, color: G.black }}>{num}</div>
                  <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <PhoneMockup />
      </div>
    </section>
  );
}

/* ── TRUST BAR ── */
function TrustBar() {
  const items = ["욕설·혐오 표현 100% 필터링", "원어민 감수 완료", "AI 실시간 피드백", "매일 새 표현 업데이트", "한국인 특화 설명"];
  return (
    <div style={{ background: G.black, padding: "22px 60px", display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap", fontFamily: "'Noto Sans KR', sans-serif" }}>
      {items.map(t => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: G.accent, display: "inline-block", flexShrink: 0 }} />
          {t}
        </div>
      ))}
    </div>
  );
}

/* ── HOW IT WORKS ── */
function HowItWorks() {
  const steps = [
    { num: "01", icon: "🃏", title: "Learn", desc: "오늘의 슬랭 카드 1장. 뜻, 예문, 한국어 유사 표현까지 한 번에. 하루 5분이면 충분해요." },
    { num: "02", icon: "✍️", title: "Practice", desc: "배운 표현으로 빈칸 채우기, 쉐도잉, 발음 연습. 입과 손이 기억하게 만들어요." },
    { num: "03", icon: "🤖", title: "Apply", desc: "AI 친구와 실제 대화 연습. 어색하게 쓰면 바로 피드백. 원어민처럼 자연스러워질 때까지." },
  ];
  return (
    <div style={{ background: G.white, padding: "100px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "'Noto Sans KR', sans-serif" }}>
        <Reveal>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: G.accent, marginBottom: 14 }}>학습 방법</div>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 36, fontWeight: 900, lineHeight: 1.2, letterSpacing: -1, marginBottom: 16, maxWidth: 520, color: G.black }}>3단계로 완성하는<br />자연스러운 영어</h2>
          <p style={{ fontSize: 16, color: G.gray, lineHeight: 1.7, maxWidth: 480, fontWeight: 300 }}>배우고, 연습하고, 실전 적용까지.</p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, marginTop: 56 }}>
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.1}>
              <div style={{ background: G.light, borderRadius: 24, padding: "32px 28px", position: "relative", overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 56, fontWeight: 900, color: "rgba(0,0,0,0.04)", position: "absolute", top: 14, right: 18, lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 34, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 10, color: G.black }}>{s.title}</div>
                <div style={{ fontSize: 14, color: G.gray, lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── FEATURES ── */
function Features() {
  const feats = [
    { tag: "Daily", icon: "🃏", title: "오늘의 학습 카드", desc: "매일 선별된 캐주얼 표현 1개. 앞면엔 영어, 뒷면엔 뜻·예문·뉘앙스. 망각곡선 기반 자동 복습.", delay: 0 },
    { tag: "AI", icon: "💬", title: "AI 캐주얼 회화 연습", desc: "GPT 기반 원어민 친구 페르소나. 카페, 파티, SNS DM 등 상황별 대화. 어색한 표현은 즉시 교정.", delay: 0.1 },
    { tag: "Listening", icon: "🎧", title: "발음 & 쉐도잉", desc: "원어민 발음 듣기 + 내 발음 녹음 분석. 귀와 입으로 동시에 익히는 쉐도잉 모드.", delay: 0.2 },
    { tag: "Progress", icon: "📊", title: "레벨 & 진도 관리", desc: "학습 스트릭, 카테고리별 숙련도, 경험치 시스템. 내 성장을 한눈에 확인.", delay: 0.25 },
  ];
  return (
    <div style={{ background: G.black, padding: "100px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "'Noto Sans KR', sans-serif" }}>
        <Reveal>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: G.accent2, marginBottom: 14 }}>핵심 기능</div>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 36, fontWeight: 900, lineHeight: 1.2, letterSpacing: -1, marginBottom: 16, color: G.white }}>원어민처럼 말하는 데<br />필요한 모든 것</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 480, fontWeight: 300 }}>단순 암기가 아닌, 실제로 쓸 수 있는 영어를 위한 기능들이에요.</p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18, marginTop: 56 }}>
          {feats.map(f => (
            <Reveal key={f.title} delay={f.delay}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, padding: 32 }}>
                <div style={{ display: "inline-block", background: "rgba(255,204,0,0.12)", border: "1px solid rgba(255,204,0,0.25)", color: G.accent2, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 10px", borderRadius: 100, marginBottom: 14 }}>{f.tag}</div>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,77,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 700, color: G.white, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.15} style={{ gridColumn: "1 / -1" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, padding: 32, display: "flex", gap: 28, alignItems: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(255,77,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🛡️</div>
              <div>
                <div style={{ display: "inline-block", background: "rgba(255,204,0,0.12)", border: "1px solid rgba(255,204,0,0.25)", color: G.accent2, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 10px", borderRadius: 100, marginBottom: 12 }}>Safety</div>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 700, color: G.white, marginBottom: 8 }}>건전한 표현만 엄선</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 300 }}>욕설·혐오 표현은 필터링으로 완전 제외. OpenAI Moderation API + 원어민 감수 이중 검증.</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ── REVIEWS ── */
function Reviews() {
  const reviews = [
    { text: "교환학생 갔을 때 친구들이 왜 그렇게 영어가 자연스럽냐고 물어봤어요. 슬랭업 덕분이었죠.", name: "김민지", role: "대학교 3학년 · 교환학생 준비 중", bg: G.accent, ch: "김" },
    { text: "해외 컨퍼런스에서 외국 동료들이랑 농담도 주고받게 됐어요. 딱딱한 비즈니스 영어만 알던 제가!", name: "이준혁", role: "IT 스타트업 개발자 · 5개월 사용", bg: G.navy, ch: "이" },
    { text: "욕설 없이 트렌디한 표현들만 모아둔 곳이 없었는데, 진짜 필요했던 서비스예요.", name: "박소연", role: "대학원생 · 미국 유학 준비", bg: "#059669", ch: "박" },
  ];
  return (
    <div style={{ background: G.cream, padding: "100px 60px", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: G.accent, marginBottom: 14 }}>실제 후기</div>
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 36, fontWeight: 900, lineHeight: 1.2, letterSpacing: -1, color: G.black }}>벌써 원어민 친구한테<br />칭찬받았어요</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginTop: 56 }}>
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.1}>
              <div style={{ background: G.white, borderRadius: 20, padding: 26, border: "1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ color: "#f59e0b", fontSize: 14, marginBottom: 14 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, marginBottom: 20 }}>"{r.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: G.white }}>{r.ch}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: G.black }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: G.gray, marginTop: 2 }}>{r.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── FINAL CTA ── */
function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section style={{ padding: "120px 60px", textAlign: "center", background: G.white, fontFamily: "'Noto Sans KR', sans-serif" }}>
      <Reveal>
        <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 44, fontWeight: 900, lineHeight: 1.15, letterSpacing: -1.5, marginBottom: 20, color: G.black }}>
          지금 바로 시작하면<br /><span style={{ color: G.accent }}>오늘부터 원어민처럼</span>
        </h2>
        <p style={{ fontSize: 17, color: G.gray, marginBottom: 44, fontWeight: 300 }}>신용카드 필요 없어요. 무료로 시작하고, 마음에 들면 계속하세요.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/login")} style={{ padding: "16px 36px", borderRadius: 100, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", background: G.accent, color: G.white, boxShadow: "0 8px 30px rgba(255,77,0,0.3)", fontFamily: "'Noto Sans KR', sans-serif" }}>무료로 시작하기 →</button>
          <button style={{ padding: "16px 36px", borderRadius: 100, fontSize: 15, fontWeight: 600, border: `2px solid ${G.black}`, cursor: "pointer", background: "transparent", fontFamily: "'Noto Sans KR', sans-serif", color: G.black }}>앱 다운로드</button>
        </div>
      </Reveal>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer style={{ background: G.black, padding: "60px 60px 40px", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
        <div>
          <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: G.white, marginBottom: 10 }}>
            영어<span style={{ color: G.accent }}>인싸</span>되기
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 220, lineHeight: 1.6 }}>교과서 말고, 진짜 원어민 영어.</p>
        </div>
        {[
          { title: "서비스", links: ["오늘의 학습", "AI 회화 연습", "발음 연습", "진도 관리"] },
          { title: "회사", links: ["소개", "블로그", "채용", "문의"] },
          { title: "법적 고지", links: ["이용약관", "개인정보처리방침"] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ color: G.white, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>{col.title}</div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(l => <li key={l}><a href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1200, margin: "48px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.3)", flexWrap: "wrap", gap: 10 }}>
        <span>© 2025 영어인싸되기 (Engssa). All rights reserved.</span>
        <span>Made with ❤️ for Korean learners</span>
      </div>
    </footer>
  );
}

/* ── HOME ── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; background: #f9f8f5; width: 100%; }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <Nav scrolled={scrolled} />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Features />
      <Reviews />
      <FinalCTA />
      <Footer />
    </>
  );
}