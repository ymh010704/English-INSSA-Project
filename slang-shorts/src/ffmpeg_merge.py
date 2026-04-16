import subprocess
import json
import os


def add_subtitles(
    video_path: str,
    subtitles: list,   # [{"time": 0.0, "text": "..."}]
    output_path: str,
) -> str:
    """
    FFmpeg으로 영상에 자막 오버레이 (Veo 3.1 오디오 내장 버전)
    반환: output_path
    """
    # 1. SRT 자막 파일 생성
    srt_path = output_path.replace(".mp4", ".srt")
    _write_srt(subtitles, srt_path)

    srt_escaped = srt_path.replace("\\", "/").replace(":", "\\:")
    font_name = "Noto Sans CJK KR"

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", (
            f"subtitles={srt_escaped}:force_style="
            f"'FontName={font_name},FontSize=12,Bold=1,"
            f"PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,"
            f"Alignment=2,MarginV=40'"
        ),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "copy",   # 기존 오디오 그대로 유지
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"[FFmpeg] 자막 합성 실패:\n{result.stderr}")

    print(f"[FFmpeg] 최종 영상 저장 완료: {output_path}")

    if os.path.exists(srt_path):
        os.remove(srt_path)

    return output_path


def _write_srt(subtitles: list, srt_path: str):
    """subtitle 리스트를 .srt 형식으로 저장"""
    lines = []
    for i, sub in enumerate(subtitles, 1):
        start = sub["time"]
        if i < len(subtitles):
            end = subtitles[i]["time"] - 0.1
        else:
            end = start + 3.0

        lines.append(str(i))
        lines.append(f"{_fmt_time(start)} --> {_fmt_time(end)}")
        lines.append(sub["text"])
        lines.append("")

    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def _fmt_time(seconds: float) -> str:
    """초 → SRT 시간 형식 HH:MM:SS,mmm"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
