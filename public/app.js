// public/app.js
// 左邊大地圖、右邊對話，角色頭像 + tabs 切換 + NPC 互動 + 新手導覽 + 洗鞋估價流程

(function () {
  // ===== 0. 共用設定 =====
  const FALLBACK_ERROR_TEXT =
    "系統目前連線異常，請稍後再試，或改由官方 LINE 詢問真人客服。";

  function nowTimeLabel() {
    try {
      return new Date().toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  }

  // ===== 1. 角色設定 =====
  const roles = [
    {
      id: "chCustomerService",
      name: "C.H 客服",
      icon: "💁‍♀️",
      avatar: "/images/role-cs.png",
      badge: "對話 · 介紹服務 · 回覆一般問題",
      samples: [
        "你們有提供免費收送嗎？",
        "一般衣物清洗大概多久可以完成？",
        "有沒有什麼洗前注意事項？",
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
      badge: "實際清洗判斷 · 污漬與材質評估",
      samples: [
        "這雙麂皮鞋有發霉，可以處理嗎？",
        "包包內裡發黃，大概能改善多少？",
      ],
    },
    {
      id: "ironingMaster",
      name: "熨燙師傅",
      icon: "🧺",
      avatar: "/images/role-ironing.png",
      badge: "整燙與定型 · 版型維護建議",
      samples: [
        "西裝熨燙完會不會變形？",
        "襯衫可以做立體燙線嗎？",
      ],
    },
    {
      id: "deliveryStaff",
      name: "外送員",
      icon: "🛵",
      avatar: "/images/role-delivery.png",
      badge: "收送範圍 · 約時間 · 外送相關問題",
      samples: [
        "板橋這一帶收送是哪些時段？",
        "臨時有事要改時間可以嗎？",
      ],
    },
  ];

  // 預設角色：C.H 客服
  let currentRole = roles[0];

  // 每個角色自己的對話紀錄
  const conversations = {};
  roles.forEach((r) => {
    conversations[r.id] = [];
  });

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

  function bindClickAndTouch(el, handler) {
    if (!el || !handler) return;
    el.addEventListener("click", handler);
    el.addEventListener("touchstart", function (e) {
      e.preventDefault();
      handler();
    });
  }

  // ===== 3. 新手導覽 =====
  function showOnboarding() {
    if (!onboardingEl) return;
    onboardingEl.classList.add("visible");
  }

  function hideOnboarding() {
    if (!onboardingEl) return;
    onboardingEl.classList.remove("visible");
  }

  try {
    const seen = window.localStorage.getItem("chTownOnboardingSeen");
    if (!seen) {
      window.localStorage.setItem("chTownOnboardingSeen", "1");
      setTimeout(showOnboarding, 600);
    }
  } catch (e) {
    // ignore
  }

  bindClickAndTouch(onboardingCloseEl, hideOnboarding);
  bindClickAndTouch(onboardingBtnEl, hideOnboarding);

  // ===== 4. 洗鞋估價流程狀態 =====
  const SHOE_FLOW_STEPS = [
    "1️⃣ 這雙鞋子的材質是什麼？例如：真皮、麂皮、帆布、網布、PU 皮、混合材質…",
    "2️⃣ 品牌與型號（如果不確定可以大概描述，例如：Nike 白色氣墊鞋、無品牌樂福鞋…）",
    "3️⃣ 鞋子的顏色與現在的髒污狀況，可以簡單形容一下嗎？",
    "4️⃣ 主要的髒污或汙漬類型是什麼？例如：發霉、黃漬、油漬、雨水染色、汗漬、泥土…",
    "5️⃣ 髒污大概存在多久了？例如：幾天內、1 個月內、好幾個月或更久…",
    "6️⃣ 是否有自己處理過？用過哪些清潔劑或方法？",
    "7️⃣ 這雙鞋大概穿多久、使用頻率如何？（如：剛買沒多久 / 穿了好幾年）",
  ];

  let currentFlow = null;

  function resetFlowIfNeeded() {
    currentFlow = null;
  }

  // ===== 5. 對話紀錄工具 =====
  function ensureConversation(role) {
    if (!conversations[role.id]) {
      conversations[role.id] = [];
    }
  }

  function appendSystemWelcomeIfEmpty(role) {
    ensureConversation(role);
    const list = conversations[role.id];
    if (list.length === 0) {
      list.push({
        type: "ai",
        text:
          role.id === "cleanerMaster"
            ? "這邊主要負責實際清潔判斷、污漬與材質評估，有關清洗風險與成功率都可以問我。"
            : role.id === "ironingMaster"
            ? "這邊主要負責熨燙與整型，關於版型維護、熨燙風險可以跟我討論。"
            : role.id === "deliveryStaff"
            ? "我負責收送與物流安排，關於收送範圍、約時間、臨時改約等問題可以問我。"
            : role.id === "shopManager"
            ? "我主要協助你了解整體流程與注意事項，例如收件、流程、風險告知。"
            : "嗨～歡迎來到 C.H AI 小鎮，我可以先幫你介紹服務，或你有什麼想問的都可以直接打在下面。",
        time: nowTimeLabel(),
      });
    }
  }

  // ===== 6. 角色切換 =====
  function updateRoleHeader(role) {
    if (currentRoleNameEl) {
      currentRoleNameEl.textContent = `${role.icon} ${role.name}`;
    }
    if (roleBadgeEl) {
      roleBadgeEl.textContent = role.badge || "";
    }
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
      bindClickAndTouch(btn, () => {
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
      bindClickAndTouch(btn, () => {
        sendMessage(q);
      });
      quickQuestionsEl.appendChild(btn);
    });

    if (
      currentRole.id === "chCustomerService" ||
      currentRole.id === "cleanerMaster"
    ) {
      const btn = document.createElement("button");
      btn.className = "quick-question quick-question-accent";
      btn.textContent = "🥿 我要估鞋子清洗價格";
      bindClickAndTouch(btn, () => {
        startShoeQuoteFlow(currentRole.id);
      });
      quickQuestionsEl.appendChild(btn);
    }
  }

  // ===== 9. 渲染對話內容 =====
  function renderConversation() {
    const msgs = conversations[currentRole.id] || [];
    chatBoxEl.innerHTML = "";

    msgs.forEach((msg) => {
      const row = document.createElement("div");
      row.className = "chat-row";

      const bubble = document.createElement("div");
      bubble.className =
        msg.type === "user" ? "chat-bubble user" : "chat-bubble ai";
      bubble.textContent = msg.text;

      const meta = document.createElement("div");
      meta.className = "chat-meta";
      meta.textContent = msg.time || "";

      row.appendChild(bubble);
      row.appendChild(meta);
      chatBoxEl.appendChild(row);
    });

    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  }

  // ===== 10. 呼叫後端 API =====
  async function callChatApi(text, roleId) {
    const role =
      roles.find((r) => r.id === (roleId || currentRole.id)) || currentRole;

    ensureConversation(role);
    appendSystemWelcomeIfEmpty(role);

    const typingMsg = {
      type: "ai",
      text: "正在為你整理回覆…",
      time: nowTimeLabel(),
    };
    conversations[role.id].push(typingMsg);
    renderConversation();

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "web:" + role.id, // 可以之後改成真實 userId
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
        console.error("[/api/chat] JSON 解析失敗：", parseErr);
        data = null;
      }

      // 把「正在輸入」那則換成真正回覆
      conversations[role.id].pop();
      conversations[role.id].push({
        type: "ai",
        text:
          (data && (data.reply || data.message || data.content)) ||
          FALLBACK_ERROR_TEXT,
        time: nowTimeLabel(),
      });
      renderConversation();
    } catch (err) {
      console.error("[/api/chat] 呼叫失敗：", err);
      conversations[role.id].pop();
      conversations[role.id].push({
        type: "ai",
        text: FALLBACK_ERROR_TEXT,
        time: nowTimeLabel(),
      });
      renderConversation();
    }
  }

  // ===== 11. 處理送出訊息 =====
  function sendMessage(text) {
    resetFlowIfNeeded();

    const trimmed = (text || "").trim();
    if (!trimmed) return;

    ensureConversation(currentRole);
    appendSystemWelcomeIfEmpty(currentRole);

    conversations[currentRole.id].push({
      type: "user",
      text: trimmed,
      time: nowTimeLabel(),
    });
    renderConversation();

    userInputEl.value = "";
    callChatApi(trimmed, currentRole.id);
  }

  // ===== 12. 洗鞋估價流程 =====
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
      "好的，來幫你做一個「鞋子清洗估價」的小問卷，我會依照你的描述，給你一個保守的成功率與價格區間。過程大概 6～7 個問題，你用文字回答就可以。";
    conversations[role.id].push({
      type: "ai",
      text: intro,
      time: nowTimeLabel(),
    });
    conversations[role.id].push({
      type: "ai",
      text: SHOE_FLOW_STEPS[0],
      time: nowTimeLabel(),
    });

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
      conversations[role.id].push({
        type: "ai",
        text: nextQ,
        time: nowTimeLabel(),
      });
      renderConversation();
      return true; // 還在流程中，先不要打 API
    }

    // 問答結束，整合資訊打一次 OpenAI
    const summaryPrompt = buildShoeQuotePrompt(currentFlow.answers);
    conversations[role.id].push({
      type: "ai",
      text:
        "收到，幫你根據剛剛的描述，綜合評估清洗成功率與價格區間，請稍等一下…",
      time: nowTimeLabel(),
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
      "髒污存在時間",
      "是否自行處理過與處理方式",
      "鞋子使用時間與頻率",
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
5）建議話術（用你是 C.H 精緻洗衣的口吻，寫一段可以直接回覆給客人的說明）

以下是客人回答的問卷內容：
${pairs}
`;
  }

  // ===== 13. 角色切換 & 入口 =====
  function switchRole(roleId) {
    resetFlowIfNeeded();

    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    currentRole = role;

    ensureConversation(role);
    appendSystemWelcomeIfEmpty(role);

    updateRoleHeader(role);
    renderRoleTabs();
    renderQuickQuestions();
    renderConversation();

    if (window.chTownMapSetActiveRole) {
      window.chTownMapSetActiveRole(role.id);
    }
  }

  // ===== 14. 對外給地圖呼叫：切換角色 =====
  window.chTownUiSwitchRole = switchRole;

  // ===== 15. 綁定輸入表單 =====
  chatFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!userInputEl) return;

    const text = (userInputEl.value || "").trim();
    if (!text) return;

    // 若在洗鞋估價流程中，先讓流程吃
    if (handleShoeFlowAnswer(text)) {
      conversations[currentRole.id].push({
        type: "user",
        text,
        time: nowTimeLabel(),
      });
      renderConversation();
      userInputEl.value = "";
      return;
    }

    sendMessage(text);
  });

  if (shoeFlowBtnEl) {
    bindClickAndTouch(shoeFlowBtnEl, () => {
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
