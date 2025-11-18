// public/game.js
// C.H AI Town 小鎮：大地圖 + 點建築切換角色

(function () {
  const ROOT_ID = "game-root";

  function boot() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    const width = root.clientWidth || 520;
    const height = root.clientHeight || 520;

    const config = {
      type: Phaser.AUTO,
      parent: ROOT_ID,
      width,
      height,
      backgroundColor: "#0b1020",
      scene: {
        create,
        update,
      },
    };

    const game = new Phaser.Game(config);

    function create() {
      const scene = this;
      const w = scene.scale.width;
      const h = scene.scale.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // 背景區塊
      const bg = scene.add
        .rectangle(centerX, centerY, w * 0.96, h * 0.96, 0x151933)
        .setStrokeStyle(2, 0x343b5d);
      bg.setOrigin(0.5, 0.5);

      // 馬路 – 垂直
      const roadWidth = w * 0.08;
      scene.add
        .rectangle(centerX, centerY, roadWidth, h * 0.8, 0x22263d)
        .setStrokeStyle(1, 0x3a415d);

      // 馬路 – 水平（上方）
      scene.add
        .rectangle(centerX, h * 0.42, w * 0.8, roadWidth * 0.72, 0x22263d)
        .setStrokeStyle(1, 0x3a415d);

      // 虛線
      const dashCount = 7;
      const dashLen = (w * 0.8) / (dashCount * 2);
      for (let i = 0; i < dashCount; i++) {
        const x = centerX - (w * 0.8) / 2 + dashLen / 2 + i * dashLen * 2;
        scene.add.rectangle(x, h * 0.42, dashLen, 3, 0x4a536f);
      }

      // === 建築工廠函式 ===
      function createBuilding(opts) {
        const { x, y, color, title, subtitle, onClick } = opts;
        const width = w * 0.22;
        const height = h * 0.18;

        const container = scene.add.container(x, y);

        const base = scene.add
          .rectangle(0, 0, width, height, color)
          .setOrigin(0.5, 0.5)
          .setStrokeStyle(3, 0x192034);
        base.setRadius?.(14);

        const roof = scene.add
          .rectangle(0, -height * 0.38, width * 0.9, height * 0.25, 0x111324)
          .setOrigin(0.5, 0.5);

        const door = scene.add.rectangle(
          0,
          height * 0.05,
          width * 0.16,
          height * 0.3,
          0x111324
        );
        const winLeft = scene.add.rectangle(
          -width * 0.22,
          -height * 0.05,
          width * 0.16,
          height * 0.2,
          0x111324
        );
        const winRight = scene.add.rectangle(
          width * 0.22,
          -height * 0.05,
          width * 0.16,
          height * 0.2,
          0x111324
        );

        const titleText = scene.add
          .text(0, -height * 0.45, title, {
            fontSize: 14,
            color: "#fdf2ff",
            fontStyle: "700",
          })
          .setOrigin(0.5, 0.5);

        const subtitleText = scene.add
          .text(0, height * 0.42, subtitle, {
            fontSize: 11,
            color: "#cfd4ff",
          })
          .setOrigin(0.5, 0.5);

        container.add([
          base,
          roof,
          door,
          winLeft,
          winRight,
          titleText,
          subtitleText,
        ]);

        // 點擊範圍
        const hit = scene.add
          .rectangle(0, 0, width * 1.05, height * 1.1, 0xffffff, 0)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true });

        hit.on("pointerdown", () => {
          if (typeof onClick === "function") onClick();
          // 小小的閃動效果
          scene.tweens.add({
            targets: container,
            scaleX: 1.03,
            scaleY: 1.03,
            yoyo: true,
            duration: 120,
            ease: "Quad.easeInOut",
          });
        });

        container.add(hit);
        return container;
      }

      // === 建築：對應角色 ===
      createBuilding({
        x: centerX - w * 0.22,
        y: h * 0.24,
        color: 0xff6b81,
        title: "C.H 門市",
        subtitle: "接待 · 一般諮詢",
        onClick: () => {
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap("chCustomerService");
          }
        },
      });

      createBuilding({
        x: centerX + w * 0.22,
        y: h * 0.24,
        color: 0x4f7dff,
        title: "整燙 / 整理",
        subtitle: "西裝 · 禮服整燙",
        onClick: () => {
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap("ironingMaster");
          }
        },
      });

      createBuilding({
        x: centerX - w * 0.22,
        y: h * 0.7,
        color: 0x32c872,
        title: "收送倉庫",
        subtitle: "外送 · 收送調度",
        onClick: () => {
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap("deliveryStaff");
          }
        },
      });

      // === 主角圓點 ===
      const startX = centerX;
      const startY = h * 0.55;

      const outer = scene.add.circle(startX, startY, 11, 0xff86a0);
      const inner = scene.add.circle(startX, startY, 5, 0xffffff);
      const playerGroup = scene.add.container(0, 0, [outer, inner]);
      playerGroup.x = startX;
      playerGroup.y = startY;

      scene.player = playerGroup;
      scene.playerTarget = null;

      // 點擊地圖：走到該位置
      scene.input.on("pointerdown", (pointer) => {
        const localY = Phaser.Math.Clamp(
          pointer.y,
          h * 0.16,
          h * 0.82
        );
        const localX = Phaser.Math.Clamp(
          pointer.x,
          centerX - w * 0.38,
          centerX + w * 0.38
        );
        scene.playerTarget = { x: localX, y: localY };
      });

      // 鍵盤方向鍵
      scene.cursors = scene.input.keyboard.createCursorKeys();
    }

    function update(time, delta) {
      const scene = this;
      const player = scene.player;
      if (!player) return;

      const speed = 0.22 * delta; // 每 frame 位移

      let vx = 0;
      let vy = 0;

      if (scene.cursors?.left.isDown) vx -= speed;
      if (scene.cursors?.right.isDown) vx += speed;
      if (scene.cursors?.up.isDown) vy -= speed;
      if (scene.cursors?.down.isDown) vy += speed;

      if (vx !== 0 || vy !== 0) {
        scene.playerTarget = null;
        player.x += vx;
        player.y += vy;
      } else if (scene.playerTarget) {
        const dx = scene.playerTarget.x - player.x;
        const dy = scene.playerTarget.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) {
          scene.playerTarget = null;
        } else {
          player.x += (dx / dist) * speed;
          player.y += (dy / dist) * speed;
        }
      }
    }

    // 視窗 resize：讓 canvas 跟著 panel 大小走
    window.addEventListener("resize", () => {
      const r = root.getBoundingClientRect();
      const w2 = Math.max(320, r.width || width);
      const h2 = Math.max(320, r.height || height);
      game.scale.resize(w2, h2);
    });
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
