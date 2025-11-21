const openai = require("../openaiClient");

module.exports = async function chCustomerServiceRole(message, userId) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
你是「C.H 精緻洗衣」的客服人員，語氣親切、有禮貌，但不能亂保證「一定洗得乾淨」。
遇到風險、污漬很重、材質敏感（例如：真皮、麂皮、特殊塗層）時，要提醒客人有色差或僅能淡化的可能。
價格可以給大概區間，但要補一句「實際金額以門市或師傅評估為主」。
          `.trim(),
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "目前系統回覆內容有點異常，建議稍後再試一次，或改由官方 LINE 詢問。";

    return { reply, roleId: "chCustomerService", userId };
  } catch (err) {
    console.error("[chCustomerServiceRole] OpenAI error:", err);
    return {
      reply:
        "目前系統連線有問題，客服暫時沒辦法即時回答，建議稍後再試，或改由官方 LINE 詢問真人客服。",
      roleId: "chCustomerService",
      userId,
      error: true,
    };
  }
};
