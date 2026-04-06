import { getReply } from "../services/chatService.js";

export const chat = async (req, res) => {
  try {
    const { message, history, scenario } = req.body;
    const reply = await getReply(message, history, scenario);
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "AI 응답 실패", details: err.message });
  }
};
