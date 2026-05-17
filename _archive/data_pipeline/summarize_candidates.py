import json
import math
from statistics import median

PATH = "data_pipeline/data/candidate_usage_stats.json"  # 필요하면 경로 수정

def percentile(sorted_vals, p):
    if not sorted_vals:
        return None
    k = (len(sorted_vals) - 1) * p
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_vals[int(k)]
    d0 = sorted_vals[f] * (c - k)
    d1 = sorted_vals[c] * (k - f)
    return d0 + d1

def summarize(name, rows):
    print(f"\n===== {name} =====")
    print(f"count = {len(rows):,}")
    if not rows:
        return

    match_counts = sorted(r["match_count"] for r in rows)
    subreddit_counts = sorted(r["subreddit_count"] for r in rows)
    source_file_counts = sorted(len(r.get("source_files", [])) for r in rows)

    def show_dist(label, vals):
        print(f"\n[{label}]")
        print(f"min   = {vals[0]:,.0f}")
        print(f"p10   = {percentile(vals, 0.10):,.0f}")
        print(f"p25   = {percentile(vals, 0.25):,.0f}")
        print(f"p50   = {percentile(vals, 0.50):,.0f}")
        print(f"p75   = {percentile(vals, 0.75):,.0f}")
        print(f"p90   = {percentile(vals, 0.90):,.0f}")
        print(f"p95   = {percentile(vals, 0.95):,.0f}")
        print(f"p99   = {percentile(vals, 0.99):,.0f}")
        print(f"max   = {vals[-1]:,.0f}")

    show_dist("match_count", match_counts)
    show_dist("subreddit_count", subreddit_counts)
    show_dist("source_file_count", source_file_counts)

    print("\n[low-count buckets]")
    for t in [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]:
        n = sum(1 for r in rows if r["match_count"] <= t)
        print(f"match_count <= {t:>4}: {n:>8,} ({n/len(rows)*100:6.2f}%)")

    print("\n[low-subreddit buckets]")
    for t in [1, 2, 3, 5, 10, 20, 50, 100]:
        n = sum(1 for r in rows if r["subreddit_count"] <= t)
        print(f"subreddit_count <= {t:>3}: {n:>8,} ({n/len(rows)*100:6.2f}%)")

    print("\n[source files]")
    for t in [1, 2]:
        n = sum(1 for r in rows if len(r.get("source_files", [])) == t)
        print(f"source_file_count == {t}: {n:>8,} ({n/len(rows)*100:6.2f}%)")

    print("\n[top 20 lowest nonzero match_count]")
    low = sorted(rows, key=lambda r: (r["match_count"], r["subreddit_count"], r["normalized_word"]))[:20]
    for r in low:
        print(
            f'{r["normalized_word"][:40]:40}  '
            f'match={r["match_count"]:>8,}  '
            f'subreddits={r["subreddit_count"]:>6,}  '
            f'sources={len(r.get("source_files", []))}'
        )

    print("\n[top 20 highest match_count]")
    high = sorted(rows, key=lambda r: r["match_count"], reverse=True)[:20]
    for r in high:
        print(
            f'{r["normalized_word"][:40]:40}  '
            f'match={r["match_count"]:>8,}  '
            f'subreddits={r["subreddit_count"]:>6,}  '
            f'sources={len(r.get("source_files", []))}'
        )

with open(PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

matched = [r for r in data if r.get("matched") is True]

unigram = [r for r in matched if len(r["normalized_word"].split()) == 1]
multiword = [r for r in matched if len(r["normalized_word"].split()) >= 2]

print(f"total matched normalized words = {len(matched):,}")
summarize("UNIGRAM", unigram)
summarize("MULTIWORD", multiword)

print("\n===== COMBO FILTER COUNTS =====")
rules = {
    "R1_match<=10": lambda r: r["match_count"] <= 10,
    "R2_match<=50": lambda r: r["match_count"] <= 50,
    "R3_match<=100": lambda r: r["match_count"] <= 100,
    "R4_subreddit==1": lambda r: r["subreddit_count"] == 1,
    "R5_sourcefile==1": lambda r: len(r.get("source_files", [])) == 1,
    "R6_match<=50_and_subreddit==1": lambda r: r["match_count"] <= 50 and r["subreddit_count"] == 1,
    "R7_match<=100_and_subreddit<=2": lambda r: r["match_count"] <= 100 and r["subreddit_count"] <= 2,
    "R8_match<=100_and_sourcefile==1": lambda r: r["match_count"] <= 100 and len(r.get("source_files", [])) == 1,
    "R9_match<=100_and_subreddit<=2_and_sourcefile==1": lambda r: (
        r["match_count"] <= 100 and
        r["subreddit_count"] <= 2 and
        len(r.get("source_files", [])) == 1
    ),
}

for name, fn in rules.items():
    n = sum(1 for r in matched if fn(r))
    print(f"{name:45} -> {n:>8,} ({n/len(matched)*100:6.2f}%)")