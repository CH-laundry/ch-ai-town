(function () {
  // ===== 1. 角色設定 =====
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
      samples: [
        "收件流程是怎麼跑的？",
        "哪些情況會列入高風險清洗？",
      ],
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

  // ===== DOM =====
  const roleTabsEl = document.getElementById("role-tabs");
  const chatBoxEl = document.getElementById("chat-box");
  const quickQuestionsEl = document.getElementById("quick-questions");
  const currentRoleNameEl = document.getElementById("current-role-name");
  const roleBadgeEl = document.getElementById("role-badge");
  const roleAvatarImgEl = document.getElementById("role-avatar-img");
  const chatFormEl = document.getElementById("chat-form");
  const userInputEl = document.getElementById("user-input");

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

  function renderRoleTabs() {
    roleTabsEl.innerHTML = "";
    roles.forEach((r) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "role-tab" + (r.id === currentRole.id ? " active" : "");
      btn.dataset.roleId = r.id;
      btn.innerHTML = `<span class="icon">${r.icon}</span><span class="label">${r.name}</span>`;
      btn.addEventListener("click", () => switchRole(r.id));
      roleTabsEl.appendChild(btn);
    });
  }

  function renderQuickQuestions() {
    quickQuestionsEl.innerHTML = "";
    (currentRole.samples || []).forEach((q) => {
      const b = document.createElement("button");
      b.textContent = q;
      b.addEventListener("click", () => {
        userInputEl.value = q;
      });
      quickQuestionsEl.appendChild(b);
    });
  }

  function renderConversation() {
    const msgs = conversations[currentRole.id] || [];
    chatBoxEl.innerHTML = "";

    msgs.forEach((m) => {
      const wrap = document.createElement("div");
      wrap.className = "msg " + m.type;

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = m.text;

      wrap.appendChild(bubble);
      chatBoxEl.appendChild(wrap);
    });

    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  }

  function pushMessage(role, type, text) {
    ensureConversation(role);
    conversations[role.id].push({ type, text });
    if (role.id === currentRole.id) renderConversation();
  }

  // ===== 新增：更新角色頭像 =====
  function updateRoleHeader(role) {
    currentRoleNameEl.textContent = role.name;
    roleBadgeEl.textContent = role.badge;
    roleAvatarImgEl.src = role.avatar;
    roleAvatarImgEl.alt = role.name + "頭像";
  }

  // ===== 切換角色 =====
  function switchRole(roleId) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    currentRole = role;
    updateRoleHeader(role);

    ensureConversation(role);
    renderRoleTabs();
    renderQuickQuestions();
    renderConversation();
  }

  // ===== 發送訊息 =====
  async function sendMessage(text) {
    const t = text.trim();
    if (!t) return;

    const role = currentRole;
    pushMessage(role, "user", t);
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
      pushMessage(role, "ai", data.reply || data.message);
    } catch (err) {
      pushMessage(role, "ai", "伺服器錯誤，請稍後再試。");
    }
  }

  chatFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(userInputEl.value);
  });

  // ===== 初始化 =====
  ensureConversation(currentRole);
  updateRoleHeader(currentRole);
  renderRoleTabs();
  renderQuickQuestions();
  renderConversation();
})();
