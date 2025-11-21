const express = require("express");
const router = express.Router();

const chCustomerService = require("./roles/chCustomerService");
const storeManager = require("./roles/storeManager");
const cleanerMaster = require("./roles/cleanerMaster");
const ironingMaster = require("./roles/ironingMaster");
const deliveryStaff = require("./roles/deliveryStaff");

/**
 * ✅ 同時支援「舊的 snake_case」跟「新的 camelCase」 roleId
 *  - 前端現在用：chCustomerService / shopManager / cleanerMaster / ironingMaster / deliveryStaff
 *  - 舊代碼可能還有：ch_customer_service / store_manager / cleaner_master / ironing_master / delivery_staff
 */
const roleMap = {
  // 舊版 snake_case
  ch_customer_service: chCustomerService,
  store_manager: storeManager,
  cleaner_master: cleanerMaster,
  ironing_master: ironingMaster,
  delivery_staff: deliveryStaff,

  // 新版 camelCase（給小鎮前台用）
  chCustomerService: chCustomerService,
  shopManager: storeManager,
  cleanerMaster: cleanerMaster,
  ironingMaster: ironingMaster,
  deliveryStaff: deliveryStaff
};

/**
 * 統一把各個角色模組的回傳值，整理成 { reply, raw } 格式
 */
function normalizeReply(raw, fallbackMessage) {
  if (!raw) {
    return {
      reply: fallbackMessage,
      raw: null
    };
  }

  // 角色如果直接回傳字串
  if (typeof raw === "string") {
    return {
      reply: raw,
      raw
    };
  }

  // 角色回傳物件：盡量從常見欄位抓字
  if (typeof raw === "object") {
    const replyText =
      raw.reply ||
      raw.message ||
      raw.content ||
      "";

    return {
      reply: replyText && replyText.trim()
        ? replyText
        : fallbackMessage,
      raw
    };
  }

  // 其他奇怪型別
  return {
    reply: fallbackMessage,
    raw
  };
}

router.post("/chat", async (req, res) => {
  try {
    const { userId, roleId, message } = req.body;

    if (!roleId || !message) {
      const msg = "系統錯誤：缺少 roleId 或 message。";
      return res.status(400).json({
        error: msg,
        reply: msg
      });
    }

    const roleFn = roleMap[roleId];

    // ✅ 避免再出現「roleFn is not a function」直接爆掉
    if (!roleFn || typeof roleFn !== "function") {
      const msg = `系統設定錯誤：找不到對應角色或角色未正確設定（roleId: ${roleId}）。`;
      console.error("[ERROR /chat] invalid roleId:", roleId);
      return res.status(400).json({
        error: msg,
        reply: msg
      });
    }

    // ✅ 呼叫對應角色邏輯（各角色自己去 call OpenAI）
    const rawResult = await roleFn(message, userId);

    // ✅ 統一輸出結構，前端只要讀 data.reply 就有字
    const { reply } = normalizeReply(
      rawResult,
      "系統目前連線異常，請稍後再試，或改由真人客服協助。"
    );

    return res.json({
      reply,
      roleId,
      userId
    });
  } catch (err) {
    console.error("[ERROR /chat]", err);
    const msg = "系統目前連線有問題，建議稍後再試，或改由真人客服協助。";
    // 即使 500，一樣帶 reply，讓前端有東西可以顯示
    return res.status(500).json({
      error: "Internal server error",
      reply: msg
    });
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
      { id: "deliveryStaff", name: "外送員" }
    ]
  });
});

module.exports = router;
