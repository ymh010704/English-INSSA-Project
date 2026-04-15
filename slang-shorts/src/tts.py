import os
from google.cloud import texttospeech


def generate_audio(narration: str, output_path: str) -> str:
    """
    Google TTS로 나레이션 음성 파일 생성
    반환: output_path
    """
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=narration)

    # 한국어 여성 목소리
    voice = texttospeech.VoiceSelectionParams(
        language_code="ko-KR",
        name="ko-KR-Neural2-A",  # 자연스러운 한국어 여성 목소리
        ssml_gender=texttospeech.SsmlVoiceGender.FEMALE,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=1.05,  # 쇼츠용으로 약간 빠르게
        pitch=1.0,
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config,
    )

    with open(output_path, "wb") as f:
        f.write(response.audio_content)

    print(f"[TTS] 음성 저장 완료: {output_path}")
    return output_path
