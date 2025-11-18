// public/game.js
// 不用任何外部套件，單純 canvas 2D 小鎮 + 角色移動

(function () {
  const canvas = document.getElementById("town-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const state = {
    width: 800,
    height: 500,
    player: {
      x: 260,
      y: 300,
      r: 12,
      color: "#ff8fb6",
      speed: 2.2,
      target: null, // {x,y} 點擊目標
    },
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    },
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.width = Math.max(320, rect.width || 480);
    state.height = Math.max(320, rect.height || 420);
    canvas.width = state.width;
    canvas.height = state.height;
  }

  resize();
  window.addEventListener("resize", resize);

  /* ---------- 畫面 ---------- */

  function drawBackground() {
    const { width: w, height: h } = state;

    // 背景漸層
    const g = ctx.createRadialGradient(w / 2, h * 0.1, 0, w / 2, h / 2, h * 0.9);
    g.addColorStop(0, "#222744");
    g.addColorStop(1, "#050814");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // 道路
    ctx.fillStyle = "#1e2238";
    ctx.strokeStyle = "#3b4262";
    ctx.lineWidth = 1.5;

    // 橫向
    const roadH = { x: w * 0.07, y: h * 0.55, w: w * 0.86, h: 52 };
    ctx.fillRect(roadH.x, roadH.y, roadH.w, roadH.h);
    ctx.strokeRect(roadH.x, roadH.y, roadH.w, roadH.h);

    // 直向
    const roadV = { x: w * 0.24, y: h * 0.15, w: 46, h: h * 0.7 };
    ctx.fillRect(roadV.x, roadV.y, roadV.w, roadV.h);
    ctx.strokeRect(roadV.x, roadV.y, roadV.w, roadV.h);

    // 草地
    ctx.fillStyle = "#182433";
    ctx.strokeStyle = "#335a7a";
    const topField = { x: w * 0.52, y: h * 0.08, w: w * 0.42, h: h * 0.32 };
    const bottomField = { x: w * 0.52, y: h * 0.62, w: w * 0.42, h: h * 0.30 };
    ctx.fillRect(topField.x, topField.y, topField.w, topField.h);
    ctx.strokeRect(topField.x, topField.y, topField.w, topField.h);
    ctx.fillRect(bottomField.x, bottomField.y, bottomField.w, bottomField.h);
    ctx.strokeRect(bottomField.x, bottomField.y, bottomField.w, bottomField.h);

    // 建物
    drawBuilding({
      x: w * 0.73,
      y: h * 0.17,
      w: w * 0.26,
      h: h * 0.20,
      border: "#ff8fb6",
      title: "C.H 門市",
      subtitle: "櫃檯接待 · 諮詢",
      icon: "🏪",
    });

    drawBuilding({
      x: w * 0.73,
      y: h * 0.7,
      w: w * 0.28,
      h: h * 0.20,
      border: "#ffc96b",
      title: "整理區 / 倉庫",
      subtitle: "分類 · 包裝 · 入庫",
      icon: "📦",
    });

    drawBuilding({
      x: w * 0.24,
      y: h * 0.13,
      w: w * 0.22,
      h: h * 0.18,
      border: "#7ad3ff",
      title: "外送集散點",
      subtitle: "出車 · 回件",
      icon: "🚚",
    });

    // 提示文字
    ctx.fillStyle = "#f4f5ff";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("👣 點一下小鎮任一位置，角色會走過去。", w * 0.06, h * 0.06);
    ctx.fillText("⌨️ 方向鍵可控制移動。", w * 0.06, h * 0.06 + 18);
  }

  function drawBuilding(cfg) {
    const { x, y, w, h, border, title, subtitle, icon } = cfg;

    // 主體
    ctx.fillStyle = "#252842";
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    roundRect(x - w / 2, y - h / 2, w, h, 10, true, true);

    // 招牌
    const signW = w * 0.7;
    const signH = 22;
    const signX = x - signW / 2;
    const signY = y - h / 2 - signH - 4;
    ctx.fillStyle = border;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    roundRect(signX, signY, signW, signH, 999, true, true);

    ctx.fillStyle = "#111111";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${icon}  ${title}`, x, signY + signH / 2);

    // 副標
    ctx.fillStyle = "#e4e6ff";
    ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
    ctx.fillText(subtitle, x, y + h * 0.1);

    // 小窗
    ctx.fillStyle = "#34425f";
    ctx.strokeStyle = "#6073a2";
    ctx.lineWidth = 1;

    const winW = w * 0.16;
    const winH = h * 0.26;
    const baseY = y + h * 0.02;
    const x1 = x - w * 0.26;
    const x2 = x - w * 0.08;
    const x3 = x + w * 0.10;

    roundRect(x1, baseY, winW, winH, 4, true, true);
    roundRect(x2, baseY, winW, winH, 4, true, true);
    roundRect(x3, baseY, winW, winH, 4, true, true);
  }

  function roundRect(x, y, w, h, r, fill, stroke) {
    if (typeof r === "number") {
      r = { tl: r, tr: r, br: r, bl: r };
    }
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + w - r.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    ctx.lineTo(x + w, y + h - r.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    ctx.lineTo(x + r.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function drawPlayer() {
    const { player } = state;
    // 光圈
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,143,182,0.25)";
    ctx.arc(player.x, player.y, player.r + 8, 0, Math.PI * 2);
    ctx.fill();

    // 本體
    ctx.beginPath();
    ctx.fillStyle = player.color;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 標籤
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("你", player.x, player.y - player.r - 4);
  }

  /* ---------- 更新 ---------- */

  function update() {
    const { player, keys, width: w, height: h } = state;
    let vx = 0;
    let vy = 0;

    if (keys.ArrowLeft) vx -= 1;
    if (keys.ArrowRight) vx += 1;
    if (keys.ArrowUp) vy -= 1;
    if (keys.ArrowDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy) || 1;
      player.x += (vx / len) * player.speed * 2;
      player.y += (vy / len) * player.speed * 2;
      player.target = null; // 手動移動就取消點擊目標
    } else if (player.target) {
      const dx = player.target.x - player.x;
      const dy = player.target.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        player.x += (dx / dist) * player.speed * 2;
        player.y += (dy / dist) * player.speed * 2;
      } else {
        player.target = null;
      }
    }

    // 邊界
    player.x = Math.min(Math.max(player.r + 6, player.x), w - player.r - 6);
    player.y = Math.min(Math.max(player.r + 6, player.y), h - player.r - 6);
  }

  function loop() {
    update();
    drawBackground();
    drawPlayer();
    requestAnimationFrame(loop);
  }

  /* ---------- 事件 ---------- */

  window.addEventListener("keydown", (e) => {
    if (e.key in state.keys) {
      state.keys[e.key] = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key in state.keys) {
      state.keys[e.key] = false;
    }
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * state.width;
    const y = ((e.clientY - rect.top) / rect.height) * state.height;
    state.player.target = { x, y };
  });

  /* ---------- 啟動 ---------- */

  loop();
})();
