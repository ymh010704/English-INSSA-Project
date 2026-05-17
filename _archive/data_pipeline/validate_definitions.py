"""
validate_definitions.py  (Stage 9.5)

final_dataset.jsonl의 definition_en이 실제 슬랭 의미를 정확히 담고 있는지
reddit_examples를 ground truth로 삼아 LLM으로 검증·교정한다.

실행 (enrich_dataset.py 이후, split_for_review.py 이전):
  python data_pipeline/validate_definitions.py [--mode all|problems|high_ratio|rewrite] [--with-korean] [--no-resume]

옵션:
  --mode all         전체 검증
  --mode problems    짧거나 잘린 정의만
  --mode high_ratio  slang_ratio >= 0.5 단어만
  --mode rewrite     reddit_examples 기반으로 정의 전면 재작성 (Wiktionary 무시)
  --with-korean      definition_ko도 함께 교정 (rewrite 미지원)
  --no-resume        체크포인트 무시하고 처음부터 재시작
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Optional

from openai import OpenAI

# enrich_dataset.py에서 수동 패치 목록과 서브셋 판별 함수 재사용
sys.path.insert(0, str(Path(__file__).parent))
from enrich_dataset import (
    DEFINITION_PATCHES,
    _is_auto,
    _is_curated,
    _is_review,
    write_jsonl,
)

# ─── 경로 ───────────────────────────────────────────────────────────────────
FINAL_PATH           = Path("data_pipeline/output/final_dataset.jsonl")
CURATED_PATH         = Path("data_pipeline/output/curated_dataset.jsonl")
AUTO_PATH            = Path("data_pipeline/output/auto_approved.jsonl")
REVIEW_PATH          = Path("data_pipeline/output/needs_review.jsonl")
CHECKPOINT_PATH      = Path("data_pipeline/output/validation_results.jsonl")
REWRITE_CHECKPOINT_PATH = Path("data_pipeline/output/rewrite_results.jsonl")

# ─── 설정 ────────────────────────────────────────────────────────────────────
OPENAI_MODEL    = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")
API_MAX_RETRIES = 4
API_RETRY_BASE  = 2.0

SYSTEM_PROMPT = (
    "You are an expert English slang lexicographer for a language-learning app. "
    "Your job is to check if a slang definition has a CRITICAL error — not to improve it.\n\n"
    "Default to is_adequate=true. Only set is_adequate=false when ALL of the following apply:\n"
    "1. The current definition describes a completely different meaning from what the Reddit examples show.\n"
    "2. A Korean learner reading the definition would be genuinely misled about the word's meaning.\n"
    "3. The error is clear and obvious — not a matter of completeness or nuance.\n\n"
    "Do NOT set is_adequate=false if:\n"
    "- The definition is correct but could be more detailed.\n"
    "- The definition captures the main meaning but misses a secondary usage.\n"
    "- You would simply word it differently.\n"
    "- The examples show multiple meanings and the definition covers at least one well.\n\n"
    "Provide a corrected definition ONLY when is_adequate=false. Keep it concise (1-2 sentences).\n"
    "Reply with JSON only."
)

REWRITE_SYSTEM_PROMPT = (
    "You are an expert English slang lexicographer for a Korean language-learning app. "
    "Write a concise slang definition (1-2 sentences) for the given word "
    "based strictly on how it is used in the provided Reddit examples. "
    "Focus on the SLANG or informal meaning — ignore literal/dictionary meanings. "
    "If the examples are ambiguous, use your own knowledge of contemporary English slang. "
    "Reply with JSON only."
)


# ─── 노이즈 예문 필터 ────────────────────────────────────────────────────────
def _is_usable_example(text: str) -> bool:
    """비영어/URL/노이즈 예문 제거."""
    t = text.strip()
    if not t or len(t) < 15:
        return False
    if t.startswith("![") or t.startswith("http://") or t.startswith("https://"):
        return False
    non_ascii = sum(1 for c in t if ord(c) > 127)
    if non_ascii / len(t) > 0.30:
        return False
    return True


def filter_examples(examples: list[str]) -> list[str]:
    """사용 가능한 예문만 반환. 모두 걸리면 원본 유지."""
    filtered = [ex for ex in examples if _is_usable_example(ex)]
    return filtered if filtered else examples


# ─── 대상 선별 ────────────────────────────────────────────────────────────────
def _is_problem_def(definition_en: str) -> bool:
    d = (definition_en or "").strip()
    if len(d) < 15:
        return True
    if d and d[0] in (";", ",", ".", "-"):
        return True
    if ";" in d[:20] or (d[:20].count(",") >= 2):
        return True
    return False


def should_validate(row: dict, mode: str) -> bool:
    word = row.get("word", "")
    # 수동 패치된 단어는 보호 — 모든 모드에서 스킵
    if word in DEFINITION_PATCHES:
        return False
    if mode == "rewrite":
        # 예문이 있는 단어 전체 재작성
        return len(row.get("reddit_examples") or []) > 0
    if mode == "all":
        return True
    if mode == "problems":
        return _is_problem_def(row.get("definition_en", ""))
    if mode == "high_ratio":
        return float(row.get("slang_ratio", 0)) >= 0.5
    return False


# ─── LLM 호출 ─────────────────────────────────────────────────────────────────
def build_prompt(
    word: str,
    definition_en: str,
    examples: list[str],
    slang_ratio: float,
    with_korean: bool,
) -> str:
    ex_lines = "\n".join(f"[{i+1}] {ex[:300]}" for i, ex in enumerate(examples[:6]))
    ko_instruction = (
        "\n- definition_ko: Korean translation of the corrected definition "
        "(only if is_adequate=false, else null)"
        if with_korean
        else ""
    )
    ko_field = ', "definition_ko": null or "..."' if with_korean else ""
    return (
        f'Word: "{word}"\n'
        f'Current definition: "{definition_en}"\n'
        f"Slang usage rate: {slang_ratio:.0%} of Reddit contexts\n\n"
        f"Reddit examples (ground truth):\n{ex_lines}\n\n"
        f"For this word:\n"
        f"- is_adequate: true if the current definition accurately captures "
        f"the slang meaning shown in the examples above\n"
        f"- reason: one-sentence explanation\n"
        f"- definition_en: corrected slang definition (only if is_adequate=false, else null)"
        f"{ko_instruction}\n\n"
        f'Return JSON only: {{"word": "...", "is_adequate": true/false, "reason": "..."{ko_field}, "definition_en": null or "..."}}'
    )


def build_rewrite_prompt(word: str, examples: list[str], slang_ratio: float) -> str:
    ex_lines = "\n".join(f"[{i+1}] {ex[:300]}" for i, ex in enumerate(examples[:6]))
    return (
        f'Word: "{word}"\n'
        f"Slang usage rate: {slang_ratio:.0%} of Reddit contexts\n\n"
        f"Reddit examples (real usage):\n{ex_lines}\n\n"
        f'Write a concise slang definition for "{word}" as shown in the examples above.\n'
        f'Return JSON only: {{"word": "...", "definition_en": "..."}}'
    )


def call_llm(
    client: OpenAI,
    word: str,
    definition_en: str,
    examples: list[str],
    slang_ratio: float,
    with_korean: bool,
    rewrite: bool = False,
) -> dict[str, Any]:
    if rewrite:
        prompt = build_rewrite_prompt(word, examples, slang_ratio)
        system = REWRITE_SYSTEM_PROMPT
        max_tok = 200
    else:
        prompt = build_prompt(word, definition_en, examples, slang_ratio, with_korean)
        system = SYSTEM_PROMPT
        max_tok = 300 if not with_korean else 450

    last_err: Optional[Exception] = None
    for attempt in range(1, API_MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=max_tok,
                temperature=0,
            )
            content = response.choices[0].message.content or "{}"
            result = json.loads(content)
            result.setdefault("word", word)
            if rewrite:
                # rewrite 결과는 항상 적용 — apply_corrections가 is_adequate=False일 때만 쓰므로 강제 설정
                result["is_adequate"] = False
                result.setdefault("definition_en", None)
            else:
                result.setdefault("is_adequate", True)
                result.setdefault("reason", "")
                result.setdefault("definition_en", None)
                if with_korean:
                    result.setdefault("definition_ko", None)
            return result
        except Exception as exc:
            last_err = exc
            if attempt < API_MAX_RETRIES:
                time.sleep(API_RETRY_BASE * (2 ** (attempt - 1)))
    raise RuntimeError(f"LLM call failed after {API_MAX_RETRIES} attempts for '{word}': {last_err}")


# ─── 체크포인트 ──────────────────────────────────────────────────────────────
def load_checkpoint(path: Path) -> dict[str, dict]:
    """word → result 매핑 로드."""
    done: dict[str, dict] = {}
    if not path.exists():
        return done
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
                w = row.get("word", "")
                if w:
                    done[w] = row
            except json.JSONDecodeError:
                continue
    return done


# ─── 교정 적용 ────────────────────────────────────────────────────────────────
def apply_corrections(
    final_rows: list[dict],
    corrections: dict[str, dict],
    with_korean: bool,
) -> tuple[list[dict], int]:
    """검증/재작성 결과를 final_dataset rows에 적용. 수동 패치 단어는 덮어쓰지 않음."""
    corrected = 0
    for row in final_rows:
        word = row.get("word", "")
        result = corrections.get(word)
        if not result:
            continue
        if result.get("is_adequate"):
            continue
        if word in DEFINITION_PATCHES:
            continue
        new_def = result.get("definition_en")
        if new_def and isinstance(new_def, str) and new_def.strip():
            row["definition_en"] = new_def.strip()
            row["_auto_corrected"] = True
            corrected += 1
        if with_korean:
            new_ko = result.get("definition_ko")
            if new_ko and isinstance(new_ko, str) and new_ko.strip():
                row["definition_ko"] = new_ko.strip()
    return final_rows, corrected


def regenerate_subsets(final_rows: list[dict]) -> None:
    curated     = [r for r in final_rows if _is_curated(r)]
    auto_rows   = [dict(r, review_status="auto_approved") for r in final_rows if _is_auto(r)]
    review_rows = [dict(r, review_status="needs_review")  for r in final_rows if _is_review(r)]

    write_jsonl(curated,     CURATED_PATH)
    write_jsonl(auto_rows,   AUTO_PATH)
    write_jsonl(review_rows, REVIEW_PATH)

    print(f"  curated_dataset  -> {CURATED_PATH}  ({len(curated)}개)")
    print(f"  auto_approved    -> {AUTO_PATH}  ({len(auto_rows)}개)")
    print(f"  needs_review     -> {REVIEW_PATH}  ({len(review_rows)}개)")


# ─── Main ─────────────────────────────────────────────────────────────────────
def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description="Stage 9.5: LLM definition validation / rewrite")
    parser.add_argument(
        "--mode", choices=["all", "problems", "high_ratio", "rewrite"], default="problems",
        help="검증 대상 범위 (기본: problems)",
    )
    parser.add_argument(
        "--with-korean", action="store_true",
        help="definition_ko도 함께 교정 (rewrite 모드 미지원)",
    )
    parser.add_argument(
        "--no-resume", action="store_true",
        help="체크포인트 무시하고 처음부터",
    )
    args = parser.parse_args()

    is_rewrite = args.mode == "rewrite"
    ckpt_path = REWRITE_CHECKPOINT_PATH if is_rewrite else CHECKPOINT_PATH

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY is not set.")

    print(f"[INFO] Model: {OPENAI_MODEL} | Mode: {args.mode} | Korean: {args.with_korean}")

    final_rows: list[dict] = []
    with FINAL_PATH.open(encoding="utf-8") as f:
        for line in f:
            final_rows.append(json.loads(line))
    print(f"[INFO] Loaded {len(final_rows)} words from {FINAL_PATH}")

    to_validate = [r for r in final_rows if should_validate(r, args.mode)]
    print(f"[INFO] 처리 대상: {len(to_validate)}개 / 수동 패치 스킵: {len(DEFINITION_PATCHES)}개")

    if args.no_resume:
        done_results: dict[str, dict] = {}
        ckpt_path.unlink(missing_ok=True)
    else:
        done_results = load_checkpoint(ckpt_path)
    skipped = sum(1 for r in to_validate if r.get("word") in done_results)
    print(f"[INFO] 이미 완료: {skipped}개 / 남은 작업: {len(to_validate)-skipped}개")

    client = OpenAI(api_key=api_key)
    ckpt_path.parent.mkdir(parents=True, exist_ok=True)

    newly_done = 0
    rewritten = 0
    with ckpt_path.open("a", encoding="utf-8") as ckpt:
        for i, row in enumerate(to_validate):
            word = row.get("word", "")
            if word in done_results:
                continue

            examples = filter_examples(row.get("reddit_examples") or [])
            if not examples:
                result: dict[str, Any] = {
                    "word": word,
                    "is_adequate": True,
                    "reason": "no examples available",
                    "definition_en": None,
                }
            else:
                result = call_llm(
                    client=client,
                    word=word,
                    definition_en=row.get("definition_en", ""),
                    examples=examples,
                    slang_ratio=float(row.get("slang_ratio", 0)),
                    with_korean=args.with_korean,
                    rewrite=is_rewrite,
                )

            done_results[word] = result
            ckpt.write(json.dumps(result, ensure_ascii=False) + "\n")
            ckpt.flush()
            newly_done += 1

            if not result.get("is_adequate"):
                rewritten += 1
                new_def = result.get("definition_en") or "(없음)"
                if newly_done % 50 == 1 or is_rewrite:
                    print(
                        f"  [{i+1}/{len(to_validate)}] {word!r}: "
                        f"{row.get('definition_en','')[:35]!r} -> {new_def[:35]!r}"
                    )
            elif newly_done % 100 == 0:
                print(f"  [{i+1}/{len(to_validate)}] {newly_done} processed, {rewritten} rewritten so far...")

    action = "재작성" if is_rewrite else "교정"
    print(f"\n[INFO] 완료: {newly_done}개 처리, {rewritten}개 {action}됨")

    final_rows, corrected = apply_corrections(final_rows, done_results, args.with_korean)
    print(f"[INFO] final_dataset에 {corrected}개 정의 적용")

    for r in final_rows:
        r.pop("_auto_corrected", None)

    write_jsonl(final_rows, FINAL_PATH)
    print(f"[DONE] final_dataset.jsonl updated")

    regenerate_subsets(final_rows)

    lookup = {r["word"]: r for r in final_rows}
    check = ["gooner", "goon", "bet", "sus", "goat", "fire", "cap", "rizz", "slay", "wtf"]
    print("\n=== 핵심 단어 정의 확인 ===")
    for w in check:
        e = lookup.get(w)
        if e:
            tag = "[PATCH]" if w in DEFINITION_PATCHES else "[REWRITE]" if is_rewrite else "[AUTO]"
            if w in DEFINITION_PATCHES:
                tag = "[PATCH]"
            print(f"  {w:<12}{tag} {e.get('definition_en','')[:60]}")


if __name__ == "__main__":
    main()
