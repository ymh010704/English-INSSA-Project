"""
rank_final_candidates.py

enough_evidence + holdout 단어를 학습 우선순위 기준으로 랭킹.

공식 (Formula H, Wiktionary-free):

  slang_ratio          = slang_hits / sampled
  raw_expected_slang   = match_count * slang_ratio
  expected_slang_capped= min(raw_expected_slang, EXPECTED_SLANG_CAP)

  cat_conf             = CATEGORY_CONF[slang_category]   # LLM 생성 카테고리
  cat_penalty          = (1 - cat_conf) * 0.4
  penalty              = min(0.95, cat_penalty * (1 - slang_ratio))

  priority_score       = log10(1 + expected_slang_capped) * (1 - penalty)

설계 근거:
- sls_direct(Wiktionary) 의존 제거: word_summary의 slang_category(LLM 생성)로 대체
- cat_conf=1.0(internet_slang/aave): penalty=0 → expected 기준 순수 정렬
- slang_ratio가 높으면 cat_penalty 효과 무력화 → 명확한 슬랭은 카테고리 불확실성 무관
- slang_ratio 이중반영 방지: expected에 이미 반영됐으므로 penalty만 사용
"""

from __future__ import annotations

import json
import math
from pathlib import Path

WORD_SUMMARY_PATH = Path("data_pipeline/output/word_summary.jsonl")
RANKED_FULL_PATH = Path("data_pipeline/stratified_review_output/ranked_candidates_full.json")
OUTPUT_PATH = Path("data_pipeline/output/ranked_candidates.jsonl")

HOLDOUT_MIN_HITS = 3
HOLDOUT_MIN_RATIO = 0.05 / 3  # p/3 ≈ 0.01667

EXPECTED_SLANG_CAP = 3_000_000

# LLM 생성 slang_category → ranking confidence
CATEGORY_CONF: dict[str, float] = {
    "internet_slang": 1.0,  # 명확한 인터넷 슬랭
    "aave": 1.0,             # AAVE (African American Vernacular English)
    "general_slang": 0.85,  # 일반 구어 슬랭
    "colloquial": 0.65,     # 구어체/비격식 (슬랭보다 약함)
}
CATEGORY_CONF_DEFAULT = 0.5  # slang_category가 None이거나 알 수 없는 경우

EXPLICIT_WORDS = {
    "ass", "asshole", "bitch", "cock", "cunt", "dick", "dildo", "fuck", "fucking",
    "motherfucker", "nigga", "nigger", "pussy", "shit", "slut", "whore",
}


def load_word_summary(path: Path) -> dict:
    result = {}
    with path.open(encoding="utf-8") as f:
        for line in f:
            try:
                row = json.loads(line)
                result[row["normalized_word"]] = row
            except (json.JSONDecodeError, KeyError):
                continue
    return result


def load_ranked_full(path: Path) -> dict:
    """dispersion_score, single_token 등 보조 필드 로드 (선택적)."""
    if not path.exists():
        return {}
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    return {x["normalized_word"]: x for x in data}


def compute_priority(
    match_count: int,
    slang_hits: int,
    sampled: int,
    slang_category: str | None,
) -> tuple[float, float, int]:
    slang_ratio = slang_hits / sampled if sampled > 0 else 0.0
    raw_expected = match_count * slang_ratio
    expected_capped = min(raw_expected, EXPECTED_SLANG_CAP)

    cat_conf = CATEGORY_CONF.get(slang_category or "", CATEGORY_CONF_DEFAULT)
    cat_penalty = (1.0 - cat_conf) * 0.4
    penalty = min(0.95, cat_penalty * (1.0 - slang_ratio))

    priority = math.log10(1 + expected_capped) * (1.0 - penalty)
    return round(priority, 6), round(slang_ratio, 6), round(raw_expected)


def is_holdout_included(slang_hits: int, slang_ratio: float) -> bool:
    return slang_hits >= HOLDOUT_MIN_HITS and slang_ratio >= HOLDOUT_MIN_RATIO


def main() -> None:
    print("[INFO] Loading word_summary...")
    ws = load_word_summary(WORD_SUMMARY_PATH)
    print(f"[INFO] Loaded {len(ws)} words")

    print("[INFO] Loading ranked_candidates_full (auxiliary fields)...")
    rc = load_ranked_full(RANKED_FULL_PATH)
    print(f"[INFO] Loaded {len(rc)} auxiliary entries")

    rows = []
    stats = {"enough_evidence": 0, "holdout_included": 0, "holdout_excluded": 0}

    for word, w in ws.items():
        decision = w["decision"]
        if decision == "drop":
            continue

        r = rc.get(word, {})
        slang_hits = w["slang_hits"]
        sampled = w["sampled"]
        match_count = w["match_count"]
        slang_category = w.get("slang_category")

        is_vulgar = word in EXPLICIT_WORDS

        priority, slang_ratio, raw_expected = compute_priority(
            match_count, slang_hits, sampled, slang_category
        )

        if decision == "holdout":
            included = is_holdout_included(slang_hits, slang_ratio)
            if not included:
                stats["holdout_excluded"] += 1
                continue
            stats["holdout_included"] += 1
        else:
            stats["enough_evidence"] += 1

        row = {
            "normalized_word": word,
            "decision": decision,
            "slang_ratio": slang_ratio,
            "slang_hits": slang_hits,
            "sampled": sampled,
            "match_count": match_count,
            "raw_expected_slang": raw_expected,
            "priority_score": priority,
            "slang_category": slang_category,
            "is_vulgar": is_vulgar,
            "dispersion_score": r.get("dispersion_score"),
            "single_token": r.get("single_token"),
            "holdout_included": (decision == "holdout"),
        }
        rows.append(row)

    rows.sort(key=lambda x: x["priority_score"], reverse=True)
    for i, row in enumerate(rows, 1):
        row["rank"] = i

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(f"\n[DONE] {len(rows)} words written to {OUTPUT_PATH}")
    print(f"  enough_evidence : {stats['enough_evidence']}")
    print(f"  holdout included: {stats['holdout_included']}")
    print(f"  holdout excluded: {stats['holdout_excluded']}")

    print("\n=== TOP 20 ===")
    for r in rows[:20]:
        print(f"  {r['rank']:4d}. {r['normalized_word']:<20} priority={r['priority_score']:.3f}  "
              f"slang_ratio={r['slang_ratio']:.3f}  raw_expected={r['raw_expected_slang']:,}  "
              f"category={r['slang_category']}")

    print("\n=== BOTTOM 10 ===")
    for r in rows[-10:]:
        print(f"  {r['rank']:4d}. {r['normalized_word']:<20} priority={r['priority_score']:.3f}  "
              f"slang_ratio={r['slang_ratio']:.3f}  raw_expected={r['raw_expected_slang']:,}  "
              f"category={r['slang_category']}")

    lookup = {r["normalized_word"]: r for r in rows}
    known = ["vibe", "fire", "cringe", "rizz", "slay", "sus", "cap", "bet", "low key",
             "woke", "based", "mid", "salty", "drip", "lmao", "ngl"]
    problem = ["never", "people", "go", "good", "way", "got", "one"]
    print("\n=== KNOWN SLANG 순위 ===")
    for w in known:
        e = lookup.get(w)
        if e:
            print(f"  {e['rank']:4d}. {w:<15} priority={e['priority_score']:.3f}  "
                  f"slang_ratio={e['slang_ratio']:.3f}  category={e['slang_category']}")
        else:
            print(f"   N/A  {w:<15} (not in output)")
    print("\n=== 문제 단어 순위 (낮을수록 좋음) ===")
    for w in problem:
        e = lookup.get(w)
        if e:
            print(f"  {e['rank']:4d}. {w:<15} priority={e['priority_score']:.3f}  "
                  f"slang_ratio={e['slang_ratio']:.3f}  category={e['slang_category']}")
        else:
            print(f"   N/A  {w:<15} (not in output / dropped)")


if __name__ == "__main__":
    main()
