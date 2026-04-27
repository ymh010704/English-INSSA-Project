import { useEffect, useRef, useState } from "react";

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetch("/api/slangs/shorts")
      .then((r) => r.json())
      .then((data) => setShorts(data.data || []));
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === current) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [current]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
    setCurrent(index);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        backgroundColor: "#000",
      }}
    >
      {shorts.length === 0 && (
        <div style={{ color: "#fff", textAlign: "center", paddingTop: "40vh", fontSize: 18 }}>
          쇼츠가 없어요
        </div>
      )}
      {shorts.map((s, i) => (
        <div
          key={s.slang_id}
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <video
            ref={(el) => (videoRefs.current[i] = el)}
            src={s.shorts_url}
            loop
            playsInline
            onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
            style={{ height: "75%", maxWidth: "100%", objectFit: "contain", marginBottom: "160px", cursor: "pointer" }}
          />
          {/* 하단 그라데이션 */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "45%",
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: 20,
              right: 20,
              color: "#fff",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: "bold" }}>{s.word}</div>
            <div style={{ fontSize: 15, marginTop: 6, opacity: 0.95 }}>{s.definition_ko}</div>
            <div style={{ fontSize: 13, marginTop: 8, opacity: 0.85 }}>"{s.example_en}"</div>
          </div>
        </div>
      ))}
    </div>
  );
}
