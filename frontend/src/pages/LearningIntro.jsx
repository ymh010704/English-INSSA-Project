import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Timer, BookOpen, Target, GraduationCap, Flame } from "lucide-react";

import Mascot from "../components/Mascot";
import G from "../constants/colors";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Sidebar from "../components/Sidebar";

export default function LearningIntro() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [todayWords, setTodayWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // 1. 스트릭 정보 가져오기
        const statsRes = await axios.get('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStreak(statsRes.data.streak || 0);

        // 2. 오늘의 학습 단어 5개 가져오기
        const wordsRes = await axios.get('/api/slangs/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTodayWords(wordsRes.data);

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>학습 데이터를 준비 중입니다...</div>;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* 사이드바 (필요 시 주석 해제하여 사용) */}
      {/* <Sidebar active="learning" /> */}

      <div style={{
        flex: 1,
        minHeight: "100vh",
        fontFamily: "'Noto Sans KR', sans-serif",
        display: "flex", 
        flexDirection: "column",
        background: G.pageBg,
        overflowY: "auto"
      }}>

        <PageHeader title="오늘의 학습" icon={GraduationCap} />

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div style={{ width: "100%", maxWidth: 560 }}>

            {/* 캐릭터 + 스트릭 */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <Mascot size={140} mode="cheer" />
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,77,0,0.08)", border: "1px solid rgba(255,77,0,0.2)",
                borderRadius: 100, padding: "8px 20px", marginTop: 16,
              }}>
                <Flame size={18} color={G.accent} strokeWidth={2} />
                <span style={{ fontSize: 14, fontWeight: 700, color: G.accent }}>
                  {streak}일 연속 학습 중!
                </span>
              </div>
            </div>

            {/* 타이틀 */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 900, color: G.black, letterSpacing: -1, marginBottom: 10,
              }}>
                오늘의 슬랭 <span style={{ color: G.accent }}>5개</span>
              </h1>
              <p style={{ fontSize: 14, color: G.gray, lineHeight: 1.7 }}>
                딱 5분이면 충분해요.<br />
                오늘도 한 걸음 더 원어민에 가까워져요
              </p>
            </div>

            {/* 오늘 배울 단어 미리보기 */}
            <div style={{
              background: G.white, borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden", marginBottom: 24,
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}>
              {todayWords.map((w, i) => (
                <div key={w.slang_id} style={{
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: i < todayWords.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  gap: 20
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 14, fontWeight: 800, color: G.black }}>{w.word}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                    <span style={{ 
                      fontSize: 13, 
                      color: G.gray,
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2, 
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-all"
                    }}>
                      {w.definition_ko}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 예상 소요 시간 정보 */}
            <div style={{
              display: "flex", gap: 12, marginBottom: 28, justifyContent: "center",
            }}>
              {[
                { icon: Timer,    label: "예상 시간", value: "3~5분" },
                { icon: BookOpen, label: "학습 단어", value: "5개"   },
                { icon: Target,   label: "오늘 목표", value: "100%"  },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{
                    flex: 1, background: G.white, borderRadius: 14,
                    padding: "14px 10px", textAlign: "center",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><Icon size={20} color={G.accent} strokeWidth={1.8} /></div>
                    <div style={{ fontSize: 11, color: G.gray, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: G.black, fontFamily: "'Unbounded', sans-serif" }}>{item.value}</div>
                  </div>
                );
              })}
            </div>

            {/* 시작 버튼 */}
            <Button 
              onClick={() => navigate("/card-study")} 
              style={{ width: "100%", borderRadius: 16, padding: "18px", fontSize: 16, letterSpacing: 0.5 }}
            >
              학습 시작하기 →
            </Button>

            <p style={{ textAlign: "center", fontSize: 12, color: "#aeb1b6", marginTop: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>오늘 학습하면 {streak + 1}일 연속 달성! <Flame size={11} color={G.accent} strokeWidth={2} /></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}