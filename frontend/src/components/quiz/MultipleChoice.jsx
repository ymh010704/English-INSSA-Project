/* 말 그대로 객관식 문제 컴포넌트 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import SideButton from "./SideButton";
import "./Quiz.css"
import Swal from "sweetalert2"; // Toast 메시지 띄울라고 씀


const G = {
  black: "#0a0a0a", white: "#ffffff",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981", red: "#ef4444", 
};

export default function MultipleChoice({ data, onNext, savedSelection }) {
  const [selected, setSelected] = useState(savedSelection ?? null); // 선택한 인덱스
  const [submitted, setSubmitted] = useState(savedSelection !== undefined); // 확인 버튼 클릭 여부

  const [isBookmarked, setIsBookmarked] = useState(data.isBookmarked || false);

  const options = data.answers;

  // useEffect로 부모(CardStudy)에서 index가 바뀌면(이전/다음 버튼) 상태를 동기화하는 용도
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
        iconColor: newBookmarkStatus ? '#ffcc00' : G.accent,
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
      const response = await fetch('/api/report/slang', {
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

  function handleConfirm() {
    if (selected === null || submitted) return;
    setSubmitted(true);
  }

  function handleNextClick() {
    const isCorrect = data.answers[selected].isCorrect;
    onNext(isCorrect, selected);
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
      <div style={{ background: G.white, borderRadius: 32, padding: "40px 44px", boxShadow: "0 32px 80px rgba(0,0,0,0.12)", minHeight: 450, display: "flex", flexDirection: "column", width: "100%", maxWidth: 640 }}>
        <div style={{ paddingBottom: 20, borderBottom: "2px solid #f0ece5", marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#bbb5a8", marginBottom: 8 }}>객관식 퀴즈</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: G.black, lineHeight: 1.4 }}>
            <span style={{ color: G.accent }}>'{data.word}'</span>의 뜻으로 가장 적절한 것은?
          </div>
          
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {options.map((option, index) => {
            let bgColor = G.lightGray;
            let border = "2px solid rgba(0,0,0,0.05)";
            
            if (submitted) {
              if (option.isCorrect) { bgColor = `${G.green}20`; border = `2px solid ${G.green}`; }
              else if (selected === index) { bgColor = `${G.red}20`; border = `2px solid ${G.red}`; }
            } else if (selected === index) {
              border = `2px solid ${G.accent}`; bgColor = `${G.accent}05`;
            }

            return (
              <button className="quiz-option-btn" key={index} onClick={() => !submitted && setSelected(index)} style={{
                background: bgColor, border: border, borderRadius: 100, padding: "16px 24px",
                cursor: submitted ? "default" : "pointer", textAlign: "left", fontSize: 15, fontWeight: 600,
                transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: 10
              }}>
                {option.text}
                {submitted && option.isCorrect && <span style={{ marginLeft: 'auto' }}>✅</span>}
                {submitted && !option.isCorrect && selected === index && <span style={{ marginLeft: 'auto' }}>❌</span>}
              </button>
            );
          })}
        </div>

        <div className="quiz-card-container" style={{ marginTop: 'auto', paddingTop: 20 }}>
          {!submitted ? (
            <button className="quiz-action-btn" onClick={handleConfirm} disabled={selected === null} style={{
              width: '100%', padding: "18px", borderRadius: 100, border: "none",
              background: selected === null ? "#d6d0c8" : G.accent, color: G.white, fontWeight: 700, cursor: "pointer"
            }}>정답 확인하기</button>
          ) : (
            <>
              <button className="quiz-action-btn" onClick={() => setSubmitted(false)} style={{
                flex: 1, padding: "18px", borderRadius: 100, border: `2px solid #e5dfd5`,
                background: G.white, color: G.gray, fontWeight: 700, cursor: "pointer"
              }}>다시 고르기</button>
              
              <button className="quiz-action-btn" onClick={handleNextClick} style={{
                flex: 1.5, padding: "18px", float: `right`, borderRadius: 100, border: `2px solid ${G.accent}`,
                background: G.white, color: G.accent, fontWeight: 700, cursor: "pointer"
              }}>다음 문제로 →</button>
            </>
          )}
        </div>
      </div>
    </div>
    
  );
}