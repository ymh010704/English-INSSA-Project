from __future__ import annotations

import argparse
import csv
import hashlib
import json
import pickle
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Tuple, Any

import numpy as np
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer


# =========================================================
# 0) PATH CONFIG
# =========================================================
PROJECT_ROOT = Path(r"C:\Users\User\Downloads\English-INSSA-Project")
DATA_PIPELINE_DIR = PROJECT_ROOT / "data_pipeline"

INPUT_JSON = DATA_PIPELINE_DIR / "data" / "polysemous_candidates.json"

OUTPUT_DIR = DATA_PIPELINE_DIR / "output"
DEBUG_DIR = OUTPUT_DIR / "debug"
REVIEW_DIR = OUTPUT_DIR / "review"
CACHE_DIR = DATA_PIPELINE_DIR / "cache"
RESOURCES_DIR = DATA_PIPELINE_DIR / "resources"

FINAL_OUTPUT_JSON = OUTPUT_DIR / "polysemous_clusters.json"
REVIEW_QUEUE_CSV = REVIEW_DIR / "review_queue.csv"
EMBEDDING_CACHE_PATH = CACHE_DIR / "embeddings.pkl"

DOMAIN_LEXICON_PATH = RESOURCES_DIR / "domain_lexicon.json"
CANONICAL_CUE_MAP_PATH = RESOURCES_DIR / "canonical_cue_map.json"
CANNOT_LINK_RULES_PATH = RESOURCES_DIR / "cannot_link_rules.json"
POLARITY_LEXICON_PATH = RESOURCES_DIR / "polarity_lexicon.json"

for p in [OUTPUT_DIR, DEBUG_DIR, REVIEW_DIR, CACHE_DIR, RESOURCES_DIR]:
    p.mkdir(parents=True, exist_ok=True)


# =========================================================
# 1) MODEL / THRESHOLD CONFIG
# =========================================================
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# v3: obvious same-sense pair가 0.58~0.66 근처에 몰려서 더 완화
PAIR_MERGE_THRESHOLD = 0.62
PAIR_REVIEW_THRESHOLD = 0.50

CLUSTER_MEAN_THRESHOLD = 0.56
CLUSTER_Q25_THRESHOLD = 0.50
CLUSTER_MIN_THRESHOLD = 0.40

LOW_CONFIDENCE_CLUSTER_THRESHOLD = 0.60

LABEL_STOPWORDS = {
    "a", "an", "the", "to", "of", "for", "and", "or", "that", "this", "these", "those",
    "someone", "somebody", "something", "thing", "things", "stuff", "person", "people",
    "one", "ones", "kind", "usually", "often", "especially", "informal", "slang",
    "colloquial", "term", "used", "describe", "any", "anything", "everything", "nothing",
    "act", "amount", "kind", "very", "high", "highly", "long", "smallest", "some", "real",
    "particularly", "be", "with", "through", "in", "on", "off", "up", "out", "by", "into",
    "from", "its", "their", "his", "her", "my", "your", "our", "at", "while", "keeping",
    "various", "originally"
}

GENERIC_HEAD_BLACKLIST = {
    "__headword__", "headword", "thing", "things", "stuff", "anything", "any", "someone",
    "somebody", "something", "act", "amount", "kind", "very", "high", "highly", "long",
    "smallest", "used", "especially", "particularly", "with", "through", "into", "from",
    "of", "in", "on", "off", "up", "out", "be", "is", "are", "was", "were", "it", "its",
    "at", "while", "keeping", "various", "originally", "make"
}

EVALUATION_POS_HINTS = {
    "success", "great", "awesome", "excellent", "amazing", "cool", "remarkable", "exceptional", "best"
}
EVALUATION_NEG_HINTS = {
    "failure", "unpopular", "poor", "worthless", "awful", "terrible", "bad", "smelly"
}

HUMAN_REF_TOKENS = {
    "someone", "somebody", "person", "people", "man", "woman", "guy", "girl",
    "boy", "lady", "dude", "kid", "child", "children"
}

HUMAN_PRONOUN_TOKENS = {
    "he", "she", "him", "her", "his", "hers"
}

BODY_PART_TERMS = {
    "breast", "breasts", "boob", "boobs", "tit", "tits", "titty", "titties",
    "nipple", "nipples", "butt", "ass", "genitalia", "penis", "vagina", "dick",
    "face", "mouth", "eye", "eyes", "ear", "ears", "nose", "lip", "lips",
    "skin", "hair", "arm", "arms", "leg", "legs", "hand", "hands", "foot", "feet"
}

PERSON_NOUN_TERMS = {
    "person", "people", "man", "woman", "guy", "girl", "boy", "lady",
    "idiot", "fool", "moron", "loser", "jerk", "capitalist", "dude"
}


# =========================================================
# 2) DATA CLASSES
# =========================================================
@dataclass
class DefinitionFeatures:
    index: int
    raw_definition: str
    raw_example: str
    cleaned_definition: str
    masked_definition: str
    masked_example: str
    argument_hints: List[str]
    inferred_pos: str
    semantic_type: str
    semantic_domain: List[str]
    semantic_domain_scores: Dict[str, float]
    polarity: str
    concreteness: str
    human_target: bool
    head_terms: List[str]
    canonical_cues: List[str]
    example_hints: Dict[str, Any]


# =========================================================
# 3) RESOURCE LOADING
# =========================================================
def load_json(path: Path) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

DOMAIN_LEXICON: Dict[str, List[str]] = load_json(DOMAIN_LEXICON_PATH)
CANONICAL_CUE_MAP: Dict[str, str] = load_json(CANONICAL_CUE_MAP_PATH)
CANNOT_LINK_RULES_RAW: List[List[str]] = load_json(CANNOT_LINK_RULES_PATH)
POLARITY_LEXICON: Dict[str, List[str]] = load_json(POLARITY_LEXICON_PATH)

CANNOT_LINK = {frozenset(rule) for rule in CANNOT_LINK_RULES_RAW}
POSITIVE_CUES = set(POLARITY_LEXICON.get("positive", []))
NEGATIVE_CUES = set(POLARITY_LEXICON.get("negative", []))


# =========================================================
# 4) PREPROCESSING
# =========================================================
META_PAREN_PATTERNS = [
    r"\bslang\b",
    r"\bcolloquial\b",
    r"\binformal\b",
    r"\bvulgar\b",
    r"\bfiguratively\b",
    r"\bby extension\b",
    r"\boften\b",
    r"\busually\b",
    r"\bespecially\b",
    r"\bgenerally\b",
]

META_PREFIX_PATTERNS = [
    r"^used to describe\s+",
    r"^used as\s+",
    r"^term for\s+",
    r"^a term for\s+",
    r"^an intensifier meaning\s+",
]

ARG_HINT_PATTERNS = [
    r"\(someone\)",
    r"\(somebody\)",
    r"\(something\)",
    r"\(of a person\)",
    r"\(of a woman\)",
    r"\(of a man\)",
    r"\(of drugs?\)",
    r"\(of money\)",
    r"\(in prison\)",
    r"\(sexual\)",
]

STOPWORDS = {
    "a", "an", "the", "to", "of", "for", "and", "or", "that", "this", "someone",
    "somebody", "something", "thing", "person", "people", "one", "ones", "kind",
    "usually", "often", "especially", "informal", "slang", "colloquial",
    "term", "used", "describe"
}


def normalize_ws(text: str) -> str:
    text = text.replace("“", '"').replace("”", '"').replace("’", "'").replace("–", "-")
    return re.sub(r"\s+", " ", text).strip()


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z']+", text.lower())


def match_token_or_phrase(text: str, cue: str) -> bool:
    cue = cue.lower().strip()
    if not cue:
        return False
    if " " in cue:
        return cue in text
    return bool(re.search(rf"\b{re.escape(cue)}\b", text))


def extract_argument_hints(text: str) -> List[str]:
    lowered = text.lower()
    hits = []
    for pat in ARG_HINT_PATTERNS:
        for m in re.finditer(pat, lowered):
            hits.append(m.group(0).strip("()"))
    return sorted(set(hits))


def remove_meta_parentheticals(text: str) -> str:
    def repl(match):
        inner = match.group(1).lower().strip()
        for pat in META_PAREN_PATTERNS:
            if re.search(pat, inner):
                return ""
        return match.group(0)
    return re.sub(r"\(([^)]{1,100})\)", repl, text)


def strip_meta_prefixes(text: str) -> str:
    out = text
    for pat in META_PREFIX_PATTERNS:
        out = re.sub(pat, "", out, flags=re.I)
    return out


def clean_definition(definition: str) -> Tuple[str, List[str]]:
    text = normalize_ws((definition or "").lower())
    arg_hints = extract_argument_hints(text)
    text = remove_meta_parentheticals(text)
    text = strip_meta_prefixes(text)
    text = re.sub(r"\[[^\]]+\]", "", text)
    text = re.sub(r"[;|/]+", " ; ", text)
    text = re.sub(r"\s+", " ", text).strip(" .;,-")
    return text, arg_hints


def clean_example(example: str) -> str:
    if not example:
        return ""
    text = normalize_ws(example.lower())
    return re.sub(r"\s+", " ", text).strip()


def mask_headword(text: str, normalized_word: str, surface_forms: List[str]) -> str:
    if not text:
        return text
    forms = sorted(set([normalized_word.lower()] + [s.lower() for s in surface_forms if s]), key=len, reverse=True)
    out = text.lower()
    for form in forms:
        if not form:
            continue
        out = re.sub(rf"\b{re.escape(form)}\b", "__HEADWORD__", out)
    return out


# =========================================================
# 5) FEATURE EXTRACTION
# =========================================================
def infer_pos(cleaned_definition: str) -> str:
    text = cleaned_definition.strip()
    if not text:
        return "unknown"
    if text.startswith("to "):
        return "verb"
    if re.match(r"^(a|an|the|any|anything|something|nothing|someone|somebody|person|man|woman|guy|girl)\b", text):
        return "noun"
    if re.match(r"^(excellent|great|awesome|cool|amazing|terrible|awful|worthless|nasty|despicable)\b", text):
        return "adj"
    return "unknown"


def infer_semantic_type(cleaned_definition: str) -> str:
    text = cleaned_definition.strip()
    if not text:
        return "unknown"

    # 1) verb/action 먼저
    if text.startswith("to "):
        return "action"

    # 2) event/action-like noun 먼저
    # "an act of jumping ...", "the act of ...", "a throw ...", "a kick ..."
    if re.match(r"^(an?|the)\s+act\s+of\b", text):
        return "event"
    if re.match(r"^(an?|the)\s+(jump|dive|throw|kick|pass|shot|blast|splash|leap|fall)\b", text):
        return "event"

    # 3) evaluation
    if any(h in text for h in EVALUATION_POS_HINTS | EVALUATION_NEG_HINTS):
        return "evaluation"

    if re.search(r"\b(excellent|great|awesome|cool|amazing|awful|terrible|worthless|nasty|despicable|remarkable|exceptional|success|failure)\b", text):
        return "evaluation"

    # 4) body_part는 아주 보수적으로
    # 핵심 head noun 자체가 신체부위일 때만
    body_part_head_patterns = [
        r"^(a|an|the)\s+\w+'s\s+(breast|ass|butt|face|mouth|head|eye|arm|leg|hand|foot|chest)\b",
        r"^(a|an|the)\s+(breast|ass|butt|face|mouth|head|eye|arm|leg|hand|foot|chest)\b",
    ]
    for pat in body_part_head_patterns:
        if re.search(pat, text):
            return "body_part"

    # 5) person
    if re.search(r"\b(person|man|woman|guy|girl|idiot|fool|moron|loser|jerk|capitalist)\b", text):
        return "person"

    # 6) state
    if re.search(r"\b(situation|state|condition|trouble|problem|concern|consideration|rebuke|nonsense)\b", text):
        return "state"

    # 7) object
    if re.match(r"^(a|an|the)\b", text):
        return "object"

    return "unknown"


def score_domains(cleaned_definition: str, example: str) -> Dict[str, float]:
    text = f"{cleaned_definition} || {example}".lower()
    scores = {}
    for domain, cues in DOMAIN_LEXICON.items():
        score = 0.0
        for cue in cues:
            if match_token_or_phrase(text, cue):
                score += 1.0 if " " in cue else 0.6
        if score > 0:
            scores[domain] = score

    total = sum(scores.values())
    if total > 0:
        scores = {k: round(v / total, 4) for k, v in scores.items()}
        scores = dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))
    return scores


def infer_polarity(cleaned_definition: str, example: str) -> str:
    text = f"{cleaned_definition} {example}".lower()
    toks = set(tokenize(text))
    pos = len(toks & POSITIVE_CUES)
    neg = len(toks & NEGATIVE_CUES)

    if any(h in text for h in EVALUATION_POS_HINTS):
        pos += 2
    if any(h in text for h in EVALUATION_NEG_HINTS):
        neg += 2

    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"


def infer_concreteness(domain_scores: Dict[str, float], semantic_type: str, cleaned_definition: str) -> str:
    concrete_domains = {"body", "drugs", "crime_violence", "money", "object_artifact", "food_drink", "literal_explosion", "sports_play"}
    abstract_domains = {"praise", "insult", "trouble_problem", "emotion_state", "social_interaction", "information_knowledge", "prediction_judgment", "evaluation_negative"}

    text = cleaned_definition.lower()
    doms = set(domain_scores.keys())

    if any(h in text for h in EVALUATION_POS_HINTS | EVALUATION_NEG_HINTS):
        return "abstract"

    if semantic_type == "action":
        return "unknown"
    if semantic_type == "state":
        return "abstract"
    if semantic_type == "evaluation":
        return "abstract"
    if semantic_type in {"person", "body_part"}:
        return "concrete"
    if semantic_type == "object" or doms & concrete_domains:
        return "concrete"
    if doms & abstract_domains:
        return "abstract"

    if re.search(r"\b(problem|situation|concern|consideration|rebuke|nonsense|lie|exaggeration|information|prediction)\b", text):
        return "abstract"
    if re.search(r"\b(feces|genitalia|bullet|capsule|drug|letter|screenshot|recording|explosive|bomb|breast|joint|car|basket|pass)\b", text):
        return "concrete"

    return "unknown"


def infer_human_target(cleaned_definition: str, example: str, semantic_type: str, argument_hints: List[str]) -> bool:
    text = f"{cleaned_definition} {example}".lower()
    toks = set(tokenize(text))

    if semantic_type in {"person", "body_part"}:
        return True

    if "someone" in argument_hints or "somebody" in argument_hints or "of a person" in argument_hints:
        return True

    if toks & HUMAN_REF_TOKENS:
        return True

    if toks & HUMAN_PRONOUN_TOKENS:
        return True

    return False


def extract_head_terms(masked_definition: str) -> List[str]:
    toks = []
    for tok in tokenize(masked_definition):
        if tok in STOPWORDS or tok in LABEL_STOPWORDS or tok in GENERIC_HEAD_BLACKLIST:
            continue
        if len(tok) <= 1:
            continue
        toks.append(tok)

    deduped = []
    for t in toks:
        if t not in deduped:
            deduped.append(t)
    return deduped[:4]


def canonicalize_cues(head_terms: List[str], masked_definition: str, masked_example: str) -> List[str]:
    text = f"{masked_definition} {masked_example}".lower()
    tokens = set(tokenize(text)) | set(head_terms)
    cues = []
    for tok in tokens:
        if tok in CANONICAL_CUE_MAP:
            cues.append(CANONICAL_CUE_MAP[tok])

    for cue_key, mapped in CANONICAL_CUE_MAP.items():
        if " " in cue_key and cue_key in text:
            cues.append(mapped)

    return sorted(set(cues))


def extract_example_hints(example: str, normalized_word: str, surface_forms: List[str]) -> Dict[str, Any]:
    if not example:
        return {"pattern": "", "context_tokens": [], "has_example": False}

    ex = example.lower()
    forms = sorted(set([normalized_word.lower()] + [s.lower() for s in surface_forms if s]), key=len, reverse=True)
    for form in forms:
        ex = re.sub(rf"\b{re.escape(form)}\b", "__HEADWORD__", ex)

    toks = tokenize(ex)
    pattern = ""
    context_tokens = []

    for i, tok in enumerate(toks):
        if tok == "headword":
            left = toks[max(0, i - 2):i]
            right = toks[i + 1:i + 3]
            context_tokens = left + right

            if left and left[-1] in {"is", "was", "be", "looks", "sounds", "are"}:
                pattern = "be + X"
            elif right and right[0] in {"out", "up", "off"}:
                pattern = "X + particle"
            elif left and left[-1] in {"that", "this", "the", "a"}:
                pattern = "det + X"
            break

    return {
        "pattern": pattern,
        "context_tokens": context_tokens,
        "has_example": True,
    }


# =========================================================
# 6) EMBEDDING CACHE
# =========================================================
class EmbeddingCache:
    def __init__(self, model_name: str, cache_path: Path):
        self.model = SentenceTransformer(model_name)
        self.cache_path = cache_path
        if cache_path.exists():
            with open(cache_path, "rb") as f:
                self.cache: Dict[str, np.ndarray] = pickle.load(f)
        else:
            self.cache = {}

    @staticmethod
    def _key(text: str) -> str:
        return hashlib.sha1(text.encode("utf-8")).hexdigest()

    def get_many(self, texts: List[str]) -> List[np.ndarray]:
        missing = []
        missing_keys = []

        for text in texts:
            key = self._key(text)
            if key not in self.cache:
                missing.append(text)
                missing_keys.append(key)

        if missing:
            embs = self.model.encode(
                missing,
                normalize_embeddings=True,
                convert_to_numpy=True,
                show_progress_bar=False,
            )
            for k, emb in zip(missing_keys, embs):
                self.cache[k] = emb

        return [self.cache[self._key(t)] for t in texts]

    def save(self):
        with open(self.cache_path, "wb") as f:
            pickle.dump(self.cache, f)


# =========================================================
# 7) PAIR SCORING
# =========================================================
def cosine(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))


def overlap_score(xs: List[str], ys: List[str]) -> float:
    if not xs or not ys:
        return 0.0
    sx, sy = set(xs), set(ys)
    inter = len(sx & sy)
    union = len(sx | sy)
    return inter / union if union else 0.0


def head_similarity(heads1: List[str], heads2: List[str]) -> float:
    if not heads1 or not heads2:
        return 0.0
    best = 0.0
    for h1 in heads1:
        for h2 in heads2:
            best = max(best, fuzz.QRatio(h1, h2) / 100.0)
    return best


def top_domain_family(domain_scores: Dict[str, float]) -> str:
    return next(iter(domain_scores.keys()), "unknown")


def domain_conflict(dom1: str, dom2: str) -> bool:
    if dom1 == "unknown" or dom2 == "unknown":
        return False
    return frozenset([dom1, dom2]) in CANNOT_LINK


def domain_similarity(scores1: Dict[str, float], scores2: Dict[str, float]) -> float:
    keys = set(scores1.keys()) | set(scores2.keys())
    if not keys:
        return 0.0
    num = sum(min(scores1.get(k, 0.0), scores2.get(k, 0.0)) for k in keys)
    den = sum(max(scores1.get(k, 0.0), scores2.get(k, 0.0)) for k in keys)
    return num / den if den else 0.0


def type_similarity(t1: str, t2: str) -> float:
    if t1 == t2:
        return 1.0

    compatible = {
        ("state", "evaluation"),
        ("evaluation", "state"),
        ("action", "event"),
        ("event", "action"),
        ("object", "event"),
        ("event", "object"),
        ("person", "evaluation"),
        ("evaluation", "person"),
        ("object", "action"),
        ("action", "object"),
        ("object", "body_part"),
        ("body_part", "object"),
    }

    if (t1, t2) in compatible:
        return 0.55

    return 0.0


def simple_eq_score(a, b) -> float:
    return 1.0 if a == b else 0.0


def score_pair(
    feat1: DefinitionFeatures,
    feat2: DefinitionFeatures,
    emb_def1: np.ndarray,
    emb_def2: np.ndarray,
    emb_joint1: np.ndarray,
    emb_joint2: np.ndarray,
) -> Dict[str, Any]:
    emb_def_sim = cosine(emb_def1, emb_def2)
    emb_joint_sim = cosine(emb_joint1, emb_joint2)
    head_sim = head_similarity(feat1.head_terms, feat2.head_terms)
    cue_sim = overlap_score(feat1.canonical_cues, feat2.canonical_cues)
    dom_sim = domain_similarity(feat1.semantic_domain_scores, feat2.semantic_domain_scores)
    typ_sim = type_similarity(feat1.semantic_type, feat2.semantic_type)
    pol_sim = simple_eq_score(feat1.polarity, feat2.polarity)
    conc_sim = simple_eq_score(feat1.concreteness, feat2.concreteness)
    human_sim = simple_eq_score(feat1.human_target, feat2.human_target)

    penalties = []
    hard_block = False

    dom1 = top_domain_family(feat1.semantic_domain_scores)
    dom2 = top_domain_family(feat2.semantic_domain_scores)

    if domain_conflict(dom1, dom2):
        hard_block = True
        penalties.append(f"cannot_link:{dom1}:{dom2}")

    if feat1.semantic_type == "person" and feat2.semantic_type == "object":
        penalties.append("person_vs_object")
    if feat1.semantic_type == "object" and feat2.semantic_type == "person":
        penalties.append("object_vs_person")
    if {feat1.semantic_type, feat2.semantic_type} == {"person", "body_part"}:
        penalties.append("person_vs_body_part")

    if feat1.polarity != feat2.polarity and {"praise", "insult"} & {dom1, dom2}:
        penalties.append("polarity_conflict_eval")

    # evaluation끼리는 concrete/abstract 충돌 패널티를 줄이지 말고 다른 경우만 약하게
    if (
        feat1.concreteness != feat2.concreteness
        and not ({feat1.semantic_type, feat2.semantic_type} <= {"evaluation", "state"})
        and {"praise", "body", "crime_violence", "evaluation_negative"} & {dom1, dom2}
    ):
        penalties.append("concreteness_conflict")

    penalty_value = 0.0
    if "person_vs_object" in penalties or "object_vs_person" in penalties:
        penalty_value += 0.10
    if "person_vs_body_part" in penalties:
        penalty_value += 0.18
    if "polarity_conflict_eval" in penalties:
        penalty_value += 0.12
    if "concreteness_conflict" in penalties:
        penalty_value += 0.06

    if hard_block:
        score = 0.0
        decision = "split"
    else:
        score = (
            0.34 * emb_def_sim
            + 0.18 * emb_joint_sim
            + 0.12 * head_sim
            + 0.10 * cue_sim
            + 0.10 * dom_sim
            + 0.06 * typ_sim
            + 0.04 * pol_sim
            + 0.03 * conc_sim
            + 0.03 * human_sim
            - penalty_value
        )

        shared_cues = set(feat1.canonical_cues) & set(feat2.canonical_cues)
        noun_verb_pair = {feat1.inferred_pos, feat2.inferred_pos} == {"noun", "verb"}

        if shared_cues:
            score += 0.06

        if shared_cues and dom_sim >= 0.4:
            score += 0.05

        if noun_verb_pair and shared_cues:
            score += 0.08

        if "gun_violence" in shared_cues and {feat1.semantic_type, feat2.semantic_type} == {"object", "action"}:
            score += 0.05

        if "deception" in shared_cues and noun_verb_pair:
            score += 0.05

        if "drug_use" in shared_cues:
            score += 0.08

        if "explosive_object" in shared_cues:
            score += 0.08

        if "sports_play" in shared_cues:
            score += 0.08

        if "positive_evaluation" in shared_cues:
            score += 0.08

        if "negative_evaluation" in shared_cues:
            score += 0.08

        if score >= PAIR_MERGE_THRESHOLD:
            decision = "merge"
        elif score >= PAIR_REVIEW_THRESHOLD:
            decision = "review"
        else:
            decision = "split"

    return {
        "i": feat1.index,
        "j": feat2.index,
        "emb_def_sim": round(emb_def_sim, 4),
        "emb_joint_sim": round(emb_joint_sim, 4),
        "head_sim": round(head_sim, 4),
        "cue_sim": round(cue_sim, 4),
        "domain_sim": round(dom_sim, 4),
        "type_sim": round(typ_sim, 4),
        "polarity_sim": round(pol_sim, 4),
        "concreteness_sim": round(conc_sim, 4),
        "human_target_sim": round(human_sim, 4),
        "hard_block": hard_block,
        "penalties": penalties,
        "same_sense_score": round(score, 4),
        "decision": decision,
    }


# =========================================================
# 8) CONSTRAINED CLUSTERING
# =========================================================
def pair_lookup(pair_scores: List[Dict[str, Any]]) -> Dict[Tuple[int, int], Dict[str, Any]]:
    lookup = {}
    for p in pair_scores:
        lookup[(p["i"], p["j"])] = p
        lookup[(p["j"], p["i"])] = p
    return lookup


def cluster_cross_scores(cluster_a: set, cluster_b: set, lookup: Dict[Tuple[int, int], Dict[str, Any]]):
    scores = []
    blocks = []
    for i in cluster_a:
        for j in cluster_b:
            p = lookup.get((i, j))
            if p is None:
                continue
            scores.append(p["same_sense_score"])
            if p["hard_block"]:
                blocks.append((i, j))
    return scores, blocks


def constrained_agglomerative(def_indices: List[int], pair_scores: List[Dict[str, Any]]):
    lookup = pair_lookup(pair_scores)
    clusters = [{i} for i in def_indices]
    merge_steps = []

    while True:
        best = None
        best_score = -1.0

        for a_idx in range(len(clusters)):
            for b_idx in range(a_idx + 1, len(clusters)):
                c1, c2 = clusters[a_idx], clusters[b_idx]
                scores, blocks = cluster_cross_scores(c1, c2, lookup)
                if not scores or blocks:
                    continue

                arr = np.array(scores)
                mean_score = float(arr.mean())
                q25_score = float(np.quantile(arr, 0.25))
                min_score = float(arr.min())

                if (
                    mean_score >= CLUSTER_MEAN_THRESHOLD
                    and q25_score >= CLUSTER_Q25_THRESHOLD
                    and min_score >= CLUSTER_MIN_THRESHOLD
                ):
                    candidate_score = mean_score
                    if candidate_score > best_score:
                        best_score = candidate_score
                        best = (a_idx, b_idx, mean_score, q25_score, min_score)

        if best is None:
            break

        a_idx, b_idx, mean_score, q25_score, min_score = best
        left = clusters[a_idx]
        right = clusters[b_idx]
        merged = left | right

        merge_steps.append({
            "left_cluster": sorted(left),
            "right_cluster": sorted(right),
            "score_mean": round(mean_score, 4),
            "score_q25": round(q25_score, 4),
            "score_min": round(min_score, 4),
            "accepted": True,
        })

        new_clusters = []
        for idx, c in enumerate(clusters):
            if idx not in {a_idx, b_idx}:
                new_clusters.append(c)
        new_clusters.append(merged)
        clusters = new_clusters

    return [sorted(c) for c in clusters], merge_steps


# =========================================================
# 9) CLUSTER LABELING / CONFIDENCE
# =========================================================
def choose_representative(cluster: List[int], features: List[DefinitionFeatures], pair_scores: List[Dict[str, Any]]) -> int:
    if len(cluster) == 1:
        return cluster[0]

    score_map = {m: [] for m in cluster}
    for p in pair_scores:
        i, j = p["i"], p["j"]
        if i in cluster and j in cluster:
            score_map[i].append(p["same_sense_score"])
            score_map[j].append(p["same_sense_score"])

    avg_scores = {m: (sum(v) / len(v) if v else 0.0) for m, v in score_map.items()}
    return max(avg_scores, key=avg_scores.get)


def cluster_confidence(cluster: List[int], pair_scores: List[Dict[str, Any]], features: List[DefinitionFeatures]) -> float:
    if len(cluster) == 1:
        feat = features[cluster[0]]
        conf = 0.40
        if feat.semantic_type != "unknown":
            conf += 0.10
        if feat.semantic_domain:
            conf += 0.15
        if feat.canonical_cues:
            conf += 0.15
        if feat.raw_example.strip():
            conf += 0.08
        if len(feat.head_terms) >= 2:
            conf += 0.05
        if feat.example_hints.get("pattern"):
            conf += 0.02
        if not feat.semantic_domain and not feat.canonical_cues:
            conf -= 0.08
        conf = min(max(conf, 0.0), 0.95)
        return round(conf, 2)

    vals = []
    doms = []
    for p in pair_scores:
        if p["i"] in cluster and p["j"] in cluster:
            vals.append(p["same_sense_score"])

    for idx in cluster:
        doms.extend(features[idx].semantic_domain[:2])

    cohesion = sum(vals) / len(vals) if vals else 0.5
    if doms:
        counts = {}
        for d in doms:
            counts[d] = counts.get(d, 0) + 1
        dom_consistency = max(counts.values()) / len(doms)
    else:
        dom_consistency = 0.5

    conf = 0.7 * cohesion + 0.3 * dom_consistency
    conf = min(max(conf, 0.0), 0.99)
    return round(conf, 2)


def pick_label_head(rep_feat: DefinitionFeatures) -> str:
    if rep_feat.canonical_cues:
        return rep_feat.canonical_cues[0]

    for h in rep_feat.head_terms:
        if h not in GENERIC_HEAD_BLACKLIST and h not in LABEL_STOPWORDS:
            return h

    for tok in tokenize(rep_feat.masked_definition):
        if tok not in GENERIC_HEAD_BLACKLIST and tok not in LABEL_STOPWORDS:
            return tok

    return rep_feat.cleaned_definition[:40]


def build_cluster_label(cluster: List[int], features: List[DefinitionFeatures], rep_idx: int) -> str:
    rep_feat = features[rep_idx]
    top_domains = rep_feat.semantic_domain[:2]
    head = pick_label_head(rep_feat)
    dom_txt = " / ".join(top_domains) if top_domains else "misc"
    return f"{head} / {dom_txt}"


# =========================================================
# 10) PROCESSING
# =========================================================
def process_word(entry: Dict[str, Any], embedder: EmbeddingCache):
    normalized_word = entry["normalized_word"]
    raw_defs = entry["definitions"]
    surface_forms = entry.get("surface_forms", [normalized_word])

    features: List[DefinitionFeatures] = []
    def_texts: List[str] = []
    joint_texts: List[str] = []

    for idx, d in enumerate(raw_defs):
        cleaned_def, arg_hints = clean_definition(d.get("definition_en", ""))
        cleaned_ex = clean_example(d.get("example_en", ""))

        masked_def = mask_headword(cleaned_def, normalized_word, surface_forms)
        masked_ex = mask_headword(cleaned_ex, normalized_word, surface_forms)

        inferred_pos = infer_pos(cleaned_def)
        semantic_type = infer_semantic_type(cleaned_def)
        domain_scores = score_domains(masked_def, masked_ex)
        semantic_domain = list(domain_scores.keys())
        polarity = infer_polarity(masked_def, masked_ex)
        concreteness = infer_concreteness(domain_scores, semantic_type, cleaned_def)
        human_target = infer_human_target(cleaned_def, cleaned_ex, semantic_type, arg_hints)
        head_terms = extract_head_terms(masked_def)
        canonical_cues = canonicalize_cues(head_terms, masked_def, masked_ex)
        example_hints = extract_example_hints(cleaned_ex, normalized_word, surface_forms)

        feat = DefinitionFeatures(
            index=idx,
            raw_definition=d.get("definition_en", ""),
            raw_example=d.get("example_en", ""),
            cleaned_definition=cleaned_def,
            masked_definition=masked_def,
            masked_example=masked_ex,
            argument_hints=arg_hints,
            inferred_pos=inferred_pos,
            semantic_type=semantic_type,
            semantic_domain=semantic_domain,
            semantic_domain_scores=domain_scores,
            polarity=polarity,
            concreteness=concreteness,
            human_target=human_target,
            head_terms=head_terms,
            canonical_cues=canonical_cues,
            example_hints=example_hints,
        )
        features.append(feat)

        def_texts.append(masked_def)
        joint_texts.append(f"{masked_def} [SEP] {masked_ex}".strip())

    def_embs = embedder.get_many(def_texts)
    joint_embs = embedder.get_many(joint_texts)

    pair_scores = []
    for i in range(len(features)):
        for j in range(i + 1, len(features)):
            p = score_pair(features[i], features[j], def_embs[i], def_embs[j], joint_embs[i], joint_embs[j])
            pair_scores.append(p)

    clusters, merge_steps = constrained_agglomerative(
        def_indices=list(range(len(features))),
        pair_scores=pair_scores,
    )

    final_clusters = []
    ambiguous = []
    review_needed = False
    review_rows = []

    for cluster in clusters:
        rep_idx = choose_representative(cluster, features, pair_scores)
        label = build_cluster_label(cluster, features, rep_idx)
        confidence = cluster_confidence(cluster, pair_scores, features)

        if confidence < LOW_CONFIDENCE_CLUSTER_THRESHOLD:
            review_needed = True

        if len(cluster) == 1:
            member = cluster[0]
            related = [p for p in pair_scores if member in (p["i"], p["j"]) and p["decision"] == "review"]
            if related:
                ambiguous.append(member)
                review_needed = True

        domains = []
        for idx in cluster:
            domains.extend(features[idx].semantic_domain[:2])
        domains = list(dict.fromkeys(domains))[:3]

        rep_defs = [features[idx].raw_definition for idx in cluster[:2]]

        final_clusters.append({
            "cluster_id": f"{normalized_word}_{len(final_clusters) + 1}",
            "label": label,
            "semantic_domain": domains,
            "member_definition_indices": cluster,
            "representative_definitions": rep_defs,
            "confidence": confidence,
        })

    for p in pair_scores:
        if p["decision"] == "review":
            i, j = p["i"], p["j"]
            f1, f2 = features[i], features[j]
            review_rows.append({
                "normalized_word": normalized_word,
                "def_i": i,
                "def_j": j,
                "score": p["same_sense_score"],
                "decision": p["decision"],
                "hard_block": p["hard_block"],
                "top_domain_i": top_domain_family(f1.semantic_domain_scores),
                "top_domain_j": top_domain_family(f2.semantic_domain_scores),
                "type_i": f1.semantic_type,
                "type_j": f2.semantic_type,
                "polarity_i": f1.polarity,
                "polarity_j": f2.polarity,
                "definition_i": f1.raw_definition,
                "definition_j": f2.raw_definition,
                "example_i": f1.raw_example,
                "example_j": f2.raw_example,
                "reason_flags": "|".join(p["penalties"]),
            })

    debug_payload = {
        "normalized_word": normalized_word,
        "processed_definitions": [asdict(f) for f in features],
        "pairwise_scores": pair_scores,
        "merge_steps": merge_steps,
        "final_clusters": final_clusters,
        "unassigned_or_ambiguous": sorted(set(ambiguous)),
        "review_needed": review_needed,
    }

    with open(DEBUG_DIR / f"{normalized_word}__debug.json", "w", encoding="utf-8") as f:
        json.dump(debug_payload, f, ensure_ascii=False, indent=2)

    return {
        "normalized_word": normalized_word,
        "clusters": final_clusters,
        "unassigned_or_ambiguous": sorted(set(ambiguous)),
        "review_needed": review_needed,
    }, review_rows


# =========================================================
# 11) CSV WRITER
# =========================================================
def write_review_csv(rows: List[Dict[str, Any]], path: Path):
    fieldnames = [
        "normalized_word", "def_i", "def_j", "score", "decision", "hard_block",
        "top_domain_i", "top_domain_j", "type_i", "type_j", "polarity_i", "polarity_j",
        "definition_i", "definition_j", "example_i", "example_j", "reason_flags"
    ]
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# =========================================================
# 12) ARGPARSE
# =========================================================
def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--sample-words",
        type=str,
        default="",
        help="Comma-separated normalized_word list. Example: shit,bomb,cap"
    )
    parser.add_argument(
        "--max-words",
        type=int,
        default=0,
        help="Process only the first N entries after filtering. 0 means all."
    )
    return parser.parse_args()


# =========================================================
# 13) MAIN
# =========================================================
def main():
    args = parse_args()

    if not INPUT_JSON.exists():
        raise FileNotFoundError(f"Input JSON not found: {INPUT_JSON}")

    with open(INPUT_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    if args.sample_words.strip():
        target_words = {
            w.strip().lower()
            for w in args.sample_words.split(",")
            if w.strip()
        }
        data = [
            entry for entry in data
            if entry.get("normalized_word", "").lower() in target_words
        ]
        print(f"[INFO] Filtered by sample words: {sorted(target_words)}")
        print(f"[INFO] Remaining entries: {len(data)}")

    if args.max_words and args.max_words > 0:
        data = data[:args.max_words]
        print(f"[INFO] Limited to first {len(data)} entries")

    print(f"[INFO] Loaded {len(data)} word entries from {INPUT_JSON}")
    print(f"[INFO] Output dir: {OUTPUT_DIR}")

    embedder = EmbeddingCache(EMBED_MODEL_NAME, EMBEDDING_CACHE_PATH)

    outputs = []
    all_review_rows = []

    for idx, entry in enumerate(data, start=1):
        normalized_word = entry.get("normalized_word", f"word_{idx}")
        print(f"[{idx}/{len(data)}] Processing: {normalized_word}")
        out, review_rows = process_word(entry, embedder)
        outputs.append(out)
        all_review_rows.extend(review_rows)

    embedder.save()

    with open(FINAL_OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(outputs, f, ensure_ascii=False, indent=2)

    write_review_csv(all_review_rows, REVIEW_QUEUE_CSV)

    print(f"[DONE] Final output saved to: {FINAL_OUTPUT_JSON}")
    print(f"[DONE] Review CSV saved to: {REVIEW_QUEUE_CSV}")
    print(f"[DONE] Debug files saved under: {DEBUG_DIR}")
    print(f"[DONE] Embedding cache saved to: {EMBEDDING_CACHE_PATH}")


if __name__ == "__main__":
    main()
