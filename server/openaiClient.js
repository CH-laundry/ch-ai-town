// 🔥 強制載入 dotenv（在 Node v24 裡要放在第一行、不能被包在 function 或 module.exports 裡）
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const OpenAI = require("openai");

// ⭐ 這裡直接印出 process.env.OPENAI_API_KEY 的前 5 碼
// ⭐ 用來驗證「到底 dotenv 有沒有被讀取」
// ⭐ 本機測試用，線上 Railway 不會出現問題
console.log("[DEBUG] Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.slice(0, 5) + "..." : "EMPTY");

if (!process.env.OPENAI_API_KEY) {
  console.warn("[ERROR] OPENAI_API_KEY is missing. Using local mock client instead.");

  module.exports = {
    chat: {
      completions: {
        create: async () => ({
          choices: [
            {
              message: {
                content:
                  "(本機測試模式) 因為缺少 OPENAI_API_KEY，使用 mock AI 回覆。",
              },
            },
          ],
        }),
      },
    },
  };
  return;
}

module.exports = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
