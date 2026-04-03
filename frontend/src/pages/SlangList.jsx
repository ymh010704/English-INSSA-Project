import React, { useEffect, useState } from 'react';

const SlangList = () => {
  const [slangs, setSlangs] = useState([]);

  useEffect(() => {
    // 백엔드 API 호출 (Nginx를 통과하므로 상대 경로 사용)
    fetch('/api/slangs')
      .then(res => res.json())
      .then(response => {
      if (response.ok && Array.isArray(response.data)) {
        setSlangs(response.data); // 실제 배열인 response.data를 넣어야 함!
      }
    })
      .catch(err => console.error("데이터 로딩 실패:", err));
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: '40px', fontSize: '2.5rem', fontWeight: 'bold' }}>
        🔥 인싸 슬랭 사전 🔥
        </h1>
        
        {/* 카드들을 정렬하는 컨테이너 */}
        <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '25px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
        }}>
        {Array.isArray(slangs) && slangs.map((item) => (
            <div key={item.slang_id} style={{ 
            backgroundColor: '#fff', 
            borderRadius: '20px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
            overflow: 'hidden', 
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column'
            }}>
            {/* 상단 태그 부분 */}
            <div style={{ backgroundColor: '#4f46e5', padding: '12px 20px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>#{item.word}</span>
            </div>
            
            <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                <small style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '0.7rem' }}>ENGLISH DEFINITION</small>
                <p style={{ color: '#4b5563', fontStyle: 'italic', marginTop: '5px' }}>"{item.definition_en}"</p>
                </div>

                <div style={{ backgroundColor: '#f0f4ff', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                <small style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '0.7rem' }}>한글 설명</small>
                <p style={{ color: '#1f2937', fontWeight: '600', marginTop: '5px', lineHeight: '1.5' }}>{item.definition_ko}</p>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
                <small style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '0.7rem' }}>EXAMPLE</small>
                <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '5px' }}>{item.example_en}</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '5px' }}>→ {item.example_ko}</p>
                </div>
            </div>
            </div>
        ))}
        </div>
    </div>
    );
};

export default SlangList;