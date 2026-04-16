import os
from google.cloud import storage
import pymysql

BUCKET_NAME = os.environ["GCS_BUCKET_NAME"]
DB_HOST     = os.environ.get("DB_HOST", "mysql")
DB_NAME     = os.environ["MYSQL_DATABASE"]
DB_USER     = os.environ["MYSQL_USER"]
DB_PASSWORD = os.environ["MYSQL_PASSWORD"]


def upload_to_gcs(local_path: str, destination_blob: str) -> str:
    """
    GCS 버킷에 파일 업로드
    반환: 공개 URL (gs:// 또는 https://)
    """
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(destination_blob)

    blob.upload_from_filename(local_path)

    # 균일한 버킷 액세스(Uniform Bucket-Level Access) 환경에서는
    # make_public() 대신 IAM으로 allUsers 읽기 권한을 버킷 단위로 부여해야 함
    # URL은 공개 형식으로 직접 생성
    url = f"https://storage.googleapis.com/{BUCKET_NAME}/{destination_blob}"
    print(f"[GCS] 업로드 완료: {url}")
    return url


def save_shorts_url(slang_id: int, video_url: str):
    """
    DB의 slangs 테이블에 shorts_url 업데이트
    """
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE slangs SET shorts_url = %s WHERE slang_id = %s",
                (video_url, slang_id),
            )
        conn.commit()
        print(f"[DB] slang_id={slang_id} shorts_url 저장 완료")
    finally:
        conn.close()
