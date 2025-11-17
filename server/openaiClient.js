const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "[WARN] OPENAI_API_KEY is not set. Please configure it in .env (local) or Railway env vars."
  );
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * 封裝與 OpenAI 對話
 * @param {Object} params
 * @param {string} params.systemPrompt - 角色 system prompt
 * @param {string} params.userMessage - 使用者訊息
 * @returns {Promise<string>} GPT 回覆內容
 */
async function chatWithOpenAI({ systemPrompt, userMessage }) {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ]
  });

  const reply = completion.choices?.[0]?.message?.content || "";
  return reply.trim();
}

module.exports = {
  chatWithOpenAI
};
