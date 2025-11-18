// public/game.js
// C.H AI Town 2D 小鎮：有道路、房子、倉庫，角色可用鍵盤或點擊移動

(function () {
  const GAME_ROOT_ID = "game-root";

  function createGameConfig(width, height) {
    return {
      type: Phaser.AUTO,
      parent: GAME_ROOT_ID,
      width,
      height,
      backgroundColor: "#0b1020",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [TownScene],
    };
  }

  class TownScene extends Phaser.Scene {
    constructor() {
      super("TownScene");
      this.player = null;
      this.cursors = null;
      this.moveTarget = null;
      this.playerAura = null;
      this.playerLabel = null;
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;

      // 背景
      const bgBase = this.add.rectangle(w / 2, h / 2, w, h, 0x13162a);
      const bgGlow = this.add.rectangle(w / 2, h * 0.3, w * 0.8, h * 0.6, 0x22294b, 0.9);
      const bgBottom = this.add.rectangle(w / 2, h * 0.9, w * 0.8, h * 0.3, 0x181b33, 0.9);

      bgBase.setStrokeStyle(1, 0x2c3152);
      bgGlow.setStrokeStyle(1, 0x363d66);
      bgBottom.setStrokeStyle(1, 0x363d66);

      // 道路
      const roadColor = 0x1e2238;

      const roadH = this.add.rectangle(w / 2, h * 0.58, w * 0.86, 52, roadColor);
      roadH.setStrokeStyle(1, 0x3b4262);

      const roadV = this.add.rectangle(w * 0.28, h * 0.5, 46, h * 0.7, roadColor);
      roadV.setStrokeStyle(1, 0x3b4262);

      // 草地區
      this.add.rectangle(w * 0.7, h * 0.26, w * 0.4, h * 0.3, 0x182433).setStrokeStyle(1, 0x335a7a);
      this.add.rectangle(w * 0.7, h * 0.82, w * 0.4, h * 0.26, 0x182433).setStrokeStyle(1, 0x335a7a);

      // 建築
      this._createBuilding({
        x: w * 0.7,
        y: h * 0.25,
        width: w * 0.24,
        height: h * 0.18,
        color: 0x252842,
        border: 0xff8fb6,
        title: "C.H 門市",
        subtitle: "櫃檯接待 · 諮詢",
        icon: "🏪",
      });

      this._createBuilding({
        x: w * 0.7,
        y: h * 0.8,
        width: w * 0.26,
        height: h * 0.18,
        color: 0x252842,
        border: 0xffc96b,
        title: "整理區 / 倉庫",
        subtitle: "分類 · 包裝 · 入庫",
        icon: "📦",
      });

      this._createBuilding({
        x: w * 0.28,
        y: h * 0.2,
        width: w * 0.24,
        height: h * 0.16,
        color: 0x252842,
        border: 0x7ad3ff,
        title: "外送集散點",
        subtitle: "出車 · 回件",
        icon: "🚚",
      });

      this.add.text(w * 0.08, h * 0.08, "👣 點一下小鎮任一位置\n角色會走過去", {
        fontSize: 12,
        color: "#f4f5ff",
        lineSpacing: 4,
      });

      // 主角
      this.player = this.physics.add.circle(w * 0.3, h * 0.58, 15, 0xff8fb6);
      this.player.setStrokeStyle(2, 0xffffff);
      this.player.body.setCollideWorldBounds(true);

      this.playerAura = this.add.circle(this.player.x, this.player.y, 24, 0xff8fb6, 0.2);

      this.playerLabel = this.add
        .text(this.player.x, this.player.y - 26, "你", {
          fontSize: 12,
          color: "#ffffff",
        })
        .setOrigin(0.5, 1);

      this.cursors = this.input.keyboard.createCursorKeys();

      this.input.on("pointerdown", (pointer) => {
        this.moveTarget = { x: pointer.worldX, y: pointer.worldY };
      });
    }

    _createBuilding(cfg) {
      const { x, y, width, height, color, border, title, subtitle, icon } = cfg;

      const base = this.add.rectangle(x, y, width, height, color);
      base.setStrokeStyle(2, border);

      const sign = this.add.rectangle(x, y - height * 0.33, width * 0.7, 20, border, 1);
      sign.setStrokeStyle(1, 0xffffff);

      this.add
        .text(x, y - height * 0.34, `${icon}  ${title}`, {
          fontSize: 12,
          color: "#111111",
        })
        .setOrigin(0.5, 0.5);

      this.add
        .text(x, y + height * 0.02, subtitle, {
          fontSize: 11,
          color: "#e4e6ff",
        })
        .setOrigin(0.5, 0.5);

      const winW = width * 0.18;
      const winH = height * 0.28;
      this.add.rectangle(x - width * 0.22, y + height * 0.05, winW, winH, 0x34425f).setStrokeStyle(1, 0x6073a2);
      this.add.rectangle(x - width * 0.05, y + height * 0.05, winW, winH, 0x34425f).setStrokeStyle(1, 0x6073a2);
      this.add.rectangle(x + width * 0.12, y + height * 0.05, winW, winH, 0x34425f).setStrokeStyle(1, 0x6073a2);
    }

    update() {
      if (!this.player) return;

      const speed = 170;
      const body = this.player.body;

      body.setVelocity(0);

      if (this.cursors.left.isDown) {
        body.setVelocityX(-speed);
        this.moveTarget = null;
      } else if (this.cursors.right.isDown) {
        body.setVelocityX(speed);
        this.moveTarget = null;
      }

      if (this.cursors.up.isDown) {
        body.setVelocityY(-speed);
        this.moveTarget = null;
      } else if (this.cursors.down.isDown) {
        body.setVelocityY(speed);
        this.moveTarget = null;
      }

      if (this.moveTarget) {
        const dx = this.moveTarget.x - this.player.x;
        const dy = this.moveTarget.y - this.player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 4) {
          const vx = (dx / dist) * speed;
          const vy = (dy / dist) * speed;
          body.setVelocity(vx, vy);
        } else {
          body.setVelocity(0, 0);
          this.moveTarget = null;
        }
      }

      const w = this.scale.width;
      const h = this.scale.height;
      this.player.x = Phaser.Math.Clamp(this.player.x, 24, w - 24);
      this.player.y = Phaser.Math.Clamp(this.player.y, 24, h - 24);

      if (this.playerAura) {
        this.playerAura.x = this.player.x;
        this.playerAura.y = this.player.y;
      }
      if (this.playerLabel) {
        this.playerLabel.x = this.player.x;
        this.playerLabel.y = this.player.y - 24;
      }
    }
  }

  function boot() {
    const root = document.getElementById(GAME_ROOT_ID);
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const width = Math.max(320, rect.width || 480);
    const height = Math.max(320, rect.height || 420);

    const config = createGameConfig(width, height);
    const game = new Phaser.Game(config);

    window.addEventListener("resize", () => {
      const r = root.getBoundingClientRect();
      const w = Math.max(320, r.width || 480);
      const h = Math.max(320, r.height || 420);
      game.scale.resize(w, h);
    });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 0);
  } else {
    window.addEventListener("DOMContentLoaded", boot);
  }
})();
