import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useBreakpoint from "../hooks/useBreakpoint";
import { Flame, BookOpen, Zap, Moon, Trophy, Crown, Star, Gem, Bot, Sprout, TrendingUp, Award, Smartphone, MessageSquare, ThumbsUp, MinusCircle, Sparkles, Heart, CheckCircle, Timer, BarChart2, Calendar, Lock } from "lucide-react";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";

// 티어 정의
const TIERS = [
  { name: "입문",     min: 0,    max: 200,  color: "#94a3b8", icon: Sprout     },
  { name: "초보",     min: 200,  max: 500,  color: "#22c55e", icon: BookOpen   },
  { name: "중급",     min: 500,  max: 1000, color: "#3b82f6", icon: TrendingUp },
  { name: "고급",     min: 1000, max: 2000, color: "#8b5cf6", icon: Zap        },
  { name: "전문가",   min: 2000, max: 4000, color: "#f59e0b", icon: Award      },
  { name: "원어민급", min: 4000, max: 9999, color: "#ff4d00", icon: Crown      },
];

function getTier(xp) {
  return TIERS.findLast(t => xp >= t.min) || TIERS[0];
}

const BADGES = [
  { icon: Flame,    color: "#f97316", bg: "#fff7ed", name: "7일 연속",      desc: "7일 연속 학습",          done: true  },
  { icon: BookOpen, color: "#3b82f6", bg: "#eff6ff", name: "첫 10개",       desc: "표현 10개 학습",         done: true  },
  { icon: Zap,      color: "#eab308", bg: "#fefce8", name: "스피드 러너",   desc: "하루 10개 학습",         done: true  },
  { icon: Moon,     color: "#8b5cf6", bg: "#f5f3ff", name: "야간 학습",     desc: "밤 11시 이후 학습",      done: true  },
  { icon: Trophy,   color: "#f59e0b", bg: "#fffbeb", name: "퍼펙트 스코어", desc: "연습 100% 달성",         done: true  },
  { icon: Crown,    color: "#ff4d00", bg: "#fff5f0", name: "30일 연속",     desc: "30일 연속 학습",         done: false },
  { icon: Star,     color: "#10b981", bg: "#f0fdf4", name: "올라운더",      desc: "모든 카테고리 50% 이상",  done: false },
  { icon: Gem,      color: "#06b6d4", bg: "#ecfeff", name: "100개 달성",    desc: "표현 100개 학습",        done: false },
  { icon: Bot,      color: "#6366f1", bg: "#eef2ff", name: "AI 마스터",     desc: "AI 대화 50회",           done: false },
];

/* ── 섹션 카드 래퍼 ── */
function Section({ title, sub, children, style = {}, icon: Icon }) {
  return (
    <div style={{ background: G.white, borderRadius: 24, padding: "28px 30px", border: "1px solid rgba(0,0,0,0.05)", ...style }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: G.black, display: "flex", alignItems: "center", gap: 6 }}>
          {Icon && <Icon size={14} color={G.gray} strokeWidth={2} />}
          {title}
        </div>
        {sub && <div style={{ fontSize: 12, color: G.gray, marginTop: 3 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

/* ── XP / 티어 ── */
function XpTier({ xp = 0 }) {
  const tier = getTier(xp);
  const next = TIERS[TIERS.indexOf(tier) + 1];
  const pct = next ? ((xp - tier.min) / (next.min - tier.min)) * 100 : 100;

  return (
    <Section icon={Zap} title="경험치 & 티어" sub={`다음 티어까지 ${next ? next.min - xp : 0} XP`}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${tier.color}18`, border: `2px solid ${tier.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {(() => { const I = tier.icon; return <I size={32} color={tier.color} strokeWidth={1.8} />; })()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 18, fontWeight: 900, color: tier.color }}>{tier.name}</div>
              <div style={{ fontSize: 12, color: G.gray, marginTop: 2 }}>현재 {xp.toLocaleString()} XP</div>
            </div>
            {next && <div style={{ fontSize: 12, color: G.gray }}>{next.name} {next.min.toLocaleString()} XP</div>}
          </div>

          <div style={{ height: 10, background: G.lightGray, borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc)`, borderRadius: 100, transition: "width 1s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {TIERS.map(t => {
          const I = t.icon;
          const unlocked = xp >= t.min;

          return (
            <div key={t.name} style={{ flex: 1, textAlign: "center", opacity: unlocked ? 1 : 0.3 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, margin: "0 auto 4px",
                background: unlocked ? `${t.color}18` : G.lightGray,
                border: `1.5px solid ${unlocked ? t.color + "44" : "#e5e7eb"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <I size={17} color={unlocked ? t.color : "#aaa"} strokeWidth={2} />
              </div>
              <div style={{ fontSize: 9, color: unlocked ? t.color : G.gray, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── 스트릭 ── */
function StreakCard({ streak = 0 }) {
  return (
    <div style={{ background: `linear-gradient(145deg, ${G.navy}, #1e3a5f)`, borderRadius: 24, padding: "28px 30px", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, background: "radial-gradient(circle, rgba(255,77,0,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: "'Noto Sans KR', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
        <Flame size={12} color="rgba(255,255,255,0.4)" strokeWidth={2} /> 연속 학습 스트릭
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 56, fontWeight: 900, color: G.white, lineHeight: 1 }}>{streak}</div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontFamily: "'Noto Sans KR', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
          일 연속 <Flame size={16} color={G.accent} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Noto Sans KR', sans-serif" }}>
        최장 기록 <span style={{ color: G.accent2, fontWeight: 700 }}>{streak}일</span> · 오늘도 학습하면 <span style={{ color: G.green, fontWeight: 700 }}>{streak + 1}일</span>
      </div>
    </div>
  );
}

/* ── 주간 차트 ── */
function WeeklyChart({ weeklyData = [] }) {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));

    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${mm}-${dd}`;

    const log = weeklyData.find(item => item.date === dateStr);

    return {
      d: dayNames[d.getDay()],
      date: dateStr,
      count: log ? Number(log.count) : 0,
    };
  });

  const max = Math.max(...weekly.map(d => d.count), 1);

  return (
    <Section icon={TrendingUp} title="주간 학습량" sub="이번 주 일별 학습한 표현 수">
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
        {weekly.map((d, i) => {
          const isToday = i === 6;
          const h = d.count ? Math.max((d.count / max) * 90, 20) : 8;

          return (
            <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
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
function CategoryChart({ categories = [] }) {
  return (
    <Section icon={BarChart2} title="카테고리별 숙련도" sub="카테고리별 학습 완료 비율">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {categories.map(c => (
          <div key={c.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: G.black }}>
                {(() => { const I = c.icon; return <I size={14} color={c.color} strokeWidth={2} />; })()}
                {c.label}
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
function MonthlyCalendar({ calendarData }) {
  if (!calendarData) return null;

  const { year, month, startDay, days, studied, today } = calendarData;
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  const cells = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <Section icon={Calendar} title="월간 학습 캘린더" sub={`${year}년 ${month}월 · ${studied.length}일 학습`}>
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
    <Section icon={Trophy} title="달성 뱃지" sub={`${done.length} / ${BADGES.length}개 획득`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {done.map(b => {
          const Icon = b.icon;
          return (
            <div key={b.name} style={{ background: b.bg, border: `1px solid ${b.color}22`, borderRadius: 16, padding: "16px 10px", textAlign: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: `linear-gradient(145deg, ${b.color}, ${b.color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", boxShadow: `0 4px 12px ${b.color}44` }}>
                <Icon size={22} color="#fff" strokeWidth={2} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: G.black, marginBottom: 2 }}>{b.name}</div>
              <div style={{ fontSize: 10, color: G.gray, lineHeight: 1.4 }}>{b.desc}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: G.gray, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
        잠김 <Lock size={10} strokeWidth={2.5} color={G.gray} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {locked.map(b => {
          const Icon = b.icon;
          return (
            <div key={b.name} style={{ background: G.lightGray, border: "1px solid #e5e7eb", borderRadius: 16, padding: "16px 10px", textAlign: "center", opacity: 0.4 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <Icon size={22} color="#fff" strokeWidth={2} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: G.gray, marginBottom: 2 }}>{b.name}</div>
              <div style={{ fontSize: 10, color: G.gray, lineHeight: 1.4 }}>{b.desc}</div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── 메인 ── */
export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const fetchFullStats = async () => {
      try {
        const token = localStorage.getItem("token");
        // 아까 만든 getFullStats 서비스와 연결된 엔드포인트 호출
        const res = await axios.get("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("통계 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullStats();
  }, []);

  if (loading) return <div style={{ padding: 40, color: G.navy }}>데이터를 분석 중입니다... 📊</div>;
  if (!data) return <div style={{ padding: 40 }}>데이터를 불러올 수 없습니다.</div>;

  const XP = data.xp;
  const STREAK = data.streak;

  const categoryIconMap = { // 뒤에 Smartphone 같은거 db랑 매칭 시켜야함(카테고리) << 위에 하드코딩이 이거여서 이거 씀
    "SNS / 일상": Smartphone,
    "감탄 / 리액션": MessageSquare,
    "칭찬 / 긍정": ThumbsUp,
    "완곡 / 거절": MinusCircle,
    "Gen Z 유행어": Sparkles,
    "연애 / SNS": Heart,
  };

  const CATEGORIES = (data?.categories || []).map(c => ({
    label: c.category,
    pct: Math.round((c.mastered / c.total) * 100) || 0,
    count: c.total,
    color: G.accent,
    icon: categoryIconMap[c.category] || Star
  }));

  const studiedDays = (data.activityLog || []).map(log =>
    Number(String(log.date).slice(-2))
  );

  const CALENDAR = data ? {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    startDay: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay(),
    days: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
    studied: studiedDays,
    today: new Date().getDate(),
  } : null;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif", background: G.pageBg }}>

      <PageHeader title="진도 관리" icon={BarChart2} />

      {/* 메인 그리드 */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* 상단 요약 */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16 }}>
          {[
            { icon: BookOpen,   label: "총 학습 표현", value: `${data.totalCount || 0}개`,  color: G.accent },
            { icon: CheckCircle, label: "완료한 카드", value: `${data.masteredCount || 0}개`, color: G.green  },
            { icon: Flame,       label: "연속 학습일", value: `${data.streak || 0}일`,     color: G.blue   },
            { icon: Timer,       label: "정확도",     value: `${data.accuracy || 0}%`,    color: G.purple },
          ].map(s => {
            const Icon = s.icon;
            return (
            <div key={s.label} style={{ background: G.white, borderRadius: 20, padding: "22px 24px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon size={20} color={s.color} strokeWidth={1.8} />
              </div>
              <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 24, fontWeight: 900, color: G.black, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: G.gray }}>{s.label}</div>
            </div>
          );})}
        </div>

        {/* 스트릭 + XP */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 20 }}>
          <StreakCard streak={STREAK} />
          <XpTier xp={XP} />
        </div>

        {/* 주간 차트 + 카테고리 */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
          <WeeklyChart weeklyData={data.activityLog} />
          <CategoryChart categories={CATEGORIES} />
        </div>

        {/* 캘린더 + 뱃지 */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
          <MonthlyCalendar calendarData={CALENDAR} />
          <BadgeGrid stats={data} />
        </div>
      </div>
    </div>
  );
}