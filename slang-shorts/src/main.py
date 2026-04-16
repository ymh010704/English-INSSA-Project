"""
slang-shorts 자동화 파이프라인 메인 엔트리포인트

흐름:
  DB에서 shorts_url이 없는 슬랭 조회
  → Gemini: 자막 + Veo 프롬프트 생성
  → Veo 3.1 Lite: 오디오 포함 영상 생성
  → FFmpeg: 자막 오버레이
  → GCS 업로드
  → DB: shorts_url 업데이트
"""

import os
import tempfile
import pymysql

from gemini import generate_script
from veo import generate_video
from ffmpeg_merge import add_subtitles
from storage import upload_to_gcs, save_shorts_url

DB_HOST     = os.environ.get("DB_HOST", "mysql")
DB_NAME     = os.environ["MYSQL_DATABASE"]
DB_USER     = os.environ["MYSQL_USER"]
DB_PASSWORD = os.environ["MYSQL_PASSWORD"]

BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "3"))


def fetch_pending_slangs() -> list[dict]:
    """shorts_url이 없는 슬랭 목록 조회"""
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT slang_id AS id, word, definition_ko, example_en, example_ko
                FROM slangs
                WHERE shorts_url IS NULL OR shorts_url = ''
                ORDER BY created_at ASC
                LIMIT %s
                """,
                (BATCH_SIZE,),
            )
            return cur.fetchall()
    finally:
        conn.close()


def process_slang(slang: dict):
    """단일 슬랭에 대한 전체 파이프라인 실행"""
    slang_id   = slang["id"]
    word       = slang["word"]
    def_ko     = slang["definition_ko"]
    example_en = slang["example_en"]
    example_ko = slang["example_ko"]

    print(f"\n{'='*50}")
    print(f"[Pipeline] 슬랭: {word} (id={slang_id})")
    print(f"{'='*50}")

    with tempfile.TemporaryDirectory() as tmpdir:
        video_raw  = os.path.join(tmpdir, "raw_video.mp4")
        final_path = os.path.join(tmpdir, "final.mp4")

        # Step 1: Gemini 스크립트 생성
        print("[Step 1] Gemini 스크립트 생성 중...")
        script     = generate_script(word, def_ko, example_en, example_ko)
        subtitles  = script["subtitles"]
        veo_prompt = script["veo_prompt"]
        print(f"  자막 수: {len(subtitles)}개")

        # Step 2: Veo 3.1 Lite 영상 생성 (오디오 포함)
        print("[Step 2] Veo 영상 생성 중...")
        generate_video(veo_prompt, video_raw, 8)

        # Step 3: FFmpeg 자막 오버레이
        print("[Step 3] FFmpeg 자막 오버레이 중...")
        add_subtitles(video_raw, subtitles, final_path)

        # Step 4: GCS 업로드
        print("[Step 4] GCS 업로드 중...")
        blob_name = f"shorts/{word.replace(' ', '_')}_{slang_id}.mp4"
        video_url = upload_to_gcs(final_path, blob_name)

        # Step 5: DB 저장
        print("[Step 5] DB 업데이트 중...")
        save_shorts_url(slang_id, video_url)

    print(f"[Pipeline] 완료: {word} → {video_url}")
    return video_url


def main():
    print("[slang-shorts] 파이프라인 시작")
    slangs = fetch_pending_slangs()

    if not slangs:
        print("[slang-shorts] 처리할 슬랭이 없습니다.")
        return

    print(f"[slang-shorts] 처리 대상: {len(slangs)}개")

    for slang in slangs:
        try:
            process_slang(slang)
        except Exception as e:
            print(f"[ERROR] slang_id={slang['id']} ({slang['word']}) 처리 실패: {e}")
            continue

    print("\n[slang-shorts] 전체 완료")


if __name__ == "__main__":
    main()
