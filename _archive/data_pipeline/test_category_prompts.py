"""
카테고리 프롬프트 변형 테스트
여러 프롬프트로 동일 단어들을 분류해 최적안 탐색
"""
import json, os, sys, time
from openai import OpenAI

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "gpt-4.1-nano"

CATEGORIES_KO = [
    "칭찬·인정", "긍정·동의", "감탄·놀람", "강조 표현",
    "일상 대화", "SNS·인터넷 반응", "줄임말·약어", "감정 표현",
    "비판·부정 반응", "관계·연애", "유머·밈", "게임·커뮤니티",
    "돈·라이프스타일", "주의/거친 표현",
]
CAT_LIST = ", ".join(f'"{c}"' for c in CATEGORIES_KO)

# 테스트 단어
TEST_WORDS = [
    {"word": "lmao",   "definition_en": "An acronym for 'laughing my ass off,' used to express amusement or that something is very funny."},
    {"word": "omg",    "definition_en": "Oh My God; exclamation of surprise, shock, excitement, or disbelief."},
    {"word": "wtf",    "definition_en": "What the fuck; an exclamation of shock, disbelief, or frustration."},
    {"word": "ngl",    "definition_en": "Not gonna lie; used to introduce an honest or slightly embarrassing admission."},
    {"word": "goat",   "definition_en": "Greatest Of All Time; used to describe someone as the absolute best at something."},
    {"word": "dm",     "definition_en": "To send a private message or direct message to someone online."},
    {"word": "rizz",   "definition_en": "Rizz refers to a person's charm or charisma, especially when attracting others romantically."},
    {"word": "cringe", "definition_en": "Something that causes feelings of embarrassment, awkwardness, or secondhand shame."},
    {"word": "bet",    "definition_en": "Expression of agreement or affirmation; 'okay', 'sure', or 'for sure'."},
    {"word": "sus",    "definition_en": "Suspicious; behaving in a sketchy or untrustworthy way."},
    {"word": "cap",    "definition_en": "To lie or exaggerate; 'no cap' means 'for real' or 'I'm not lying'."},
    {"word": "af",     "definition_en": "As fuck; used as a slang intensifier (e.g., 'tired af', 'cute af')."},
    {"word": "irl",    "definition_en": "In real life; used to distinguish real-world situations from online ones."},
    {"word": "fomo",   "definition_en": "Fear Of Missing Out; anxiety about missing exciting or interesting events."},
    {"word": "slay",   "definition_en": "To perform or look exceptionally well; to dominate or impress greatly."},
]

# ── 프롬프트 변형들 ──────────────────────────────────────────────────────────────

VARIANTS = {

    "A. 현재 (기준선)": (
        "You are a Korean-English bilingual dictionary editor for a language learning app targeting Korean adults. "
        "For each slang word, pick the best category from this list: " + CAT_LIST + "\n\n"
        "Rules:\n"
        "- Choose 1 to 3 categories (most relevant first).\n"
        "- Return as a JSON array.\n"
        "- Base it on how the word is actually used, not its literal meaning."
    ),

    "B. 제약 제거 (중립)": (
        "You are a Korean-English bilingual dictionary editor for a language learning app targeting Korean adults. "
        "For each slang word, pick the best category from this list: " + CAT_LIST + "\n\n"
        "Rules:\n"
        "- Choose 1 to 3 categories (most relevant first).\n"
        "- Return as a JSON array.\n"
        "- Consider both the word's form (e.g. is it an abbreviation?) and how it is used."
    ),

    "C. 줄임말 명시": (
        "You are a Korean-English bilingual dictionary editor for a language learning app targeting Korean adults. "
        "For each slang word, pick the best category from this list: " + CAT_LIST + "\n\n"
        "Rules:\n"
        "- Choose 1 to 3 categories (most relevant first).\n"
        "- Return as a JSON array.\n"
        "- '줄임말·약어' applies when the word itself IS an abbreviation or acronym (e.g. lmao, omg, goat). "
        "Include it alongside the meaning-based category.\n"
        "- Other categories are meaning/usage based."
    ),

    "E. 정의 기반 판단": (
        "You are a Korean-English bilingual dictionary editor for a language learning app targeting Korean adults. "
        "For each slang word, pick the best category from this list: " + CAT_LIST + "\n\n"
        "Rules:\n"
        "- Choose 1 to 3 categories (most relevant first).\n"
        "- Return as a JSON array.\n"
        "- '줄임말·약어': the word is formed from initials or shortened letters of a phrase. "
        "Check the definition — if it says 'acronym for', 'stands for', or spells out a full phrase "
        "(like 'Greatest Of All Time', 'Fear Of Missing Out'), include '줄임말·약어'.\n"
        "- Always pair '줄임말·약어' with a meaning-based category.\n"
        "- Regular slang words that are NOT abbreviations (sus, cap, rizz, slay) do NOT get '줄임말·약어'."
    ),

    "D. 예시 포함": (
        "You are a Korean-English bilingual dictionary editor for a language learning app targeting Korean adults. "
        "For each slang word, pick the best category from this list: " + CAT_LIST + "\n\n"
        "Rules:\n"
        "- Choose 1 to 3 categories (most relevant first).\n"
        "- Return as a JSON array.\n"
        "- Consider BOTH what the word IS (form) and how it is USED (meaning).\n"
        "- If the word is an abbreviation or acronym, always include '줄임말·약어'.\n"
        "- Examples: lmao → ['감탄·놀람', '줄임말·약어'], slay → ['칭찬·인정'], bet → ['긍정·동의', '일상 대화']"
    ),
}

USER_TMPL = (
    "Categorize these slang words. "
    "Return JSON: {{\"results\": [{{\"word\": \"...\", \"category\": [\"...\", \"...\"]}}, ...]}}\n\n"
    "{items}"
)


def call(system: str, words: list[dict]) -> dict[str, list]:
    items = "\n".join(f'- word: "{w["word"]}", definition_en: "{w["definition_en"]}"' for w in words)
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": USER_TMPL.format(items=items)},
        ],
        response_format={"type": "json_object"},
        max_tokens=len(words) * 60 + 200,
        temperature=0,
    )
    payload = json.loads(resp.choices[0].message.content or "{}")
    return {r["word"]: r.get("category", []) for r in payload.get("results", []) if "word" in r}


def main():
    # 줄임말인지 아닌지 기대값
    abbr_words = {"lmao", "omg", "wtf", "ngl", "goat", "dm", "af", "irl", "fomo"}

    for name, system in VARIANTS.items():
        print(f"\n{'='*55}")
        print(f"변형 {name}")
        print('='*55)
        result = call(system, TEST_WORDS)
        time.sleep(0.5)

        abbr_hits = 0
        for w in TEST_WORDS:
            cats = result.get(w["word"], [])
            is_abbr = w["word"] in abbr_words
            has_abbr_cat = "줄임말·약어" in cats
            flag = ""
            if is_abbr and not has_abbr_cat:
                flag = "  ← 줄임말 누락"
            elif is_abbr and has_abbr_cat:
                flag = "  ✓"
                abbr_hits += 1
            print(f"  {w['word']:<10} {cats}{flag}")

        print(f"\n  줄임말 정확도: {abbr_hits}/{len(abbr_words)} ({abbr_hits/len(abbr_words)*100:.0f}%)")


if __name__ == "__main__":
    main()
