const express = require("express");
const path = require("path");
const cors = require("cors");

const router = require("./router");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", router);

// serve frontend
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`C.H AI Town backend running on port ${PORT}`);
});
