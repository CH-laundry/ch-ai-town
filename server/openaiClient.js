// 🔥 不管誰先 require，我自己先載入 .env
require("dotenv").config();

const OpenAI = require("openai");

// 如果 .env 還是沒有金鑰 → 給清楚的 warning 並中止 new OpenAI()
if (!process.env.OPENAI_API_KEY) {
  console.warn("[ERROR] OPENAI_API_KEY not found in .env or environment.");
  console.warn("[ERROR] Please add OPENAI_API_KEY to your .env file.");
  // 避免 Node 直接 crash，回傳一個 mock client，而不是 throw error
  module.exports = {
    chat: {
      completions: {
        create: async () => ({
          choices: [
            {
              message: {
                content:
                  "(本機模式) 因為沒有 OPENAI_API_KEY，所以使用 mock 回覆。",
              },
            },
          ],
        }),
      },
    },
  };
  return; // ⚠️ 一定要 return 避免執行 new OpenAI()
}

// 有金鑰 → 用真的 OpenAI client
module.exports = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
