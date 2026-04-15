import os
import json
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")


def generate_script(word: str, definition_ko: str, example_en: str, example_ko: str) -> dict:
    """
    슬랭 단어를 받아 쇼츠용 스크립트와 Veo 프롬프트를 생성합니다.
    반환: { narration, subtitles, veo_prompt }
    """
    prompt = f"""
You are a creative script writer for Korean English learning Shorts videos.

Slang word: "{word}"
Korean meaning: "{definition_ko}"
Example (EN): "{example_en}"
Example (KO): "{example_ko}"

Create a 30-second Shorts script in JSON format:
{{
  "narration": "Full Korean narration script (TTS용, 30초 분량)",
  "subtitles": [
    {{"time": 0.0, "text": "자막 텍스트"}},
    ...
  ],
  "veo_prompt": "A vibrant, trendy short-form video showing young people using the slang '{word}' in a real-life situation. Bright colors, dynamic cuts, Gen Z aesthetic, no text overlays, 9:16 vertical format."
}}

Rules:
- narration은 훅(hook) → 단어 소개 → 예문 → 정리 구조
- subtitles는 narration 타이밍에 맞게 5~8개
- veo_prompt는 영어로, 영상 분위기만 묘사 (텍스트/자막 없이)
- JSON만 반환, 다른 텍스트 없이
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
