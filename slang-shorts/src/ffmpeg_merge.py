import subprocess
import json
import os


def merge_video_audio_subtitles(
    video_path: str,
    audio_path: str,
    subtitles: list,   # [{"time": 0.0, "text": "..."}]
    output_path: str,
) -> str:
    """
    FFmpeg으로 영상 + 음성 합성 + 자막 오버레이
    반환: output_path
    """
    # 1. SRT 자막 파일 생성
    srt_path = output_path.replace(".mp4", ".srt")
    _write_srt(subtitles, srt_path)

    # 2. 영상 길이 확인 (오디오 기준으로 자름)
    audio_duration = _get_duration(audio_path)

    # 3. FFmpeg 합성
    # - 영상이 짧으면 loop, 오디오 길이에 맞춤
    # - 자막은 subtitles filter로 오버레이 (폰트: NotoSansCJK)
    srt_escaped = srt_path.replace("\\", "/").replace(":", "\\:")
    font_name = "Noto Sans CJK KR"

    cmd = [
        "ffmpeg", "-y",
        "-stream_loop", "-1",    # 영상 루프 (짧은 경우 대비)
        "-i", video_path,
        "-i", audio_path,
        "-t", str(audio_duration),
        "-vf", (
            f"subtitles={srt_escaped}:force_style="
            f"'FontName={font_name},FontSize=18,Bold=1,"
            f"PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,"
            f"Alignment=2,MarginV=40'"
        ),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"[FFmpeg] 합성 실패:\n{result.stderr}")

    print(f"[FFmpeg] 최종 영상 저장 완료: {output_path}")

    # 임시 SRT 파일 삭제
    if os.path.exists(srt_path):
        os.remove(srt_path)

    return output_path


def _write_srt(subtitles: list, srt_path: str):
    """subtitle 리스트를 .srt 형식으로 저장"""
    lines = []
    for i, sub in enumerate(subtitles, 1):
        start = sub["time"]
        # 다음 자막 시작 직전까지 표시 (마지막은 +3초)
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


def _get_duration(file_path: str) -> float:
    """ffprobe로 미디어 길이(초) 반환"""
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "json",
            file_path,
        ],
        capture_output=True, text=True,
    )
    data = json.loads(result.stdout)
    return float(data["format"]["duration"])
