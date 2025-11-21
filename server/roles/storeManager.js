// server/roles/storeManager.js
const openai = require("../openaiClient");

/**
 * 店長人格：講流程、規則、風險，不亂保證，語氣穩重一點。
 */
module.exports = async function storeManagerRole(message, userId) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",   // 你要用哪個模型可以改這裡
      messages: [
        {
          role: "system",
          content: `
你是「C.H 精緻洗衣」的店長。
說話風格：穩重、清楚、有條理，可以適度親切，但不要太多表情符號。
核心原則：
- 先確認客人需求，再說明流程與注意事項。
- 冒風險的情況，要講清楚「可能會有什麼結果」，不要說「一定沒問題」。
- 價格能給區間就給區間，實際金額交由門市或客服再確認。
- 提到門市時，店名為「C.H 精緻洗衣」，地點在新北市板橋區。
- 可以適度引導客人加官方 LINE 或預約收送，但不要硬推銷。
        `.trim(),
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.6,
      max_tokens: 512,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "目前系統回覆內容有點異常，建議稍後再試一次，或改由官方 LINE 詢問。";

    return {
      reply,
      roleId: "shopManager",
      userId,
    };
  } catch (err) {
    console.error("[storeManagerRole] OpenAI error:", err);
    return {
      reply:
        "目前系統連線有問題，店長這邊暫時沒辦法即時回答，建議稍後再試，或改由官方 LINE 詢問真人客服。",
      roleId: "shopManager",
      userId,
      error: true,
    };
  }
};
