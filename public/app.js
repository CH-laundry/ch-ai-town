// public/app.js
// 左邊大地圖、右邊對話，角色頭像 + tabs 切換 + NPC 互動 + 新手導覽 + 洗鞋估價流程

(function () {
  // ===== 0. 統一錯誤訊息（前端最後防線） =====
  const FALLBACK_ERROR_TEXT =
    "系統目前連線異常，請稍後再試，或改由官方 LINE 詢問真人客服。";

  // ===== 1. 角色設定（id 要對應後端 roleMap） =====
  const roles = [
    {
      id: "chCustomerService",
      name: "C.H 客服",
      icon: "💬",
      avatar: "/images/role-cs.png",
      badge: "對話 · 介紹服務 · 回覆一般問題",
      samples: [
        "你們有提供免費收送嗎？",
        "精品包清洗大概多少價格？",
        "想知道整體洗衣流程。",
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
      badge: "分析材質 · 污漬風險與是否能清潔",
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
      samples: [
        "板橋收送大概什麼時間可以到？",
        "可以幫我改送回時間嗎？",
      ],
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
  const onboardingEl = document.getElementById("onboarding-overlay");
  const onboardingBtnEl = document.getElementById("onboarding-start-btn");
  const onboardingCloseEl = document.getElementById("onboarding-close");
  const shoeFlowBtnEl = document.getElementById("shoe-flow-btn");

  if (!roleTabsEl || !chatBoxEl || !chatFormEl) {
    console.warn("[C.H AI Town] 必要元素缺失，app.js 未啟動。");
    return;
  }

  // ===== 3. 新手導覽 =====
  function showOnboarding() {
    if (!onboardingEl) return;
    onboardingEl.classList.add("visible");
  }

  function hideOnboarding() {
    if (!onboardingEl) return;
    onboardingEl.classList.remove("visible");
    try {
      localStorage.setItem("chTownOnboardingDone", "1");
    } catch (e) {
      console.warn("localStorage 無法使用", e);
    }
  }

  try {
    const done = localStorage.getItem("chTownOnboardingDone");
    if (!done) {
      // 延遲一點點，等畫面載入
      setTimeout(showOnboarding, 600);
    }
  } catch (e) {
    // 忽略
  }

  if (onboardingCloseEl) {
    onboardingCloseEl.addEventListener("click", hideOnboarding);
  }
  if (onboardingBtnEl) {
    onboardingBtnEl.addEventListener("click", hideOnboarding);
  }

  // ===== 4. 洗鞋估價流程狀態 =====
  const SHOE_FLOW_STEPS = [
    "鞋子大概是什麼材質？例如：帆布、真皮、麂皮、網布、運動鞋等。",
    "鞋子品牌與型號大概是什麼？（不清楚可以說「不確定」）",
    "鞋子的顏色或配色是什麼？",
    "主要髒污或汙漬是什麼類型？例如：黃漬、泥土、油漬、發霉、發黃、飲料咖啡等。",
    "髒污大概分布在哪裡？例如：鞋面、鞋底邊、鞋帶、內裡、大面積或局部？",
    "目前有沒有發霉味、異味或很久沒洗？",
    "有沒有急件需求？例如：幾天內一定要穿、是否可以接受一般工作天？",
  ];

  let currentFlow = null; // { type: "shoe-quote", step: number, answers: [] }

  function startShoeQuoteFlow(preferRoleId) {
    const role =
      roles.find((r) => r.id === (preferRoleId || "cleanerMaster")) || roles[2];
    currentRole = role;
    ensureConversation(role);

    currentFlow = {
      type: "shoe-quote",
      step: 0,
      answers: [],
      roleId: role.id,
    };

    const intro =
      "好的，來幫你做一個「鞋子清洗估價」的小問卷，我會依照你的描述，給你一個保守的成功率與價格區間。過程大概 6～7 個問題，都是勾選型的資訊，你用文字回答就好。";
    conversations[role.id].push({ type: "ai", text: intro });
    conversations[role.id].push({ type: "ai", text: SHOE_FLOW_STEPS[0] });
    updateRoleHeader(role);
    renderRoleTabs();
    renderQuickQuestions();
    renderConversation();

    if (window.chTownMapSetActiveRole) {
      window.chTownMapSetActiveRole(role.id);
    }
  }

  function handleShoeFlowAnswer(userText) {
    if (!currentFlow || currentFlow.type !== "shoe-quote") return false;

    currentFlow.answers.push(userText);
    currentFlow.step += 1;

    const role = roles.find((r) => r.id === currentFlow.roleId) || currentRole;
    ensureConversation(role);

    if (currentFlow.step < SHOE_FLOW_STEPS.length) {
      const nextQ = SHOE_FLOW_STEPS[currentFlow.step];
      conversations[role.id].push({ type: "ai", text: nextQ });
      renderConversation();
      return true; // 還在流程中，先不要打 API
    }

    // 問答結束，整合資訊打一次 OpenAI
    const summaryPrompt = buildShoeQuotePrompt(currentFlow.answers);
    conversations[role.id].push({
      type: "ai",
      text: "收到，幫你根據剛剛的描述，綜合評估清洗成功率與價格區間，請稍等一下…",
    });
    renderConversation();

    currentFlow = null; // 結束流程

    callChatApi(summaryPrompt, role.id);
    return true;
  }

  function buildShoeQuotePrompt(answers) {
    const fields = [
      "鞋子材質",
      "鞋子品牌與型號",
      "鞋子顏色",
      "主要髒污或汙漬類型",
      "髒污分布位置與範圍",
      "是否發霉或有異味",
      "是否為急件與時間需求",
    ];

    const pairs = fields
      .map((label, idx) => `${label}：${answers[idx] || "（未填）"}`)
      .join("\n");

    return `
你是「C.H 精緻洗衣」的專業洗鞋估價顧問，請用台灣消費者可以理解的方式，根據以下資訊，提供保守估價建議。

請依序回覆：
1）清洗成功率（請用 0～100% 的區間描述，偏保守，說明影響成功率的關鍵因素）
2）建議清洗價格區間（請給出 NT$ 金額範圍，並說明為何是這個區間）
3）可能的風險提醒（例如：變色、材質變硬、膠老化、黃漬僅能淡化等）
4）處理流程簡述（用 2～4 個步驟，讓客人理解大概怎麼處理）
5）建議話術（用你是 C.H 精緻洗衣的口吻，最後一段話邀請客人加 LINE 或預約收送，但不要太硬性推銷）

客人提供的描述如下：
${pairs}
`;
  }

  // ===== 5. 對話資料初始化 =====
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

  // ===== 6. 更新右側標頭 =====
  function updateRoleHeader(role) {
    if (currentRoleNameEl) currentRoleNameEl.textContent = role.name;
    if (roleBadgeEl) roleBadgeEl.textContent = role.badge;
    if (roleAvatarImgEl && role.avatar) {
      roleAvatarImgEl.src = role.avatar;
      roleAvatarImgEl.alt = role.name + "頭像";
    }
  }

  // ===== 7. 渲染角色 tabs =====
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

  // ===== 8. 渲染快捷問題 =====
  function renderQuickQuestions() {
    if (!quickQuestionsEl) return;
    quickQuestionsEl.innerHTML = "";

    (currentRole.samples || []).forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "quick-question";
      btn.textContent = q;
      btn.addEventListener("click", () => {
        sendMessage(q);
      });
      quickQuestionsEl.appendChild(btn);
    });

    // 額外加：洗鞋估價快捷鍵（客服 / 師傅看到）
    if (
      currentRole.id === "chCustomerService" ||
      currentRole.id === "cleanerMaster"
    ) {
      const btn = document.createElement("button");
      btn.className = "quick-question quick-question-accent";
      btn.textContent = "🥿 我要估鞋子清洗價格";
      btn.addEventListener("click", () => {
        startShoeQuoteFlow(currentRole.id);
      });
      quickQuestionsEl.appendChild(btn);
    }
  }

  // ===== 9. 渲染對話內容 =====
  function renderConversation() {
    const msgs = conversations[currentRole.id] || [];
    chatBoxEl.innerHTML = [];

    chatBoxEl.innerHTML = "";

    msgs.forEach((m) => {
      const wrapper = document.createElement("div");
      wrapper.className = "msg " + (m.type || "ai");

      const bubble = document.createElement("div");
      bubble.className = "bubble";

      const rawText = (m.text || "").toString();
      const displayText =
        !rawText.trim() || rawText.includes("無回應內容")
          ? FALLBACK_ERROR_TEXT
          : rawText;

      bubble.textContent = displayText;

      wrapper.appendChild(bubble);
      chatBoxEl.appendChild(wrapper);
    });

    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  }

  // ===== 10. 呼叫後端 OpenAI API（所有角色共用） =====
  async function callChatApi(text, roleId) {
    const role = roles.find((r) => r.id === roleId) || currentRole;
    ensureConversation(role);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: text,
          roleId: role.id,
        }),
      });

      if (!resp.ok) {
        throw new Error("API 回傳非 200 狀態");
      }

      let data;
      try {
        data = await resp.json();
      } catch (parseErr) {
        console.error("[chat] JSON parse error:", parseErr);
        conversations[role.id].push({
          type: "ai",
          text: FALLBACK_ERROR_TEXT,
        });
        renderConversation();
        return;
      }

      let replyRaw =
        (data &&
          (data.reply || data.message || data.content || data.error || ""))
          .toString()
          .trim() || "";

      console.log("[chat] raw reply from /api/chat:", replyRaw);

      // ✅ 後端如果還有舊邏輯回「無回應內容」，在這邊直接攔截改成錯誤提示
      if (!replyRaw || replyRaw.includes("無回應內容")) {
        conversations[role.id].push({
          type: "ai",
          text: FALLBACK_ERROR_TEXT,
        });
      } else {
        conversations[role.id].push({ type: "ai", text: replyRaw });
      }

      renderConversation();
    } catch (err) {
      console.error("[chat] fetch error:", err);
      conversations[role.id].push({
        type: "ai",
        text: FALLBACK_ERROR_TEXT,
      });
      renderConversation();
    }
  }

  // ===== 11. 發送訊息（一般對話 or 流程模式） =====
  function sendMessage(text) {
    const t = (text || "").trim();
    if (!t) return;

    const role = currentRole;
    ensureConversation(role);
    conversations[role.id].push({ type: "user", text: t });
    renderConversation();
    if (userInputEl) userInputEl.value = "";

    // 若正在洗鞋估價流程，先進流程邏輯，不直接丟 API
    if (currentFlow && currentFlow.type === "shoe-quote") {
      const handled = handleShoeFlowAnswer(t);
      if (handled) return;
    }

    // 一般對話：直接丟給 OpenAI
    callChatApi(t, role.id);
  }

  // ===== 12. 切換角色（給 tabs / 建築用） =====
  function switchRole(roleId) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    currentRole = role;
    ensureConversation(role);
    updateRoleHeader(role);
    renderRoleTabs();
    renderQuickQuestions();
    renderConversation();

    if (window.chTownMapSetActiveRole) {
      window.chTownMapSetActiveRole(role.id);
    }
  }

  // ===== 13. NPC 主動講話（給 game.js 呼叫） =====
  function npcQuickTalk(roleId, text) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    currentRole = role;
    ensureConversation(role);
    conversations[role.id].push({
      type: "ai",
      text: text,
    });

    updateRoleHeader(role);
    renderRoleTabs();
    renderQuickQuestions();
    renderConversation();

    if (window.chTownMapSetActiveRole) {
      window.chTownMapSetActiveRole(role.id);
    }
  }

  // ===== 14. 提供給 game.js 呼叫的全域函式 =====
  // 點建築 → 切換角色
  window.chTownSwitchRoleFromMap = function (roleId) {
    switchRole(roleId);
  };

  // 點 NPC → 讓 NPC 說一句話
  window.chTownNpcSay = function (roleId, text) {
    npcQuickTalk(roleId, text);
  };

  // NPC 幫忙預填建議問題
  window.chTownFillUserInput = function (text) {
    if (!userInputEl) return;
    userInputEl.value = text || "";
    userInputEl.focus();
  };

  // NPC / UI 觸發洗鞋估價流程
  window.chTownStartShoeQuote = function (preferRoleId) {
    startShoeQuoteFlow(preferRoleId);
  };

  // ===== 15. 綁定輸入表單 =====
  chatFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!userInputEl) return;
    sendMessage(userInputEl.value);
  });

  // UI 的「我要估鞋子」按鈕
  if (shoeFlowBtnEl) {
    shoeFlowBtnEl.addEventListener("click", () => {
      startShoeQuoteFlow(currentRole.id);
    });
  }

  // ===== 16. 初始化 =====
  ensureConversation(currentRole);
  updateRoleHeader(currentRole);
  renderRoleTabs();
  renderQuickQuestions();
  renderConversation();
})();
