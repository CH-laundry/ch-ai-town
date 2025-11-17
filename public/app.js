// ===== C.H AI Town 前端主程式 =====

const roles = [
  {
    id: "ch_customer_service",
    name: "C.H 客服",
    desc: "對話、介紹服務、回覆一般問題",
  },
  {
    id: "shop_manager",
    name: "店長",
    desc: "掌握全局，說明流程與注意事項",
  },
  {
    id: "cleaner_master",
    name: "清潔師傅",
    desc: "分析材質、污漬風險與能否清潔",
  },
  {
    id: "ironing_master",
    name: "熨燙師傅",
    desc: "處理熨燙細節、版型與變形風險",
  },
  {
    id: "delivery_staff",
    name: "外送員",
    desc: "收送時間、範圍與路線相關問題",
  },
];

let currentRoleId = roles[0].id;

// 建一個簡單 userId，之後可以跟 LINE userId 對接
function getUserId() {
  const key = "chAiTownUserId";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = "user-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
    window.localStorage.setItem(key, id);
  }
  return id;
}

const userId = getUserId();

document.addEventListener("DOMContentLoaded", () => {
  const roleCards = document.querySelectorAll(".role-card");
  const currentRoleNameEl = document.getElementById("current-role-name");
  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  // 切換角色
  roleCards.forEach((card) => {
    card.addEventListener("click", () => {
      roleCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      currentRoleId = card.dataset.roleId;
      const roleName = card.dataset.roleName || "AI 角色";
      currentRoleNameEl.textContent = roleName;

      appendSystemMessage(
        `已切換成「${roleName}」。你可以直接繼續提問，不需要重新整理畫面。`
      );
    });
  });

  // 發送訊息
  sendBtn.addEventListener("click", () => {
    sendMessage(input, sendBtn, chatBox, currentRoleNameEl.textContent);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, sendBtn, chatBox, currentRoleNameEl.textContent);
    }
  });

  // 初始提示
  appendSystemMessage("你好，這裡是 C.H AI Town，小鎮角色已就緒，請先選擇你想對話的角色。");
});

// ===== UI Helper =====

function appendMessage(text, type, roleName) {
  const chatBox = document.getElementById("chat-box");
  const row = document.createElement("div");
  row.className = "msg-row " + type;

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble " + type;

  if (roleName) {
    const meta = document.createElement("div");
    meta.className = "msg-meta";
    meta.textContent = type === "user" ? "你" : roleName;
    bubble.appendChild(meta);
  }

  const content = document.createElement("div");
  content.textContent = text;
  bubble.appendChild(content);

  row.appendChild(bubble);
  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendSystemMessage(text) {
  appendMessage(text, "ai", "系統訊息");
}

function setLoadingState(isLoading) {
  const btn = document.getElementById("send-btn");
  const input = document.getElementById("chat-input");

  btn.disabled = isLoading;
  input.disabled = isLoading;

  if (isLoading) {
    btn.textContent = "思考中…";
  } else {
    btn.textContent = "發送";
  }
}

// ===== 與後端溝通 =====

async function sendMessage(input, sendBtn, chatBox, roleNameForDisplay) {
  const text = (input.value || "").trim();
  if (!text) return;

  appendMessage(text, "user", "你");
  input.value = "";
  setLoadingState(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        roleId: currentRoleId,
        message: text,
      }),
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();
    const replyText =
      data.reply ||
      "後端沒有回覆內容，請稍後再試或聯絡系統管理者。";

    appendMessage(replyText, "ai", roleNameForDisplay || "AI 角色");
  } catch (err) {
    appendMessage(
      "系統目前連線有點問題，請稍後再試一次。\n（錯誤詳情：" +
        err.message +
        "）",
      "ai",
      "系統錯誤"
    );
  } finally {
    setLoadingState(false);
  }
}
