import { useState } from "react";
import { useNavigate } from "react-router-dom";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";

/* ── 데이터 ── */

const SITUATION_PATTERNS = [
  {
    id: "order", emoji: "☕", title: "카페에서 주문하기", level: "기초",
    color: "#92400e", bg: "#fef3c7",
    patterns: [
      { en: "Can I get a latte, please?", kr: "라떼 한 잔 주세요.", point: "Can I get ~은 주문할 때 가장 자연스러운 표현" },
      { en: "For here or to go?", kr: "여기서 드실 건가요, 가져가실 건가요?", point: "카페에서 직원이 꼭 묻는 표현" },
      { en: "Can I have that iced?", kr: "아이스로 해주실 수 있나요?", point: "Can I have ~ 로 옵션 변경 요청" },
      { en: "What's your most popular drink?", kr: "제일 인기 있는 음료가 뭐예요?", point: "추천 요청할 때 자주 사용" },
    ]
  },
  {
    id: "direction", emoji: "🗺️", title: "길 묻기", level: "기초",
    color: "#065f46", bg: "#d1fae5",
    patterns: [
      { en: "Excuse me, how do I get to the subway?", kr: "실례합니다, 지하철역에 어떻게 가나요?", point: "Excuse me로 시작하면 훨씬 자연스러워요" },
      { en: "Is it within walking distance?", kr: "걸어갈 수 있는 거리인가요?", point: "거리 확인할 때 유용한 표현" },
      { en: "Take the second left.", kr: "두 번째 왼쪽으로 꺾으세요.", point: "방향 알려줄 때 Take the + 방향 구조" },
      { en: "You can't miss it.", kr: "쉽게 찾을 수 있을 거예요.", point: "원어민이 길 알려줄 때 마무리로 자주 씀" },
    ]
  },
  {
    id: "shopping", emoji: "🛍️", title: "쇼핑하기", level: "초급",
    color: "#9f1239", bg: "#ffe4e6",
    patterns: [
      { en: "Do you have this in a different size?", kr: "이거 다른 사이즈 있나요?", point: "in a different size/color 패턴 활용" },
      { en: "I'm just browsing, thanks.", kr: "그냥 구경하는 중이에요, 감사해요.", point: "직원 도움 정중히 거절할 때" },
      { en: "Can I try this on?", kr: "이거 입어봐도 될까요?", point: "try on = 옷/신발 입어보다" },
      { en: "Do you have a return policy?", kr: "환불 정책이 어떻게 되나요?", point: "구매 전 환불 확인할 때 필수 표현" },
    ]
  },
  {
    id: "smalltalk", emoji: "💬", title: "스몰톡", level: "초급",
    color: "#0369a1", bg: "#e0f2fe",
    patterns: [
      { en: "How's it going?", kr: "어떻게 지내요?", point: "How are you보다 훨씬 자연스러운 인사" },
      { en: "Not bad, can't complain.", kr: "나쁘지 않아요, 뭐.", point: "무난하게 답할 때 원어민이 즐겨 쓰는 표현" },
      { en: "What have you been up to?", kr: "요즘 어떻게 지냈어요?", point: "오랜만에 만났을 때 근황 묻기" },
      { en: "Same old, same old.", kr: "별거 없어요, 그냥 그렇죠.", point: "특별한 일 없을 때 자연스러운 대답" },
    ]
  },
  {
    id: "restaurant", emoji: "🍽️", title: "식당에서", level: "초급",
    color: "#6d28d9", bg: "#ede9fe",
    patterns: [
      { en: "Table for two, please.", kr: "두 명 자리 주세요.", point: "식당 입구에서 첫 마디" },
      { en: "What do you recommend?", kr: "뭘 추천해주실래요?", point: "메뉴 고를 때 가장 유용한 한 마디" },
      { en: "Could we get the check, please?", kr: "계산서 주실 수 있나요?", point: "계산할 때. bill 대신 check가 미국식" },
      { en: "Is service included?", kr: "서비스 요금이 포함돼 있나요?", point: "팁 문화 나라에서 꼭 알아야 할 표현" },
    ]
  },
  {
    id: "work", emoji: "💼", title: "직장/학교에서", level: "중급",
    color: "#374151", bg: "#f3f4f6",
    patterns: [
      { en: "Could you clarify what you mean?", kr: "무슨 말씀인지 좀 더 설명해 주실 수 있나요?", point: "이해 못했을 때 정중하게 묻는 표현" },
      { en: "I'll get back to you on that.", kr: "그 부분은 확인해서 다시 알려드릴게요.", point: "즉시 답하기 어려울 때 시간 버는 표현" },
      { en: "Let's touch base later.", kr: "나중에 다시 얘기해요.", point: "touch base = 간단히 연락하다/확인하다" },
      { en: "I see where you're coming from.", kr: "무슨 말씀인지 이해해요.", point: "상대방 의견에 공감 표현할 때" },
    ]
  },
];

const EXPRESSION_CARDS = [
  { en: "I'm down for that.", kr: "나 그거 하고 싶어 / 좋아.", note: "down for = ~할 마음이 있다", emoji: "👍", tag: "동의" },
  { en: "That's on me.", kr: "내 실수야 / 내가 살게.", note: "상황에 따라 뜻이 달라지는 표현", emoji: "🙋", tag: "책임" },
  { en: "I can't wrap my head around it.", kr: "이해가 안 돼.", note: "wrap one's head around = 이해하다", emoji: "🤯", tag: "이해" },
  { en: "You're telling me!", kr: "그러게 말이야! / 내 말이!",  note: "강한 공감을 표현할 때", emoji: "💯", tag: "공감" },
  { en: "We're on the same page.", kr: "우리 생각이 같네.", note: "의견 일치할 때 자주 쓰는 표현", emoji: "📖", tag: "공감" },
  { en: "Cut me some slack.", kr: "좀 봐줘 / 너무 몰아붙이지 마.", note: "여유를 달라고 할 때", emoji: "😅", tag: "부탁" },
  { en: "Spill the tea!", kr: "얘기해봐! 뭔 일이야?", note: "gossip/뒷얘기 들려달라고 할 때", emoji: "☕", tag: "SNS" },
  { en: "It's not rocket science.", kr: "그게 뭐 그리 어렵다고.", note: "별거 아님을 강조할 때", emoji: "🚀", tag: "표현" },
];

const DIALOGUES = [
  {
    id: 1, title: "파티에서 새 친구 만나기", emoji: "🎉", level: "초급",
    lines: [
      { speaker: "A", en: "Hey, I don't think we've met. I'm Jake!", kr: "안녕, 우리 처음이죠? 저 Jake예요!", slang: null },
      { speaker: "B", en: "Oh hey! I'm Mia. This party is giving major vibes.", kr: "오 안녕! 나 Mia야. 이 파티 완전 분위기 좋다.", slang: "giving major vibes" },
      { speaker: "A", en: "No cap, it's literally the best party I've been to all year.", kr: "ㄹㅇ, 올해 온 파티 중에 최고야.", slang: "No cap" },
      { speaker: "B", en: "Lowkey same. How do you know the host?", kr: "은근 나도 그래. 호스트 어떻게 알아?", slang: "Lowkey" },
      { speaker: "A", en: "We go way back. We've been friends since high school.", kr: "오래됐어. 고등학교 때부터 친구야.", slang: null },
    ]
  },
  {
    id: 2, title: "카페에서 친구랑 수다", emoji: "☕", level: "초급",
    lines: [
      { speaker: "A", en: "Okay, spill the tea. What happened with you and Tom?", kr: "야, 얘기해봐. 너랑 Tom이랑 무슨 일이야?", slang: "spill the tea" },
      { speaker: "B", en: "Ugh, he literally ghosted me after our third date.", kr: "아, 세 번째 데이트 후에 잠수탔어.", slang: "ghosted" },
      { speaker: "A", en: "No way! That's so extra of him.", kr: "말도 안돼! 진짜 오버스럽다.", slang: "extra" },
      { speaker: "B", en: "Honestly, I'm lowkey over it now.", kr: "솔직히 이제 은근 괜찮아졌어.", slang: "lowkey" },
      { speaker: "A", en: "Slay, girl! You deserve better anyway.", kr: "잘했어! 넌 더 좋은 사람 만날 자격 있어.", slang: "Slay" },
    ]
  },
  {
    id: 3, title: "직장 동료와 점심", emoji: "🍱", level: "중급",
    lines: [
      { speaker: "A", en: "Dude, the new project is no joke. I'm lowkey stressed.", kr: "야, 새 프로젝트 장난 아니야. 은근 스트레스받아.", slang: "lowkey" },
      { speaker: "B", en: "I feel you. The deadline is way too tight.", kr: "공감해. 마감이 너무 빡빡해.", slang: null },
      { speaker: "A", en: "The manager keeps adding stuff. It's giving too much.", kr: "매니저가 계속 일을 추가하는데. 너무 많아.", slang: "It's giving" },
      { speaker: "B", en: "I'll get back to you on this, but maybe we can split the tasks?", kr: "나중에 다시 얘기해보자. 일을 나눠볼 수 있을 것 같은데?", slang: null },
      { speaker: "A", en: "Bet. Let's touch base after lunch.", kr: "좋아. 점심 후에 다시 얘기하자.", slang: "Bet" },
    ]
  },
];

const GRAMMAR_POINTS = [
  {
    title: "gonna / wanna / gotta",
    tag: "축약 표현", emoji: "🗣️", color: G.accent,
    formal: ["going to", "want to", "got to (have to)"],
    casual: ["gonna", "wanna", "gotta"],
    examples: [
      { en: "I'm gonna grab some food.", kr: "나 음식 좀 사러 갈 거야." },
      { en: "You wanna hang out later?", kr: "나중에 놀래?" },
      { en: "I gotta go, talk later!", kr: "나 가야 해, 나중에 얘기해!" },
    ],
    note: "교과서에선 가르쳐주지 않지만, 원어민은 대화에서 항상 이렇게 말해요."
  },
  {
    title: "Like & So 사용법",
    tag: "필러 표현", emoji: "💭", color: G.blue,
    formal: ["approximately", "therefore / very"],
    casual: ["like (필러)", "so (강조)"],
    examples: [
      { en: "She was like, totally shocked.", kr: "걔가 완전히 충격받은 것 같았어." },
      { en: "It was so good, I can't even.", kr: "진짜 너무 좋아서 말을 못하겠어." },
      { en: "I was like, wait, what?", kr: "나 완전히, 잠깐, 뭐라고? 했어." },
    ],
    note: "'like'는 원어민 대화에서 문장 사이 필러로 엄청 자주 써요. 어색하지 않아요."
  },
  {
    title: "현재진행형으로 미래 표현",
    tag: "시제 활용", emoji: "⏰", color: G.green,
    formal: ["will + 동사원형"],
    casual: ["be + ~ing (확정된 미래)"],
    examples: [
      { en: "We're meeting at 7.", kr: "우리 7시에 만나기로 했어." },
      { en: "I'm heading out now.", kr: "나 지금 나가는 중이야." },
      { en: "They're coming over tonight.", kr: "걔네 오늘 밤 올 거야." },
    ],
    note: "이미 약속/계획된 일은 will보다 현재진행형이 더 자연스러워요."
  },
  {
    title: "Do you mind ~? 정중한 부탁",
    tag: "공손한 표현", emoji: "🙏", color: G.purple,
    formal: ["Please + 동사", "Could you ~?"],
    casual: ["Do you mind ~ing?", "Would you mind ~?"],
    examples: [
      { en: "Do you mind turning that down?", kr: "소리 좀 줄여줄 수 있어?" },
      { en: "Would you mind waiting a sec?", kr: "잠깐 기다려줄 수 있어?" },
      { en: "Do you mind if I sit here?", kr: "여기 앉아도 될까요?" },
    ],
    note: "대답할 때 'Not at all!' 또는 'Go ahead!'는 OK라는 뜻이에요."
  },
];

/* ── 서브 컴포넌트들 ── */

function SituationTab() {
  const [selected, setSelected] = useState(null);
  const [flipped, setFlipped] = useState(null);

  if (selected) {
    const s = SITUATION_PATTERNS.find(p => p.id === selected);
    return (
      <div>
        <button onClick={() => { setSelected(null); setFlipped(null); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, marginBottom: 24 }}>← 목록으로</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 36 }}>{s.emoji}</div>
          <div>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.black }}>{s.title}</div>
            <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>패턴 {s.patterns.length}개</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {s.patterns.map((p, i) => (
            <div key={i} onClick={() => setFlipped(flipped === i ? null : i)} style={{
              background: flipped === i ? G.navy : G.white,
              borderRadius: 20, padding: "22px 24px", cursor: "pointer",
              border: `1.5px solid ${flipped === i ? "transparent" : G.lightGray}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: flipped === i ? G.white : G.black, marginBottom: 6 }}>{p.en}</div>
              {flipped === i && (
                <>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>{p.kr}</div>
                  <div style={{ background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.25)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8 }}>
                    <span>💡</span>
                    <span style={{ fontSize: 13, color: G.accent2, lineHeight: 1.6 }}>{p.point}</span>
                  </div>
                </>
              )}
              {flipped !== i && <div style={{ fontSize: 13, color: G.gray }}>탭해서 해석 & 포인트 보기</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
      {SITUATION_PATTERNS.map(s => (
        <div key={s.id} onClick={() => setSelected(s.id)} style={{
          background: G.white, borderRadius: 20, padding: "24px 22px", cursor: "pointer",
          border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>{s.emoji}</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: G.black, marginBottom: 4 }}>{s.title}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 100, fontWeight: 700 }}>{s.level}</span>
            <span style={{ fontSize: 12, color: G.gray }}>패턴 {s.patterns.length}개 →</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpressionTab() {
  const [flipped, setFlipped] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
      {EXPRESSION_CARDS.map((c, i) => (
        <div key={i} onClick={() => setFlipped(flipped === i ? null : i)} style={{
          borderRadius: 20, cursor: "pointer", overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)", transition: "transform 0.2s",
          minHeight: 160,
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        >
          {flipped !== i ? (
            <div style={{ background: `linear-gradient(145deg, ${G.navy}, #1e3a5f)`, padding: "28px 24px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: "radial-gradient(circle, rgba(255,77,0,0.2) 0%, transparent 70%)" }} />
              <div style={{ fontSize: 28 }}>{c.emoji}</div>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 16, fontWeight: 900, color: G.white, lineHeight: 1.3 }}>{c.en}</div>
              <div style={{ display: "inline-flex", width: "fit-content", background: "rgba(255,77,0,0.2)", color: G.accent, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, letterSpacing: 1 }}>{c.tag}</div>
            </div>
          ) : (
            <div style={{ background: G.white, padding: "24px", height: "100%", display: "flex", flexDirection: "column", gap: 10, border: "2px solid rgba(255,77,0,0.15)" }}>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 14, fontWeight: 900, color: G.black }}>{c.en}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: G.black }}>{c.kr}</div>
              <div style={{ background: "#fffbf0", border: "1px solid rgba(255,204,0,0.3)", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 6 }}>
                <span>💡</span>
                <span style={{ fontSize: 12, color: "#5a5750", lineHeight: 1.6 }}>{c.note}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DialogueTab() {
  const [selected, setSelected] = useState(null);

  if (selected !== null) {
    const d = DIALOGUES[selected];
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, marginBottom: 24 }}>← 목록으로</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 32 }}>{d.emoji}</span>
          <div>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: G.black }}>{d.title}</div>
            <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>{d.level} · 슬랭 포함 실전 대화</div>
          </div>
        </div>
        <div style={{ background: G.white, borderRadius: 24, padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 16 }}>
          {d.lines.map((line, i) => {
            const isA = line.speaker === "A";
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isA ? "flex-start" : "flex-end", gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.gray, marginLeft: isA ? 4 : 0, marginRight: isA ? 0 : 4 }}>{line.speaker}</div>
                <div style={{ maxWidth: "78%", background: isA ? G.lightGray : G.navy, borderRadius: isA ? "4px 18px 18px 18px" : "18px 18px 4px 18px", padding: "12px 16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isA ? G.black : G.white, lineHeight: 1.6, marginBottom: 4 }}>
                    {line.slang ? (
                      line.en.split(line.slang).map((part, j, arr) => (
                        <span key={j}>{part}{j < arr.length - 1 && <span style={{ background: isA ? "rgba(255,77,0,0.12)" : "rgba(255,77,0,0.3)", color: G.accent, fontWeight: 800, padding: "1px 5px", borderRadius: 4 }}>{line.slang}</span>}</span>
                      ))
                    ) : line.en}
                  </div>
                  <div style={{ fontSize: 12, color: isA ? G.gray : "rgba(255,255,255,0.5)" }}>{line.kr}</div>
                </div>
                {line.slang && (
                  <div style={{ maxWidth: "78%", display: "flex", gap: 6, background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.25)", borderRadius: 10, padding: "7px 12px", fontSize: 11, color: "#92400e", alignItems: "center" }}>
                    <span>✨</span> <strong>{line.slang}</strong> = 슬랭 포인트!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {DIALOGUES.map((d, i) => (
        <div key={i} onClick={() => setSelected(i)} style={{
          background: G.white, borderRadius: 20, padding: "20px 24px", cursor: "pointer",
          border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          display: "flex", alignItems: "center", gap: 16, transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
        >
          <span style={{ fontSize: 32, flexShrink: 0 }}>{d.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: G.black, marginBottom: 4 }}>{d.title}</div>
            <div style={{ fontSize: 12, color: G.gray }}>{d.level} · 대화 {d.lines.length}줄 · 슬랭 {d.lines.filter(l => l.slang).length}개</div>
          </div>
          <span style={{ fontSize: 20, color: G.gray }}>›</span>
        </div>
      ))}
    </div>
  );
}

function GrammarTab() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {GRAMMAR_POINTS.map((g, i) => (
        <div key={i} style={{ background: G.white, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div onClick={() => setOpen(open === i ? null : i)} style={{
            padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = G.lightGray}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `${g.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{g.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: G.black }}>{g.title}</div>
              <div style={{ fontSize: 11, color: g.color, fontWeight: 700, marginTop: 2, background: `${g.color}12`, display: "inline-block", padding: "2px 10px", borderRadius: 100 }}>{g.tag}</div>
            </div>
            <span style={{ fontSize: 18, color: G.gray, transform: open === i ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
          </div>
          {open === i && (
            <div style={{ padding: "0 24px 24px", borderTop: "1px solid #f0ece5" }}>
              {/* 교과서 vs 실제 */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16, marginTop: 16 }}>
                <div style={{ flex: 1, background: "#fef2f2", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: G.gray, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>📚 교과서</div>
                  {g.formal.map((f, j) => <div key={j} style={{ fontSize: 13, fontWeight: 600, color: "#7f1d1d", marginBottom: 3 }}>{f}</div>)}
                </div>
                <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: G.gray, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>🗣️ 원어민</div>
                  {g.casual.map((c, j) => <div key={j} style={{ fontSize: 13, fontWeight: 700, color: G.green, marginBottom: 3 }}>{c}</div>)}
                </div>
              </div>
              {/* 예문 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {g.examples.map((ex, j) => (
                  <div key={j} style={{ background: G.lightGray, borderRadius: 12, padding: "12px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: G.black, marginBottom: 3 }}>{ex.en}</div>
                    <div style={{ fontSize: 12, color: G.gray }}>{ex.kr}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fffbf0", border: "1px solid rgba(255,204,0,0.3)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 8 }}>
                <span>💡</span>
                <span style={{ fontSize: 13, color: "#5a5750", lineHeight: 1.6 }}>{g.note}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── 메인 ── */
const TABS = [
  { id: "situation", label: "상황별 패턴", emoji: "🗺️" },
  { id: "expression", label: "핵심 표현", emoji: "💬" },
  { id: "dialogue", label: "실전 대화문", emoji: "🎭" },
  { id: "grammar", label: "문법 포인트", emoji: "📖" },
];

export default function ConversationLearn() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("situation");

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif" }}>

      <PageHeader title="회화 학습" emoji="💬" />

      {/* 탭 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "0 40px", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? G.accent : G.gray,
            borderBottom: `2.5px solid ${tab === t.id ? G.accent : "transparent"}`,
            fontFamily: "'Noto Sans KR', sans-serif", whiteSpace: "nowrap", transition: "all 0.15s",
          }}>{t.emoji} {t.label}</button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "situation" && <SituationTab />}
        {tab === "expression" && <ExpressionTab />}
        {tab === "dialogue" && <DialogueTab />}
        {tab === "grammar" && <GrammarTab />}
      </div>
    </div>
  );
}