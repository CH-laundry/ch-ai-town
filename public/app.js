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

  // ===== 1. 角色 =====
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
      badge: "店內規則 · 價格說明 · 客訴處理",
      samples: [
        "想問大約多久可以洗好？",
        "如果洗壞了你們怎麼處理？",
        "有會員或儲值方案嗎？",
      ],
    },
    {
      id: "cleanerMaster",
      name: "清潔師傅",
      icon: "🧼",
      avatar: "/images/role-cleaner.png",
      badge: "衣物 / 鞋子 / 包包材質與清潔建議",
      samples: [
        "這雙麂皮鞋發霉還救得回來嗎？",
        "包包發黃有機會洗白嗎？",
        "羽絨外套可以水洗嗎？",
      ],
    },
    {
      id: "ironingMaster",
      name: "熨燙師傅",
      icon: "👔",
      avatar: "/images/role-ironing.png",
      badge: "西裝 / 襯衫定型 · 皺摺處理",
      samples: [
        "西裝肩線有點跑掉可以救嗎？",
        "襯衫領子捲起來可以壓平嗎？",
        "婚紗整燙大概怎麼處理？",
      ],
    },
    {
      id: "deliveryStaff",
      name: "外送員",
      icon: "🚚",
      avatar: "/images/role-delivery.png",
      badge: "收送安排 · 路線問題 · 洗鞋估價入口",
      samples: [
        "請問板橋這邊有免費收送嗎？",
        "想改一下送回的時間可以嗎？",
        "我想估一下這雙鞋清洗大概多少。",
      ],
    },
  ];

  let currentRole = roles[0];
  const conversations = {};
  const MAX_MESSAGES_PER_ROLE = 60;

  function ensureConversation(role) {
    if (!conversations[role.id]) {
      conversations[role.id] = [];
    }
  }

  function appendAiMessage(role, text) {
    ensureConversation(role);
    conversations[role.id].push({
      type: "ai",
      text,
      time: nowTimeLabel(),
    });
    if (conversations[role.id].length > MAX_MESSAGES_PER_ROLE) {
      conversations[role.id].shift();
    }
  }

  // ===== 2. DOM 取得 =====
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
      setTimeout(showOnboarding, 600);
    }
  } catch (e) {
    // ignore
  }

  // ★ 這裡同時綁 click + touchstart，避免手機版按鈕無反應
  if (onboardingCloseEl) {
    onboardingCloseEl.addEventListener("click", hideOnboarding);
    onboardingCloseEl.addEventListener("touchstart", function (e) {
      e.preventDefault();
      hideOnboarding();
    });
  }
  if (onboardingBtnEl) {
    onboardingBtnEl.addEventListener("click", hideOnboarding);
    onboardingBtnEl.addEventListener("touchstart", function (e) {
      e.preventDefault();
      hideOnboarding();
    });
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

  let currentFlow = null;

  function resetFlow() {
    currentFlow = null;
  }

  function startShoeFlow(fromRoleId) {
    const role = roles.find((r) => r.id === fromRoleId) || currentRole;
    currentRole = role;
    ensureConversation(role);

    currentFlow = {
      type: "shoe-quote",
      roleId: role.id,
      step: 0,
      answers: [],
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
    renderConversation();
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
      return true;
    }

    // 問完所有問題，呼叫後端 AI 算估價
    const summaryPrompt =
      "以下是客人提供的鞋子清洗資訊，請你幫忙以 C.H 精緻洗衣的專業角度，保守估計清洗成功率與價格區間，並說明可能的風險與注意事項：" +
      "\n\n" +
      currentFlow.answers
        .map((a, idx) => `Q${idx + 1}：${SHOE_FLOW_STEPS[idx]}\nA：${a}`)
        .join("\n\n");

    conversations[role.id].push({
      type: "ai",
      text: "好的，我來幫你綜合評估一下，稍等我幾秒鐘。",
      time: nowTimeLabel(),
    });
    renderConversation();

    fetch("/api/chat/" + role.id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: summaryPrompt }),
    })
      .then((res) => res.json())
      .then((data) => {
        const reply =
          (data && data.reply) ||
          "目前系統回覆有點慢，等一下再試一次，或改由 LINE 詢問真人客服。";
        conversations[role.id].push({
          type: "ai",
          text: reply,
          time: nowTimeLabel(),
        });
        renderConversation();
      })
      .catch((err) => {
        console.error("shoe-flow error", err);
        conversations[role.id].push({
          type: "ai",
          text: FALLBACK_ERROR_TEXT,
          time: nowTimeLabel(),
        });
        renderConversation();
      })
      .finally(() => {
        resetFlow();
      });

    return true;
  }

  // ===== 5. 更新右側角色頭像區 =====
  function updateRoleHeader(role) {
    if (!role) return;
    currentRole = role;
    if (currentRoleNameEl) currentRoleNameEl.textContent = role.name;
    if (roleBadgeEl) roleBadgeEl.textContent = role.badge;
    if (roleAvatarImgEl) roleAvatarImgEl.src = role.avatar;

    if (window.chTownMapSetActiveRole) {
      window.chTownMapSetActiveRole(role.id);
    }
  }

  // ===== 6. 渲染角色 tabs =====
  function renderRoleTabs() {
    roleTabsEl.innerHTML = "";
    roles.forEach((role) => {
      const tab = document.createElement("button");
      tab.className =
        "role-tab" + (role.id === currentRole.id ? " active" : "");
      tab.textContent = role.icon + " " + role.name;
      tab.addEventListener("click", () => {
        currentRole = role;
        ensureConversation(role);
        updateRoleHeader(role);
        renderRoleTabs();
        renderConversation();
      });
      roleTabsEl.appendChild(tab);
    });
  }

  // ===== 7. 快捷問題區 =====
  function renderQuickQuestions() {
    quickQuestionsEl.innerHTML = "";
    const role = currentRole;
    if (!role.samples || !role.samples.length) return;
    role.samples.forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "quick-question-btn";
      btn.textContent = q;
      btn.addEventListener("click", () => {
        sendMessage(q);
      });
      quickQuestionsEl.appendChild(btn);
    });
  }

  // ===== 8. 對話訊息渲染 =====
  function renderConversation() {
    const msgs = conversations[currentRole.id] || [];
    chatBoxEl.innerHTML = "";

    msgs.forEach((m) => {
      const wrapper = document.createElement("div");
      wrapper.className = "msg " + (m.type || "ai");

      const bubble = document.createElement("div");
      bubble.className = "bubble";

      const textEl = document.createElement("div");
      textEl.className = "text";
      textEl.textContent = m.text;

      const metaEl = document.createElement("div");
      metaEl.className = "meta";
      metaEl.textContent = m.time || "";

      bubble.appendChild(textEl);
      bubble.appendChild(metaEl);
      wrapper.appendChild(bubble);
      chatBoxEl.appendChild(wrapper);
    });

    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  }

  // ===== 9. 對話送出處理 =====
  function sendMessage(text) {
    const t = (text || "").trim();
    if (!t) return;

    const role = currentRole;
    ensureConversation(role);
    conversations[role.id].push({
      type: "user",
      text: t,
      time: nowTimeLabel(),
    });
    renderConversation();
    if (userInputEl) userInputEl.value = "";

    if (currentFlow && currentFlow.type === "shoe-quote") {
      if (handleShoeFlowAnswer(t)) {
        return;
      }
    }

    fetch("/api/chat/" + role.id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: t }),
    })
      .then((res) => res.json())
      .then((data) => {
        const reply =
          (data && data.reply) ||
          "目前系統回覆有點慢，等一下再試一次，或改由 LINE 詢問真人客服。";
        conversations[role.id].push({
          type: "ai",
          text: reply,
          time: nowTimeLabel(),
        });
        renderConversation();
      })
      .catch((err) => {
        console.error("chat error", err);
        conversations[role.id].push({
          type: "ai",
          text: FALLBACK_ERROR_TEXT,
          time: nowTimeLabel(),
        });
        renderConversation();
      });
  }

  // ===== 10. 綁定事件 =====
  if (chatFormEl) {
    chatFormEl.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!userInputEl) return;
      sendMessage(userInputEl.value);
    });
  }

  if (shoeFlowBtnEl) {
    shoeFlowBtnEl.addEventListener("click", function () {
      startShoeFlow("deliveryStaff");
    });
  }

  // 左邊小鎮透過 window.chTownNpcSay 呼叫這裡
  window.chTownNpcSay = function (roleId, text) {
    const role = roles.find((r) => r.id === roleId) || currentRole;
    currentRole = role;
    ensureConversation(role);

    conversations[role.id].push({
      type: "ai",
      text,
      time: nowTimeLabel(),
    });
    updateRoleHeader(role);
    renderRoleTabs();
    renderConversation();
  };

  // ===== 11. 初始化畫面 =====
  roles.forEach((r) => ensureConversation(r));

  appendAiMessage(
    roles[0],
    "嗨～歡迎來到 C.H AI 小鎮，我可以先幫你介紹服務，或你有什麼想問的都可以直接打在下面。"
  );

  updateRoleHeader(currentRole);
  renderRoleTabs();
  renderQuickQuestions();
  renderConversation();
})();
