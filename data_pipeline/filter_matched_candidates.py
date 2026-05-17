from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence

# Embedded English stopword list to avoid extra dependencies/downloads.
# Based largely on common NLTK-style English stopwords plus a few practical additions.
DEFAULT_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "ain", "all", "am", "an", "and", "any",
    "are", "aren", "aren't", "as", "at", "be", "because", "been", "before", "being", "below",
    "between", "both", "but", "by", "can", "couldn", "couldn't", "d", "did", "didn", "didn't",
    "do", "does", "doesn", "doesn't", "doing", "don", "don't", "down", "during", "each", "few",
    "for", "from", "further", "had", "hadn", "hadn't", "has", "hasn", "hasn't", "have", "haven",
    "haven't", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
    "i", "if", "in", "into", "is", "isn", "isn't", "it", "it's", "its", "itself", "just", "ll",
    "m", "ma", "me", "mightn", "mightn't", "more", "most", "mustn", "mustn't", "my", "myself",
    "needn", "needn't", "no", "nor", "not", "now", "o", "of", "off", "on", "once", "only", "or",
    "other", "our", "ours", "ourselves", "out", "over", "own", "re", "s", "same", "shan",
    "shan't", "she", "she's", "should", "should've", "shouldn", "shouldn't", "so", "some", "such",
    "t", "than", "that", "that'll", "the", "their", "theirs", "them", "themselves", "then", "there",
    "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "ve", "very",
    "was", "wasn", "wasn't", "we", "were", "weren", "weren't", "what", "when", "where", "which",
    "while", "who", "whom", "why", "will", "with", "won", "won't", "wouldn", "wouldn't", "y", "you",
    "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
}

# Conservative exact-match function-phrase blacklist.
# These are phrases that are highly likely to be grammatical noise rather than slang entries.
DEFAULT_FUNCTION_PHRASE_BLACKLIST = {
    "i am",
    "on the",
    "to the",
    "want to",
    "a lot",
    "out of",
    "has been",
    "as well",
    "a bit",
    "kind of",
    "do it",
    "up to",
    "and that",
    "the one",
    "i see",
    "with it",
    "how much",
    "up and",
    "can do",
    "on it",
}

TOKEN_RE = re.compile(r"[a-z0-9]+(?:'[a-z0-9]+)*")


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_line_set(path: Path | None, default: set[str]) -> set[str]:
    if path is None:
        return set(default)

    if not path.exists():
        raise FileNotFoundError(f"Set file not found: {path}")

    if path.suffix.lower() == ".json":
        raw = load_json(path)
        if not isinstance(raw, list):
            raise ValueError(f"JSON set file must be a list[str]: {path}")
        return {str(x).strip().lower() for x in raw if str(x).strip()}

    items: set[str] = set()
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip().lower()
            if not line or line.startswith("#"):
                continue
            items.add(line)
    return items


def tokenize(text: str) -> List[str]:
    return TOKEN_RE.findall(text.lower())


def is_stopword_only(normalized_word: str, stopwords: set[str]) -> bool:
    tokens = tokenize(normalized_word)
    return bool(tokens) and all(token in stopwords for token in tokens)


def is_multiword(normalized_word: str) -> bool:
    return len(tokenize(normalized_word)) >= 2


def to_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def source_file_count(entry: Dict[str, Any]) -> int:
    source_files = entry.get("source_files") or []
    if isinstance(source_files, list):
        return len(source_files)
    return 0


def group_entries_by_word(entries: Sequence[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for entry in entries:
        normalized_word = str(entry.get("normalized_word", "")).strip().lower()
        if not normalized_word:
            normalized_word = "__MISSING_NORMALIZED_WORD__"
        grouped[normalized_word].append(entry)
    return grouped


def summarize_group(normalized_word: str, group: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
    match_counts = [to_int(entry.get("match_count"), 0) for entry in group]
    subreddit_counts = [to_int(entry.get("subreddit_count"), 0) for entry in group]
    matched_flags = [bool(entry.get("matched", False)) for entry in group]

    source_files_union: set[str] = set()
    for entry in group:
        source_files = entry.get("source_files") or []
        if isinstance(source_files, list):
            source_files_union.update(str(x) for x in source_files)

    return {
        "normalized_word": normalized_word,
        "entry_count": len(group),
        "group_match_count": max(match_counts) if match_counts else 0,
        "group_subreddit_count": max(subreddit_counts) if subreddit_counts else 0,
        "group_source_files": sorted(source_files_union),
        "group_source_file_count": len(source_files_union),
        "group_matched": any(matched_flags),
        "inconsistent_match_count": len(set(match_counts)) > 1,
        "inconsistent_subreddit_count": len(set(subreddit_counts)) > 1,
        "inconsistent_source_files": len({tuple(sorted((entry.get('source_files') or []))) for entry in group}) > 1,
    }


def decide_drop_reasons(
    normalized_word: str,
    group_summary: Dict[str, Any],
    stopwords: set[str],
    match_threshold: int,
    function_phrase_blacklist: set[str],
    safelist: set[str],
) -> List[str]:
    if normalized_word in safelist:
        return []

    reasons: List[str] = []

    if not group_summary["group_matched"]:
        reasons.append("not_matched")

    if is_stopword_only(normalized_word, stopwords):
        reasons.append("stopword_only")

    if is_multiword(normalized_word) and normalized_word in function_phrase_blacklist:
        reasons.append("function_phrase_blacklist")

    if group_summary["group_match_count"] <= match_threshold:
        reasons.append(f"low_match_count_lte_{match_threshold}")

    return reasons


def attach_drop_metadata(entry: Dict[str, Any], group_summary: Dict[str, Any], drop_reasons: Sequence[str]) -> Dict[str, Any]:
    enriched = dict(entry)
    enriched["_filter_metadata"] = {
        "drop_reasons": list(drop_reasons),
        "group_match_count": group_summary["group_match_count"],
        "group_subreddit_count": group_summary["group_subreddit_count"],
        "group_source_file_count": group_summary["group_source_file_count"],
    }
    return enriched


def build_summary(
    *,
    input_entries: Sequence[Dict[str, Any]],
    grouped: Dict[str, List[Dict[str, Any]]],
    kept_entries: Sequence[Dict[str, Any]],
    dropped_entries: Sequence[Dict[str, Any]],
    kept_words: Sequence[str],
    dropped_words: Sequence[str],
    word_level_reasons: Dict[str, List[str]],
    group_summaries: Dict[str, Dict[str, Any]],
    match_threshold: int,
    function_phrase_blacklist: set[str],
    safelist: set[str],
    stopwords: set[str],
) -> Dict[str, Any]:
    reason_word_counter: Counter[str] = Counter()
    reason_entry_counter: Counter[str] = Counter()

    for normalized_word, reasons in word_level_reasons.items():
        entry_count = len(grouped[normalized_word])
        for reason in reasons:
            reason_word_counter[reason] += 1
            reason_entry_counter[reason] += entry_count

    examples_by_reason: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for normalized_word, reasons in word_level_reasons.items():
        summary = group_summaries[normalized_word]
        example = {
            "normalized_word": normalized_word,
            "entry_count": summary["entry_count"],
            "match_count": summary["group_match_count"],
            "subreddit_count": summary["group_subreddit_count"],
        }
        for reason in reasons:
            if len(examples_by_reason[reason]) < 20:
                examples_by_reason[reason].append(example)

    inconsistent_groups = [
        summary
        for summary in group_summaries.values()
        if summary["inconsistent_match_count"]
        or summary["inconsistent_subreddit_count"]
        or summary["inconsistent_source_files"]
    ]

    return {
        "config": {
            "match_threshold": match_threshold,
            "stopword_count": len(stopwords),
            "function_phrase_blacklist_count": len(function_phrase_blacklist),
            "safelist_count": len(safelist),
        },
        "counts": {
            "input_entries": len(input_entries),
            "input_normalized_words": len(grouped),
            "kept_entries": len(kept_entries),
            "kept_normalized_words": len(kept_words),
            "dropped_entries": len(dropped_entries),
            "dropped_normalized_words": len(dropped_words),
        },
        "drop_reason_counts_by_word": dict(reason_word_counter),
        "drop_reason_counts_by_entry": dict(reason_entry_counter),
        "examples_by_reason": dict(examples_by_reason),
        "inconsistent_group_count": len(inconsistent_groups),
        "inconsistent_group_examples": inconsistent_groups[:20],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Filter matched_candidates.json by word-level hard-cut rules.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data_pipeline/data/matched_candidates.json"),
        help="Path to matched_candidates.json",
    )
    parser.add_argument(
        "--kept-output",
        type=Path,
        default=Path("data_pipeline/data/filtered_candidates.json"),
        help="Output path for kept entries",
    )
    parser.add_argument(
        "--dropped-output",
        type=Path,
        default=Path("data_pipeline/data/dropped_candidates.json"),
        help="Output path for dropped entries with metadata",
    )
    parser.add_argument(
        "--summary-output",
        type=Path,
        default=Path("data_pipeline/data/filter_summary.json"),
        help="Output path for summary JSON",
    )
    parser.add_argument(
        "--match-threshold",
        type=int,
        default=200,
        help="Drop words whose group-level match_count is <= this threshold",
    )
    parser.add_argument(
        "--stopword-file",
        type=Path,
        default=None,
        help="Optional .txt or .json file to override default stopwords",
    )
    parser.add_argument(
        "--function-phrase-blacklist-file",
        type=Path,
        default=None,
        help="Optional .txt or .json file to override default exact-match function-phrase blacklist",
    )
    parser.add_argument(
        "--safelist-file",
        type=Path,
        default=None,
        help="Optional .txt or .json file of exact normalized_word entries to always keep",
    )
    parser.add_argument(
        "--disable-function-phrase-blacklist",
        action="store_true",
        help="Disable exact-match function phrase blacklist filtering",
    )
    args = parser.parse_args()

    entries = load_json(args.input)
    if not isinstance(entries, list):
        raise ValueError(f"Input JSON must be a list of objects: {args.input}")

    stopwords = load_line_set(args.stopword_file, DEFAULT_STOPWORDS)
    function_phrase_blacklist = set()
    if not args.disable_function_phrase_blacklist:
        function_phrase_blacklist = load_line_set(
            args.function_phrase_blacklist_file,
            DEFAULT_FUNCTION_PHRASE_BLACKLIST,
        )
    safelist = load_line_set(args.safelist_file, set())

    grouped = group_entries_by_word(entries)

    kept_entries: List[Dict[str, Any]] = []
    dropped_entries: List[Dict[str, Any]] = []
    kept_words: List[str] = []
    dropped_words: List[str] = []
    word_level_reasons: Dict[str, List[str]] = {}
    group_summaries: Dict[str, Dict[str, Any]] = {}

    for normalized_word, group in grouped.items():
        group_summary = summarize_group(normalized_word, group)
        group_summaries[normalized_word] = group_summary
        drop_reasons = decide_drop_reasons(
            normalized_word=normalized_word,
            group_summary=group_summary,
            stopwords=stopwords,
            match_threshold=args.match_threshold,
            function_phrase_blacklist=function_phrase_blacklist,
            safelist=safelist,
        )

        if drop_reasons:
            dropped_words.append(normalized_word)
            word_level_reasons[normalized_word] = drop_reasons
            dropped_entries.extend(attach_drop_metadata(entry, group_summary, drop_reasons) for entry in group)
        else:
            kept_words.append(normalized_word)
            kept_entries.extend(group)

    summary = build_summary(
        input_entries=entries,
        grouped=grouped,
        kept_entries=kept_entries,
        dropped_entries=dropped_entries,
        kept_words=kept_words,
        dropped_words=dropped_words,
        word_level_reasons=word_level_reasons,
        group_summaries=group_summaries,
        match_threshold=args.match_threshold,
        function_phrase_blacklist=function_phrase_blacklist,
        safelist=safelist,
        stopwords=stopwords,
    )

    save_json(args.kept_output, kept_entries)
    save_json(args.dropped_output, dropped_entries)
    save_json(args.summary_output, summary)

    print(f"Input entries            : {len(entries):,}")
    print(f"Input normalized words  : {len(grouped):,}")
    print(f"Kept entries            : {len(kept_entries):,}")
    print(f"Kept normalized words   : {len(kept_words):,}")
    print(f"Dropped entries         : {len(dropped_entries):,}")
    print(f"Dropped normalized words: {len(dropped_words):,}")
    print("Drop reasons (word-level):")
    for reason, count in sorted(summary["drop_reason_counts_by_word"].items()):
        print(f"  - {reason}: {count:,}")


if __name__ == "__main__":
    main()
