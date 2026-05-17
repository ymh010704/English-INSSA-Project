import json
from pathlib import Path
from typing import Any, Dict, List, Set


# -----------------------------
# 설정
# -----------------------------
SCORED_PATH = "data_pipeline/data/scored_candidates.json"

# 네가 준 positive seed들
POSITIVE_SEEDS = [
    "on god",
    "rizz",
    "cringe",
    "low key",
    "high key",
    "salty",
    "chill",
    "touch grass",
    "feral",
    "snowflake",
    "gas",
    "cook",
    "grind",
    "blow up",
    "mess with",
    "fit",
    "sick",
]

# 선택: 비교용 negative seed도 넣을 수 있음
NEGATIVE_SEEDS = [
    "good",
    "want",
    "story",
    "million",
    "close to",
    "come from",
]

# threshold sweep 범위
SWEEP_START = 2.80
SWEEP_END = 4.20
SWEEP_STEP = 0.05

# 보존 목표
TARGET_RECALLS = [1.00, 0.95, 0.90]


# -----------------------------
# 유틸
# -----------------------------
def normalize_text(s: Any) -> str:
    return str(s or "").strip().lower()


def load_json(path: str) -> List[Dict[str, Any]]:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {path}")
    with p.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("JSON must be a list.")
    return data


def index_by_normalized_word(items: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    out: Dict[str, Dict[str, Any]] = {}
    for item in items:
        key = normalize_text(item.get("normalized_word") or item.get("word"))
        if key:
            out[key] = item
    return out


def frange(start: float, end: float, step: float):
    x = start
    while x <= end + 1e-9:
        yield round(x, 4)
        x += step


def safe_float(x: Any, default: float = 0.0) -> float:
    try:
        if x is None:
            return default
        return float(x)
    except (TypeError, ValueError):
        return default


# -----------------------------
# 평가 함수
# -----------------------------
def print_seed_status(
    seed_name: str,
    seed_words: List[str],
    indexed: Dict[str, Dict[str, Any]],
) -> Dict[str, Any]:
    print(f"\n[{seed_name}]")
    found = []
    missing = []

    for seed in seed_words:
        key = normalize_text(seed)
        item = indexed.get(key)
        if item is None:
            missing.append(seed)
            continue

        label = item.get("support_label", "unknown")
        score = safe_float(item.get("support_score"))
        match_count = item.get("match_count", 0)
        subreddit_count = item.get("subreddit_count", 0)

        found.append(
            {
                "seed": seed,
                "label": label,
                "score": score,
                "match_count": match_count,
                "subreddit_count": subreddit_count,
            }
        )

    for row in found:
        print(
            f"{row['seed']:<12} | "
            f"{row['label']:<9} | "
            f"score={row['score']:.4f} | "
            f"match={row['match_count']:<8} | "
            f"subs={row['subreddit_count']}"
        )

    if missing:
        print("\nmissing:")
        for seed in missing:
            print(f"  - {seed}")

    counts = {"keep": 0, "gray_zone": 0, "prune": 0, "other": 0}
    for row in found:
        label = row["label"]
        if label in counts:
            counts[label] += 1
        else:
            counts["other"] += 1

    total = len(seed_words)
    found_n = len(found)
    keep_recall = counts["keep"] / total if total else 0.0
    survive_recall = (counts["keep"] + counts["gray_zone"]) / total if total else 0.0

    print("\nsummary:")
    print(f"  total seeds      : {total}")
    print(f"  found in file    : {found_n}")
    print(f"  keep             : {counts['keep']}")
    print(f"  gray_zone        : {counts['gray_zone']}")
    print(f"  prune            : {counts['prune']}")
    print(f"  keep recall      : {keep_recall:.3f}")
    print(f"  survive recall   : {survive_recall:.3f}   (keep + gray_zone)")

    return {
        "found": found,
        "missing": missing,
        "counts": counts,
        "keep_recall": keep_recall,
        "survive_recall": survive_recall,
    }


def sweep_prune_threshold(
    items: List[Dict[str, Any]],
    positive_seeds: List[str],
    indexed: Dict[str, Dict[str, Any]],
) -> None:
    print("\n[threshold sweep: prune by support_score only]")

    # seed -> score 매핑
    seed_scores = {}
    missing = []
    for seed in positive_seeds:
        item = indexed.get(normalize_text(seed))
        if item is None:
            missing.append(seed)
            continue
        seed_scores[seed] = safe_float(item.get("support_score"))

    if missing:
        print("warning: some positive seeds not found, sweep recall will exclude them:")
        for seed in missing:
            print(f"  - {seed}")

    total_items = len(items)
    valid_seed_count = len(seed_scores)

    if valid_seed_count == 0:
        print("No valid positive seeds found. Sweep aborted.")
        return

    rows = []
    for threshold in frange(SWEEP_START, SWEEP_END, SWEEP_STEP):
        pruned_items = 0
        for item in items:
            score = safe_float(item.get("support_score"))
            if score < threshold:
                pruned_items += 1

        kept_items = total_items - pruned_items
        compression = pruned_items / total_items

        kept_seed_count = sum(1 for score in seed_scores.values() if score >= threshold)
        recall = kept_seed_count / valid_seed_count

        rows.append(
            {
                "threshold": threshold,
                "pruned_items": pruned_items,
                "kept_items": kept_items,
                "compression": compression,
                "seed_recall": recall,
            }
        )

    print("\nall sweep results:")
    for row in rows:
        print(
            f"thr={row['threshold']:.2f} | "
            f"seed_recall={row['seed_recall']:.3f} | "
            f"pruned={row['pruned_items']}/{total_items} "
            f"({row['compression']:.3%})"
        )

    print("\nrecommended thresholds by target recall:")
    for target in TARGET_RECALLS:
        candidates = [r for r in rows if r["seed_recall"] >= target]
        if not candidates:
            print(f"  target recall {target:.2f}: no threshold found")
            continue

        # recall 만족하는 후보 중 가장 많이 prune하는 threshold
        best = max(candidates, key=lambda r: (r["compression"], r["threshold"]))
        print(
            f"  target recall {target:.2f} -> "
            f"thr={best['threshold']:.2f}, "
            f"seed_recall={best['seed_recall']:.3f}, "
            f"pruned={best['pruned_items']}/{total_items} "
            f"({best['compression']:.3%})"
        )


# -----------------------------
# 실행
# -----------------------------
def main() -> None:
    items = load_json(SCORED_PATH)
    indexed = index_by_normalized_word(items)

    print(f"loaded candidates: {len(items)}")

    positive_result = print_seed_status("positive seeds", POSITIVE_SEEDS, indexed)

    if NEGATIVE_SEEDS:
        print_seed_status("negative seeds", NEGATIVE_SEEDS, indexed)

    sweep_prune_threshold(items, POSITIVE_SEEDS, indexed)

    print("\ninterpretation guide:")
    print("  - keep recall 이 높을수록 네 seed들이 keep에 잘 남은 것")
    print("  - survive recall 이 높을수록 네 seed들이 prune은 안 당한 것")
    print("  - threshold sweep은 prune threshold를 올렸을 때")
    print("    seed를 몇 % 살리면서 전체 후보를 얼마나 더 줄일 수 있는지 보여줌")


if __name__ == "__main__":
    main()