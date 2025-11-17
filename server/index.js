require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { handleChat } = require("./router");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// 健康檢查 & 確認服務是否啟動
app.get("/", (req, res) => {
  res.send("C.H AI Town backend is running.");
});

// 主聊天入口
app.post("/api/chat", async (req, res) => {
  try {
    const { userId, message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required and must be string" });
    }

    const result = await handleChat(userId || "anonymous", message);

    res.json(result);
  } catch (err) {
    console.error("[ERROR] /api/chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`C.H AI Town server listening on port ${PORT}`);
});
