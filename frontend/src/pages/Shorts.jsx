import { useEffect, useRef, useState } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";

function ShortsItem({ s, isActive, volume, muted, onVolumeChange, onToggleMute }) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) video.play().catch(() => {});
    else { video.pause(); video.currentTime = 0; }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const toggleMute = onToggleMute;

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration || isDragging.current) return;
    setProgress(video.currentTime / video.duration);
  };

  const seekTo = (clientX) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = ratio * video.duration;
    setProgress(ratio);
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    seekTo(e.clientX);
    const onMove = (e) => seekTo(e.clientX);
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // 터치 지원
  const handleTouchStart = (e) => {
    isDragging.current = true;
    seekTo(e.touches[0].clientX);
    const onMove = (e) => seekTo(e.touches[0].clientX);
    const onEnd = () => {
      isDragging.current = false;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div style={{
      height: "100%",
      scrollSnapAlign: "start",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    }}>
      {/* 영상 + 진행 바 묶음 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <video
          ref={videoRef}
          src={s.shorts_url}
          loop
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
          onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
          style={{ width: "100%", maxHeight: "72vh", objectFit: "contain", cursor: "pointer", display: "block" }}
        />

        {/* 진행 바 — 영상 바로 아래 */}
        <div style={{ width: "100%", padding: "8px 0 4px" }}>
          <div
            ref={progressRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              width: "100%", height: 4, borderRadius: 2,
              background: "rgba(255,255,255,0.25)", cursor: "pointer",
            }}
          >
            <div style={{
              width: `${progress * 100}%`, height: "100%",
              background: "#ff4d00", borderRadius: 2,
            }} />
          </div>
        </div>
      </div>

      {/* 하단 그라데이션 */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* 단어 설명 */}
      <div style={{ position: "absolute", bottom: 40, left: 20, right: 70, color: "#fff" }}>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>{s.word}</div>
        <div style={{ fontSize: 14, marginTop: 6, opacity: 0.95 }}>{s.definition_ko}</div>
        <div style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>"{s.example_en}"</div>
      </div>

      {/* 볼륨 컨트롤 */}
      <div style={{
        position: "absolute", bottom: 50, right: 16,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <button onClick={toggleMute} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#fff", display: "flex" }}>
          {muted || volume === 0
            ? <VolumeX size={20} strokeWidth={1.8} />
            : volume < 0.5
            ? <Volume1 size={20} strokeWidth={1.8} />
            : <Volume2 size={20} strokeWidth={1.8} />}
        </button>
        <input
          type="range" min={0} max={1} step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => { const v = parseFloat(e.target.value); onVolumeChange(v); }}
          style={{ writingMode: "vertical-lr", direction: "rtl", width: 4, height: 80, cursor: "pointer", accentColor: "#ff4d00" }}
        />
      </div>
    </div>
  );
}

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const savedVol = parseFloat(localStorage.getItem("shorts_volume") ?? "1");
  const [volume, setVolume] = useState(savedVol);
  const [muted, setMuted] = useState(false);
  const prevVolume = useRef(savedVol);

  const updateVolume = (v) => {
    setVolume(v);
    if (muted) setMuted(false);
    localStorage.setItem("shorts_volume", v);
  };

  const toggleMute = () => {
    if (!muted) { prevVolume.current = volume; setMuted(true); }
    else { setMuted(false); updateVolume(prevVolume.current || 1); }
  };

  useEffect(() => {
    fetch("/api/slangs/shorts")
      .then((r) => r.json())
      .then((data) => setShorts(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
    setCurrent(index);
  };

  if (loading) return (
    <div style={{ height: "100%", backgroundColor: "#000", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 20px 80px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ width: 140, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.12)", marginBottom: 10, animation: "shimmer 1.4s infinite linear", backgroundImage: "linear-gradient(90deg,rgba(255,255,255,0.06) 25%,rgba(255,255,255,0.14) 50%,rgba(255,255,255,0.06) 75%)", backgroundSize: "200% 100%" }} />
        <div style={{ width: "90%", height: 14, borderRadius: 6, background: "rgba(255,255,255,0.08)", marginBottom: 6, animation: "shimmer 1.4s infinite linear", backgroundImage: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%" }} />
        <div style={{ width: "70%", height: 14, borderRadius: 6, background: "rgba(255,255,255,0.08)", animation: "shimmer 1.4s infinite linear", backgroundImage: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%" }} />
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory", backgroundColor: "#000" }}
    >
      {shorts.length === 0 && (
        <div style={{ color: "#fff", textAlign: "center", paddingTop: "40vh", fontSize: 18 }}>쇼츠가 없어요</div>
      )}
      {shorts.map((s, i) => (
        <ShortsItem
          key={s.slang_id}
          s={s}
          isActive={i === current}
          volume={volume}
          muted={muted}
          onVolumeChange={updateVolume}
          onToggleMute={toggleMute}
        />
      ))}
    </div>
  );
}
