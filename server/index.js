const express = require("express");
const cors = require("cors");
const path = require("path");

const router = require("./router");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", router);

/*******************************
 *   FRONTEND UI (HTML/CSS/JS)
 *******************************/
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<title>C.H AI Town</title>
<style>
body { margin: 0; background: #f7f7f7; font-family: "Segoe UI", Arial, sans-serif; }

/* Header */
.header { display: flex; justify-content: space-between; padding: 15px 20px; background: white; border-bottom: 1px solid #ddd; }
.logo { font-weight: bold; color: #333; }

.section-title { font-size: 18px; font-weight: bold; margin: 20px; }

/* Roles */
.role-grid {
  display: grid;
  padding: 20px;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}
.role-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: 0.25s;
}
.role-card:hover {
  transform: scale(1.03);
}
.role-selected {
  border: 2px solid #3f80ff;
}
.role-card .icon {
  font-size: 26px;
  margin-bottom: 5px;
}
.role-card .name {
  font-weight: 600;
  color: #333;
}
.role-card .desc {
  color: #777;
  font-size: 14px;
  margin-top: 4px;
}

/* Chat */
.chat-box {
  height: 320px;
  overflow-y: auto;
  background: white;
  margin: 15px;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #ddd;
}
.msg {
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  max-width: 80%;
}
.ai-msg {
  background: #f2f2f2;
}
.user-msg {
  background: #d6e4ff;
  margin-left: auto;
}

/* Input */
.input-area {
  display: flex;
  margin: 15px;
}
.input-area input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
}
.input-area button {
  padding: 12px 20px;
  margin-left: 10px;
  border: none;
  border-radius: 10px;
  background: #3f80ff;
  color: white;
  cursor: pointer;
}
</style>
</head>
<body>

<div class="header">
  <div class="logo">C.H AI Town</div>
</div>

<div class="section-title">選擇角色</div>

<div class="role-grid" id="role-grid">
  <div class="role-card" data-id="ch_customer_service">
    <div class="icon">💼</div>
    <div class="name">C.H 客服</div>
    <div class="desc">對話、介紹服務、回答問題</div>
  </div>

  <div class="role-card" data-id="store_manager">
    <div class="icon">🏪</div>
    <div class="name">店長</div>
    <div class="desc">掌握全局、給建議</div>
  </div>

  <div class="role-card" data-id="cleaner_master">
    <div class="icon">🧼</div>
    <div class="name">清潔師傅</div>
    <div class="desc">分析材質、污漬風險、判斷可否清潔</div>
  </div>

  <div class="role-card" data-id="ironing_master">
    <div class="icon">🧺</div>
    <div class="name">熨燙師傅</div>
    <div class="desc">講解熨燙流程與注意事項</div>
  </div>

  <div class="role-card" data-id="delivery_staff">
    <div class="icon">🚚</div>
    <div class="name">外送員</div>
    <div class="desc">查詢運送、收送服務相關問題</div>
  </div>
</div>

<div class="section-title">聊天區</div>

<div class="chat-box" id="chat-box"></div>

<div class="input-area">
  <input type="text" id="msgInput" placeholder="輸入訊息...">
  <button onclick="sendMsg()">送出</button>
</div>

<script>
let currentRole = "";
let userId = "web-user-" + Math.random().toString(36).substring(2, 8);

// 點選角色
document.querySelectorAll(".role-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".role-card").forEach(c => c.classList.remove("role-selected"));
    card.classList.add("role-selected");
    currentRole = card.dataset.id;

    appendAI("已切換角色：" + card.querySelector(".name").innerText);
  });
});

// 加入訊息
function appendAI(text) {
  let box = document.getElementById("chat-box");
  box.innerHTML += \`<div class="msg ai-msg">\${text}</div>\`;
  box.scrollTop = box.scrollHeight;
}
function appendUser(text) {
  let box = document.getElementById("chat-box");
  box.innerHTML += \`<div class="msg user-msg">\${text}</div>\`;
  box.scrollTop = box.scrollHeight;
}

// 發送訊息
async function sendMsg() {
  let msg = document.getElementById("msgInput").value.trim();
  if (!msg) return;
  if (!currentRole) {
    appendAI("請先選擇一個角色 🙏");
    return;
  }

  appendUser(msg);
  document.getElementById("msgInput").value = "";

  let res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      roleId: currentRole,
      message: msg
    })
  });

  let data = await res.json();
  appendAI(data.reply);
}
</script>

</body>
</html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`C.H AI Town server running on port ${port}`);
});
