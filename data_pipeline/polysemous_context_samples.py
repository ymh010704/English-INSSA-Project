import os
import re
import json
from typing import Dict, List, Iterable, Optional

# zst 지원
try:
    import zstandard as zstd
except ImportError:
    zstd = None


# =========================
# 설정
# =========================
POLYSEMOUS_PATH = "data_pipeline/output/polysemous_priority_candidates.json"

REDDIT_DUMP_PATHS = [
    "C:\\Users\\User\\Downloads\\reddit\\comments\\RC_2025-09.zst",
    "C:\\Users\\User\\Downloads\\reddit\\comments\\RC_2025-12.zst",
]

OUTPUT_PATH = "polysemous_context_samples.json"

# 단어당 최대 샘플 수
MAX_SAMPLES_PER_WORD = 100

# 문맥 앞뒤 글자 수
CONTEXT_WINDOW = 100

# 너무 짧은 댓글은 무시할지 여부
MIN_BODY_LEN = 3


# =========================
# 유틸
# =========================
def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def iter_zst_json_lines(path: str) -> Iterable[dict]:
    """
    .zst Reddit JSONL 파일을 한 줄씩 읽어 dict로 반환
    """
    if zstd is None:
        raise ImportError("zstandard가 설치되어 있지 않습니다. pip install zstandard")

    with open(path, "rb") as f:
        dctx = zstd.ZstdDecompressor(max_window_size=2**31)
        with dctx.stream_reader(f) as reader:
            buffer = ""
            while True:
                chunk = reader.read(1024 * 1024)
                if not chunk:
                    break
                buffer += chunk.decode("utf-8", errors="ignore")

                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        yield json.loads(line)
                    except Exception:
                        continue

            if buffer.strip():
                try:
                    yield json.loads(buffer.strip())
                except Exception:
                    pass


def build_word_patterns(words: List[str]) -> Dict[str, re.Pattern]:
    """
    normalized_word별 regex 패턴 생성
    - 단일 단어: \bword\b
    - phrase: 공백을 \s+ 로 허용
    """
    patterns = {}

    for word in words:
        escaped = re.escape(word)
        if " " in word:
            escaped = escaped.replace(r"\ ", r"\s+")
            pattern = re.compile(rf"(?<!\w){escaped}(?!\w)", re.IGNORECASE)
        else:
            pattern = re.compile(rf"\b{escaped}\b", re.IGNORECASE)

        patterns[word] = pattern

    return patterns


def extract_context(text: str, start: int, end: int, window: int = CONTEXT_WINDOW) -> str:
    left = max(0, start - window)
    right = min(len(text), end + window)
    snippet = text[left:right].replace("\n", " ").strip()
    return snippet


def all_words_filled(samples_by_word: Dict[str, List[dict]], max_samples: int) -> bool:
    return all(len(v) >= max_samples for v in samples_by_word.values())


# =========================
# 메인
# =========================
def main():
    polysemous_data = load_json(POLYSEMOUS_PATH)

    target_words = []
    meta_by_word = {}

    for row in polysemous_data:
        w = (row.get("normalized_word") or "").strip().lower()
        if not w:
            continue
        target_words.append(w)
        meta_by_word[w] = {
            "sense_count": row.get("sense_count", 0),
            "match_count": row.get("match_count", 0),
            "subreddit_count": row.get("subreddit_count", 0),
            "surface_forms": row.get("surface_forms", []),
            "definitions": row.get("definitions", []),
        }

    target_words = sorted(set(target_words))
    print(f"타깃 단어 수: {len(target_words):,}")

    patterns = build_word_patterns(target_words)

    # 단어별 샘플 저장소
    samples_by_word: Dict[str, List[dict]] = {w: [] for w in target_words}

    # 중복 댓글 저장 방지용
    # (같은 단어에 대해 같은 body를 여러 번 넣는 것 방지)
    seen_body_per_word: Dict[str, set] = {w: set() for w in target_words}

    for dump_path in REDDIT_DUMP_PATHS:
        print(f"\n처리 시작: {dump_path}")
        file_name = os.path.basename(dump_path)
        processed = 0
        matched_lines = 0

        for obj in iter_zst_json_lines(dump_path):
            processed += 1
            if processed % 500000 == 0:
                print(f"  - 처리 댓글 수: {processed:,}")

            body = obj.get("body", "")
            if not isinstance(body, str) or len(body) < MIN_BODY_LEN:
                continue

            # 삭제된 댓글 등 스킵
            if body in ("[deleted]", "[removed]"):
                continue

            # 이미 모든 단어 샘플을 다 채웠으면 중단
            if all_words_filled(samples_by_word, MAX_SAMPLES_PER_WORD):
                print("  - 모든 타깃 단어 샘플 수집 완료. 조기 종료.")
                break

            for word, pattern in patterns.items():
                # 이미 이 단어 샘플이 다 찼으면 스킵
                if len(samples_by_word[word]) >= MAX_SAMPLES_PER_WORD:
                    continue

                match = pattern.search(body)
                if not match:
                    continue

                # 같은 body 중복 저장 방지
                body_key = body[:500]
                if body_key in seen_body_per_word[word]:
                    continue

                seen_body_per_word[word].add(body_key)
                matched_lines += 1

                snippet = extract_context(body, match.start(), match.end(), CONTEXT_WINDOW)

                sample = {
                    "normalized_word": word,
                    "matched_text": body[match.start():match.end()],
                    "context": snippet,
                    "full_body": body,
                    "subreddit": obj.get("subreddit", ""),
                    "author": obj.get("author", ""),
                    "created_utc": obj.get("created_utc", None),
                    "score": obj.get("score", None),
                    "source_file": file_name,
                    "permalink": obj.get("permalink", ""),
                }

                samples_by_word[word].append(sample)

        print(f"처리 완료: {file_name}")
        print(f"  - 총 읽은 댓글 수: {processed:,}")
        print(f"  - 매치 저장 횟수: {matched_lines:,}")

        # 이 파일 끝난 뒤 현재 진행 상황 출력
        filled = sum(1 for w in target_words if len(samples_by_word[w]) >= MAX_SAMPLES_PER_WORD)
        print(f"  - 샘플 완료 단어 수: {filled:,} / {len(target_words):,}")

        if all_words_filled(samples_by_word, MAX_SAMPLES_PER_WORD):
            break

    # 출력 구조 정리
    output = []
    for word in target_words:
        output.append({
            "normalized_word": word,
            "sense_count": meta_by_word[word]["sense_count"],
            "match_count": meta_by_word[word]["match_count"],
            "subreddit_count": meta_by_word[word]["subreddit_count"],
            "surface_forms": meta_by_word[word]["surface_forms"],
            "definitions": meta_by_word[word]["definitions"],
            "sample_count": len(samples_by_word[word]),
            "samples": samples_by_word[word],
        })

    save_json(OUTPUT_PATH, output)

    print(f"\n저장 완료: {OUTPUT_PATH}")

    # 샘플 부족 단어도 확인
    insufficient = [x for x in output if x["sample_count"] < MAX_SAMPLES_PER_WORD]
    print(f"샘플 부족 단어 수: {len(insufficient):,}")

    if insufficient:
        print("\n[샘플 부족 단어 예시 20개]")
        for row in insufficient[:20]:
            print(f"- {row['normalized_word']} : {row['sample_count']}개")


if __name__ == "__main__":
    main()