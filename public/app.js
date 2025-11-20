// public/app.js
// 左邊大地圖、右邊對話，角色頭像 + tabs 切換

(function () {
  // ===== 1. 角色設定（id 要對應後端 roleMap） =====
  const roles = [
    {
      id: "chCustomerService",
      name: "C.H 客服",
      icon: "💬",
      avatar: "/images/role-cs.png",
      badge: "對話 · 介紹服務 · 回覆一般問題",
      samples: [
        "這個油漬有機會洗乾淨嗎？",
        "你們有提供免費收送嗎？",
        "精品包清洗大概多少價格？",
      ],
    },
    {
      id: "shopManager",
      name: "店長",
      icon: "🧾",
      avatar: "/images/role-manager.png",
      badge: "掌握全局 · 說明流程與注意事項",
      samples: ["收件流程是怎麼跑的？", "哪些情況會列入高風險清洗？"],
    },
    {
      id: "cleanerMaster",
      name: "清潔師傅",
      icon: "🧼",
      avatar: "/images/role-cleaner.png",
      badge: "判斷材質 · 污漬風險說明",
      samples: [
        "這件大衣標籤寫 X，這種材質會縮水嗎？",
        "包包發霉有機會處理嗎？",
      ],
    },
    {
      id: "ironingMaster",
      name: "熨燙師傅",
      icon: "🧺",
      avatar: "/images/role-ironing.png",
      badge: "熨燙方式 · 整燙注意事項",
      samples: ["西裝燙線可以救回來嗎？", "婚紗有小皺褶可以處理嗎？"],
    },
    {
      id: "deliveryStaff",
      name: "外送員",
      icon: "🚚",
      avatar: "/images/role-delivery.png",
      badge: "收送時間 · 区域與聯絡相關問題",
      samples: ["板橋收送大概什麼時間可以到？", "可以幫我改送回時間嗎？"],
    },
  ];

  let currentRole = roles[0];
  const conversations = {};
  const userId = "web-" + Math.random().toString(36).slice(2);

  // ===== 2. DOM =====
  const roleTabsEl = document.getElementById("role-tabs");
  const chatBoxEl = document.getElementById("chat-box");
  const quickQuestionsEl = document.getElementById("quick-questions");
  const currentRoleNameEl = document.getElementById("current-role-name");
  const roleBadgeEl = document.getElementById("role-badge");
  const roleAvatarImgEl = document.getElementById("role-avatar-img");
  const chatFormEl = document.getElementById("chat-form");
  const userInputEl = document.getElementById("user-input");

  if (!roleTabsEl || !chatBoxEl || !chatFormEl) {
    console.warn("[C.H AI Town] 必要元素缺失，app.js 未啟動。");
    return;
  }

  // ===== 3. 對話資料初始化 =====
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

  // ===== 4. 更新角色標頭 =====
  function updateRoleHeader(role) {
    currentRoleNameEl.textContent = role.name;
    roleBadgeEl.textContent = role.badge;
    roleAvatarImgEl.src = role.avatar;
    roleAvatarImgEl.alt = role.name;
  }

  // ===== 5. 重新渲染 tabs =====
  function renderRoleTabs() {
    roleTabsEl.innerHTML = "";
    roles.forEach((role) => {
      const btn = document.createElement("button");
      btn.className =
        "role-tab" + (role.id === currentRole.id ? " active" : "");
      btn.textContent = role.name;
      btn.addEventListener("click", () => {
        switchRole(role.id);
      });
      roleTabsEl.appendChild(btn);
    });
  }

  // ===== 6. 渲染快捷問題 =====
  function renderQuickQuestions() {
    quickQuestionsEl.innerHTML = "";
    currentRole.samples.forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "quick-question";
      btn.textContent = q;
      btn.addEventListener("click", () => {
        sendMessage(q);
      });
      quickQuestionsEl.appendChild(btn);
    });
  }

  // ===== 7. 渲染對話內容 =====
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

  // ===== 8. 發送訊息 =====
  async function sendMessage(text) {
    const t = text.trim();
    if (!t) return;

    const role = currentRole;
    ensureConversation(role);
    conversations[role.id].push({ type: "user", text: t });
    renderConversation();
    userInputEl.value = "";

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId: role.id,
          userId,
          message: t,
        }),
      });

      if (!resp.ok) {
        throw new Error("API 回應非 200");
      }

      const data = await resp.json();
      const reply = data.reply || "抱歉，暫時無法取得回覆，稍後再試一次。";

      conversations[role.id].push({ type: "bot", text: reply });
      renderConversation();
    } catch (err) {
      console.error(err);
      conversations[role.id].push({
        type: "bot",
        text: "抱歉，系統好像有點忙，請稍後再試一次。",
      });
      renderConversation();
    }
  }

  // ===== 9. 切換角色 =====
  function switchRole(roleId) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    currentRole = role;
    ensureConversation(role);
    updateRoleHeader(role);
    renderRoleTabs();
    renderQuickQuestions();
    renderConversation();
  }

  // ⭐ 給 NPC 用：點人物 → 切角色 + 在右側說一句歡迎話
  function npcQuickTalk(roleId, text) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    currentRole = role;
    ensureConversation(role);
    conversations[role.id].push({ type: "bot", text });
    updateRoleHeader(role);
    renderRoleTabs();
    renderQuickQuestions();
    renderConversation();
  }

  // ⭐ 給小鎮地圖用：點建築 → 切換角色
  window.chTownSwitchRoleFromMap = function (roleId) {
    switchRole(roleId);
  };

  // ⭐ 給 NPC 用：被點擊時說一句話
  window.chTownNpcSay = function (roleId, text) {
    npcQuickTalk(roleId, text);
  };

  // ===== 10. 綁定輸入表單 =====
  chatFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(userInputEl.value);
  });

  // ===== 11. 初始化 =====
  ensureConversation(currentRole);
  updateRoleHeader(currentRole);
  renderRoleTabs();
  renderQuickQuestions();
  renderConversation();
})();
