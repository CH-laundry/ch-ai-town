// 先載入 .env（一定要在任何需要環境變數的 require 之前）
require("dotenv").config();

const express = require("express");
const path = require("path");
const router = require("./router");

const app = express();

// 從環境變數讀取 PORT，沒有就用 8080
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態資源：CSS / JS / 圖片
app.use(express.static(path.join(__dirname, "../public")));

// API 路由
app.use("/api", router);

// 主頁面
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`C.H AI Town backend running on port ${PORT}`);
});
