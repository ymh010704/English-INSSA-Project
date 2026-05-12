import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SlangList = () => {
  const [slangs, setSlangs] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null); // 상세 모달
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/slangs')
      .then(res => res.json())
      .then(response => {
        if (response.success && Array.isArray(response.data)) {
          setSlangs(response.data);
        }
      })
      .catch(err => console.error("데이터 로딩 실패:", err));
  }, []);

  const filtered = slangs.filter(item =>
    item.word?.toLowerCase().includes(query.toLowerCase()) ||
    item.definition_ko?.includes(query) ||
    item.definition_en?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: '24px', fontSize: '2.5rem', fontWeight: 'bold' }}>
        🔥 인싸 슬랭 사전 🔥
      </h1>

      {/* 검색창 */}
      <div style={{ maxWidth: 480, margin: '0 auto 32px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="단어, 뜻으로 검색..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '12px 40px 12px 42px',
              borderRadius: 12, border: '2px solid #e5e7eb',
              fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#4f46e5'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af',
            }}>✕</button>
          )}
        </div>
        {query && (
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#6b7280', marginTop: 6 }}>
            {filtered.length}개 검색됨
          </div>
        )}
      </div>

      {/* 카드 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {filtered.length === 0 && query && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            "{query}" 검색 결과가 없어요
          </div>
        )}
        {filtered.map((item) => (
          <div
            key={item.slang_id}
            onClick={() => setSelected(item)}
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'; }}
          >
            <div style={{ backgroundColor: '#4f46e5', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem', wordBreak: 'break-word', lineHeight: 1.3 }}>{item.word}</span>
              {item.shorts_url && <span style={{ fontSize: 13, flexShrink: 0 }}>▶</span>}
            </div>
            <div style={{ padding: '12px 16px' }}>
              <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                {item.definition_ko}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480,
              overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ backgroundColor: '#4f46e5', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.4rem' }}>#{selected.word}</span>
              <button onClick={() => setSelected(null)} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 14,
              }}>✕</button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: 16 }}>
                <small style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '0.7rem' }}>ENGLISH DEFINITION</small>
                <p style={{ color: '#4b5563', fontStyle: 'italic', marginTop: 5 }}>"{selected.definition_en}"</p>
              </div>
              <div style={{ backgroundColor: '#f0f4ff', padding: '14px', borderRadius: '12px', marginBottom: 16 }}>
                <small style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '0.7rem' }}>한글 설명</small>
                <p style={{ color: '#1f2937', fontWeight: '600', marginTop: 5, lineHeight: 1.5 }}>{selected.definition_ko}</p>
              </div>
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, marginBottom: selected.shorts_url ? 16 : 0 }}>
                <small style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '0.7rem' }}>EXAMPLE</small>
                <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '0.9rem', marginTop: 5 }}>{selected.example_en}</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 5 }}>→ {selected.example_ko}</p>
              </div>
              {selected.shorts_url && (
                <video
                  src={selected.shorts_url}
                  loop playsInline controls
                  style={{ width: '100%', borderRadius: 12, marginTop: 4 }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlangList;
