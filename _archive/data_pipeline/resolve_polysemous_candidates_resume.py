
import os
import re
import json
import time
import random
import sqlite3
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional, Iterable, Tuple
from collections import Counter, defaultdict

try:
    import zstandard as zstd
except ImportError:
    zstd = None

from openai import OpenAI

# =========================
# 설정
# =========================
POLYSEMOUS_JSON_PATH = "data_pipeline/output/polysemous_candidates.json"

REDDIT_DUMP_PATHS = [
    r"C:\Users\User\Downloads\reddit\comments\RC_2025-09.zst",
    r"C:\Users\User\Downloads\reddit\comments\RC_2025-12.zst",
]

OUTPUT_DIR = "polysemous_resolution_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 임시 reservoir 저장 DB (덤프 1회 스캔용)
TEMP_DB_PATH = os.path.join(OUTPUT_DIR, "contexts_reservoir.sqlite")

# 결과 파일들
SUMMARY_JSONL_PATH = os.path.join(OUTPUT_DIR, "summary_results.jsonl")
CLASSIFICATION_DEBUG_JSONL_PATH = os.path.join(OUTPUT_DIR, "all_classification_debug.jsonl")
ERRORS_JSONL_PATH = os.path.join(OUTPUT_DIR, "errors.jsonl")

MAX_CONTEXTS_PER_WORD = 500
BATCH_SIZE = 100
CLASSIFY_SUB_BATCH_SIZE = 20

TOP_PRESENCE_THRESHOLD = 0.15
TOP_CLARITY_THRESHOLD = 0.65
TOP_COUNT_THRESHOLD = 12

# 실행 제어
TARGET_WORD = None
# TARGET_WORD = "fire"

# 중요:
# True면 기존 contexts_reservoir.sqlite를 지우고 덤프를 처음부터 다시 스캔함
# 기본값은 False. 지금 같은 상황에서는 절대 True로 두지 말 것.
FORCE_RESCAN = False

# True면 DB가 이미 있고 usable하면 덤프 스캔을 건너뛰고 분류만 재개함
REUSE_EXISTING_DB = True

BASIC_SKIP_WORDS = {
    "a", "an", "the", "and", "or", "but", "to", "of", "in", "on", "at", "for",
    "is", "it", "be", "as", "by", "we", "he", "she", "they", "i", "you",
    "er", "-er", "uh", "um", "ok", "okay", "yo", "eh"
}

MIN_WORD_LEN = 2
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

OPENAI_MODEL = "gpt-5.4-mini"
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")

client = OpenAI(api_key=OPENAI_API_KEY)

TOKEN_RE = re.compile(r"[A-Za-z0-9_]+(?:'[A-Za-z0-9_]+)?")


# =========================
# 데이터 구조
# =========================
@dataclass
class ContextSample:
    normalized_word: str
    matched_surface: str
    body: str
    subreddit: Optional[str]
    source_file: str
    comment_id: Optional[str]


@dataclass
class ResolutionResult:
    normalized_word: str
    surface_forms: List[str]
    definitions: List[Dict[str, Any]]
    total_sampled_contexts: int
    classified_contexts: int
    sense_counts: Dict[str, int]
    top_sense_index: Optional[int]
    top_presence: float
    top_clarity: float
    top_count: int
    decision: str
    stop_reason: str


@dataclass
class PreparedCandidate:
    candidate_id: int
    candidate: Dict[str, Any]
    normalized_word: str
    surface_forms: List[str]
    single_token_surfaces: List[str]
    multiword_surfaces: List[str]


# =========================
# 유틸
# =========================
def normalize_text(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def load_polysemous_candidates(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def should_skip_candidate(item: Dict[str, Any]) -> Tuple[bool, str]:
    normalized_word = normalize_text(item.get("normalized_word", ""))
    surface_forms = [normalize_text(x) for x in item.get("surface_forms", [])]

    if not normalized_word:
        return True, "empty_normalized_word"

    if normalized_word in BASIC_SKIP_WORDS:
        return True, "basic_skip_word"

    if len(normalized_word.replace(" ", "")) < MIN_WORD_LEN:
        return True, "too_short"

    cleaned = [sf for sf in surface_forms if sf and sf not in BASIC_SKIP_WORDS]
    if not cleaned:
        return True, "all_surface_forms_skipped"

    if item.get("sense_count", 0) < 2:
        return True, "not_polysemous"

    return False, ""


def append_jsonl(path: str, row: Dict[str, Any]):
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def load_processed_words(summary_path: str) -> set:
    processed = set()
    if not os.path.exists(summary_path):
        return processed

    with open(summary_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            word = normalize_text(obj.get("normalized_word", ""))
            if word:
                processed.add(word)
    return processed


def extract_focus_window(text: str, surface: str, window: int = 180) -> str:
    if not text:
        return ""

    lower_text = text.lower()
    lower_surface = surface.lower()
    idx = lower_text.find(lower_surface)

    if idx == -1:
        return text[: window * 2]

    start = max(0, idx - window)
    end = min(len(text), idx + len(surface) + window)
    return text[start:end].strip()


def compute_metrics(sense_counter: Counter) -> Tuple[Optional[int], float, float, int]:
    total = sum(sense_counter.values())
    if total == 0:
        return None, 0.0, 0.0, 0

    ranked = sense_counter.most_common()
    top_idx, top_count = ranked[0]
    top_presence = top_count / total
    second_count = ranked[1][1] if len(ranked) > 1 else 0
    top_clarity = (top_count - second_count) / top_count if top_count > 0 else 0.0
    return top_idx, top_presence, top_clarity, top_count


def iter_zst_json_lines(path: str) -> Iterable[Dict[str, Any]]:
    if zstd is None:
        raise ImportError("zstandard 패키지가 필요합니다. pip install zstandard")

    with open(path, "rb") as fh:
        dctx = zstd.ZstdDecompressor(max_window_size=2**31)
        with dctx.stream_reader(fh) as reader:
            buffer = ""
            while True:
                chunk = reader.read(1024 * 1024)
                if not chunk:
                    break
                buffer += chunk.decode("utf-8", errors="ignore")
                lines = buffer.split("\n")
                buffer = lines.pop()
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        yield json.loads(line)
                    except json.JSONDecodeError:
                        continue

            if buffer.strip():
                try:
                    yield json.loads(buffer)
                except json.JSONDecodeError:
                    pass


# =========================
# Reservoir SQLite
# =========================
def init_temp_db(db_path: str, reset: bool = False) -> sqlite3.Connection:
    if reset and os.path.exists(db_path):
        os.remove(db_path)

    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA temp_store=MEMORY")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS contexts (
            candidate_id INTEGER NOT NULL,
            slot INTEGER NOT NULL,
            normalized_word TEXT NOT NULL,
            matched_surface TEXT NOT NULL,
            body TEXT NOT NULL,
            subreddit TEXT,
            source_file TEXT NOT NULL,
            comment_id TEXT,
            PRIMARY KEY (candidate_id, slot)
        )
        """
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_contexts_candidate_id ON contexts(candidate_id)"
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_contexts_normalized_word ON contexts(normalized_word)"
    )
    conn.commit()
    return conn


def existing_db_has_contexts(db_path: str) -> bool:
    if not os.path.exists(db_path):
        return False

    try:
        conn = init_temp_db(db_path, reset=False)
        cur = conn.execute("SELECT COUNT(*) FROM contexts")
        count = cur.fetchone()[0]
        conn.close()
        return count > 0
    except Exception:
        return False


def upsert_reservoir_context(
    conn: sqlite3.Connection,
    candidate_id: int,
    seen_count: int,
    limit: int,
    sample: ContextSample,
):
    if seen_count <= limit:
        slot = seen_count - 1
    else:
        j = random.randint(1, seen_count)
        if j > limit:
            return
        slot = j - 1

    conn.execute(
        """
        INSERT OR REPLACE INTO contexts (
            candidate_id, slot, normalized_word, matched_surface, body,
            subreddit, source_file, comment_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            candidate_id,
            slot,
            sample.normalized_word,
            sample.matched_surface,
            sample.body,
            sample.subreddit,
            sample.source_file,
            sample.comment_id,
        ),
    )


def load_contexts_for_word(
    conn: sqlite3.Connection,
    normalized_word: str,
    limit: Optional[int] = None,
) -> List[ContextSample]:
    query = """
        SELECT normalized_word, matched_surface, body, subreddit, source_file, comment_id
        FROM contexts
        WHERE normalized_word = ?
        ORDER BY slot ASC
    """
    params: Tuple[Any, ...]
    if limit is None:
        params = (normalized_word,)
    else:
        query += " LIMIT ?"
        params = (normalized_word, limit)

    cur = conn.execute(query, params)
    rows = cur.fetchall()
    return [
        ContextSample(
            normalized_word=row[0],
            matched_surface=row[1],
            body=row[2],
            subreddit=row[3],
            source_file=row[4],
            comment_id=row[5],
        )
        for row in rows
    ]


# =========================
# 후보 준비 / 매칭 인덱스
# =========================
def prepare_candidates(
    raw_candidates: List[Dict[str, Any]],
    processed_words: set,
) -> List[PreparedCandidate]:
    prepared: List[PreparedCandidate] = []

    for item in raw_candidates:
        normalized_word = normalize_text(item.get("normalized_word", ""))
        if TARGET_WORD is not None and normalized_word != normalize_text(TARGET_WORD):
            continue

        skip, reason = should_skip_candidate(item)
        if skip:
            result = ResolutionResult(
                normalized_word=normalized_word,
                surface_forms=item.get("surface_forms", []),
                definitions=item.get("definitions", []),
                total_sampled_contexts=0,
                classified_contexts=0,
                sense_counts={},
                top_sense_index=None,
                top_presence=0.0,
                top_clarity=0.0,
                top_count=0,
                decision="skipped",
                stop_reason=reason,
            )
            append_jsonl(SUMMARY_JSONL_PATH, asdict(result))
            print(f"[SKIP] {normalized_word} | {reason}")
            continue

        if normalized_word in processed_words:
            print(f"[SKIP_ALREADY_DONE] {normalized_word}")
            continue

        normalized_surfaces = []
        for sf in item.get("surface_forms", []):
            sf_norm = normalize_text(sf)
            if sf_norm and sf_norm not in BASIC_SKIP_WORDS:
                normalized_surfaces.append(sf_norm)

        normalized_surfaces = sorted(set(normalized_surfaces), key=lambda x: (-len(x), x))
        single_token_surfaces = [sf for sf in normalized_surfaces if " " not in sf and sf.isascii()]
        multiword_only = [sf for sf in normalized_surfaces if sf not in single_token_surfaces]

        candidate_id = len(prepared)
        prepared_candidate = PreparedCandidate(
            candidate_id=candidate_id,
            candidate=item,
            normalized_word=normalized_word,
            surface_forms=normalized_surfaces,
            single_token_surfaces=single_token_surfaces,
            multiword_surfaces=multiword_only,
        )
        prepared.append(prepared_candidate)

    return prepared


def build_match_indexes(
    prepared_candidates: List[PreparedCandidate],
) -> Tuple[Dict[str, List[Tuple[int, str]]], List[Tuple[str, int]]]:
    single_surface_map: Dict[str, List[Tuple[int, str]]] = defaultdict(list)
    multiword_surface_entries: List[Tuple[str, int]] = []

    for pc in prepared_candidates:
        for sf in pc.single_token_surfaces:
            single_surface_map[sf].append((pc.candidate_id, sf))
        for sf in pc.multiword_surfaces:
            multiword_surface_entries.append((sf, pc.candidate_id))

    multiword_surface_entries.sort(key=lambda x: (-len(x[0]), x[0]))
    return single_surface_map, multiword_surface_entries


def find_candidate_matches(
    body_norm: str,
    single_surface_map: Dict[str, List[Tuple[int, str]]],
    multiword_surface_entries: List[Tuple[str, int]],
) -> Dict[int, str]:
    matched: Dict[int, str] = {}

    tokens = set(TOKEN_RE.findall(body_norm))
    for tok in tokens:
        if tok not in single_surface_map:
            continue
        for candidate_id, surface in single_surface_map[tok]:
            matched.setdefault(candidate_id, surface)

    for surface, candidate_id in multiword_surface_entries:
        if candidate_id in matched:
            continue
        if surface in body_norm:
            matched[candidate_id] = surface

    return matched


# =========================
# 글로벌 문맥 수집 (덤프 1회 스캔)
# =========================
def collect_contexts_for_all_candidates(
    prepared_candidates: List[PreparedCandidate],
    dump_paths: List[str],
    max_contexts: int,
    db_path: str,
):
    if not prepared_candidates:
        print("[INFO] no candidates to scan")
        return

    conn = init_temp_db(db_path, reset=True)
    single_surface_map, multiword_surface_entries = build_match_indexes(prepared_candidates)

    matched_seen_per_candidate = [0] * len(prepared_candidates)
    total_scanned = 0
    total_matches = 0
    write_ops = 0

    for dump_path in dump_paths:
        source_file = os.path.basename(dump_path)
        print(f"[SCAN_START] source={source_file}")
        scanned_in_file = 0

        for obj in iter_zst_json_lines(dump_path):
            total_scanned += 1
            scanned_in_file += 1

            if total_scanned % 500000 == 0:
                sampled_total = sum(min(x, max_contexts) for x in matched_seen_per_candidate)
                print(
                    f"[PROGRESS] scanned_total={total_scanned} | source={source_file} | "
                    f"scanned_in_file={scanned_in_file} | total_matches={total_matches} | "
                    f"sampled_slots_filled={sampled_total}"
                )
                conn.commit()

            body = obj.get("body", "")
            if not body or body in {"[deleted]", "[removed]"}:
                continue

            body_norm = normalize_text(body)
            if not body_norm:
                continue

            matches = find_candidate_matches(
                body_norm=body_norm,
                single_surface_map=single_surface_map,
                multiword_surface_entries=multiword_surface_entries,
            )
            if not matches:
                continue

            for candidate_id, matched_surface in matches.items():
                total_matches += 1
                matched_seen_per_candidate[candidate_id] += 1
                sample = ContextSample(
                    normalized_word=prepared_candidates[candidate_id].normalized_word,
                    matched_surface=matched_surface,
                    body=extract_focus_window(body, matched_surface, window=180),
                    subreddit=obj.get("subreddit"),
                    source_file=source_file,
                    comment_id=obj.get("id"),
                )
                upsert_reservoir_context(
                    conn=conn,
                    candidate_id=candidate_id,
                    seen_count=matched_seen_per_candidate[candidate_id],
                    limit=max_contexts,
                    sample=sample,
                )
                write_ops += 1

        conn.commit()
        print(f"[SCAN_DONE] source={source_file} | scanned={scanned_in_file}")

    conn.commit()
    sampled_candidates = sum(1 for x in matched_seen_per_candidate if x > 0)
    print(
        f"[COLLECT_DONE] scanned_total={total_scanned} | total_matches={total_matches} | "
        f"write_ops={write_ops} | candidates_with_matches={sampled_candidates}/{len(prepared_candidates)}"
    )
    conn.close()


# =========================
# OpenAI 분류
# =========================
def build_classification_payload(
    candidate: Dict[str, Any],
    batch_contexts: List[ContextSample],
) -> Dict[str, Any]:
    senses = []
    for i, d in enumerate(candidate["definitions"]):
        senses.append({
            "sense_id": i,
            "definition_en": d.get("definition_en", "").strip(),
            "example_en": d.get("example_en", "").strip(),
        })

    contexts = []
    for i, c in enumerate(batch_contexts):
        contexts.append({
            "context_index": i,
            "matched_surface": c.matched_surface,
            "text": c.body,
            "subreddit": c.subreddit,
        })

    return {
        "target_word": candidate["normalized_word"],
        "candidate_senses": senses,
        "contexts": contexts,
    }


CLASSIFICATION_SCHEMA = {
    "type": "object",
    "properties": {
        "results": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "context_index": {"type": "integer"},
                    "sense_id": {"type": ["integer", "null"]},
                },
                "required": ["context_index", "sense_id"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["results"],
    "additionalProperties": False,
}


def call_openai_sense_classifier(payload: Dict[str, Any]) -> Dict[str, Any]:
    system_prompt = (
        "You are a strict word-sense classifier.\n"
        "Your task is to classify each context into exactly one listed sense_id or null.\n"
        "Rules:\n"
        "1. Use only the provided candidate senses.\n"
        "2. If the usage does not clearly match any listed sense, return null.\n"
        "3. Do not guess.\n"
        "4. Return valid JSON only.\n"
        "5. Keep the original context_index unchanged.\n"
    )

    user_prompt = (
        "Classify each context for the target word.\n\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )

    response = client.responses.create(
        model=OPENAI_MODEL,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "sense_classification",
                "schema": CLASSIFICATION_SCHEMA,
                "strict": True,
            }
        },
    )
    return json.loads(response.output_text)


def parse_classification_results(
    data: Dict[str, Any],
    batch_size: int,
    num_senses: int,
) -> List[Optional[int]]:
    preds: List[Optional[int]] = [None] * batch_size
    results = data.get("results", [])
    if not isinstance(results, list):
        return preds

    for item in results:
        if not isinstance(item, dict):
            continue
        idx = item.get("context_index")
        sense_id = item.get("sense_id")
        if not isinstance(idx, int) or idx < 0 or idx >= batch_size:
            continue
        if sense_id is None:
            preds[idx] = None
            continue
        if not isinstance(sense_id, int) or sense_id < 0 or sense_id >= num_senses:
            preds[idx] = None
            continue
        preds[idx] = sense_id

    return preds


def classify_batch(
    candidate: Dict[str, Any],
    batch_contexts: List[ContextSample],
    sub_batch_size: int = CLASSIFY_SUB_BATCH_SIZE,
    max_retries: int = 2,
    retry_sleep: float = 2.0,
) -> List[Optional[int]]:
    final_preds: List[Optional[int]] = []
    num_senses = len(candidate["definitions"])

    for start in range(0, len(batch_contexts), sub_batch_size):
        sub_batch = batch_contexts[start:start + sub_batch_size]
        payload = build_classification_payload(candidate, sub_batch)
        success = False
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                response_data = call_openai_sense_classifier(payload)
                preds = parse_classification_results(
                    data=response_data,
                    batch_size=len(sub_batch),
                    num_senses=num_senses,
                )
                final_preds.extend(preds)
                success = True
                break
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    time.sleep(retry_sleep)

        if not success:
            print(
                f"[WARN] classify_batch failed | word={candidate['normalized_word']} | "
                f"sub_batch_start={start} | error={last_error}"
            )
            final_preds.extend([None] * len(sub_batch))
            append_jsonl(ERRORS_JSONL_PATH, {
                "stage": "classify_batch",
                "normalized_word": candidate["normalized_word"],
                "sub_batch_start": start,
                "error": repr(last_error),
            })

    return final_preds


def append_classification_debug(
    normalized_word: str,
    batch_start: int,
    batch_contexts: List[ContextSample],
    preds: List[Optional[int]],
):
    rows = []
    for i, (ctx, pred) in enumerate(zip(batch_contexts, preds)):
        rows.append({
            "context_index_in_batch": i,
            "context_index_global": batch_start + i,
            "matched_surface": ctx.matched_surface,
            "text": ctx.body,
            "predicted_sense_id": pred,
            "subreddit": ctx.subreddit,
            "source_file": ctx.source_file,
            "comment_id": ctx.comment_id,
        })

    append_jsonl(CLASSIFICATION_DEBUG_JSONL_PATH, {
        "normalized_word": normalized_word,
        "batch_start": batch_start,
        "rows": rows,
    })


# =========================
# resolve
# =========================
def resolve_candidate(candidate: Dict[str, Any], contexts: List[ContextSample]) -> ResolutionResult:
    definitions = candidate["definitions"]
    sense_counter = Counter()
    classified_contexts = 0

    stop_reason = "max_batches_exhausted"
    decision = "ambiguous"

    limited_contexts = contexts[:MAX_CONTEXTS_PER_WORD]

    for start in range(0, len(limited_contexts), BATCH_SIZE):
        batch = limited_contexts[start:start + BATCH_SIZE]
        if not batch:
            break

        predictions = classify_batch(candidate, batch)
        append_classification_debug(candidate["normalized_word"], start, batch, predictions)

        if len(predictions) != len(batch):
            raise ValueError("classify_batch returned length mismatch")

        for pred in predictions:
            if pred is None:
                continue
            if not isinstance(pred, int):
                continue
            if pred < 0 or pred >= len(definitions):
                continue
            sense_counter[pred] += 1
            classified_contexts += 1

        top_idx, top_presence, top_clarity, top_count = compute_metrics(sense_counter)

        print(
            f"[BATCH] {candidate['normalized_word']} | classified={classified_contexts} | "
            f"top_idx={top_idx} | top_presence={top_presence:.3f} | "
            f"top_clarity={top_clarity:.3f} | top_count={top_count}"
        )

        if (
            top_presence >= TOP_PRESENCE_THRESHOLD
            and top_clarity >= TOP_CLARITY_THRESHOLD
            and top_count >= TOP_COUNT_THRESHOLD
        ):
            decision = "resolved"
            stop_reason = "threshold_satisfied"
            return ResolutionResult(
                normalized_word=candidate["normalized_word"],
                surface_forms=candidate.get("surface_forms", []),
                definitions=definitions,
                total_sampled_contexts=len(limited_contexts),
                classified_contexts=classified_contexts,
                sense_counts={str(k): v for k, v in sense_counter.items()},
                top_sense_index=top_idx,
                top_presence=top_presence,
                top_clarity=top_clarity,
                top_count=top_count,
                decision=decision,
                stop_reason=stop_reason,
            )

    top_idx, top_presence, top_clarity, top_count = compute_metrics(sense_counter)
    return ResolutionResult(
        normalized_word=candidate["normalized_word"],
        surface_forms=candidate.get("surface_forms", []),
        definitions=definitions,
        total_sampled_contexts=len(limited_contexts),
        classified_contexts=classified_contexts,
        sense_counts={str(k): v for k, v in sense_counter.items()},
        top_sense_index=top_idx,
        top_presence=top_presence,
        top_clarity=top_clarity,
        top_count=top_count,
        decision=decision,
        stop_reason=stop_reason,
    )


# =========================
# 메인
# =========================
def main():
    raw_candidates = load_polysemous_candidates(POLYSEMOUS_JSON_PATH)
    print(f"[INFO] total raw candidates = {len(raw_candidates)}")

    processed_words = load_processed_words(SUMMARY_JSONL_PATH)
    print(f"[INFO] already processed words = {len(processed_words)}")

    prepared_candidates = prepare_candidates(raw_candidates, processed_words)
    print(f"[INFO] candidates to classify = {len(prepared_candidates)}")

    if not prepared_candidates:
        print("[INFO] nothing to do")
        return

    db_exists_and_has_contexts = existing_db_has_contexts(TEMP_DB_PATH)
    print(f"[INFO] existing_db_has_contexts = {db_exists_and_has_contexts}")

    should_scan = True
    if FORCE_RESCAN:
        print("[INFO] FORCE_RESCAN=True -> existing DB를 지우고 다시 스캔합니다.")
        should_scan = True
    elif REUSE_EXISTING_DB and db_exists_and_has_contexts:
        print("[INFO] existing DB detected -> dump scan을 건너뛰고 classification만 재개합니다.")
        should_scan = False
    else:
        print("[INFO] reusable DB가 없으므로 dump scan을 수행합니다.")
        should_scan = True

    if should_scan:
        collect_contexts_for_all_candidates(
            prepared_candidates=prepared_candidates,
            dump_paths=REDDIT_DUMP_PATHS,
            max_contexts=MAX_CONTEXTS_PER_WORD,
            db_path=TEMP_DB_PATH,
        )

    conn = init_temp_db(TEMP_DB_PATH, reset=False)

    for idx, pc in enumerate(prepared_candidates, 1):
        normalized_word = pc.normalized_word
        print(f"\n[{idx}/{len(prepared_candidates)}] RESOLVE: {normalized_word}")

        try:
            contexts = load_contexts_for_word(conn, normalized_word, limit=MAX_CONTEXTS_PER_WORD)
        except Exception as e:
            append_jsonl(ERRORS_JSONL_PATH, {
                "stage": "load_contexts_for_word",
                "normalized_word": normalized_word,
                "error": repr(e),
            })
            contexts = []

        if not contexts:
            result = ResolutionResult(
                normalized_word=normalized_word,
                surface_forms=pc.candidate.get("surface_forms", []),
                definitions=pc.candidate.get("definitions", []),
                total_sampled_contexts=0,
                classified_contexts=0,
                sense_counts={},
                top_sense_index=None,
                top_presence=0.0,
                top_clarity=0.0,
                top_count=0,
                decision="ambiguous",
                stop_reason="no_contexts_found",
            )
            append_jsonl(SUMMARY_JSONL_PATH, asdict(result))
            print(f"[NO_CONTEXTS] {normalized_word}")
            continue

        try:
            result = resolve_candidate(pc.candidate, contexts)
            append_jsonl(SUMMARY_JSONL_PATH, asdict(result))
            print(
                f"[RESULT] {normalized_word} | decision={result.decision} | "
                f"top_sense_index={result.top_sense_index} | "
                f"top_presence={result.top_presence:.3f} | "
                f"top_clarity={result.top_clarity:.3f} | top_count={result.top_count}"
            )
        except Exception as e:
            append_jsonl(ERRORS_JSONL_PATH, {
                "stage": "resolve_candidate",
                "normalized_word": normalized_word,
                "error": repr(e),
            })
            print(f"[ERROR] resolve failed | word={normalized_word} | error={e}")

    conn.close()
    print("[DONE] all candidates processed")


if __name__ == "__main__":
    main()
