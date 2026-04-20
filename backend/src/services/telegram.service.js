import axios from 'axios';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendDailyWord(slang) {
  const text =
    `📚 *오늘의 영어 슬랭*\n\n` +
    `✨ *${slang.word}*\n` +
    `${slang.definition_ko}\n\n` +
    `💬 *예문*\n"${slang.example_en}"\n\n` +
    `🇰🇷 *해석*\n"${slang.example_ko}"`;

  await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'Markdown',
  });

  console.log(`[Telegram] 발송 완료: ${slang.word}`);
}
