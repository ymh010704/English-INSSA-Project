import json
import hashlib
from pathlib import Path
from typing import Any, Dict, List

POLYSEMOUS_JSON_PATH = "data_pipeline/data/polysemous_candidates.json"
SENSE_INVENTORY_OUTPUT_PATH = "data_pipeline/data/polysemous_sense_inventory.json"

INVENTORY_VERSION = "v1"


def normalize_text(value: Any) -> str:
    """None 방지 + 앞뒤 공백 정리."""
    if value is None:
        return ""
    return str(value).strip()


def make_sense_uid(normalized_word: str, definition_obj: Dict[str, Any]) -> str:
    """
    sense 순서와 최대한 독립적으로 가기 위해
    definition 내용 기반 해시로 sense_uid 생성.
    """
    payload = {
        "normalized_word": normalize_text(normalized_word),
        "word": normalize_text(definition_obj.get("word", "")),
        "definition_en": normalize_text(definition_obj.get("definition_en", "")),
        "example_en": normalize_text(definition_obj.get("example_en", "")),
        "source_label": sorted(definition_obj.get("source_label", [])),
    }

    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]
    return f"{normalized_word}::{digest}"


def transform_definition(
    normalized_word: str,
    definition_obj: Dict[str, Any],
    sense_local_id: int,
) -> Dict[str, Any]:
    return {
        "sense_local_id": sense_local_id,
        "sense_uid": make_sense_uid(normalized_word, definition_obj),
        "word": normalize_text(definition_obj.get("word", "")),
        "definition_en": normalize_text(definition_obj.get("definition_en", "")),
        "example_en": normalize_text(definition_obj.get("example_en", "")),
        "source_label": definition_obj.get("source_label", []),
    }


def transform_candidate_item(item: Dict[str, Any]) -> Dict[str, Any]:
    normalized_word = normalize_text(item.get("normalized_word", ""))
    definitions = item.get("definitions", [])

    senses = [
        transform_definition(
            normalized_word=normalized_word,
            definition_obj=definition,
            sense_local_id=i,
        )
        for i, definition in enumerate(definitions, start=1)
    ]

    return {
        "normalized_word": normalized_word,
        "inventory_version": INVENTORY_VERSION,
        "surface_forms": item.get("surface_forms", []),
        "sense_count": len(senses),
        "match_count_from_matched_candidates": item.get(
            "match_count_from_matched_candidates", 0
        ),
        "subreddit_count_from_matched_candidates": item.get(
            "subreddit_count_from_matched_candidates", 0
        ),
        "source_labels": item.get("source_labels", []),
        "source_files": item.get("source_files", []),
        "senses": senses,
    }


def build_sense_inventory(
    input_path: str = POLYSEMOUS_JSON_PATH,
    output_path: str = SENSE_INVENTORY_OUTPUT_PATH,
) -> None:
    input_file = Path(input_path)
    output_file = Path(output_path)

    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found: {input_file}")

    with input_file.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Expected top-level JSON array in polysemous_candidates.json")

    transformed = [transform_candidate_item(item) for item in data]

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with output_file.open("w", encoding="utf-8") as f:
        json.dump(transformed, f, ensure_ascii=False, indent=2)

    print(f"[DONE] wrote sense inventory: {output_file}")
    print(f"[INFO] total words: {len(transformed)}")


if __name__ == "__main__":
    build_sense_inventory()