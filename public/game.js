// public/game.js
// C.H AI Town - 純原生 Canvas 版本，不再依賴 Phaser

(function () {
  const GAME_ROOT_ID = "game-root";

  const state = {
    playerX: 0,
    playerY: 0,
    targetX: 0,
    targetY: 0,
    speed: 4,
    canvas: null,
    ctx: null,
    animationId: null,
  };

  function createCanvas(root) {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    root.innerHTML = "";
    root.appendChild(canvas);
    resizeCanvas(canvas, root);
    return canvas;
  }

  function resizeCanvas(canvas, root) {
    const rect = root.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(320, rect.width || 480);
    const height = Math.max(320, rect.height || 420);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.ctx = ctx;

    // 初始化玩家在中間偏下
    state.playerX = width * 0.5;
    state.playerY = height * 0.55;
    state.targetX = state.playerX;
    state.targetY = state.playerY;

    drawScene();
  }

  function drawScene() {
    const ctx = state.ctx;
    if (!ctx) return;
    const canvas = state.canvas;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // 背景漸層
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#181b32");
    gradient.addColorStop(0.5, "#111528");
    gradient.addColorStop(1, "#050712");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 下半部平台
    ctx.fillStyle = "#15172b";
    roundRect(ctx, w * 0.05, h * 0.55, w * 0.9, h * 0.35, 20, true, false);

    // 道路
    ctx.fillStyle = "#2b304e";
    // 上橫路
    roundRect(ctx, w * 0.15, h * 0.25, w * 0.7, 40, 18, true, false);
    // 直路
    roundRect(ctx, w * 0.45, h * 0.25, 40, h * 0.45, 18, true, false);

    // 中線
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 16]);
    ctx.beginPath();
    ctx.moveTo(w * 0.16, h * 0.45);
    ctx.lineTo(w * 0.84, h * 0.45);
    ctx.stroke();
    ctx.setLineDash([]);

    // 建築 - 門市
    drawBuilding(
      ctx,
      w * 0.18,
      h * 0.18,
      120,
      90,
      "#fb6b7d",
      "#ffb3c1",
      "C.H 門市"
    );

    // 建築 - 整燙 / 整理區
    drawBuilding(
      ctx,
      w * 0.6,
      h * 0.16,
      130,
      95,
      "#3b82f6",
      "#93c5fd",
      "整燙 / 整理"
    );

    // 建築 - 倉庫 / 收送
    drawBuilding(
      ctx,
      w * 0.12,
      h * 0.6,
      130,
      85,
      "#22c55e",
      "#a7f3d0",
      "收送倉庫"
    );

    // 玩家
    drawPlayer(ctx, state.playerX, state.playerY);

    // 玩家名標籤
    ctx.fillStyle = "rgba(15,23,42,0.9)";
    roundRect(
      ctx,
      state.playerX - 42,
      state.playerY + 26,
      84,
      22,
      11,
      true,
      false
    );
    ctx.fillStyle = "#f9fafb";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("你在這裡", state.playerX, state.playerY + 37);
  }

  function drawPlayer(ctx, x, y) {
    // 外圈
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#ff7b93";
    ctx.fill();

    // 內圈
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#fee2e2";
    ctx.fill();
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined") stroke = false;
    if (typeof radius === "undefined") radius = 5;

    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (let side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }

    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function drawBuilding(ctx, x, y, w, h, colorMain, colorAccent, label) {
    ctx.fillStyle = colorMain;
    roundRect(ctx, x, y, w, h, 16, true, false);

    // 屋頂
    ctx.fillStyle = "rgba(15,23,42,0.9)";
    roundRect(ctx, x + 8, y + 6, w - 16, 18, 10, true, false);

    // 門
    ctx.fillStyle = colorAccent;
    roundRect(ctx, x + w * 0.4, y + h * 0.45, w * 0.22, h * 0.4, 10, true, false);

    // 小窗
    ctx.fillStyle = "rgba(15,23,42,0.95)";
    roundRect(ctx, x + 12, y + 32, 26, 22, 6, true, false);
    roundRect(ctx, x + w - 38, y + 32, 26, 22, 6, true, false);

    // 標籤文字
    ctx.fillStyle = "#f9fafb";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w / 2, y + h + 14);
  }

  function step() {
    const canvas = state.canvas;
    const ctx = state.ctx;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // 移動玩家 toward 目標點
    const dx = state.targetX - state.playerX;
    const dy = state.targetY - state.playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
      const vx = (dx / dist) * state.speed;
      const vy = (dy / dist) * state.speed;
      state.playerX += vx;
      state.playerY += vy;

      // 簡單邊界限制
      state.playerX = Math.min(Math.max(w * 0.08, state.playerX), w * 0.92);
      state.playerY = Math.min(Math.max(h * 0.2, state.playerY), h * 0.88);
    }

    drawScene();
    state.animationId = requestAnimationFrame(step);
  }

  function handleClick(evt) {
    const canvas = state.canvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    state.targetX = x;
    state.targetY = y;
  }

  function handleKeydown(evt) {
    const key = evt.key;
    const stepDelta = 18;

    switch (key) {
      case "ArrowUp":
      case "w":
      case "W":
        state.targetY = state.playerY - stepDelta;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        state.targetY = state.playerY + stepDelta;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        state.targetX = state.playerX - stepDelta;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        state.targetX = state.playerX + stepDelta;
        break;
      default:
        return;
    }
  }

  function boot() {
    const root = document.getElementById(GAME_ROOT_ID);
    if (!root) return;

    state.canvas = createCanvas(root);

    window.addEventListener("resize", () => {
      if (!state.canvas) return;
      resizeCanvas(state.canvas, root);
    });

    state.canvas.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeydown);

    if (state.animationId) cancelAnimationFrame(state.animationId);
    step();
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(boot, 0);
  } else {
    window.addEventListener("DOMContentLoaded", boot);
  }
})();
