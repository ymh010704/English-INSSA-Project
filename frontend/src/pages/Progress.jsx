import { useState } from "react";
import { useNavigate } from "react-router-dom";

const G = {
  black: "#0a0a0a", white: "#ffffff",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981", blue: "#3b82f6", purple: "#8b5cf6",
};

// 티어 정의
const TIERS = [
  { name: "Newbie",       min: 0,    max: 200,  color: "#94a3b8", emoji: "🌱" },
  { name: "Beginner",     min: 200,  max: 500,  color: "#22c55e", emoji: "🌿" },
  { name: "Intermediate", min: 500,  max: 1000, color: "#3b82f6", emoji: "💧" },
  { name: "Advanced",     min: 1000, max: 2000, color: "#8b5cf6", emoji: "⚡" },
  { name: "Expert",       min: 2000, max: 4000, color: "#f59e0b", emoji: "🔥" },
  { name: "Native-Like",  min: 4000, max: 9999, color: "#ff4d00", emoji: "👑" },
];

const XP = 1240;
const STREAK = 14;

function getTier(xp) {
  return TIERS.findLast(t => xp >= t.min) || TIERS[0];
}

const WEEKLY = [
  { d: "월", count: 3 }, { d: "화", count: 5 }, { d: "수", count: 4 },
  { d: "목", count: 6 }, { d: "금", count: 2 }, { d: "토", count: 0 }, { d: "일", count: 0 },
];

const CATEGORIES = [
  { label: "SNS / 일상",   pct: 72, color: G.accent,  icon: "📱", count: 18 },
  { label: "감탄 / 리액션", pct: 55, color: G.blue,    icon: "😮", count: 11 },
  { label: "칭찬 / 긍정",  pct: 88, color: G.green,   icon: "🙌", count: 22 },
  { label: "완곡 / 거절",  pct: 34, color: G.purple,  icon: "🙅", count: 8  },
  { label: "Gen Z 유행어", pct: 61, color: "#f59e0b",  icon: "✨", count: 15 },
  { label: "연애 / SNS",   pct: 47, color: "#ec4899",  icon: "💕", count: 12 },
];

const BADGES = [
  { emoji: "🔥", name: "7일 연속",      desc: "7일 연속 학습",        done: true  },
  { emoji: "📚", name: "첫 10개",       desc: "표현 10개 학습",       done: true  },
  { emoji: "⚡", name: "스피드 러너",   desc: "하루 10개 학습",       done: true  },
  { emoji: "🌙", name: "야간 학습",     desc: "밤 11시 이후 학습",    done: true  },
  { emoji: "🏆", name: "퍼펙트 스코어", desc: "연습 100% 달성",       done: true  },
  { emoji: "👑", name: "30일 연속",     desc: "30일 연속 학습",       done: false },
  { emoji: "🎯", name: "올라운더",      desc: "모든 카테고리 50% 이상", done: false },
  { emoji: "💎", name: "100개 달성",    desc: "표현 100개 학습",      done: false },
  { emoji: "🤖", name: "AI 마스터",     desc: "AI 대화 50회",         done: false },
];

// 이번 달 캘린더 데이터 (3월 기준)
const CALENDAR = {
  year: 2026, month: 3,
  startDay: 0, // 일요일부터 시작, 3월 1일 = 일요일
  days: 31,
  studied: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,17,18,19,20,21,22,24,25,26,27,28],
  today: 5,
};

/* ── 섹션 카드 래퍼 ── */
function Section({ title, sub, children, style = {} }) {
  return (
    <div style={{ background: G.white, borderRadius: 24, padding: "28px 30px", border: "1px solid rgba(0,0,0,0.05)", ...style }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: G.black }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: G.gray, marginTop: 3 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

/* ── XP / 티어 ── */
function XpTier() {
  const tier = getTier(XP);
  const next = TIERS[TIERS.indexOf(tier) + 1];
  const pct = next ? ((XP - tier.min) / (next.min - tier.min)) * 100 : 100;

  return (
    <Section title="⚡ 경험치 & 티어" sub={`다음 티어까지 ${next ? next.min - XP : 0} XP`}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${tier.color}18`, border: `2px solid ${tier.color}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 28 }}>{tier.emoji}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: tier.color }}>{tier.name}</div>
              <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>현재 {XP.toLocaleString()} XP</div>
            </div>
            {next && <div style={{ fontSize: 12, color: G.gray }}>{next.name} {next.min.toLocaleString()} XP</div>}
          </div>
          <div style={{ height: 10, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc)`, borderRadius: 100, transition: "width 1s ease" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {TIERS.map((t, i) => (
          <div key={t.name} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 3, filter: XP < t.min ? "grayscale(1) opacity(0.3)" : "none" }}>{t.emoji}</div>
            <div style={{ fontSize: 9, color: XP >= t.min ? t.color : G.gray, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 스트릭 ── */
function StreakCard() {
  return (
    <div style={{ background: `linear-gradient(145deg, ${G.navy}, #1e3a5f)`, borderRadius: 24, padding: "28px 30px", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, background: "radial-gradient(circle, rgba(255,77,0,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "'Noto Sans KR', sans-serif" }}>🔥 연속 학습 스트릭</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 56, fontWeight: 900, color: G.white, lineHeight: 1 }}>{STREAK}</div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontFamily: "'Noto Sans KR', sans-serif" }}>일 연속 🔥</div>
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Noto Sans KR', sans-serif" }}>최장 기록 <span style={{ color: G.accent2, fontWeight: 700 }}>21일</span> · 오늘도 학습하면 <span style={{ color: G.green, fontWeight: 700 }}>15일</span></div>
    </div>
  );
}

/* ── 주간 차트 ── */
function WeeklyChart() {
  const max = Math.max(...WEEKLY.map(d => d.count), 1);
  return (
    <Section title="📈 주간 학습량" sub="이번 주 일별 학습한 표현 수">
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
        {WEEKLY.map((d, i) => {
          const isToday = i === 6;
          const h = d.count ? Math.max((d.count / max) * 90, 20) : 8;
          return (
            <div key={d.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: d.count > 0 ? G.black : "transparent" }}>{d.count}</div>
              <div style={{ width: "100%", height: h, borderRadius: 8, background: isToday ? G.accent : d.count > 0 ? "#fed7aa" : G.lightGray, transition: "height 0.4s ease", border: isToday ? `2px solid ${G.accent}` : "none" }} />
              <div style={{ fontSize: 11, color: isToday ? G.accent : G.gray, fontWeight: isToday ? 700 : 400 }}>{d.d}</div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── 카테고리 숙련도 ── */
function CategoryChart() {
  return (
    <Section title="📊 카테고리별 숙련도" sub="카테고리별 학습 완료 비율">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {CATEGORIES.map(c => (
          <div key={c.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: G.black }}>
                <span>{c.icon}</span>{c.label}
                <span style={{ fontSize: 11, color: G.gray }}>({c.count}개)</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.pct}%</span>
            </div>
            <div style={{ height: 8, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 100, transition: "width 1s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 월간 캘린더 ── */
function MonthlyCalendar() {
  const { year, month, startDay, days, studied, today } = CALENDAR;
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <Section title="📅 월간 학습 캘린더" sub={`${year}년 ${month}월 · ${studied.length}일 학습`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {dayLabels.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: G.gray, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const isStudied = studied.includes(d);
          const isToday = d === today;
          return (
            <div key={d} style={{
              aspectRatio: "1", borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: isToday ? 900 : isStudied ? 600 : 400,
              background: isToday ? G.accent : isStudied ? "rgba(255,77,0,0.12)" : G.lightGray,
              color: isToday ? G.white : isStudied ? G.accent : G.gray,
              border: isToday ? `2px solid ${G.accent}` : "none",
              transition: "all 0.2s",
            }}>
              {d}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 16, justifyContent: "center" }}>
        {[["학습 완료", G.accent, "rgba(255,77,0,0.12)"], ["오늘", G.white, G.accent], ["미학습", G.gray, G.lightGray]].map(([label, color, bg]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: bg }} />
            <span style={{ fontSize: 11, color: G.gray }}>{label}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 달성 뱃지 ── */
function BadgeGrid() {
  const done = BADGES.filter(b => b.done);
  const locked = BADGES.filter(b => !b.done);

  return (
    <Section title="🏆 달성 뱃지" sub={`${done.length} / ${BADGES.length}개 획득`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {done.map(b => (
          <div key={b.name} style={{ background: "rgba(255,77,0,0.06)", border: "1px solid rgba(255,77,0,0.15)", borderRadius: 16, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{b.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: G.black, marginBottom: 2 }}>{b.name}</div>
            <div style={{ fontSize: 10, color: G.gray, lineHeight: 1.4 }}>{b.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: G.gray, marginBottom: 10 }}>잠김 🔒</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {locked.map(b => (
          <div key={b.name} style={{ background: G.lightGray, border: "1px solid #e5e7eb", borderRadius: 16, padding: "16px 12px", textAlign: "center", opacity: 0.5 }}>
            <div style={{ fontSize: 28, marginBottom: 6, filter: "grayscale(1)" }}>{b.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: G.gray, marginBottom: 2 }}>{b.name}</div>
            <div style={{ fontSize: 10, color: G.gray, lineHeight: 1.4 }}>{b.desc}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 메인 ── */
export default function Progress() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: G.lightGray, fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* 헤더 */}
      <div style={{ background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: G.gray, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500 }}>
          ← 뒤로가기
        </button>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 15, fontWeight: 900, color: G.black }}>
          📊 <span style={{ color: G.accent }}>진도 관리</span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* 메인 그리드 */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* 상단 요약 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { icon: "📚", label: "총 학습 표현", value: "48개", color: G.accent },
            { icon: "✅", label: "완료한 카드", value: "36개", color: G.green },
            { icon: "🎯", label: "평균 정확도", value: "87%", color: G.blue },
            { icon: "⏱️", label: "총 학습 시간", value: "4.2h", color: G.purple },
          ].map(s => (
            <div key={s.label} style={{ background: G.white, borderRadius: 20, padding: "22px 24px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 24, fontWeight: 900, color: G.black, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: G.gray }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 스트릭 + XP */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
          <StreakCard />
          <XpTier />
        </div>

        {/* 주간 차트 + 카테고리 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <WeeklyChart />
          <CategoryChart />
        </div>

        {/* 캘린더 + 뱃지 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <MonthlyCalendar />
          <BadgeGrid />
        </div>
      </div>
    </div>
  );
}