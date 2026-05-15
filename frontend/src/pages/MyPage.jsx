import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useBreakpoint from "../hooks/useBreakpoint";
import { Flame, BookOpen, Zap, Moon, Trophy, Crown, Star, Gem, Bot, Sprout, TrendingUp, Award, CircleUser, BarChart2, Bookmark as BookmarkIcon, RotateCcw, Cog, Link2, Lock } from "lucide-react";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";

const TIERS = [
  { name: "입문",     min: 0,    color: "#94a3b8", icon: Sprout     },
  { name: "초보",     min: 200,  color: "#22c55e", icon: BookOpen   },
  { name: "중급",     min: 500,  color: "#3b82f6", icon: TrendingUp },
  { name: "고급",     min: 1000, color: "#8b5cf6", icon: Zap        },
  { name: "전문가",   min: 2000, color: "#f59e0b", icon: Award      },
  { name: "원어민급", min: 4000, color: "#ff4d00", icon: Crown      },
];

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

const WEEKLY = [
  { d: "월", v: 3 }, { d: "화", v: 5 }, { d: "수", v: 4 },
  { d: "목", v: 6 }, { d: "금", v: 2 }, { d: "토", v: 0 }, { d: "일", v: 0 },
];

function getTier(xp) {
  return [...TIERS].reverse().find(t => xp >= t.min) || TIERS[0];
}

/* ── 섹션 카드 ── */
function Card({ children, style = {} }) {
  return (
    <div style={{ background: G.white, borderRadius: 20, padding: "24px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, sub, extra, icon: Icon }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: sub ? 4 : 16 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: G.black, display: "flex", alignItems: "center", gap: 6 }}>
          {Icon && <Icon size={13} color={G.gray} strokeWidth={2} />}
          {children}
        </div>
        {sub && <div style={{ fontSize: 12, color: G.gray, marginTop: 2, marginBottom: 14 }}>{sub}</div>}
      </div>
      {extra}
    </div>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const fileRef = useRef(null);

  const [user, setUser] = useState({ nickname: "인싸", email: "", provider: "local" });
  const [avatar, setAvatar] = useState(null);
  const [stats, setStats] = useState({ streak: 0, totalSlangs: 0, bookmarks: 0 });
  const [loading, setLoading] = useState(true);

  const XP = 1240;
  const tier = getTier(XP);
  const tierIdx = TIERS.findIndex(t => t.name === tier.name);
  const nextTier = TIERS[tierIdx + 1];
  const tierPct = nextTier ? ((XP - tier.min) / (nextTier.min - tier.min)) * 100 : 100;

  const doneBadges = BADGES.filter(b => b.done);
  const lockedBadges = BADGES.filter(b => !b.done);
  const weekMax = Math.max(...WEEKLY.map(d => d.v), 1);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    }
    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) setAvatar(storedAvatar);

    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    Promise.allSettled([
      axios.get("/api/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setStats(p => ({ ...p, streak: r.data.streak || 0, totalSlangs: r.data.totalSlangs || 0 }))),
      axios.get("/api/slangs/bookmarks", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => {
          const list = Array.isArray(r.data) ? r.data : r.data.data || [];
          setStats(p => ({ ...p, bookmarks: list.length }));
        }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif", background: G.pageBg }}>
      <div style={{ height: 60, background: G.white, borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", padding: "0 20px" }}>
        <Skeleton width={100} height={20} />
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton width="100%" height={isMobile ? 260 : 220} radius={28} />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Skeleton width="100%" height={140} radius={20} />
            <Skeleton width="100%" height={160} radius={20} />
            <Skeleton width="100%" height={200} radius={20} />
          </div>
          <Skeleton width="100%" height={isMobile ? 300 : 440} radius={20} />
        </div>
      </div>
    </div>
  );

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
    localStorage.setItem("avatar", url);
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif", background: G.pageBg }}>
      <PageHeader title="마이페이지" icon={CircleUser} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "16px 12px" : "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── 프로필 히어로 ── */}
        <div style={{
          background: `linear-gradient(145deg, ${G.navy}, #1a2f50)`,
          borderRadius: 28, padding: isMobile ? "24px 20px" : "36px 40px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(255,77,0,0.13) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -20, width: 220, height: 220, background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 28, position: "relative" }}>
            {/* 아바타 */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                onClick={() => fileRef.current.click()}
                title="클릭해서 사진 변경"
                style={{
                  width: 90, height: 90, borderRadius: "50%",
                  background: avatar ? "transparent" : G.accent,
                  border: "3px solid rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 34, fontFamily: "'Unbounded', sans-serif", fontWeight: 900, color: G.white,
                  cursor: "pointer", overflow: "hidden",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {avatar
                  ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (user.nickname || "U")[0]}
              </div>
              <div style={{
                position: "absolute", bottom: 2, right: 2,
                width: 28, height: 28, borderRadius: "50%",
                background: tier.color, border: "2.5px solid #1a2f50",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {(() => { const I = tier.icon; return <I size={13} color="#fff" strokeWidth={2.5} />; })()}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </div>

            {/* 유저 정보 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 900, color: G.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.nickname || user.name}
                </div>
                <div style={{
                  background: `${tier.color}22`, border: `1px solid ${tier.color}55`,
                  borderRadius: 100, padding: "4px 12px",
                  fontSize: 11, fontWeight: 700, color: tier.color, flexShrink: 0,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  {(() => { const I = tier.icon; return <I size={11} color={tier.color} strokeWidth={2.5} />; })()}
                  {tier.name}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>{user.email}</div>

              {/* XP 프로그레스 바 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{XP.toLocaleString()} XP</span>
                  {nextTier && (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", display: "flex", alignItems: "center", gap: 4 }}>
                      {(() => { const I = nextTier.icon; return <I size={10} color="rgba(255,255,255,0.28)" strokeWidth={2.5} />; })()}
                      {nextTier.name} → {nextTier.min.toLocaleString()} XP
                    </span>
                  )}
                </div>
                <div style={{ height: 7, background: "rgba(255,255,255,0.1)", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${tierPct}%`, background: `linear-gradient(90deg, ${tier.color}, ${tier.color}bb)`, borderRadius: 100, transition: "width 1.2s ease" }} />
                </div>
              </div>
            </div>

            {/* 설정 버튼 */}
            <button
              onClick={() => navigate("/settings")}
              style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 12, padding: "10px 18px", cursor: "pointer",
                fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)",
                fontFamily: "'Noto Sans KR', sans-serif", flexShrink: 0,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = G.white; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Cog size={14} strokeWidth={2} /> 설정
              </span>
            </button>
          </div>

          {/* 스탯 4개 */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { icon: Flame,    label: "연속 학습", value: `${stats.streak}일`          },
              { icon: BookOpen, label: "배운 슬랭", value: `${stats.totalSlangs}개`     },
              { icon: BookmarkIcon, label: "북마크",    value: `${stats.bookmarks}개`       },
              { icon: Zap,      label: "경험치",    value: `${XP.toLocaleString()} XP` },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
              <div key={s.label} style={{ textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 6 }}>
                  <Icon size={11} color="rgba(255,255,255,0.32)" strokeWidth={2} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)" }}>{s.label}</span>
                </div>
                <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: G.white }}>{s.value}</div>
              </div>
            );})}
          </div>
        </div>

        {/* ── 2칼럼 ── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

          {/* 왼쪽 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* 주간 활동 */}
            <Card>
              <SectionTitle icon={BarChart2} sub="일별 학습한 표현 수">이번 주 활동</SectionTitle>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 88 }}>
                {WEEKLY.map((d, i) => {
                  const isToday = i === new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                  const isTodayBool = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                  const h = d.v ? Math.max((d.v / weekMax) * 64, 16) : 6;
                  return (
                    <div key={d.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      {d.v > 0 && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: isTodayBool ? G.accent : G.black }}>{d.v}</div>
                      )}
                      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", height: h, borderRadius: 7, background: isTodayBool ? G.accent : d.v > 0 ? "#fed7aa" : G.lightGray, transition: "height 0.5s ease" }} />
                      </div>
                      <div style={{ fontSize: 10, color: isTodayBool ? G.accent : G.gray, fontWeight: isTodayBool ? 700 : 400 }}>{d.d}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 티어 여정 */}
            <Card>
              <SectionTitle icon={TrendingUp} sub="전체 티어 진행 현황">레벨 여정</SectionTitle>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                {TIERS.map(t => {
                  const I = t.icon;
                  const unlocked = XP >= t.min;
                  return (
                    <div key={t.name} style={{ textAlign: "center", opacity: unlocked ? 1 : 0.3 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, margin: "0 auto 5px",
                        background: unlocked ? `${t.color}18` : G.lightGray,
                        border: `1.5px solid ${unlocked ? t.color + "44" : "#e5e7eb"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <I size={16} color={unlocked ? t.color : "#aaa"} strokeWidth={2} />
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: unlocked ? t.color : G.gray }}>{t.name}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ height: 8, background: G.lightGray, borderRadius: 100, overflow: "hidden", position: "relative" }}>
                <div style={{ height: "100%", width: `${(tierIdx / (TIERS.length - 1)) * 100 + (tierPct / (TIERS.length - 1))}%`, background: `linear-gradient(90deg, ${G.accent}, ${tier.color})`, borderRadius: 100 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: G.gray, display: "flex", alignItems: "center", gap: 4 }}>
                  {(() => { const I = tier.icon; return <I size={11} color={tier.color} strokeWidth={2.5} />; })()}
                  현재: <strong style={{ color: tier.color }}>{tier.name}</strong>
                </span>
                {nextTier && (
                  <span style={{ fontSize: 11, color: G.gray, display: "flex", alignItems: "center", gap: 4 }}>
                    다음:
                    {(() => { const I = nextTier.icon; return <I size={11} color={nextTier.color} strokeWidth={2.5} />; })()}
                    {nextTier.name}
                  </span>
                )}
              </div>
            </Card>

            {/* 바로가기 */}
            <Card>
              <SectionTitle icon={Link2}>바로가기</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { icon: BarChart2,    label: "진도 관리",  sub: "상세 통계 & 캘린더",         path: "/progress" },
                  { icon: BookmarkIcon, label: "내 북마크",  sub: `${stats.bookmarks}개 저장됨`, path: "/bookmark" },
                  { icon: RotateCcw,   label: "복습하기",   sub: "랜덤 퀴즈 10문제",           path: "/review" },
                  { icon: Bot,         label: "AI 회화",    sub: "원어민 대화 연습",            path: "/ai-chat" },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 12px", borderRadius: 12,
                      border: "none", background: "transparent",
                      cursor: "pointer", width: "100%", textAlign: "left",
                      transition: "background 0.13s", fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,0,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: `${G.accent}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {(() => { const I = item.icon; return <I size={16} color={G.accent} strokeWidth={2} />; })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: G.black }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: G.gray, marginTop: 1 }}>{item.sub}</div>
                    </div>
                    <span style={{ fontSize: 16, color: "#d1d5db" }}>›</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* 오른쪽: 뱃지 */}
          <Card style={{ alignSelf: "start" }}>
            <SectionTitle
              icon={Trophy}
              sub="학습 목표를 달성하면 획득해요"
              extra={
                <div style={{ background: "rgba(255,77,0,0.08)", border: "1px solid rgba(255,77,0,0.15)", borderRadius: 100, padding: "3px 12px", fontSize: 12, fontWeight: 700, color: G.accent }}>
                  {doneBadges.length}/{BADGES.length}
                </div>
              }
            >
              달성 뱃지
            </SectionTitle>

            {/* 획득 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
              {doneBadges.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.name} style={{
                    background: b.bg, border: `1px solid ${b.color}22`,
                    borderRadius: 14, padding: "16px 8px", textAlign: "center",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `linear-gradient(145deg, ${b.color}, ${b.color}cc)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 8px", boxShadow: `0 4px 12px ${b.color}44`,
                    }}>
                      <Icon size={22} color="#fff" strokeWidth={2} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: G.black, lineHeight: 1.3, marginBottom: 3 }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: G.gray, lineHeight: 1.3 }}>{b.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* 잠김 */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#c8ccd1", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              잠김 <Lock size={10} strokeWidth={2.5} color="#c8ccd1" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {lockedBadges.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.name} style={{
                    background: G.lightGray, border: "1px solid #e9ecef",
                    borderRadius: 14, padding: "16px 8px", textAlign: "center", opacity: 0.4,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "#d1d5db",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 8px",
                    }}>
                      <Icon size={22} color="#fff" strokeWidth={2} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: G.gray, lineHeight: 1.3, marginBottom: 3 }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: G.gray, lineHeight: 1.3 }}>{b.desc}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#bcc0c6", padding: "4px 0 8px" }}>
          영어인싸되기 v1.0.0
        </div>
      </div>
    </div>
  );
}
