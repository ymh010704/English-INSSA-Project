import json
import math
from pathlib import Path
from collections import defaultdict
from typing import Any, Dict, List


# -----------------------------
# 설정값            
# -----------------------------
INPUT_PATH = "data_pipeline/data/filtered_candidates.json"          # 입력 파일
OUTPUT_PATH = "data_pipeline/data/scored_candidates.json"         # 출력 파일

MATCH_WEIGHT = 0.6
SUBREDDIT_WEIGHT = 0.4

KEEP_THRESHOLD = 3.65
PRUNE_THRESHOLD = 3.20


# -----------------------------
# 유틸
# -----------------------------
def safe_int(value: Any, default: int = 0) -> int:
    try:
        if value is None:
            return default
        return int(value)
    except (TypeError, ValueError):
        return default


def normalize_word_key(item: Dict[str, Any]) -> str:
    key = item.get("normalized_word") or item.get("word") or ""
    return str(key).strip().lower()


def compute_support_score(match_count: int, subreddit_count: int) -> float:
    """
    support_score = 0.6 * log10(1 + match_count) + 0.4 * log10(1 + subreddit_count)
    """
    return (
        MATCH_WEIGHT * math.log10(1 + max(match_count, 0))
        + SUBREDDIT_WEIGHT * math.log10(1 + max(subreddit_count, 0))
    )


def classify_support(score: float) -> str:
    if score >= KEEP_THRESHOLD:
        return "keep"
    if score < PRUNE_THRESHOLD:
        return "prune"
    return "gray_zone"


# -----------------------------
# 집계
# -----------------------------
def aggregate_candidates(raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    sense별 raw item들을 normalized_word 기준으로 묶는다.
    match_count / subreddit_count는 sense마다 동일한 경우가 많으므로 sum이 아니라 max 사용.
    """
    grouped: Dict[str, Dict[str, Any]] = {}

    for item in raw_items:
        key = normalize_word_key(item)
        if not key:
            continue

        if key not in grouped:
            grouped[key] = {
                "normalized_word": key,
                "surface_forms": set(),
                "definitions": [],
                "source_labels": set(),
                "source_files": set(),
                "match_count": 0,
                "subreddit_count": 0,
            }

        g = grouped[key]

        word = item.get("word")
        if word:
            g["surface_forms"].add(str(word).strip())

        source_labels = item.get("source_label") or []
        if isinstance(source_labels, list):
            for label in source_labels:
                if label:
                    g["source_labels"].add(str(label).strip())

        source_files = item.get("source_files") or []
        if isinstance(source_files, list):
            for sf in source_files:
                if sf:
                    g["source_files"].add(str(sf).strip())

        definition_obj = {
            "word": item.get("word", ""),
            "definition_en": item.get("definition_en", ""),
            "example_en": item.get("example_en", ""),
            "source_label": source_labels if isinstance(source_labels, list) else [],
        }
        g["definitions"].append(definition_obj)

        g["match_count"] = max(g["match_count"], safe_int(item.get("match_count")))
        g["subreddit_count"] = max(
            g["subreddit_count"], safe_int(item.get("subreddit_count"))
        )

    aggregated = []
    for _, g in grouped.items():
        aggregated.append(
            {
                "normalized_word": g["normalized_word"],
                "surface_forms": sorted(g["surface_forms"]),
                "definitions": g["definitions"],
                "match_count": g["match_count"],
                "subreddit_count": g["subreddit_count"],
                "source_labels": sorted(g["source_labels"]),
                "source_files": sorted(g["source_files"]),
                "sense_count": len(g["definitions"]),
            }
        )

    return aggregated


# -----------------------------
# 점수 부여
# -----------------------------
def score_candidates(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    scored = []

    for item in candidates:
        match_count = safe_int(item.get("match_count"))
        subreddit_count = safe_int(item.get("subreddit_count"))

        score = compute_support_score(match_count, subreddit_count)
        support_label = classify_support(score)

        new_item = dict(item)
        new_item["support_score"] = round(score, 6)
        new_item["support_label"] = support_label
        scored.append(new_item)

    scored.sort(
        key=lambda x: (
            x["support_score"],
            safe_int(x.get("match_count")),
            safe_int(x.get("subreddit_count")),
        ),
        reverse=True,
    )

    for rank, item in enumerate(scored, start=1):
        item["support_rank"] = rank

    return scored


# -----------------------------
# 요약 출력
# -----------------------------
def print_summary(scored: List[Dict[str, Any]]) -> None:
    counts = defaultdict(int)
    for item in scored:
        counts[item["support_label"]] += 1

    print(f"total candidates: {len(scored)}")
    print(f"keep:      {counts['keep']}")
    print(f"gray_zone: {counts['gray_zone']}")
    print(f"prune:     {counts['prune']}")
    print()

    print("top 20 candidates:")
    for item in scored[:20]:
        print(
            f"{item['support_rank']:>4} | "
            f"{item['normalized_word']:<20} | "
            f"score={item['support_score']:.4f} | "
            f"match={item['match_count']:<8} | "
            f"subs={item['subreddit_count']:<6} | "
            f"{item['support_label']}"
        )


# -----------------------------
# 실행
# -----------------------------
def main() -> None:
    input_path = Path(INPUT_PATH)
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {INPUT_PATH}")

    with input_path.open("r", encoding="utf-8") as f:
        raw = json.load(f)

    if not isinstance(raw, list):
        raise ValueError("Input JSON must be a list of objects.")

    aggregated = aggregate_candidates(raw)
    scored = score_candidates(aggregated)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(scored, f, ensure_ascii=False, indent=2)

    print_summary(scored)
    print()
    print(f"saved: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()