import os
import json
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def generate_script(word: str, definition_ko: str, example_en: str, example_ko: str = "") -> dict:
    prompt = f"""
Create a natural 8-second 'Yanadoo' style script for the slang "{word}".

[Goal]
Imagine a situation where a young foreigner and an elderly Korean person are interacting. 
The slang "{word}" must be used naturally in their conversation.

[Rules for veo_prompt]
1. SCENE: A specific place (e.g., Donut shop, Cafe, Park, or Street).
2. CHARACTERS: 
   - A young foreigner (English speaker)
   - An elderly Korean person (Korean speaker)
3. LIP-SYNC DIALOGUE:
   - 0s-3s: The foreigner says a short English sentence using "{word}".
   - 4s-8s: The elderly person responds in Korean, naturally incorporating "{word}" or reacting to its meaning.
   - Example: The grandmother says in Korean: "아~ 그게 바로 {word}라는 거구만!"
4. CAMERA: Start with a medium shot, then a DRAMATIC CLOSE-UP on the elderly person's face at 4s.
5. NO TEXT: Absolutely no letters or subtitles in the background.
6. SAFETY: The scene must be bright, cheerful, and family-friendly. NO dark, scary, ghost, supernatural, or violent imagery. Always use a positive, funny, or warm tone.
7. SLANG MEANING ONLY: The word "{word}" is a modern internet slang meaning "{definition_ko}". Do NOT use the literal/traditional meaning of the word. The scene must reflect ONLY the slang meaning. For example, "Slay" means "to do something impressively" NOT "to kill". "Ghosting" means "ignoring someone" NOT a ghost/supernatural event.

Slang: {word} ({definition_ko})

Return ONLY JSON:
{{
  "narration": "{word}의 뜻은 {definition_ko}입니다. 실생활에선 이렇게 쓰이죠.",
  "subtitles": [
    {{ "time": 0.0, "text": "외국인: (단어 사용 상황)" }},
    {{ "time": 4.0, "text": "할머니: 아~ 이게 바로 {word}!" }}
  ],
  "veo_prompt": "A cinematic medium shot of a young foreigner and a Korean grandmother in a bright [SETTING]. The foreigner says something using '{word}'. Then, a dramatic close-up of the grandmother's face as she smirks and says in Korean: '(Natural Korean response)'. 4K, realistic, 9:16, NO TEXT in scene."
}}
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
