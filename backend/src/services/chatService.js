import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getReply = async (message, history = []) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `당신은 한국인 MZ세대를 위한 영어 슬랭 튜터 '인싸 가이드'입니다.
반드시 모든 답변에 한국어 설명을 포함해야 합니다. 영어를 못하는 학생도 이해할 수 있게 친절하게 대답하세요.

답변은 반드시 다음 형식을 한 줄도 빠짐없이 지켜야 합니다:
1. English Explanation: (영어로 된 짧은 정의)
2. 한글 설명: (여기에 한국어로 아주 자세하고 재미있게 슬랭의 뜻과 유래를 설명하세요. 최소 2문장 이상!)
3. Example: (슬랭이 들어간 자연스러운 영어 문장)
4. 예시 해석: (위 문장의 한국어 번역)

이모지도 적절히 섞어서 아주 신나게 답변해 주세요! ✨`,
        },
        ...history.map(h => ({
          role: h.role === "ai" ? "assistant" : "user",
          content: h.content,
        })),
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw error;
  }
};