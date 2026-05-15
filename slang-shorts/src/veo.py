import os
import time
from google import genai
from google.genai import types

# Vertex AI를 통한 Veo 사용 (GCP 크레딧 차감)
client = genai.Client(
    vertexai=True,
    project=os.environ["GCP_PROJECT_ID"],
    location=os.environ.get("GCP_LOCATION", "us-central1"),
)

MODEL = os.environ.get("VEO_MODEL", "veo-3.1-lite-generate-001")


def generate_video(veo_prompt: str, output_path: str, duration_seconds: int = 8) -> str:
    """
    Gemini API Veo 3.1 Lite로 오디오 포함 영상 생성
    반환: output_path
    """
    print(f"[Veo] 영상 생성 시작 (모델: {MODEL})")

    operation = client.models.generate_videos(
        model=MODEL,
        prompt=veo_prompt,
        config=types.GenerateVideosConfig(
            aspect_ratio="9:16",
            duration_seconds=duration_seconds,
            number_of_videos=1,
        ),
    )

    # 완료될 때까지 폴링
    while not operation.done:
        print("[Veo] 영상 생성 중...")
        time.sleep(10)
        operation = client.operations.get(operation)

    # 결과 저장
    result = operation.result
    if result is None or not result.generated_videos:
        raise RuntimeError(
            f"[Veo] 영상 생성 실패 — filtered: {getattr(result, 'rai_media_filtered_count', '?')}, "
            f"reasons: {getattr(result, 'rai_media_filtered_reasons', '?')}"
        )
    generated_video = result.generated_videos[0]
    with open(output_path, "wb") as f:
        f.write(generated_video.video.video_bytes)

    print(f"[Veo] 영상 저장 완료: {output_path}")
    return output_path
