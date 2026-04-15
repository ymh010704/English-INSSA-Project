import os
import time
import requests

# Veo API는 Vertex AI (Google Cloud) 를 통해 사용
# https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos

PROJECT_ID = os.environ["GCP_PROJECT_ID"]
LOCATION   = os.environ.get("GCP_LOCATION", "us-central1")


def _get_access_token() -> str:
    """gcloud 인증 토큰 가져오기"""
    import subprocess
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True
    )
    return result.stdout.strip()


def generate_video(veo_prompt: str, output_path: str, duration_seconds: int = 8) -> str:
    """
    Veo API로 영상 생성 후 로컬에 저장
    반환: output_path
    """
    token = _get_access_token()
    base_url = f"https://{LOCATION}-aiplatform.googleapis.com/v1"
    endpoint  = f"{base_url}/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/veo-2.0-generate-001:predictLongRunning"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    payload = {
        "instances": [{
            "prompt": veo_prompt,
        }],
        "parameters": {
            "aspectRatio": "9:16",
            "durationSeconds": duration_seconds,
            "sampleCount": 1,
        }
    }

    # 비동기 작업 시작
    resp = requests.post(endpoint, headers=headers, json=payload)
    resp.raise_for_status()
    operation_name = resp.json()["name"]
    print(f"[Veo] 작업 시작: {operation_name}")

    # 완료 폴링
    op_url = f"{base_url}/{operation_name}"
    for _ in range(60):  # 최대 5분 대기
        time.sleep(5)
        op_resp = requests.get(op_url, headers=headers)
        op_data = op_resp.json()
        if op_data.get("done"):
            break
        print("[Veo] 영상 생성 중...")

    # 결과 영상 다운로드
    video_b64 = op_data["response"]["predictions"][0]["bytesBase64Encoded"]
    import base64
    with open(output_path, "wb") as f:
        f.write(base64.b64decode(video_b64))

    print(f"[Veo] 영상 저장 완료: {output_path}")
    return output_path
