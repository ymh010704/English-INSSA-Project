import os
import json
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def generate_script(word: str, definition_ko: str, example_en: str, example_ko: str = "") -> dict:
    """
    슬랭 단어를 받아 쇼츠용 스크립트와 Veo 프롬프트를 생성합니다.
    반환: { narration, subtitles, veo_prompt }
    """
    prompt = f"""
You are a creative director for English learning TikTok/Shorts.
Based on the slang "{word}", create a high-fidelity video prompt for Google Veo 3.1.

Rules for Veo 3.1 Prompt:
1. Include dialogue: Use 'Character says: "actual line"' format for lip-sync.
2. Include audio: Describe SFX and ambient sounds.
3. Structure: [Camera] + [Subject/Action] + [Setting] + [Style] + [Audio].

Slang: {word} ({definition_ko})
Example: {example_en}

Return only a JSON object:
{{
  "narration": "전체 한국어 해설 (TTS용, 8초 이내, 짧고 임팩트 있게)",
  "subtitles": [ {{"time": 0.0, "text": "자막"}} ],
  "veo_prompt": "A medium shot of an elderly Korean grandmother with permed gray hair and a young Black male in a sunny cafe. The grandmother looks at the man and says in Korean: '이거 완전 {word}네!'. The man laughs warmly and says in Korean: '맞아, {word} 진짜 딱이야!'. SFX: Busy cafe ambience, clinking of coffee cups, cheerful laughter. Style: 4K, cinematic lighting, vibrant colors, 9:16 aspect ratio."
}}

Rules:
- narration은 8초 이내 한국어, 최대한 짧고 핵심만
- subtitles는 narration 타이밍에 맞게 2~3개, 마지막 자막 time은 7.0 이하
- JSON만 반환, 다른 텍스트 없이
"""
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
