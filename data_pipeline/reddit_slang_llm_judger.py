from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from openai import OpenAI


# =========================
# Configuration
# =========================
SCORED_CANDIDATES_PATH = Path("data_pipeline/data/scored_candidates.json")
CONTEXT_CACHE_PATH = Path("data_pipeline/candidate_context_cache.jsonl")
WORD_SUMMARY_PATH = Path("data_pipeline/output/word_summary.jsonl")
CONTEXT_JUDGMENTS_PATH = Path("data_pipeline/output/context_judgments.jsonl")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")
N0 = 60
BATCH_SIZE = 20
K_TARGET = 15
API_MAX_RETRIES = 5
API_RETRY_BASE = 2.0

VALID_SLANG_CATEGORIES = {"internet_slang", "aave", "general_slang", "colloquial"}

CLASSIFY_SYSTEM_PROMPT = (
    "You are a slang usage classifier with broad knowledge of contemporary English slang. "
    "For each Reddit context, decide if the target word is used in a slang or informal sense "
    "based on your own knowledge. "
    "Reply with JSON only."
)

GENERATE_DEF_SYSTEM_PROMPT = (
    "You are an expert English slang lexicographer for a Korean language-learning app. "
    "Based on the Reddit examples provided, write a concise slang definition (1-2 sentences) "
    "and categorize the slang type. Focus on the SLANG or informal meaning only. "
    "If examples are ambiguous, use your own knowledge of contemporary English slang. "
    "Reply with JSON only."
)


# =========================
# n_max
# =========================
def get_n_max(match_count: int) -> int:
    if match_count < 10_000:    return 100
    if match_count < 50_000:    return 120
    if match_count < 200_000:   return 140
    if match_count < 1_000_000: return 160
    return 200


# =========================
# Data loading
# =========================
def load_scored_candidates(path: Path) -> Dict[str, Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    result: Dict[str, Dict[str, Any]] = {}
    for item in data:
        if item.get("support_label") != "keep":
            continue
        nw = str(item.get("normalized_word", "")).strip()
        if not nw:
            continue
        result[nw] = {
            "normalized_word": nw,
            "match_count": int(item.get("match_count", 0) or 0),
        }
    return result


def load_context_cache(path: Path) -> Dict[str, List[Dict[str, Any]]]:
    result: Dict[str, List[Dict[str, Any]]] = {}
    if not path.exists():
        return result
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            nw = str(row.get("normalized_word", "")).strip()
            contexts = row.get("contexts")
            if nw and isinstance(contexts, list) and contexts:
                result[nw] = contexts
    return result


def load_previous_results(path: Path) -> Dict[str, str]:
    results: Dict[str, str] = {}
    if not path.exists():
        return results
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            try:
                row = json.loads(line)
                nw = str(row.get("normalized_word", "")).strip()
                decision = str(row.get("decision", "")).strip()
                if nw and decision:
                    results[nw] = decision
            except json.JSONDecodeError:
                continue
    return results


# =========================
# Slang classification LLM call
# =========================
def build_classify_prompt(word: str, contexts: List[Dict[str, Any]]) -> str:
    ctx_lines = []
    for i, ctx in enumerate(contexts):
        text = str(ctx.get("context_text", "")).strip()[:400]
        ctx_lines.append(f"[{i+1}] {text}")
    n = len(contexts)
    return (
        f'Word: "{word}"\n\n'
        f"Reddit contexts:\n" + "\n\n".join(ctx_lines) + "\n\n"
        f"For each context [1]~[{n}]:\n"
        f"- is_slang: true if the word is used in a slang, casual, or informal sense\n\n"
        f'Return JSON only: {{"results": [{{"is_slang": true}}, ...]}}'
    )


def call_llm_classify(
    client: OpenAI,
    word: str,
    contexts: List[Dict[str, Any]],
) -> List[bool]:
    """Returns list of is_slang booleans for each context."""
    if not contexts:
        return []
    prompt = build_classify_prompt(word, contexts)
    max_tok = max(400, len(contexts) * 15 + 100)
    last_err: Exception | None = None
    for attempt in range(1, API_MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": CLASSIFY_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=max_tok,
                temperature=0,
            )
            content = response.choices[0].message.content or ""
            payload = json.loads(content)
            results = payload.get("results", [])
            if not isinstance(results, list):
                raise ValueError(f"results is not a list: {content[:200]}")
            while len(results) < len(contexts):
                results.append({"is_slang": False})
            return [bool(r.get("is_slang", False)) if isinstance(r, dict) else bool(r)
                    for r in results[:len(contexts)]]
        except Exception as exc:
            last_err = exc
            if attempt < API_MAX_RETRIES:
                time.sleep(API_RETRY_BASE * (2 ** (attempt - 1)))
    raise RuntimeError(f"LLM classify failed after {API_MAX_RETRIES} attempts: {last_err}")


# =========================
# Definition generation LLM call
# =========================
def build_definition_prompt(word: str, slang_contexts: List[str], slang_ratio: float) -> str:
    ex_lines = "\n".join(f"[{i+1}] {ex[:300]}" for i, ex in enumerate(slang_contexts[:8]))
    return (
        f'Word: "{word}"\n'
        f"Slang usage rate: {slang_ratio:.0%} in Reddit\n\n"
        f"Reddit examples (slang usage only):\n{ex_lines}\n\n"
        f'Write a concise slang definition for "{word}" based strictly on the examples above.\n'
        f'Also categorize: "internet_slang" (memes/online), "aave" (African American Vernacular), '
        f'"general_slang" (common spoken slang), or "colloquial" (informal but not typical slang).\n'
        f'Return JSON only: {{"definition_en": "...", "slang_category": "internet_slang|aave|general_slang|colloquial"}}'
    )


def generate_definition(
    client: OpenAI,
    word: str,
    slang_contexts: List[str],
    slang_ratio: float,
) -> Tuple[str, Optional[str]]:
    """Returns (definition_en, slang_category). slang_category is None if generation fails."""
    if not slang_contexts:
        return "", None
    prompt = build_definition_prompt(word, slang_contexts, slang_ratio)
    last_err: Exception | None = None
    for attempt in range(1, API_MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": GENERATE_DEF_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=300,
                temperature=0,
            )
            content = response.choices[0].message.content or ""
            payload = json.loads(content)
            definition_en = str(payload.get("definition_en", "")).strip()
            slang_category = payload.get("slang_category")
            if slang_category not in VALID_SLANG_CATEGORIES:
                slang_category = None
            return definition_en, slang_category
        except Exception as exc:
            last_err = exc
            if attempt < API_MAX_RETRIES:
                time.sleep(API_RETRY_BASE * (2 ** (attempt - 1)))
    print(f"  [WARN] generate_definition failed for '{word}': {last_err}")
    return "", None


# =========================
# Word processing
# =========================
def process_word(
    client: OpenAI,
    word: str,
    match_count: int,
    contexts: List[Dict[str, Any]],
    judgments_out,
) -> Dict[str, Any]:
    n_max = get_n_max(match_count)
    contexts = contexts[:n_max]

    if len(contexts) < N0:
        return {
            "normalized_word": word,
            "decision": "drop",
            "sampled": len(contexts),
            "slang_hits": 0,
            "match_count": match_count,
            "definition_en": None,
            "slang_category": None,
            "note": "insufficient_contexts",
        }

    slang_context_texts: List[str] = []

    def run_batch(batch: List[Dict[str, Any]]) -> int:
        is_slang_flags = call_llm_classify(client, word, batch)
        hits = 0
        for ctx, is_slang in zip(batch, is_slang_flags):
            text = str(ctx.get("context_text", ""))[:400]
            row = {
                "normalized_word": word,
                "context_id": ctx.get("context_id", ""),
                "context_text": text,
                "is_slang": is_slang,
            }
            judgments_out.write(json.dumps(row, ensure_ascii=False) + "\n")
            if is_slang:
                hits += 1
                slang_context_texts.append(text)
        judgments_out.flush()
        return hits

    # Step 1: initial N0
    K = run_batch(contexts[:N0])
    n = N0
    print(f"  initial {N0}: K={K}")

    if K == 0:
        return {
            "normalized_word": word,
            "decision": "drop",
            "sampled": n,
            "slang_hits": K,
            "match_count": match_count,
            "definition_en": None,
            "slang_category": None,
        }

    # Step 2: extend in batches until K_TARGET or n_max
    while n < n_max and K < K_TARGET:
        batch = contexts[n:n + BATCH_SIZE]
        if not batch:
            break
        K += run_batch(batch)
        n += len(batch)
        print(f"  +{len(batch)}: n={n} K={K}")

    decision = "enough_evidence" if K >= K_TARGET else "holdout"

    # Generate definition from slang contexts
    slang_ratio = K / n if n > 0 else 0.0
    print(f"  generating definition from {len(slang_context_texts)} slang contexts...")
    definition_en, slang_category = generate_definition(client, word, slang_context_texts, slang_ratio)
    print(f"  -> category={slang_category}  def=\"{definition_en[:60]}\"")

    return {
        "normalized_word": word,
        "decision": decision,
        "sampled": n,
        "slang_hits": K,
        "match_count": match_count,
        "definition_en": definition_en,
        "slang_category": slang_category,
    }


# =========================
# Main
# =========================
def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY is not set.")

    print(f"[INFO] Model: {OPENAI_MODEL}")

    candidates = load_scored_candidates(SCORED_CANDIDATES_PATH)
    context_cache = load_context_cache(CONTEXT_CACHE_PATH)

    # drop 결정은 재실행하지 않음; 나머지는 재실행
    previous = load_previous_results(WORD_SUMMARY_PATH)
    skip_words = {w for w, d in previous.items() if d == "drop"}
    print(f"[INFO] Candidates: {len(candidates)} | Skip(drop): {len(skip_words)} | To process: {len(candidates)-len(skip_words)}")

    WORD_SUMMARY_PATH.parent.mkdir(parents=True, exist_ok=True)
    client = OpenAI(api_key=api_key)

    # drop 항목만 기존 파일에서 보존
    drop_rows: List[Dict[str, Any]] = []
    if WORD_SUMMARY_PATH.exists():
        with WORD_SUMMARY_PATH.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    row = json.loads(line)
                    if row.get("decision") == "drop":
                        drop_rows.append(row)
                except json.JSONDecodeError:
                    continue

    done = 0
    target = len(candidates) - len(skip_words)

    with WORD_SUMMARY_PATH.open("w", encoding="utf-8") as summary_out, \
         CONTEXT_JUDGMENTS_PATH.open("w", encoding="utf-8") as judgments_out:

        for row in drop_rows:
            summary_out.write(json.dumps(row, ensure_ascii=False) + "\n")

        for word, info in sorted(candidates.items()):
            if word in skip_words:
                continue

            contexts = context_cache.get(word, [])
            done += 1
            print(f"[{done}/{target}] {word} | contexts={len(contexts)} match={info['match_count']}")

            if not contexts:
                row = {
                    "normalized_word": word,
                    "decision": "drop",
                    "sampled": 0,
                    "slang_hits": 0,
                    "match_count": info["match_count"],
                    "definition_en": None,
                    "slang_category": None,
                    "note": "no_contexts",
                }
            else:
                row = process_word(
                    client=client,
                    word=word,
                    match_count=info["match_count"],
                    contexts=contexts,
                    judgments_out=judgments_out,
                )

            summary_out.write(json.dumps(row, ensure_ascii=False) + "\n")
            summary_out.flush()
            print(f"  -> {row['decision']} (n={row['sampled']}, K={row['slang_hits']})")

    print("[DONE]")


if __name__ == "__main__":
    main()
