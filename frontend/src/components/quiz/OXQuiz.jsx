import React, { useState, useEffect } from "react";
import axios from "axios";
import SideButton from "./SideButton";
import "./Quiz.css"
import Swal from "sweetalert2"; // Toast 메시지 띄울라고 씀

const G = {
  black: "#0a0a0a", white: "#ffffff", accent: "#ff4d00",
  gray: "#6b7280", green: "#10b981", red: "#ef4444", light: "#f9f8f5",
};

export default function OXQuiz({ data, onNext, savedSelection }) {
  // 1. 이전 선택 기록이 있으면 그 값으로 초기화
  const [selected, setSelected] = useState(savedSelection ?? null); // 'O' 또는 'X'
  const [submitted, setSubmitted] = useState(savedSelection !== undefined);

  // 북마크용
  const [isBookmarked, setIsBookmarked] = useState(data.isBookmarked || false);

  // 2. 부모의 index가 바뀌어 savedSelection이 변경될 때 상태 동기화
  useEffect(() => {
    setSelected(savedSelection ?? null);
    setSubmitted(savedSelection !== undefined);
    setIsBookmarked(data.isBookmarked || false);
  }, [savedSelection, data]);

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/bookmarks/toggle', 
        { slangId: data.id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 토스트 메시지를 위해 일단 상태 업뎃
      const newBookmarkStatus = res.data.isBookmarked;
      setIsBookmarked(newBookmarkStatus);

      // 토스트 설정
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      // 북마크 여부에 따른 토스트 메시지 띄우기
      Toast.fire({
        icon: 'success',
        // 백엔드에서 온 최신 상태(newBookmarkStatus)를 기준으로 판단
        title: newBookmarkStatus ? '북마크 저장 완료! ⭐' : '북마크 해제 완료! 👋',
        background: '#ffffff',
        iconColor: newBookmarkStatus ? '#ffcc00' : G.accent, // 설정해두신 주황색 포인트
      });

      setIsBookmarked(res.data.isBookmarked);
    } catch (err) {
      console.error("북마크 실패", err);
      Swal.fire({
        icon: 'error',
        title: '오류 발생',
        text: '로그인 세션이 만료되었거나 서버 에러입니다.',
        confirmButtonColor: G.accent
      });
    }
  };

  const handleSlangReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentSlangId = data?.id; 
      const currentWord = data?.word || data?.term || "단어";

      if (!currentSlangId) {
        alert("🚨 단어 정보를 가져올 수 없습니다.");
        return;
      }
      const response = await fetch('/api/admin/report-slang', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slangId: currentSlangId
        })
      });

      const resData = await response.json();

      if (resData.success) {
        alert(`🚨 '${currentWord}' 단어가 관리자 시스템에 정상 신고 접수되었습니다!`);
      } else {
        alert(`신고 실패: ${resData.message}`);
      }
    } catch (err) {
      console.error("신고 에러:", err);
      alert(`시스템 오류: ${err.message}`);
    }
  };

  // 사용자가 고른 답이 실제 정답과 일치하는지 판별
  const isUserCorrect = (selected === 'O' && data.isCorrect === true) || 
                        (selected === 'X' && data.isCorrect === false);

  function handleConfirm() {
    if (selected === null || submitted) return;
    setSubmitted(true);
  }

  function handleNextClick() {
    // 부모에게 정답 여부와 사용자의 선택('O' or 'X')을 함께 전달
    onNext(isUserCorrect, selected);
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 640 }}>
{/* 오른쪽 사이드 버튼 영역 (컴포넌트로 불러옴) */}
      <div style={{
        position: "absolute",
        right: "-70px", // 카드 오른쪽 밖으로 배치
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        {/* 북마크 버튼 */}
        <SideButton 
          onClick={handleBookmark} 
          icon={isBookmarked ? "⭐" : "☆"} 
          label="저장" 
          active={isBookmarked}
        />
        {/* 힌트 버튼 (기능은 나중에 구현) */}
        <SideButton 
          onClick={() => alert("힌트: '월세 안 내고 살다'를 영어로 하면?")} 
          icon="💡" 
          label="힌트" 
        />
        {/* 신고 버튼 */}
        <SideButton 
          onClick={handleSlangReport} 
          icon="🚨" 
          label="신고" 
        />
      </div>
      <div style={{ 
        background: G.white, borderRadius: 32, padding: "40px 44px", 
        boxShadow: "0 32px 80px rgba(0,0,0,0.12)", minHeight: 450, 
        display: "flex", flexDirection: "column", width: "100%", maxWidth: 640 
      }}>
        <div style={{ paddingBottom: 20, borderBottom: "2px solid #f0ece5", marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#bbb5a8", marginBottom: 8 }}>OX 퀴즈</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: G.black, lineHeight: 1.4 }}>
            문장에서 <span style={{ color: G.accent }}>'{data.word}'</span>의 쓰임이 맞을까요?
          </div>
        </div>

        <div style={{ background: "#f7f4ef", borderRadius: 18, padding: "20px", marginBottom: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: G.black, lineHeight: 1.6, margin: 0 }}>
            "{data.exampleEn}"
          </p>
        </div>

        {/* OX 버튼 영역 */}
        <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
          {['O', 'X'].map(type => {
            // 상태에 따른 스타일 결정
            let border = "#e5dfd5";
            let bgColor = G.light;
            
            if (selected === type) {
              border = type === 'O' ? G.green : G.red;
              bgColor = type === 'O' ? `${G.green}15` : `${G.red}15`;
            }

            return (
              <button className="quiz-option-btn"
                key={type} 
                onClick={() => !submitted && setSelected(type)} 
                style={{
                  flex: 1, height: 100, borderRadius: 24, fontSize: 40, fontWeight: 900, 
                  cursor: submitted ? "default" : "pointer",
                  border: `3px solid ${border}`,
                  background: bgColor,
                  color: type === 'O' ? G.green : G.red, 
                  transition: "all 0.2s"
                }}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* 정답 확인 후 나타나는 피드백 영역 */}
        {submitted && (
          <div style={{ 
            padding: "15px", borderRadius: 16, 
            background: isUserCorrect ? `${G.green}10` : `${G.red}10`, 
            border: `1px solid ${isUserCorrect ? G.green : G.red}`, 
            marginBottom: 20, textAlign: 'center' 
          }}>
            <div style={{ fontWeight: 800, color: isUserCorrect ? G.green : G.red, fontSize: 18, marginBottom: 4 }}>
              {isUserCorrect ? "🎉 정답입니다!" : "😅 오답입니다!" }
            </div>
            <div style={{ fontSize: 13, color: G.black, fontWeight: 500 }}>
              {data.word}는 "{data.meaning || '해당 의미'}"라는 뜻이에요.
            </div>
          </div>
        )}

        {/* 하단 버튼 영역 */}
        <div style={{ marginTop: 'auto', display: "flex", gap: 10 }}>
          {!submitted ? (
            <button className="quiz-action-btn"
              onClick={handleConfirm} 
              disabled={selected === null} 
              style={{
                width: '100%', padding: "18px", borderRadius: 100, border: "none",
                background: selected === null ? "#d6d0c8" : G.accent, 
                color: G.white, fontWeight: 700, cursor: "pointer"
              }}
            >
              정답 확인하기
            </button>
          ) : (
            <>
              <button className="quiz-action-btn"
                onClick={() => setSubmitted(false)} 
                style={{
                  flex: 1, padding: "18px", borderRadius: 100, border: `2px solid #e5dfd5`,
                  background: G.white, color: G.gray, fontWeight: 700, cursor: "pointer"
                }}
              >
                다시 고르기
              </button>
              <button className="quiz-action-btn"
                onClick={handleNextClick} 
                style={{
                  flex: 1.5, padding: "18px", borderRadius: 100, border: `2px solid ${G.accent}`,
                  background: G.white, color: G.accent, fontWeight: 700, cursor: "pointer"
                }}
              >
                다음 문제로 →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    
  );
}