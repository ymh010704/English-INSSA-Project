# 영어 슬랭 학습 데이터셋 구축 파이프라인 보고서

**작성일**: 2026-05-19  
**대상 프로젝트**: English-INSSA-DATA-PROJECT  
**최종 산출물**: `data_pipeline/output/final_dataset.jsonl` (3,293개 단어)

---

## 1. 프로젝트 개요

한국인 영어 학습자를 위한 영어 슬랭 학습 앱의 데이터셋을 자동으로 구축하는 파이프라인이다.

**핵심 전략**:
- Wiktionary에서 슬랭 후보를 추출해 Reddit 댓글 덤프(2025년 9월·12월)에서 실제 사용 빈도를 검증한다.
- LLM(GPT-4.1-nano)으로 각 후보의 슬랭 여부를 판정하고 대표 영어 정의를 생성한다.
- 이후 한국어 번역, 예문 생성, 수동 검수를 거쳐 서비스에 투입한다.

**실행 환경**:
```
pip install mwparserfromhell zstandard rapidfuzz openai numpy
export OPENAI_API_KEY=sk-...
# 실행 위치: English-INSSA-DATA-PROJECT/ 루트
```

---

## 2. 파이프라인 전체 흐름

```
Wiktionary XML (bz2)
        │
  Stage 1: parse_wiktionary.py
        │ → output/slang_raw.json
        │
  Stage 2: parse_slang_raw.py
        │ + Reddit RC_2025-09.zst, RC_2025-12.zst
        │ → matched_candidates.json  (실행 디렉터리 기준)
        │
  Stage 3: filter_matched_candidates.py
        │ → data/filtered_candidates.json
        │
  Stage 4: rank_slang_candidates.py
        │ → data/scored_candidates.json  (KEEP 6,423개)
        │
  Stage 5: reddit_context_cache_builder.py
        │ + Reddit RC_2025-09.zst, RC_2025-12.zst
        │ → candidate_context_cache.jsonl  (~643MB)
        │
  Stage 6: reddit_slang_llm_judger.py  [GPT-4.1-nano]
        │ → output/word_summary.jsonl
        │
  Stage 7: rank_final_candidates.py
        │ → output/ranked_candidates.jsonl  (3,293개)
        │
  output/final_dataset.jsonl  ←─────────────────────────────┐
        │                                                     │
  [서비스 투입]                                               │
  add_korean_definitions.py  [GPT-4.1-nano]                  │
        │ → definition_ko + category 추가 (in-place)  ───────┘
        │
  generate_examples.py  [GPT-4.1-nano]
        │ 입력: output/service_public_approved.json
        │ → example_en + example_ko 추가 (in-place)
        │
  review_tool.py  [수동 검수 CLI]
        │ 입력: output/service_public_pending.json
        │ → service_public_approved.json (승인)
           → service_public_needs_revision.json (수정필요)
```

---

## 3. 각 단계 상세

### Stage 1 — `parse_wiktionary.py`

**목적**: Wiktionary XML에서 슬랭 정의가 있는 영어 단어 추출

| 항목 | 내용 |
|------|------|
| 입력 | `data_pipeline/dump/enwiktionary-20250920-pages-articles-multistream.xml.bz2` |
| 출력 | `data_pipeline/output/slang_raw.json` |

**알고리즘**:
- `ElementTree.iterparse`로 bz2 XML을 스트리밍 처리 (메모리 전체 적재 없음)
- `==English==` 섹션만 정규식으로 추출 (다국어 항목 제외)
- `#` 정의 라인의 라벨(`{{lb|en|...}}`, `{{context|...}}`, `(slang)` 등)에서 아래 TARGET_LABELS 매칭:
  ```
  {"slang", "internet slang", "internet", "aave", "informal", "colloquial"}
  ```
- 예문은 `{{ux|en|...}}` / `{{usex|en|...}}` 우선, 없으면 위키코드 제거 후 원문 사용
- 출력 필드: `word`, `definition_en`, `definition_ko`(빈값), `example_en`, `example_ko`(빈값), `source_label`, `service_category`(빈값)

---

### Stage 2 — `parse_slang_raw.py`

**목적**: Reddit 댓글 덤프 전수 스캔으로 후보 단어별 실제 사용 횟수 집계

| 항목 | 내용 |
|------|------|
| 입력 | `data_pipeline/output/slang_raw.json` + Reddit `.zst` 2개 파일 |
| 출력 | `matched_candidates.json`, `unmatched_candidates.json`, `candidate_usage_stats.json` (실행 디렉터리 기준 상대경로) |

**알고리즘**:
- 후보 단어를 토큰 길이별 `ngram_index[n]` dict로 구성
- `.zst` 파일을 스트리밍으로 읽어 JSONL 한 줄씩 파싱
- 댓글 body를 토큰화 → n-gram 슬라이딩 윈도우로 후보 단어 매칭
- 단어별 `match_count`, `source_files`, `subreddits`(최대 20개 샘플) 누적
- 정규화: 타이포그래피 따옴표·대시 표준화 후 토큰화

> **경로 주의**: 출력 파일이 실행 디렉터리 기준 상대경로로 하드코딩되어 있어, Stage 3의 기본 입력 경로(`data_pipeline/data/matched_candidates.json`)와 불일치한다. 실제 실행 시 파일을 수동으로 이동하거나 Stage 3의 `--input` 인자를 지정해야 한다.

---

### Stage 3 — `filter_matched_candidates.py`

**목적**: 통계 기반 1차 필터링으로 명백한 비슬랭·저빈도 단어 제거

| 항목 | 내용 |
|------|------|
| 입력 | `data_pipeline/data/matched_candidates.json` (기본값, `--input`으로 변경 가능) |
| 출력 | `data_pipeline/data/filtered_candidates.json`, `dropped_candidates.json`, `filter_summary.json` |

**필터 조건** (그룹 max match_count 기준, 조건 중 하나라도 해당 시 drop):

| 조건 | 기준 |
|------|------|
| `not_matched` | Reddit 매칭 이력 없음 |
| `stopword_only` | 모든 토큰이 영어 stopword (~130개) |
| `function_phrase_blacklist` | 멀티워드 구문이 18개 기능어 구문 블랙리스트에 해당 |
| `low_match_count` | 그룹 match_count ≤ 200 (기본값, `--match-threshold`로 변경 가능) |

- Safelist에 등록된 단어는 모든 필터 무시
- `--disable-function-phrase-blacklist` 옵션 제공

---

### Stage 4 — `rank_slang_candidates.py`

**목적**: 후보 단어에 Reddit 사용 빈도 기반 support_score 산정 및 3단계 분류

| 항목 | 내용 |
|------|------|
| 입력 | `data_pipeline/data/filtered_candidates.json` |
| 출력 | `data_pipeline/data/scored_candidates.json` |

**점수 공식**:
```
support_score = 0.6 × log10(1 + match_count) + 0.4 × log10(1 + subreddit_count)
```
- `match_count`, `subreddit_count`는 같은 normalized_word 내 sense들의 **max** 사용 (sum 아님)

**분류 기준**:

| 레이블 | support_score |
|--------|--------------|
| `keep` | ≥ 3.65 |
| `gray_zone` | 3.20 이상 3.65 미만 |
| `prune` | 3.20 미만 |

→ `keep` 6,423개가 이후 단계 처리 대상

---

### Stage 5 — `reddit_context_cache_builder.py`

**목적**: LLM 판정을 위한 단어별 Reddit 문맥(실제 사용 예문) 수집

| 항목 | 내용 |
|------|------|
| 입력 | `data_pipeline/data/scored_candidates.json` (`keep` 항목만) + Reddit `.zst` 2개 |
| 출력 | `data_pipeline/candidate_context_cache.jsonl` (~643MB), `candidate_context_summary.jsonl` |

**문맥 수집 목표 수 (match_count 기준)**:

| match_count | target_n |
|-------------|----------|
| < 10,000 | 100 |
| 10,000 ~ 50,000 | 120 |
| 50,000 ~ 200,000 | 140 |
| 200,000 ~ 1,000,000 | 160 |
| > 1,000,000 | 200 |

**알고리즘**:
- 2개 `.zst` 파일을 각각 별도 `multiprocessing.Process`로 **동시** 스캔
- Reservoir Sampling (Knuth's algorithm, `RANDOM_SEED=42`)으로 단어별 target_n개 무작위 수집
- 1-gram 매칭 시 `(?<![a-zA-Z0-9])word(?!-[a-zA-Z0-9]|[a-zA-Z0-9])` 패턴으로 복합어 오매칭 방지
  - 예: "fire-fighter"에서 "fire" 오매칭 차단
- 두 워커 결과를 `context_id`(SHA-256 해시) 기반 중복 제거 후 병합, 최종 target_n으로 재샘플링
- 모든 단어가 target_n 도달 시 조기 종료

---

### Stage 6 — `reddit_slang_llm_judger.py`

**목적**: 수집된 Reddit 문맥을 LLM으로 판정해 슬랭 여부 결정 및 영어 정의 생성

| 항목 | 내용 |
|------|------|
| 입력 | `data_pipeline/data/scored_candidates.json` + `data_pipeline/candidate_context_cache.jsonl` |
| 출력 | `data_pipeline/output/word_summary.jsonl` |
| 모델 | `gpt-4.1-nano` (env `OPENAI_MODEL`로 변경 가능) |

**단어별 판정 흐름 (`process_word`)**:

```
캐시 문맥 수 < 60개 → decision = "drop" (insufficient_contexts)

초기 N0 = 60개 배치 LLM 판정
    K = 슬랭 판정 수
    ├─ K == 0   → decision = "drop"
    ├─ K >= 15  → decision = "enough_evidence"
    └─ 0 < K < 15 → 20개씩 추가 배치 반복
                     ├─ K >= 15 도달 → decision = "enough_evidence"
                     └─ n_max 소진   → decision = "holdout"
```

**n_max** (match_count 기준, Stage 5의 target_n과 동일한 tier):
`<10K→100, 10K~50K→120, 50K~200K→140, 200K~1M→160, >1M→200`

**핵심 설계**:
- 재실행 시 `decision == "drop"` 항목은 skip (drop 결과 보존)
- 판정 결과를 `word_summary.jsonl`에 즉시 flush (중단 후 재시작 지원)
- 슬랭 판정 문맥 텍스트(최대 8개, 각 300자 이하)로 `generate_definition` 호출 → `definition_en`, `slang_category` 생성
- `slang_category` 유효값: `internet_slang`, `aave`, `general_slang`, `colloquial`

**예시 — "cap" drop 사유**: 60개 문맥 전체가 "market cap", "salary cap" 등 비슬랭 용법이어서 K=0 → drop

---

### Stage 7 — `rank_final_candidates.py`

**목적**: LLM 판정 결과를 바탕으로 최종 우선순위 점수 산정 및 랭킹

| 항목 | 내용 |
|------|------|
| 입력 | `data_pipeline/output/word_summary.jsonl` |
| 출력 | `data_pipeline/output/ranked_candidates.jsonl` (3,293개) |

**사전 필터**:
- `decision == "drop"` → 제외
- `decision == "holdout"` → `slang_hits >= 3` AND `slang_ratio >= 1.67%` 미충족 시 추가 제외

**우선순위 점수 공식**:
```
slang_ratio     = slang_hits / sampled
expected_capped = min(match_count × slang_ratio, 3,000,000)

cat_conf = CATEGORY_CONF[slang_category]
           internet_slang / aave  → 1.0
           general_slang          → 0.85
           colloquial             → 0.65
           그 외 / None           → 0.5

cat_penalty     = (1 - cat_conf) × 0.4
penalty         = min(0.95, cat_penalty × (1 - slang_ratio))
priority_score  = log10(1 + expected_capped) × (1 - penalty)
```

- `is_vulgar` 플래그: 16개 명시적 비속어 목록 기반
- 출력 필드: `normalized_word`, `rank`, `priority_score`, `slang_category`, `slang_hits`, `slang_ratio`, `match_count`, `is_vulgar`, `holdout_included`

---

## 4. 서비스 투입 스크립트

Stage 1–7은 데이터셋 최초 구축 시 1회 실행 완료. 아래 스크립트는 반복 실행 가능하다.

### `add_korean_definitions.py`

**목적**: `final_dataset.jsonl`에 `definition_ko`(한국어 정의) + `category`(서비스용 카테고리) 추가

| 항목 | 내용 |
|------|------|
| 입력/출력 | `data_pipeline/output/final_dataset.jsonl` (in-place) |
| 모델 | `gpt-4.1-nano`, 배치 20개, temperature=0 |

**14개 카테고리**:
칭찬·인정, 긍정·동의, 감탄·놀람, 강조 표현, 일상 대화, SNS·인터넷 반응, 줄임말·약어, 감정 표현, 비판·부정 반응, 관계·연애, 유머·밈, 게임·커뮤니티, 돈·라이프스타일, 주의/거친 표현

**실행 옵션**:
```bash
python data_pipeline/add_korean_definitions.py             # definition_ko + category 신규 생성
python data_pipeline/add_korean_definitions.py --recategorize  # category만 재분류 (definition_ko 유지)
```

- 이미 처리된 단어(`definition_ko` + `category` 모두 있음)는 자동 스킵
- 카테고리는 1~3개 배열, 관련도 높은 순서로 반환

---

### `generate_examples.py`

**목적**: 검수 완료 단어에 학습자용 예문(`example_en`, `example_ko`) 생성

| 항목 | 내용 |
|------|------|
| 입력/출력 | `data_pipeline/output/service_public_approved.json` (in-place) |
| 체크포인트 | `data_pipeline/output/example_gen_progress.jsonl` (append) |
| 모델 | `gpt-4.1-nano`, 배치 20개, temperature=0 |

**예문 제약**: 1문장, 20단어 이하, 비속어/성적/폭력 내용 금지

```bash
python data_pipeline/generate_examples.py          # 미처리 단어만 이어서 생성
python data_pipeline/generate_examples.py --reset  # 처음부터 재생성
```

---

### `review_tool.py`

**목적**: 서비스 투입 후보 단어 수동 검수 CLI

| 항목 | 내용 |
|------|------|
| 입력 | `data_pipeline/output/service_public_pending.json` |
| 출력 | `service_public_approved.json` / `service_public_needs_revision.json` |
| 체크포인트 | `data_pipeline/output/review_progress.jsonl` (append) |

**검수 키**:

| 키 | 동작 |
|----|------|
| `1` | 승인 → `service_public_approved.json` |
| `2` | 보류 → pending에 유지 |
| `3` | 수정필요 → `service_public_needs_revision.json` |
| `s` | 저장 |
| `q` | 저장 후 종료 |

- 결정마다 즉시 flush (중단 후 재시작 안전)
- `--reset` 옵션으로 progress 초기화 후 재검수 가능

---

## 5. 최종 데이터셋 현황

| 파일 | 단어 수 | 용도 |
|------|---------|------|
| `output/final_dataset.jsonl` | 3,293 | 전체 후보 (definition_ko + category 포함) |
| `output/db_insert.json` | 3,293 | DB INSERT용 (final_dataset.jsonl 후처리 산출물) |
| `output/service_public_approved.json` | 384 | **최종 서비스 투입 단어** (수동 검수 완료) |
| `output/service_public_pending.json` | 2,909 | 보류 (추가 검토 필요) |

**difficulty_tier 기준** (rank 기반, final_dataset.jsonl 내 필드):
- `essential`: rank 1–200
- `common`: rank 201–700
- `supplemental`: rank 701+

**서비스 투입 단어 필드**:
`word`, `definition_en`, `definition_ko`, `example_en`, `example_ko`, `category`, `emoji`, `shorts_url`

---

## 6. 주요 설계 결정사항

### Reddit 문맥 수집에 Reservoir Sampling 사용
전체 수억 개 댓글을 스트리밍 처리하면서 단어별 고정 개수(최대 200개)를 균등 확률로 샘플링하기 위해 Knuth's Algorithm을 사용했다. 전체를 메모리에 적재하지 않고도 편향 없는 샘플을 얻을 수 있다.

### LLM 판정 기준: 60개 초기 배치 + K_TARGET=15
60개 문맥을 한 번에 보내 슬랭 판정을 받는 방식을 택했다. 60개 중 슬랭 판정이 0개(K=0)면 즉시 drop해 API 비용을 절감하고, 15개 이상이면 충분한 증거로 보아 추가 호출을 하지 않는다. 중간값(1~14개)은 20개씩 추가 배치를 반복한다.

### Category Confidence로 슬랭 순도 보정
Reddit match_count만으로 랭킹하면 slang 아닌 일반어가 상위에 오를 수 있다. slang_category별 신뢰도(`internet_slang/aave=1.0`, `colloquial=0.65` 등)를 penalty에 반영해 "명확한 슬랭"을 우선 배치한다.

### Drop 결과 보존
Stage 6에서 `decision=drop`으로 판정된 단어는 재실행 시 skip한다. 수억 건의 Reddit 문맥을 다시 보는 비용을 방지하고, 판정 결과의 일관성을 유지한다.

---

## 7. 하드코딩 경로

```
C:\Users\User\Downloads\reddit\comments\RC_2025-09.zst
C:\Users\User\Downloads\reddit\comments\RC_2025-12.zst
data_pipeline/dump/enwiktionary-20250920-pages-articles-multistream.xml.bz2
```

Stage 2 출력 경로(`matched_candidates.json` 등)는 실행 디렉터리 기준 상대경로로 하드코딩되어 있으므로, Stage 3 실행 시 `--input` 인자로 실제 경로를 명시해야 한다.
