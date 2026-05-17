"""
split_for_review.py

final_dataset.jsonl을 두 버킷으로 분류:
- auto_approved.jsonl : 고신뢰 슬랭 (바로 사용 가능)
- needs_review.jsonl  : 인간 검토 필요

auto 기준:
  pure_slang AND slang_ratio >= 0.6

review 기준 (auto가 아닌 것 중):
  - 기존 curated 범위: pure_slang>=0.4 OR informal_slang>=0.7
  - 중요 pure_slang (ratio 낮아도 rank<=2000): fire, sus, cap, mid, bro, based 등
  - 핵심 informal_slang (ratio>=0.4, rank<=1000): bet, dude 등
"""

from __future__ import annotations

import json
from pathlib import Path

INPUT_PATH   = Path("data_pipeline/output/final_dataset.jsonl")
AUTO_PATH    = Path("data_pipeline/output/auto_approved.jsonl")
REVIEW_PATH  = Path("data_pipeline/output/needs_review.jsonl")

AUTO_PURE_RATIO    = 0.6   # pure_slang 자동 승인 기준
REVIEW_PURE_RATIO  = 0.4   # curated 범위 pure_slang
REVIEW_INF_RATIO   = 0.7   # curated 범위 informal_slang
REVIEW_PURE_RANK   = 2000  # 중요 단어 rank 상한 (ratio 낮아도 포함)
REVIEW_INF_RANK    = 1000  # 핵심 informal rank 상한
REVIEW_INF_MIN     = 0.4   # 핵심 informal 최소 ratio
REVIEW_PURE_MIN    = 0.1   # 중요 pure_slang 최소 ratio


def is_auto(r: dict) -> bool:
    return r["slang_tier"] == "pure_slang" and r["slang_ratio"] >= AUTO_PURE_RATIO


def is_review(r: dict) -> bool:
    if is_auto(r):
        return False
    tier  = r["slang_tier"]
    ratio = r["slang_ratio"]
    rank  = r["rank"]

    if tier == "pure_slang":
        # 기존 curated 범위
        if ratio >= REVIEW_PURE_RATIO:
            return True
        # rank 상위 중요 단어 (fire, sus, cap, mid, bro, based 등)
        if ratio >= REVIEW_PURE_MIN and rank <= REVIEW_PURE_RANK:
            return True

    if tier == "informal_slang":
        # 기존 curated 범위
        if ratio >= REVIEW_INF_RATIO:
            return True
        # 핵심 informal (bet, dude 등)
        if ratio >= REVIEW_INF_MIN and rank <= REVIEW_INF_RANK:
            return True

    return False


def main() -> None:
    rows = []
    with INPUT_PATH.open(encoding="utf-8") as f:
        for line in f:
            rows.append(json.loads(line))
    print(f"[INFO] Loaded {len(rows)} words from {INPUT_PATH}")

    auto_rows   = [r for r in rows if is_auto(r)]
    review_rows = [r for r in rows if is_review(r)]

    # review_status 필드 추가
    for r in auto_rows:
        r["review_status"] = "auto_approved"
    for r in review_rows:
        r["review_status"] = "needs_review"

    INPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with AUTO_PATH.open("w", encoding="utf-8") as f:
        for r in auto_rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    with REVIEW_PATH.open("w", encoding="utf-8") as f:
        for r in review_rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"\n[DONE]")
    print(f"  auto_approved → {AUTO_PATH}  ({len(auto_rows)}개)")
    print(f"  needs_review  → {REVIEW_PATH}  ({len(review_rows)}개)")

    # 핵심 단어 확인
    lookup = {r["word"]: r for r in auto_rows + review_rows}
    check = ["lmao", "fire", "vibe", "sus", "cap", "bet", "mid", "based",
             "bro", "cringe", "rizz", "dude", "never", "goat"]
    print("\n=== 핵심 단어 분류 결과 ===")
    for w in check:
        e = lookup.get(w)
        if e:
            print(f"  {w:<12} {e['review_status']:<15} "
                  f"tier={e['slang_tier']:<16} ratio={e['slang_ratio']:.2f}  rank={e['rank']}")
        else:
            print(f"  {w:<12} excluded")

    # auto 상위 20개
    print("\n=== auto_approved 상위 20개 ===")
    for r in auto_rows[:20]:
        print(f"  {r['rank']:4d}. {r['word']:<15} ratio={r['slang_ratio']:.2f}  "
              f"def={r['definition_en'][:45]}")


if __name__ == "__main__":
    main()
