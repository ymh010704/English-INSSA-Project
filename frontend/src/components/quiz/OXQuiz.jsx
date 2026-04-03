import React, { useState, useEffect } from "react";
import "./Quiz.css"

const G = {
  black: "#0a0a0a", white: "#ffffff", accent: "#ff4d00",
  gray: "#6b7280", green: "#10b981", red: "#ef4444", light: "#f9f8f5",
};

export default function OXQuiz({ data, onNext, savedSelection }) {
  // 1. 이전 선택 기록이 있으면 그 값으로 초기화
  const [selected, setSelected] = useState(savedSelection ?? null); // 'O' 또는 'X'
  const [submitted, setSubmitted] = useState(savedSelection !== undefined);

  // 2. 부모의 index가 바뀌어 savedSelection이 변경될 때 상태 동기화
  useEffect(() => {
    setSelected(savedSelection ?? null);
    setSubmitted(savedSelection !== undefined);
  }, [savedSelection]);

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
  );
}