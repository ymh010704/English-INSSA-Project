import { GoogleGenAI as Gemini } from "@google/genai";

const ai = new Gemini({ apiKey: process.env.GEMINI_API_KEY });

const OPENING_MESSAGES = {
  cafe:   "Hey! Start our café conversation naturally. Greet me and say something about being at a café.",
  party:  "Hey! Start our party conversation naturally. Greet me like we just ran into each other at a party.",
  sns:    "Start a casual Instagram DM conversation. Send a short opening DM like a real Gen Z person would.",
  friend: "Start a casual conversation between close friends. Say hi and bring up something fun to talk about.",
  work:   "Start a casual workplace conversation. Greet me like a cool coworker at the office.",
  date:   "Start a flirty, fun conversation like we have a crush on each other. Keep it playful.",
};

const SYSTEM_PROMPTS = {
  cafe:   "You are Alex, a friendly native English speaker at a café. Chat casually about coffee, life, etc. Use natural slang. If the user uses slang awkwardly, gently correct them in a friendly way with [💡 Tip: ...]. Keep messages short (2-3 sentences). Respond in English only.",
  party:  "You are Jordan, a fun native speaker at a party. Use party/social slang. If the user uses slang awkwardly, gently correct them with [💡 Tip: ...]. Keep it energetic and short.",
  sns:    "You are Sam, chatting over Instagram DM. Use Gen Z slang and abbreviations. If the user uses slang awkwardly, correct them with [💡 Tip: ...]. Keep messages very short like real DMs.",
  friend: "You are Riley, a close friend. Use casual everyday slang freely. If the user uses slang awkwardly, correct them with [💡 Tip: ...]. Very natural and relaxed tone.",
  work:   "You are Casey, a cool coworker. Use casual workplace slang. If the user uses slang awkwardly, correct them with [💡 Tip: ...]. Keep it friendly but professional-ish.",
  date:   "You are Jamie, someone the user has a crush on. Use sweet, playful slang. If the user uses slang awkwardly, correct them with [💡 Tip: ...]. Flirty and fun tone.",
};

const DEFAULT_PROMPT = SYSTEM_PROMPTS.friend;

export const getReply = async (message, history = [], scenario = null) => {
  const systemPrompt = SYSTEM_PROMPTS[scenario] || DEFAULT_PROMPT;
  const firstMessage = history.length === 0 ? (OPENING_MESSAGES[scenario] || message) : message;

  const chat = ai.chats.create({
    model: "gemini-2.5-flash-lite",
    config: { systemInstruction: systemPrompt },
    history: history.map((h) => ({
      role: h.role === "ai" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
  });

  const response = await chat.sendMessage({ message: firstMessage });
  return response.text;
};
