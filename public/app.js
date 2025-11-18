// public/app.js
// 右側聊天 + 角色切換

(function () {
  const roles = [
    {
      id: "ch_customer_service",
      name: "C.H 客服",
      icon: "💬",
      badge: "對話 · 介紹服務 · 回覆一般問題",
      samples: ["這個油漬有機會洗乾淨嗎？", "你們有提供免費收送嗎？", "精品包清洗大概多少價格？"],
    },
    {
      id: "shop_manager",
      name: "店長",
      icon: "🧾",
      badge: "掌握全局 · 說明流程與注意事項",
      samples: ["收件流程是怎麼跑的？", "哪些狀況會列入高風險清洗？"],
    },
    {
      id: "cleaner_master",
      name: "清潔師傅",
      icon: "🧴",
      badge: "分析材質 · 污漬風險與能否清潔",
      samples: ["這件白襯衫黃漬能處理到什麼程度？", "麂皮鞋子發霉還能救嗎？"],
    },
    {
      id: "ironing_master",
      name: "熨燙師傅",
      icon: "🧺",
      badge: "熨燙細節 · 版型與變形風險",
      samples: ["西裝可以整燙到很挺但不傷布料嗎？"],
    },
    {
      id: "delivery_staff",
      name: "外送員",
      icon: "🚚",
      badge: "收送時間 · 區域與聯絡相關問題",
      samples: ["板橋收送大概什麼時間可以到？", "可以幫我改送回時間嗎？"],
    },
  ];

  let currentRole = roles[0];
  let userId = "web-" + Math.random().toString(36).slice(2);

  const roleTabsEl = document.getElementById("role-tabs");
  const chatBoxEl = document.getElementById("chat-box");
  const quickQuestionsEl = document.getElementById("quick-questions");
  const currentRoleNameEl = document.getElementById("current-role-name");
  const chatFormEl = document.getElementById("chat-form");
  const userInputEl = document.getElementById("user-input");

  if (!roleTabsEl || !chatBoxEl || !chatFormEl) {
    return;
  }

  // === UI 初始化 ===

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
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", () => {
        userInputEl.value = q;
        userInputEl.focus();
      });
      quickQuestionsEl.appendChild(b);
    });
  }

  function addMessage(type, text) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg " + type;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatBoxEl.appendChild(wrapper);
    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  }

  function switchRole(roleId) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    currentRole = role;

    currentRoleNameEl.textContent = role.name;
    const badgeEl = document.querySelector(".role-badge");
    if (badgeEl) badgeEl.textContent = role.badge;

    renderRoleTabs();
    renderQuickQuestions();

    addMessage(
      "system",
      `🔁 你現在切換成「${role.name}」模式，問題會由這個角色的 AI 腦袋來回答。`
    );
  }

  function initChat() {
    // 初始化系統提示
    addMessage(
      "system",
      "你好，這裡是 C.H AI Town。左邊是 2D 小鎮，右邊是不同角色的 AI 對話區，請先在上方選擇你想對話的角色。"
    );
  }

  // === 發送訊息 ===

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    userInputEl.value = "";

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: trimmed,
          roleId: currentRole.id,
        }),
      });

      if (!resp.ok) {
        throw new Error("HTTP " + resp.status);
      }

      const data = await resp.json();
      const reply = data.reply || data.message || JSON.stringify(data);
      addMessage("ai", reply);
    } catch (err) {
      addMessage("ai", "抱歉，後端發生錯誤，請稍後再試或通知店長檢查伺服器狀態。");
      console.error(err);
    }
  }

  // === 綁定表單 ===

  chatFormEl.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage(userInputEl.value);
  });

  // 初始化
  initChat();
  renderRoleTabs();
  renderQuickQuestions();
})();
