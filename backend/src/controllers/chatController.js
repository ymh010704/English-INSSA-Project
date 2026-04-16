import { getReply } from "../services/chatService.js";

export const chat = async (req, res) => {
    try {
        const { message, history, scenario } = req.body;
    
        const reply = await getReply(message, history, scenario);
        res.json({ reply });
    } catch (err) {
        console.error("Chat error:", err.message);

        if (err.status === 429) {
            return res.status(429).json({
                error: "Rate Limit Exceeded",
                message: "지금 질문이 너무 많아요! 1분만 뒤에 다시 물어봐 줄래? (No cap 🧢)"
            });
        }

        res.status(500).json({ error: "AI 응답 실패", details: err.message });
    }
};
