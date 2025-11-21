// server/roles/storeManager.js
// 店長角色：直接用 fetch 呼叫 OpenAI 的 chat completions API

const MODEL = "gpt-4.1-mini"; // 你可以改成你有在用的模型名稱

module.exports = async function storeManagerRole(message, userId) {
  const apiKey = process.env.OPENAI_API_KEY;

  // 1) 先確認環境變數有沒有載到
  if (!apiKey) {
    console.error("[storeManagerRole] OPENAI_API_KEY is missing");
    return {
      reply:
        "後端尚未設定 OPENAI_API_KEY，暫時無法由 AI 回覆，請通知管理者檢查伺服器設定。",
      roleId: "shopManager",
      userId,
      error: true,
    };
  }

  try {
    // 2) 呼叫 OpenAI API（直接用 HTTP，不走 openaiClient）
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
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
      }),
    });

    const data = await resp.json();
    console.log("[storeManagerRole] OpenAI raw response:", data);

    if (!resp.ok) {
      const errMsg =
        data && data.error && data.error.message
          ? data.error.message
          : "未知錯誤";
      return {
        reply: `後端 AI 呼叫失敗：${errMsg}（請通知管理者檢查 API key / 模型權限）`,
        roleId: "shopManager",
        userId,
        error: true,
      };
    }

    const reply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content.trim()
        : "";

    if (!reply) {
      return {
        reply:
          "AI 回覆內容是空的，可能是系統暫時異常，建議稍後再試或改由官方 LINE 詢問。",
        roleId: "shopManager",
        userId,
        error: true,
      };
    }

    // ✅ 正常回覆
    return {
      reply,
      roleId: "shopManager",
      userId,
    };
  } catch (err) {
    console.error("[storeManagerRole] OpenAI request error:", err);
    return {
      reply:
        "目前系統連線有問題，店長這邊暫時沒辦法即時回答，建議稍後再試，或改由官方 LINE 詢問真人客服。",
      roleId: "shopManager",
      userId,
      error: true,
    };
  }
};
