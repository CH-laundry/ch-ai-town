// server/router.js
const express = require("express");
const router = express.Router();

// 角色模組
// chCustomerService / storeManager 這兩個是「函式」型角色（自己會呼叫 OpenAI）
// 其它幾個是「設定檔」型角色（只有 systemPrompt，要在這裡幫它們呼叫 OpenAI）
const chCustomerService = require("./roles/chCustomerService");
const storeManagerRoleFn = require("./roles/storeManager");
const cleanerMasterRoleConfig = require("./roles/cleanerMaster");
const ironingMasterRoleConfig = require("./roles/ironingMaster");
const deliveryStaffRoleConfig = require("./roles/deliveryStaff");

// 共用 OpenAI client（已經處理好 .env + mock）
const openai = require("./openaiClient");

/**
 * ✅ 同時支援「舊的 snake_case」跟「新的 camelCase」 roleId
 *  - 前端現在用：chCustomerService / shopManager / cleanerMaster / ironingMaster / deliveryStaff
 *  - 舊代碼可能還有：ch_customer_service / store_manager / cleaner_master / ironing_master / delivery_staff
 */
const roleMap = {
  // 新版 camelCase
  chCustomerService: chCustomerService,
  shopManager: storeManagerRoleFn,
  cleanerMaster: cleanerMasterRoleConfig,
  ironingMaster: ironingMasterRoleConfig,
  deliveryStaff: deliveryStaffRoleConfig,

  // 舊版 snake_case（保留相容性）
  ch_customer_service: chCustomerService,
  store_manager: storeManagerRoleFn,
  cleaner_master: cleanerMasterRoleConfig,
  ironing_master: ironingMasterRoleConfig,
  delivery_staff: deliveryStaffRoleConfig,
};

/**
 * 共用：幫「各種型態角色」實際跑一輪聊天
 * - 若角色 export 是 async function → 直接呼叫（如：chCustomerService, storeManager）
 * - 若角色 export 是設定物件 → 使用裡面的 systemPrompt 走 openaiClient
 */
async function runRoleChat(roleId, roleDef, message, userId) {
  // 1) 函式型角色：直接丟給它處理（內部自己決定怎麼叫 OpenAI）
  if (typeof roleDef === "function") {
    return await roleDef(message, userId);
  }

  // 2) 設定檔型角色：用它的 systemPrompt 來叫 OpenAI
  const systemPrompt =
    roleDef.systemPrompt ||
    `
你是「C.H 精緻洗衣」的專業人員（角色：${
      roleDef.displayName || roleDef.name || roleId
    }）。
請用專業但好懂的繁體中文，保守評估，清楚說明風險，不亂保證，必要時提醒客戶實際結果需以門市與師傅評估為準。
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.6,
      max_tokens: 512,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "目前系統回覆內容有點異常，建議稍後再試一次，或改由官方 LINE 詢問。";

    return {
      reply,
      roleId,
      userId,
    };
  } catch (err) {
    console.error(`[${roleId}] OpenAI error:`, err);
    return {
      reply:
        "目前系統連線有問題，暫時沒辦法即時回答，建議稍後再試，或改由官方 LINE 詢問真人客服。",
      roleId,
      userId,
      error: true,
    };
  }
}

/**
 * ✅ /chat：前端所有對話（包含小鎮、按鈕、洗鞋估價最後那題）都打這支
 */
router.post("/chat", async (req, res) => {
  try {
    const { userId, roleId, message } = req.body;

    if (!roleId || !message) {
      const msg = "系統錯誤：缺少 roleId 或 message。";
      return res.status(400).json({ error: msg, reply: msg });
    }

    const roleDef = roleMap[roleId];

    if (!roleDef) {
      const msg = `系統設定錯誤：找不到對應角色（roleId: ${roleId}）。`;
      console.error("[/api/chat] invalid roleId:", roleId);
      return res.status(400).json({ error: msg, reply: msg });
    }

    const rawResult = await runRoleChat(roleId, roleDef, message, userId);

    let reply =
      (rawResult &&
        (rawResult.reply || rawResult.message || rawResult.content || ""))
        .toString()
        .trim() || "";

    // 保底：任何空字串 / 舊版「無回應內容」全部統一成錯誤提示
    if (!reply || reply.includes("無回應內容")) {
      reply =
        "系統目前連線異常，請稍後再試，或改由官方 LINE 詢問真人客服。";
    }

    return res.json({ reply, roleId, userId });
  } catch (err) {
    console.error("[/api/chat] unexpected error:", err);
    const msg =
      "系統目前連線有問題，建議稍後再試，或改由官方 LINE 詢問真人客服。";
    return res.status(500).json({ error: "Internal server error", reply: msg });
  }
});

/**
 * ✅ /roles：回傳給前端用的角色列表（這裡用 camelCase 當標準）
 */
router.get("/roles", (req, res) => {
  res.json({
    roles: [
      { id: "chCustomerService", name: "C.H 客服" },
      { id: "shopManager", name: "店長" },
      { id: "cleanerMaster", name: "清潔師傅" },
      { id: "ironingMaster", name: "熨燙師傅" },
      { id: "deliveryStaff", name: "外送員" },
    ],
  });
});

module.exports = router;
