import os
import re
import json
import random
from typing import Dict, List, Any, Iterable, Tuple, Set

try:
    import zstandard as zstd
except ImportError:
    zstd = None


# =========================
# 설정
# =========================
POLYSEMOUS_PATH = "data_pipeline/output/polysemous_candidates.json"

REDDIT_DUMP_PATHS = [
    "C:\\Users\\User\\Downloads\\reddit\\comments\\RC_2025-09.zst",
    "C:\\Users\\User\\Downloads\\reddit\\comments\\RC_2025-12.zst",
]

OUTPUT_PATH = "data_pipeline/output/polysemous_context_samples.json"

# 단어별 랜덤 샘플 개수
SAMPLE_SIZE = 100

# 너무 짧은 댓글은 버림
MIN_BODY_LEN = 8

# 진행 로그 간격
LOG_EVERY = 500000

# 랜덤 재현성
RANDOM_SEED = 42


# =========================
# 유틸
# =========================
def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def normalize_text(text: str) -> str:
    return normalize_space((text or "").lower())


def tokenize_for_match(text: str) -> List[str]:
    """
    매칭용 토큰화.
    - 영어/숫자
    - 중간 apostrophe 허용
    """
    return re.findall(r"[a-z0-9]+(?:'[a-z0-9]+)?", text.lower())


def iter_zst_json_lines(path: str) -> Iterable[Dict[str, Any]]:
    if zstd is None:
        raise ImportError(
            "zstandard 패키지가 필요함. 설치: pip install zstandard"
        )

    with open(path, "rb") as f:
        dctx = zstd.ZstdDecompressor(max_window_size=2**31)
        with dctx.stream_reader(f) as reader:
            buffer = b""
            while True:
                chunk = reader.read(1 << 20)  # 1MB
                if not chunk:
                    break
                buffer += chunk
                lines = buffer.split(b"\n")
                buffer = lines.pop()

                for line in lines:
                    if not line.strip():
                        continue
                    try:
                        yield json.loads(line)
                    except Exception:
                        continue

            if buffer.strip():
                try:
                    yield json.loads(buffer)
                except Exception:
                    pass


# =========================
# 후보 로딩 / 인덱스 구축
# =========================
def load_polysemous_candidates(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_candidate_indexes(
    rows: List[Dict[str, Any]]
) -> Tuple[
    Dict[str, Set[str]],          # single_token_map: form -> normalized_word set
    Dict[str, List[Tuple[Tuple[str, ...], str]]],  # phrase_first_token_map
    Dict[str, Dict[str, Any]],    # meta_map
]:
    single_token_map: Dict[str, Set[str]] = {}
    phrase_first_token_map: Dict[str, List[Tuple[Tuple[str, ...], str]]] = {}
    meta_map: Dict[str, Dict[str, Any]] = {}

    for row in rows:
        normalized_word = normalize_text(row.get("normalized_word", ""))
        if not normalized_word:
            continue

        surface_forms = row.get("surface_forms", []) or []
        all_forms = set()

        all_forms.add(normalized_word)
        for sf in surface_forms:
            sf_norm = normalize_text(sf)
            if sf_norm:
                all_forms.add(sf_norm)

        meta_map[normalized_word] = {
            "normalized_word": normalized_word,
            "surface_forms": sorted(all_forms),
            "sense_count": row.get("sense_count", 0),
            "match_count": row.get("match_count", 0),
            "subreddit_count": row.get("subreddit_count", 0),
            "source_labels": row.get("source_labels", []),
            "source_files": row.get("source_files", []),
            "definitions": row.get("definitions", []),
        }

        for form in all_forms:
            tokens = tokenize_for_match(form)
            if not tokens:
                continue

            if len(tokens) == 1:
                token = tokens[0]
                single_token_map.setdefault(token, set()).add(normalized_word)
            else:
                phrase_tuple = tuple(tokens)
                first_token = phrase_tuple[0]
                phrase_first_token_map.setdefault(first_token, []).append(
                    (phrase_tuple, normalized_word)
                )

    # 긴 phrase 우선 검사
    for first_token in phrase_first_token_map:
        phrase_first_token_map[first_token].sort(
            key=lambda x: len(x[0]), reverse=True
        )

    return single_token_map, phrase_first_token_map, meta_map


# =========================
# 댓글에서 매치 찾기
# =========================
def find_matches_in_comment(
    body: str,
    single_token_map: Dict[str, Set[str]],
    phrase_first_token_map: Dict[str, List[Tuple[Tuple[str, ...], str]]],
) -> Set[str]:
    matched_words: Set[str] = set()

    tokens = tokenize_for_match(body)
    if not tokens:
        return matched_words

    token_set = set(tokens)

    # 1) single token
    for tok in token_set:
        if tok in single_token_map:
            matched_words.update(single_token_map[tok])

    # 2) multi-word phrase
    n = len(tokens)
    for i, tok in enumerate(tokens):
        if tok not in phrase_first_token_map:
            continue

        candidates = phrase_first_token_map[tok]
        for phrase_tuple, normalized_word in candidates:
            plen = len(phrase_tuple)
            if i + plen > n:
                continue
            if tuple(tokens[i:i + plen]) == phrase_tuple:
                matched_words.add(normalized_word)

    return matched_words


# =========================
# Reservoir Sampling
# =========================
def reservoir_add(
    reservoir: List[Dict[str, Any]],
    seen_count: int,
    item: Dict[str, Any],
    k: int,
) -> None:
    """
    seen_count: 이 item 포함 후 총 관측 개수 (1-based)
    """
    if len(reservoir) < k:
        reservoir.append(item)
        return

    j = random.randint(1, seen_count)
    if j <= k:
        reservoir[j - 1] = item


# =========================
# 메인
# =========================
def main() -> None:
    random.seed(RANDOM_SEED)

    rows = load_polysemous_candidates(POLYSEMOUS_PATH)
    single_token_map, phrase_first_token_map, meta_map = build_candidate_indexes(rows)

    targets = set(meta_map.keys())

    stats: Dict[str, Dict[str, Any]] = {
        word: {
            "seen_matches": 0,   # 해당 단어가 등장한 댓글 수
            "samples": [],
        }
        for word in targets
    }

    total_comments = 0
    matched_comments = 0

    print(f"[INFO] polysemous 후보 수: {len(targets):,}")
    print(f"[INFO] single-token form 수: {len(single_token_map):,}")
    print(f"[INFO] phrase starter 수: {len(phrase_first_token_map):,}")
    print(f"[INFO] sample_size: {SAMPLE_SIZE}")

    for dump_path in REDDIT_DUMP_PATHS:
        print(f"\n[INFO] scanning: {dump_path}")

        for obj in iter_zst_json_lines(dump_path):
            total_comments += 1

            body = obj.get("body", "")
            if not isinstance(body, str):
                continue
            if body in ("[deleted]", "[removed]"):
                continue

            body_norm = normalize_space(body)
            if len(body_norm) < MIN_BODY_LEN:
                continue

            matched_words = find_matches_in_comment(
                body=body_norm,
                single_token_map=single_token_map,
                phrase_first_token_map=phrase_first_token_map,
            )

            if matched_words:
                matched_comments += 1

            subreddit = obj.get("subreddit", "")
            created_utc = obj.get("created_utc", None)
            comment_id = obj.get("id", "")
            permalink = obj.get("permalink", "")

            for normalized_word in matched_words:
                stats[normalized_word]["seen_matches"] += 1
                seen_count = stats[normalized_word]["seen_matches"]

                sample_item = {
                    "body": body_norm,
                    "subreddit": subreddit,
                    "created_utc": created_utc,
                    "comment_id": comment_id,
                    "permalink": permalink,
                    "source_file": os.path.basename(dump_path),
                }

                reservoir_add(
                    reservoir=stats[normalized_word]["samples"],
                    seen_count=seen_count,
                    item=sample_item,
                    k=SAMPLE_SIZE,
                )

            if total_comments % LOG_EVERY == 0:
                nonempty_targets = sum(
                    1 for w in targets if stats[w]["seen_matches"] > 0
                )
                print(
                    f"[PROGRESS] comments={total_comments:,} | "
                    f"matched_comments={matched_comments:,} | "
                    f"sampled_words={nonempty_targets:,}"
                )

    results: List[Dict[str, Any]] = []

    for normalized_word in sorted(targets):
        meta = meta_map[normalized_word]
        seen_matches = stats[normalized_word]["seen_matches"]
        samples = stats[normalized_word]["samples"]

        if seen_matches == 0:
            continue

        results.append({
            "normalized_word": normalized_word,
            "surface_forms": meta["surface_forms"],
            "sense_count": meta["sense_count"],
            "match_count_from_matched_candidates": meta["match_count"],
            "subreddit_count_from_matched_candidates": meta["subreddit_count"],
            "source_labels": meta["source_labels"],
            "source_files": meta["source_files"],
            "definitions": meta["definitions"],
            "sample_size_requested": SAMPLE_SIZE,
            "sampled_from_total_seen_matches_in_this_run": seen_matches,
            "sampled_context_count": len(samples),
            "contexts": samples,
        })

    results.sort(
        key=lambda x: (
            -x["sampled_from_total_seen_matches_in_this_run"],
            -x["sense_count"],
            x["normalized_word"],
        )
    )

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("\n[DONE]")
    print(f"총 댓글 수: {total_comments:,}")
    print(f"매치된 댓글 수: {matched_comments:,}")
    print(f"출력 단어 수: {len(results):,}")
    print(f"저장 파일: {OUTPUT_PATH}")

    print("\n[상위 20개 미리보기]")
    for row in results[:20]:
        print(
            f"- {row['normalized_word']}"
            f" | run_seen={row['sampled_from_total_seen_matches_in_this_run']:,}"
            f" | sampled={row['sampled_context_count']}"
            f" | senses={row['sense_count']}"
        )


if __name__ == "__main__":
    main()