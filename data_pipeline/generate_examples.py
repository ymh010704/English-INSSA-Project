"""
generate_examples.py

service_public_approved.json의 각 단어에 대해:
  - example_en: 학습자용 일상 대화체 영어 예문 (LLM 생성)
  - example_ko: 자연스러운 한국어 번역 (LLM 생성)

배치 처리:
  - GPT-4.1-nano 사용 (저비용)
  - 20개 단어씩 배치
  - 체크포인트: example_gen_progress.jsonl (재실행 시 skip)

실행:
  python data_pipeline/generate_examples.py
  python data_pipeline/generate_examples.py --reset   # 체크포인트 초기화 후 재시작
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

from openai import OpenAI

INPUT_PATH    = Path("data_pipeline/output/service_public_approved.json")
PROGRESS_PATH = Path("data_pipeline/output/example_gen_progress.jsonl")

OPENAI_MODEL   = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")
BATCH_SIZE     = 20
API_MAX_RETRY  = 4
API_RETRY_BASE = 2.0

SYSTEM_PROMPT = (
    "You are a language learning content editor for Korean adults learning English slang.\n"
    "For each slang word, generate:\n"
    "1. One natural, everyday conversational English example sentence (1 sentence, under 20 words)\n"
    "   - Casual context: texting friends, hanging out, social media comment\n"
    "   - No profanity, no sexual content, no violent content\n"
    "   - The slang word must appear in the sentence\n"
    "   - The context must clearly show the slang's meaning\n"
    "2. A natural Korean translation of that sentence (not literal — match the feeling and tone)\n\n"
    "Return JSON: {\"results\": [{\"word\": \"...\", \"example_en\": \"...\", \"example_ko\": \"...\"}, ...]}"
)

USER_TEMPLATE = (
    "Process these slang words. "
    "Return JSON: {{\"results\": [{{\"word\": \"...\", \"example_en\": \"...\", \"example_ko\": \"...\"}}]}}\n\n"
    "{items}"
)


def build_batch_prompt(batch: list[dict]) -> str:
    lines = []
    for item in batch:
        cats = ", ".join(item.get("category") or [])
        lines.append(
            f'- word: "{item["word"]}", '
            f'definition_en: "{item.get("definition_en", "")}", '
            f'definition_ko: "{item.get("definition_ko", "")}", '
            f'category: ["{cats}"]'
        )
    return USER_TEMPLATE.format(items="\n".join(lines))


def call_llm(client: OpenAI, batch: list[dict]) -> dict[str, dict]:
    """batch의 각 단어에 대해 example_en, example_ko 생성.

    Returns:
        dict[str, dict]: word → {"example_en": ..., "example_ko": ...}
    """
    prompt = build_batch_prompt(batch)
    max_tok = len(batch) * 120 + 200

    last_err: Exception | None = None
    for attempt in range(1, API_MAX_RETRY + 1):
        try:
            resp = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=max_tok,
                temperature=0,
            )
            content = resp.choices[0].message.content or ""
            payload = json.loads(content)
            results = payload.get("results", [])
            return {
                r["word"]: {
                    "example_en": r.get("example_en", ""),
                    "example_ko": r.get("example_ko", ""),
                }
                for r in results
                if "word" in r and r.get("example_en")
            }
        except Exception as exc:
            last_err = exc
            if attempt < API_MAX_RETRY:
                time.sleep(API_RETRY_BASE * (2 ** (attempt - 1)))
    raise RuntimeError(f"LLM call failed after {API_MAX_RETRY} attempts: {last_err}")


def load_progress() -> dict[str, dict]:
    """example_gen_progress.jsonl 로드.

    Returns:
        dict[str, dict]: word → {"example_en": ..., "example_ko": ...}
        파일이 없으면 빈 dict 반환.
    """
    if not PROGRESS_PATH.exists():
        return {}
    result: dict[str, dict] = {}
    with PROGRESS_PATH.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
                word = row.get("word")
                if word:
                    result[word] = {
                        "example_en": row.get("example_en", ""),
                        "example_ko": row.get("example_ko", ""),
                    }
            except json.JSONDecodeError:
                continue
    return result


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description="영어 슬랭 예문 생성 (example_en/example_ko)")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="체크포인트(example_gen_progress.jsonl) 삭제 후 처음부터 재시작",
    )
    args = parser.parse_args()

    # --reset: 체크포인트 삭제
    if args.reset and PROGRESS_PATH.exists():
        PROGRESS_PATH.unlink()
        print("[INFO] 체크포인트 초기화 완료")

    # API 키 확인
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY is not set.")

    # 입력 파일 로드
    with INPUT_PATH.open(encoding="utf-8") as f:
        words: list[dict] = json.load(f)
    total = len(words)
    print(f"[INFO] Model: {OPENAI_MODEL} | Words: {total}")

    # 체크포인트 로드 (이미 완료된 단어 skip)
    progress = load_progress()
    print(f"[INFO] 이미 처리된 단어: {len(progress)}개")

    to_process = [w for w in words if w["word"] not in progress]
    print(f"[INFO] 처리 필요: {len(to_process)}개")

    client = OpenAI(api_key=api_key)

    # 배치 처리
    done_count = len(progress)
    PROGRESS_PATH.parent.mkdir(parents=True, exist_ok=True)

    with PROGRESS_PATH.open("a", encoding="utf-8") as prog_f:
        for i in range(0, len(to_process), BATCH_SIZE):
            batch = to_process[i:i + BATCH_SIZE]
            result_map = call_llm(client, batch)

            for item in batch:
                word = item["word"]
                info = result_map.get(word, {"example_en": "", "example_ko": ""})
                row = {"word": word, "example_en": info["example_en"], "example_ko": info["example_ko"]}
                prog_f.write(json.dumps(row, ensure_ascii=False) + "\n")
                progress[word] = info

            done_count += len(batch)
            print(f"  [{done_count}/{total}] 완료")

    # service_public_approved.json 업데이트 (progress에 있는 단어만)
    for item in words:
        word = item["word"]
        if word in progress:
            item["example_en"] = progress[word]["example_en"]
            item["example_ko"] = progress[word]["example_ko"]

    with INPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

    print(f"\n[DONE] {INPUT_PATH} 업데이트 완료 ({total}개)")

    # 샘플 10개 출력
    print("\n=== 샘플 ===")
    samples = [w for w in words if w.get("example_en")][:10]
    for item in samples:
        print(f"  {item['word']:<12} | {item.get('example_en', '')}")
        print(f"  {'':<12}   {item.get('example_ko', '')}")


if __name__ == "__main__":
    main()
