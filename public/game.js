// public/game.js
// 簡單 2D 小鎮：有道路、房子、倉庫，角色可用鍵盤或點擊移動

(function () {
  const GAME_ROOT_ID = "game-root";

  function createGameConfig(width, height) {
    return {
      type: Phaser.AUTO,
      parent: GAME_ROOT_ID,
      width,
      height,
      backgroundColor: "#05050a",
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
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;

      // 背景漸層
      const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x111322);
      bg.setStrokeStyle(1, 0x26283c);

      // 道路（中間一條橫路 + 一條直路）
      const roadH = this.add.rectangle(
        w / 2,
        h * 0.55,
        w * 0.85,
        46,
        0x1c1f30
      );
      roadH.setStrokeStyle(1, 0x2f3348);

      const roadV = this.add.rectangle(
        w * 0.3,
        h * 0.52,
        40,
        h * 0.7,
        0x1c1f30
      );
      roadV.setStrokeStyle(1, 0x2f3348);

      // 地塊 / 草地
      this.add.rectangle(
        w * 0.72,
        h * 0.28,
        w * 0.38,
        h * 0.32,
        0x171a2b
      ).setStrokeStyle(1, 0x303452);

      this.add.rectangle(
        w * 0.72,
        h * 0.8,
        w * 0.38,
        h * 0.25,
        0x171a2b
      ).setStrokeStyle(1, 0x303452);

      // 建築：門市、整理區 / 倉庫、外送區
      this._createBuilding({
        x: w * 0.72,
        y: h * 0.26,
        width: w * 0.22,
        height: h * 0.18,
        color: 0x252842,
        border: 0xff8fb6,
        title: "C.H 門市",
        subtitle: "櫃檯接待 · 諮詢",
      });

      this._createBuilding({
        x: w * 0.72,
        y: h * 0.76,
        width: w * 0.24,
        height: h * 0.18,
        color: 0x252842,
        border: 0xffc96b,
        title: "整理區 / 倉庫",
        subtitle: "分類 · 包裝 · 入庫",
      });

      this._createBuilding({
        x: w * 0.28,
        y: h * 0.18,
        width: w * 0.23,
        height: h * 0.15,
        color: 0x252842,
        border: 0x7ad3ff,
        title: "外送集散點",
        subtitle: "出車 · 回件",
      });

      // 小小指示牌
      const guide = this.add.text(
        w * 0.08,
        h * 0.08,
        "👣 點擊任一區域\n角色會走過去",
        {
          fontSize: 12,
          color: "#f5f5ff",
        }
      );
      guide.setAlpha(0.92);

      // 角色（主角）
      this.player = this.physics.add.circle(w * 0.3, h * 0.55, 14, 0xff8fb6);
      this.player.setStrokeStyle(2, 0xffffff);
      this.player.body.setCollideWorldBounds(true);

      // 角色外框光暈
      const aura = this.add.circle(
        this.player.x,
        this.player.y,
        22,
        0xff8fb6,
        0.18
      );
      this.playerAura = aura;

      // 名稱標籤
      this.playerLabel = this.add.text(
        this.player.x,
        this.player.y - 26,
        "你",
        {
          fontSize: 12,
          color: "#ffffff",
        }
      ).setOrigin(0.5, 1);

      // 鍵盤
      this.cursors = this.input.keyboard.createCursorKeys();

      // 點擊移動
      this.input.on("pointerdown", (pointer) => {
        this.moveTarget = { x: pointer.worldX, y: pointer.worldY };
      });
    }

    _createBuilding(cfg) {
      const { x, y, width, height, color, border, title, subtitle } = cfg;
      const rect = this.add.rectangle(x, y, width, height, color, 1);
      rect.setStrokeStyle(2, border);
      rect.setShadow(0, 0, border, 12, false, true);

      this.add.rectangle(x, y - height * 0.32, width * 0.6, 18, border, 0.9)
        .setStrokeStyle(1, 0xffffff);

      this.add.text(x, y - height * 0.33, title, {
        fontSize: 12,
        color: "#050509",
      }).setOrigin(0.5, 0.5);

      this.add.text(x, y + height * 0.05, subtitle, {
        fontSize: 11,
        color: "#e3e4ff",
      }).setOrigin(0.5, 0.5);
    }

    update() {
      if (!this.player) return;

      const speed = 170;
      const body = this.player.body;

      body.setVelocity(0);

      // 鍵盤移動優先
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

      // 點擊自動移動
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

      // Clamp 邊界
      const w = this.scale.width;
      const h = this.scale.height;
      this.player.x = Phaser.Math.Clamp(this.player.x, 20, w - 20);
      this.player.y = Phaser.Math.Clamp(this.player.y, 20, h - 20);

      // 更新光暈 & 名稱位置
      if (this.playerAura) {
        this.playerAura.x = this.player.x;
        this.playerAura.y = this.player.y;
      }
      if (this.playerLabel) {
        this.playerLabel.x = this.player.x;
        this.playerLabel.y = this.player.y - 22;
      }
    }
  }

  // ---- 初始化 Game（依照畫面大小） ----
  function boot() {
    const root = document.getElementById(GAME_ROOT_ID);
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const width = Math.max(320, rect.width || 480);
    const height = Math.max(260, rect.height || 360);

    const config = createGameConfig(width, height);
    const game = new Phaser.Game(config);

    // 視窗大小變更時調整
    window.addEventListener("resize", () => {
      const r = root.getBoundingClientRect();
      const w = Math.max(320, r.width || 480);
      const h = Math.max(260, r.height || 360);
      game.scale.resize(w, h);
    });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 0);
  } else {
    window.addEventListener("DOMContentLoaded", boot);
  }
})();
