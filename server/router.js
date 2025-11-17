const { chatWithOpenAI } = require("./openaiClient");

// 載入五個角色設定
const chCustomerService = require("./roles/chCustomerService");
const cleanerMaster = require("./roles/cleanerMaster");
const storeManager = require("./roles/storeManager");
const deliveryStaff = require("./roles/deliveryStaff");
const ironingMaster = require("./roles/ironingMaster");

const roles = [
  chCustomerService,
  cleanerMaster,
  storeManager,
  deliveryStaff,
  ironingMaster
];

/**
 * 根據使用者文字判斷最適合的角色
 * 簡單關鍵字匹配（之後可升級成 GPT 判斷）
 */
function detectRole(text) {
  const lower = (text || "").toLowerCase();
  let bestRole = chCustomerService; // 預設 C.H 客服
  let bestScore = 0;

  for (const role of roles) {
    let score = 0;
    for (const kw of role.keywords || []) {
      if (!kw) continue;
      if (lower.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }

  // 沒有任何關鍵字就回到 C.H 客服
  return bestRole;
}

/**
 * 主處理邏輯：接收 userId & message，決定角色，呼叫 GPT
 */
async function handleChat(userId, message) {
  const role = detectRole(message);

  const userMessage = `
使用者ID: ${userId}
請以角色：「${role.displayName}」的身分回覆。

客戶訊息如下（繁體中文）：
${message}

回覆要求：
1. 使用繁體中文。
2. 口吻符合角色設定（${role.displayName}）。
3. 優先解決客戶實際問題，不廢話。
4. 若涉及清洗風險，務必說明「可能風險」與「無法百分之百保證」。
5. 不要編造與 C.H 精緻洗衣實際服務不符的內容。
`.trim();

  const reply = await chatWithOpenAI({
    systemPrompt: role.systemPrompt,
    userMessage
  });

  return {
    roleId: role.id,
    roleName: role.displayName,
    reply
  };
}

module.exports = {
  handleChat
};
