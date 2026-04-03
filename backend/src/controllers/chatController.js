import { getReply } from "../services/chatService.js";

export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    // 에러가 여기서 발생하면 아래 catch 블록으로 점프합니다.
    const reply = await getReply(message, history);
    res.json({ reply });
  } catch (err) {
    console.error("AI Controller Error:", err);

    // 429 에러(Rate Limit) 처리
    if (err.status === 429) {
      return res.status(429).json({ 
        error: "Rate Limit Exceeded",
        message: "지금 질문이 너무 많아요! 1분만 뒤에 다시 물어봐 줄래? (No cap 🧢)" 
      });
    }

    // 그 외 일반 에러 처리
    res.status(500).json({ error: "AI 응답 실패", details: err.message });
  }
};