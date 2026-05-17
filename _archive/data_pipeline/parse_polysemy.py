import json
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Set

INPUT_PATH = "data_pipeline/output/matched_candidates.json"
OUTPUT_ALL_POLYSEMOUS_PATH = "data_pipeline/output/polysemous_candidates.json"
OUTPUT_PRIORITY_PATH = "data_pipeline/output/polysemous_priority_candidates.json"


def norm_text(text: str) -> str:
    """정의 중복 제거용 정규화"""
    return " ".join((text or "").strip().lower().split())


def load_json(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main() -> None:
    rows = load_json(INPUT_PATH)

    grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for row in rows:
        normalized_word = (row.get("normalized_word") or "").strip().lower()
        if not normalized_word:
            continue
        if not row.get("matched", False):
            continue
        grouped[normalized_word].append(row)

    polysemous_results: List[Dict[str, Any]] = []

    for normalized_word, items in grouped.items():
        definitions_seen: Set[str] = set()
        definitions: List[Dict[str, Any]] = []
        surface_forms: Set[str] = set()
        source_labels: Set[str] = set()
        source_files: Set[str] = set()

        match_count = 0
        subreddit_count = 0

        for item in items:
            word = (item.get("word") or "").strip()
            if word:
                surface_forms.add(word)

            for label in item.get("source_label", []):
                if label:
                    source_labels.add(label)

            for sf in item.get("source_files", []):
                if sf:
                    source_files.add(sf)

            # 같은 normalized_word 묶음이면 보통 같은 값이지만,
            # 혹시 다르면 최대값으로 보수적으로 저장
            match_count = max(match_count, int(item.get("match_count", 0) or 0))
            subreddit_count = max(subreddit_count, int(item.get("subreddit_count", 0) or 0))

            definition_en = (item.get("definition_en") or "").strip()
            example_en = (item.get("example_en") or "").strip()

            key = norm_text(definition_en)
            if key and key not in definitions_seen:
                definitions_seen.add(key)
                definitions.append({
                    "word": word,
                    "definition_en": definition_en,
                    "example_en": example_en,
                    "source_label": item.get("source_label", []),
                })

        sense_count = len(definitions)

        # 핵심: 정의가 2개 이상이면 다의어 후보
        if sense_count >= 2:
            polysemous_results.append({
                "normalized_word": normalized_word,
                "surface_forms": sorted(surface_forms),
                "sense_count": sense_count,
                "match_count": match_count,
                "subreddit_count": subreddit_count,
                "source_labels": sorted(source_labels),
                "source_files": sorted(source_files),
                "definitions": definitions,
                "single_token": " " not in normalized_word,
                "priority_score": (
                    sense_count * 3
                    + (1 if " " not in normalized_word else 0) * 2
                    + (1 if match_count >= 10000 else 0) * 2
                    + (1 if subreddit_count >= 1000 else 0)
                ),
            })

    # 전체 다의어 후보 저장
    polysemous_results.sort(
        key=lambda x: (
            -x["sense_count"],
            -x["match_count"],
            -x["subreddit_count"],
            x["normalized_word"],
        )
    )
    save_json(OUTPUT_ALL_POLYSEMOUS_PATH, polysemous_results)

    # "문맥 재검사 우선순위"용 파일
    # 실전적으로는 단일 토큰 + 빈도 높은 애들이 더 위험함
    priority_results = [
        x for x in polysemous_results
        if x["single_token"] and x["match_count"] >= 1000
    ]
    priority_results.sort(
        key=lambda x: (
            -x["priority_score"],
            -x["match_count"],
            -x["sense_count"],
            x["normalized_word"],
        )
    )
    save_json(OUTPUT_PRIORITY_PATH, priority_results)

    print(f"전체 matched normalized_word 수: {len(grouped):,}")
    print(f"다의어 후보 수(sense_count >= 2): {len(polysemous_results):,}")
    print(f"우선 재검사 후보 수(single_token & match_count>=1000): {len(priority_results):,}")

    # 상위 20개 미리 보기
    print("\n[상위 우선 재검사 후보 20개]")
    for row in priority_results[:20]:
        print(
            f"- {row['normalized_word']}"
            f" | senses={row['sense_count']}"
            f" | match_count={row['match_count']:,}"
            f" | subreddit_count={row['subreddit_count']:,}"
        )


if __name__ == "__main__":
    main()