"""
review_tool.py

service_public_pending.json의 단어를 하나씩 검수: 승인 / 보류 / 수정필요
- 승인 → service_public_approved.json에 추가, pending에서 제거
- 보류 → service_public_pending.json에 유지
- 수정필요 → service_public_needs_revision.json에 추가, pending에서 제거

실행:
  python data_pipeline/review_tool.py
  python data_pipeline/review_tool.py --reset   # 체크포인트 초기화
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

INPUT_PATH    = Path("data_pipeline/output/service_public_pending.json")
PROGRESS_PATH = Path("data_pipeline/output/review_progress.jsonl")
APPROVED_PATH = Path("data_pipeline/output/service_public_approved.json")
PENDING_PATH  = Path("data_pipeline/output/service_public_pending.json")
REVISION_PATH = Path("data_pipeline/output/service_public_needs_revision.json")

SEP = "━" * 42


def load_json(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def load_progress() -> dict[str, dict]:
    """word → {status, note} — review_progress.jsonl 로드"""
    result: dict[str, dict] = {}
    if not PROGRESS_PATH.exists():
        return result
    with PROGRESS_PATH.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
                result[row["word"]] = row
            except (json.JSONDecodeError, KeyError):
                continue
    return result


def append_progress(row: dict) -> None:
    PROGRESS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with PROGRESS_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def save_outputs(all_pending: list[dict], progress: dict[str, dict]) -> None:
    """
    - approved: 기존 approved + 이번에 승인한 단어
    - pending:  all_pending 중 승인/수정필요로 처리되지 않은 단어
    - revision: 기존 revision + 이번에 수정필요로 분류한 단어
    """
    existing_approved = load_json(APPROVED_PATH)
    existing_revision = load_json(REVISION_PATH)
    existing_approved_words = {r["word"] for r in existing_approved}
    existing_revision_words = {r["word"] for r in existing_revision}

    lookup = {r["word"]: r for r in all_pending}

    new_approved, new_revision = [], []
    for word, p in progress.items():
        entry = {**lookup.get(word, {"word": word}), "note": p.get("note")}
        if p["status"] == "승인" and word not in existing_approved_words:
            new_approved.append(entry)
        elif p["status"] == "수정필요" and word not in existing_revision_words:
            new_revision.append(entry)

    # pending = 아직 검수 안 됐거나 보류로 유지된 단어
    done_words = {w for w, p in progress.items() if p["status"] in ("승인", "수정필요")}
    updated_pending = [r for r in all_pending if r["word"] not in done_words]

    for path, data in [
        (APPROVED_PATH, existing_approved + new_approved),
        (PENDING_PATH,  updated_pending),
        (REVISION_PATH, existing_revision + new_revision),
    ]:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


def display_word(entry: dict, idx: int, total: int, counts: dict) -> None:
    print(f"\n{SEP}")
    print(
        f"[{idx}/{total}]  "
        f"승인 {counts['승인']} / 보류 {counts['보류']} / 수정필요 {counts['수정필요']}"
    )
    print(SEP)
    print(f"단어     : {entry['word']}")
    cats = entry.get("category") or []
    print(f"카테고리 : {cats}")
    print(f"EN       : {(entry.get('definition_en') or '')[:80]}")
    print(f"KO       : {(entry.get('definition_ko') or '')[:80]}")
    example = entry.get("example_en") or ""
    if example:
        print(f"예문     : {example[:100]}")
    print()
    print("[1] 승인   [2] 보류   [3] 수정필요   [s] 저장   [q] 저장 후 종료")


def get_input(prompt: str = "> ") -> str:
    try:
        return input(prompt).strip().lower()
    except (EOFError, KeyboardInterrupt):
        return "q"


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stdin.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="체크포인트 초기화")
    args = parser.parse_args()

    if args.reset and PROGRESS_PATH.exists():
        PROGRESS_PATH.unlink()
        print("[INFO] 체크포인트 초기화됨")

    all_pending = load_json(INPUT_PATH)
    progress = load_progress()

    remaining = [r for r in all_pending if r["word"] not in progress]
    total = len(all_pending)

    counts = {"승인": 0, "보류": 0, "수정필요": 0}
    for p in progress.values():
        s = p.get("status", "")
        if s in counts:
            counts[s] += 1

    reviewed_count = len(progress)
    print(f"[INFO] 보류 단어 {total}개 | 기존 검수 {reviewed_count}개 | 남은 단어 {len(remaining)}개")

    if not remaining:
        print("[DONE] 모든 단어 검수 완료!")
        save_outputs(all_pending, progress)
        return

    pending_save: list[dict] = []

    def flush_save() -> None:
        nonlocal pending_save
        for row in pending_save:
            append_progress(row)
            progress[row["word"]] = row
            s = row.get("status", "")
            if s in counts:
                counts[s] += 1
        pending_save = []
        save_outputs(all_pending, progress)
        print(f"  [저장됨] 승인 {counts['승인']} / 보류 {counts['보류']} / 수정필요 {counts['수정필요']}")

    for i, entry in enumerate(remaining, start=reviewed_count + 1):
        while True:
            display_word(entry, i, total, counts)
            cmd = get_input("> ")

            if cmd == "1":
                pending_save.append({"word": entry["word"], "status": "승인", "note": None})
                flush_save()
                break
            elif cmd == "2":
                pending_save.append({"word": entry["word"], "status": "보류", "note": None})
                flush_save()
                break
            elif cmd == "3":
                note = get_input("메모 (엔터 생략): ")
                pending_save.append({"word": entry["word"], "status": "수정필요", "note": note or None})
                flush_save()
                break
            elif cmd == "s":
                flush_save()
            elif cmd == "q":
                flush_save()
                print("\n[종료] 다음 실행 시 이어서 진행됩니다.")
                return
            else:
                print("  1/2/3/s/q 중 하나를 입력하세요.")

    flush_save()
    print(f"\n[완료] 전체 {total}개 검수 완료!")
    print(f"  승인: {counts['승인']}개  보류: {counts['보류']}개  수정필요: {counts['수정필요']}개")
    print(f"  → {APPROVED_PATH}")
    print(f"  → {PENDING_PATH}")
    print(f"  → {REVISION_PATH}")


if __name__ == "__main__":
    main()
