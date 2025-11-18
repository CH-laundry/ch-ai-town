// public/app.js
// 版本：per-role 對話 + 後端角色 key 對齊

(function () {
  // ===== 1. 角色設定：這裡的 id 要跟 server/roles 下的檔名 key 對得上 =====
  const roles = [
    {
      // 對應 roles/chCustomerService.js
      id: "chCustomerService",
      name: "C.H 客服",
      icon: "💬",
      badge: "對話 · 介紹服務 · 回覆一般問題",
      samples: [
        "這個油漬有機會洗乾淨嗎？",
        "你們有提供免費收送嗎？",
        "精品包清洗大概多少價格？",
      ],
    },
    {
      // 對應 roles/shopManager.js
      id: "shopManager",
      name: "店長",
      icon: "🧾",
      badge: "掌握全局 · 說明流程與注意事項",
      samples: ["收件流程是怎麼跑的？", "哪些情況會列入高風險清洗？"],
    },
    {
      // 對應 roles/cleanerMaster.js
      id: "cleanerMaster",
      name: "清潔師傅",
      icon: "🧴",
      badge: "分析材質 · 污漬風險與能否清潔",
      samples: [
        "這件白襯衫黃漬能處理到什麼程度？",
        "麂皮鞋子發霉還能救嗎？",
      ],
    },
    {
      // 對應 roles/ironingMaster.js
      id: "ironingMaster",
      name: "熨燙師傅",
      icon: "🧺",
      badge: "熨燙細節 · 版型與變形風險",
      samples: ["西裝可以整燙到很挺但不傷布料嗎？"],
    },
    {
      // 對應 roles/deliveryStaff.js
      id: "deliveryStaff",
      name: "外送員",
      icon: "🚚",
      badge: "收送時間 · 區域與聯絡相關問題",
      samples: ["板橋收送大概什麼時間可以到？", "可以幫我改送回時間嗎？"],
    },
  ];

  let currentRole = roles[0];
  const conversations = {}; // roleId -> [{ type: 'user'|'ai'|'system', text }]
  const userId = "web-" + Math.random().toString(36).slice(2);

  // ===== 2. 抓 DOM =====
  const roleTabsEl = document.getElementById("role-tabs");
  const chatBoxEl = document.getElementById("chat-box");
  const quickQuestionsEl = document.getElementById("quick-questions");
  const currentRoleNameEl = document.getElementById("current-role-name");
  const roleBadgeEl = document.getElementById("role-badge");
  const chatFormEl = document.getElementById("chat-form");
  const userInputEl = document.getElementById("user-input");

  if (!roleTabsEl || !chatBoxEl || !chatFormEl) {
    console.warn("[C.H AI Town] 必要元素缺失，app.js 未啟動。");
    return;
  }

  // ===== 3. 工具：初始化對話 =====
  function ensureConversation(role) {
    if (!conversations[role.id]) {
      conversations[role.id] = [
        {
          type: "system",
          text: `你現在在和「${role.name}」對話：${role.badge}`,
        },
      ];
    }
  }

  // ===== 4. 畫角色 tabs =====
  function renderRoleTabs() {
    roleTabsEl.innerHTML = "";
    roles.forEach((r) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "role-tab" + (r.id === currentRole.id ? " active" : "");
      btn.dataset.roleId = r.id;
      btn.innerHTML = `
        <span class="icon">${r.icon}</span>
        <span class="label">${r.name}</span>
      `;
      btn.addEventListener("click", () => switchRole(r.id));
      roleTabsEl.appendChild(btn);
    });
  }

  // ===== 5. 範例問題 =====
  function renderQuickQuestions() {
    quickQuestionsEl.innerHTML = "";
    (currentRole.samples || []).forEach((q) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", () => {
        userInputEl.value = q;
        userInputEl.focus();
      });
      quickQuestionsEl.appendChild(b);
    });
  }

  // ===== 6. 對話渲染 =====
  function renderConversation() {
    const msgs = conversations[currentRole.id] || [];
    chatBoxEl.innerHTML = "";

    msgs.forEach((m) => {
      const wrapper = document.createElement("div");
      wrapper.className = "msg " + m.type;
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = m.text;
      wrapper.appendChild(bubble);
      chatBoxEl.appendChild(wrapper);
    });

    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  }

  function pushMessage(role, type, text) {
    ensureConversation(role);
    conversations[role.id].push({ type, text });
    if (role.id === currentRole.id) {
      renderConversation();
    }
  }

  // ===== 7. 切換角色：聊天紀錄分開存 =====
  function switchRole(roleId) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    currentRole = role;
    currentRoleNameEl.textContent = role.name;
    if (roleBadgeEl) roleBadgeEl.textContent = role.badge;

    ensureConversation(role);
    renderRoleTabs();
    renderQuickQuestions();
    renderConversation();
  }

  // ===== 8. 發送訊息 -> /api/chat =====
  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const role = currentRole;
    pushMessage(role, "user", trimmed);
    userInputEl.value = "";

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: trimmed,
          roleId: role.id, // ★ 關鍵：用 chCustomerService / shopManager 等，跟後端對齊
        }),
      });

      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      const reply = data.reply || data.message || JSON.stringify(data);
      pushMessage(role, "ai", reply);
    } catch (err) {
      console.error("[C.H AI Town] /api/chat error:", err);
      pushMessage(
        role,
        "ai",
        "抱歉，後端發生錯誤，請稍後再試或請店長檢查伺服器。"
      );
    }
  }

  // ===== 9. 綁定表單 =====
  chatFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(userInputEl.value);
  });

  // ===== 10. 初始化 =====
  ensureConversation(currentRole);
  renderRoleTabs();
  renderQuickQuestions();
  renderConversation();
})();
