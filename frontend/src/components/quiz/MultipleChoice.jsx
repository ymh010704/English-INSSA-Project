/* 말 그대로 객관식 문제 컴포넌트 */
import React, { useState, useEffect } from "react";
import "./Quiz.css"

const G = {
  black: "#0a0a0a", white: "#ffffff",
  accent: "#ff4d00", accent2: "#ffcc00", navy: "#0d1b2a",
  gray: "#6b7280", light: "#f9f8f5", lightGray: "#f3f4f6",
  green: "#10b981", red: "#ef4444", 
};

export default function MultipleChoice({ data, onNext, savedSelection }) {
  const [selected, setSelected] = useState(savedSelection ?? null); // 선택한 인덱스
  const [submitted, setSubmitted] = useState(savedSelection !== undefined); // 확인 버튼 클릭 여부

  const options = data.answers;

  // useEffect로 부모(CardStudy)에서 index가 바뀌면(이전/다음 버튼) 상태를 동기화하는 용도
  useEffect(() => {
    setSelected(savedSelection ?? null);
    setSubmitted(savedSelection !== undefined);
  }, [savedSelection]);

  function handleConfirm() {
    if (selected === null || submitted) return;
    setSubmitted(true);
  }

  function handleNextClick() {
    const isCorrect = data.answers[selected].isCorrect;
    onNext(isCorrect, selected);
  }

  return (
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
  );
}