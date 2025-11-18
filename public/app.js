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
      icon: "🧴",
      avatar: "/images/role-cleaner.png",
      badge: "分析材質 · 污漬風險與能否清潔",
      samples: [
        "這件白襯衫黃漬能處理到什麼程度？",
        "麂皮鞋子發霉還能救嗎？",
      ],
    },
    {
      id: "ironingMaster",
      name: "熨燙師傅",
      icon: "🧺",
      avatar: "/images/role-ironing.png",
      badge: "熨燙細節 · 版型與變形風險",
      samples: ["西裝可以整燙到很挺但不傷布料嗎？"],
    },
    {
      id: "deliveryStaff",
      name: "外送員",
      icon: "🚚",
      avatar: "/images/role-delivery.png",
      badge: "收送時間 · 區域與聯絡相關問題",
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

  // ===== 4. 更新右側標頭 =====
  function updateRoleHeader(role) {
    if (currentRoleNameEl) currentRoleNameEl.textContent = role.name;
    if (roleBadgeEl) roleBadgeEl.textContent = role.badge;
    if (roleAvatarImgEl && role.avatar) {
      roleAvatarImgEl.src = role.avatar;
      roleAvatarImgEl.alt = role.name + "頭像";
    }
  }

  // ===== 5. 渲染角色 tabs =====
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

  // ===== 6. 範例問題 =====
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

  // ===== 7. 對話渲染 =====
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: t,
          roleId: role.id,
        }),
      });

      const data = await resp.json();
      const reply = data.reply || data.message || "（無回應內容）";

      conversations[role.id].push({ type: "ai", text: reply });
      renderConversation();
    } catch (err) {
      console.error(err);
      conversations[role.id].push({
        type: "ai",
        text: "伺服器忙碌中，請稍後再試。",
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

  // ===== 10. 綁定輸入表單 =====
  chatFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(userInputEl.value);
  });

  //
