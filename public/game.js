// public/game.js
// C.H AI Town 小鎮：2D 房子圖片 + NPC 互動 + 建築高亮 + 基本動畫

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
      backgroundColor: "#050814",
      scene: { preload, create, update },
    };

    const game = new Phaser.Game(config);

    // 視窗 resize：讓 canvas 跟著 panel 大小走
    window.addEventListener("resize", () => {
      const rect = root.getBoundingClientRect();
      const w2 = Math.max(320, rect.width || width);
      const h2 = Math.max(320, rect.height || height);
      game.scale.resize(w2, h2);
    });
  }

  // ===== 載入圖片資源 =====
  function preload() {
    // 房子
    this.load.image("building-store", "/images/building-store.png");
    this.load.image("building-ironing", "/images/building-ironing.png");
    this.load.image("building-delivery", "/images/building-delivery.png");

    // NPC
    this.load.image("npc-cs", "/images/npc-cs.png");
    this.load.image("npc-ironing", "/images/npc-ironing.png");
    this.load.image("npc-delivery", "/images/npc-delivery.png");
  }

  function create() {
    const scene = this;
    const w = scene.scale.width;
    const h = scene.scale.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // 背景大卡片
    const bg = scene.add
      .rectangle(centerX, centerY, w * 0.96, h * 0.96, 0x111528)
      .setStrokeStyle(2, 0x343b5d);
    bg.setOrigin(0.5, 0.5);
    bg.setDepth(-1);

    // ===== 馬路：垂直 + 水平 =====
    const roadWidth = w * 0.08;
    scene.add
      .rectangle(centerX, centerY, roadWidth, h * 0.8, 0x1f2438)
      .setStrokeStyle(1, 0x3a415d);
    scene.add
      .rectangle(centerX, h * 0.42, w * 0.8, roadWidth * 0.72, 0x1f2438)
      .setStrokeStyle(1, 0x3a415d);

    // 虛線
    const dashCount = 7;
    const dashLen = (w * 0.8) / (dashCount * 2);
    for (let i = 0; i < dashCount; i++) {
      const x = centerX - (w * 0.8) / 2 + dashLen / 2 + i * dashLen * 2;
      scene.add.rectangle(x, h * 0.42, dashLen, 3, 0x4a536f);
    }

    // 建築 map，用來做「誰是目前角色」
    const buildingByRole = {};

    // ===== 建築工廠：使用圖片當房子 =====
    function createBuilding(opts) {
      const { x, y, key, title, subtitle, roleId, onClick } = opts;
      const container = scene.add.container(x, y);

      const house = scene.add.image(0, 0, key);
      const targetWidth = w * 0.23;
      const scale = targetWidth / house.width;
      house.setScale(scale);

      const displayWidth = house.width * scale;
      const displayHeight = house.height * scale;

      const glow = scene.add
        .rectangle(
          0,
          displayHeight * 0.15,
          displayWidth * 1.05,
          displayHeight * 1.25,
          0x4d6bff,
          0.06
        )
        .setOrigin(0.5, 0.5);

      const titleText = scene.add
        .text(0, -displayHeight * 0.6, title, {
          fontSize: 16,
          color: "#fdf2ff",
          fontStyle: "700",
        })
        .setOrigin(0.5, 0.5);

      const subtitleText = scene.add
        .text(0, displayHeight * 0.55, subtitle, {
          fontSize: 12,
          color: "#cfd4ff",
        })
        .setOrigin(0.5, 0.5);

      container.add([glow, house, titleText, subtitleText]);

      const hit = scene.add
        .rectangle(0, 0, displayWidth * 1.1, displayHeight * 1.3, 0xffffff, 0)
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true });

      hit.on("pointerover", () => {
        scene.tweens.add({
          targets: container,
          scaleX: 1.04,
          scaleY: 1.04,
          duration: 140,
          ease: "Quad.easeOut",
        });
      });

      hit.on("pointerout", () => {
        scene.tweens.add({
          targets: container,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 140,
          ease: "Quad.easeOut",
        });
      });

      hit.on("pointerdown", () => {
        if (typeof onClick === "function") onClick();
        scene.tweens.add({
          targets: container,
          scaleX: 1.06,
          scaleY: 1.06,
          yoyo: true,
          duration: 130,
          ease: "Quad.easeInOut",
        });
      });

      container.add(hit);

      if (roleId) {
        buildingByRole[roleId] = { container, house, titleText, glow };
      }

      return { container, displayHeight };
    }

    // ===== 三棟房子：對應角色 =====
    const store = createBuilding({
      x: centerX - w * 0.22,
      y: h * 0.24,
      key: "building-store",
      title: "C.H 門市",
      subtitle: "接待 · 一般諮詢",
      roleId: "chCustomerService",
      onClick: () => {
        if (window.chTownSwitchRoleFromMap) {
          window.chTownSwitchRoleFromMap("chCustomerService");
        }
      },
    });

    const ironing = createBuilding({
      x: centerX + w * 0.22,
      y: h * 0.24,
      key: "building-ironing",
      title: "整燙 / 整理",
      subtitle: "西裝 · 禮服整燙",
      roleId: "ironingMaster",
      onClick: () => {
        if (window.chTownSwitchRoleFromMap) {
          window.chTownSwitchRoleFromMap("ironingMaster");
        }
      },
    });

    createBuilding({
      x: centerX - w * 0.22,
      y: h * 0.7,
      key: "building-delivery",
      title: "收送倉庫",
      subtitle: "外送 · 調度",
      roleId: "deliveryStaff",
      onClick: () => {
        if (window.chTownSwitchRoleFromMap) {
          window.chTownSwitchRoleFromMap("deliveryStaff");
        }
      },
    });

    // ===== 建築高亮：目前角色 =====
    function setActiveRoleOnMap(roleId) {
      Object.entries(buildingByRole).forEach(([key, info]) => {
        const { container, house, titleText, glow } = info;
        if (!container || !house || !titleText || !glow) return;

        if (key === roleId) {
          container.setScale(1.05);
          container.alpha = 1;
          house.clearTint();
          titleText.setColor("#ffe08a");
          glow.setFillStyle(0x6a8dff, 0.18);
        } else {
          container.setScale(1.0);
          container.alpha = 0.9;
          house.setTint(0xb0b5c8);
          titleText.setColor("#fdf2ff");
          glow.setFillStyle(0x4d6bff, 0.06);
        }
      });
    }

    // 初始預設為 C.H 客服
    setActiveRoleOnMap("chCustomerService");

    // ⭐ 給 app.js 用：通知目前角色是誰
    window.chTownMapSetActiveRole = function (roleId) {
      setActiveRoleOnMap(roleId);
    };

    // ===== 主角粉紅圓點 =====
    const startX = centerX;
    const startY = h * 0.55;

    const outer = scene.add.circle(startX, startY, 11, 0xff86a0);
    const inner = scene.add.circle(startX, startY, 5, 0xffffff);
    const playerGroup = scene.add.container(0, 0, [outer, inner]);
    playerGroup.x = startX;
    playerGroup.y = startY;

    scene.player = playerGroup;
    scene.playerTarget = null;

    // 點地圖：主角走到指定位置
    scene.input.on("pointerdown", (pointer) => {
      const localY = Phaser.Math.Clamp(pointer.y, h * 0.16, h * 0.82);
      const localX = Phaser.Math.Clamp(
        pointer.x,
        centerX - w * 0.38,
        centerX + w * 0.38
      );
      scene.playerTarget = { x: localX, y: localY };
    });

    // 鍵盤方向鍵
    scene.cursors = scene.input.keyboard.createCursorKeys();

    // ===== NPC 工具：生成頭上氣泡 =====
    function createNpcBubble(text, x, y) {
      const paddingX = 8;
      const paddingY = 4;
      const txt = scene.add.text(0, 0, text, {
        fontSize: 11,
        color: "#f7f7ff",
        wordWrap: { width: w * 0.22 },
      });
      txt.setOrigin(0.5, 0.5);
      const bounds = txt.getBounds();

      const bg = scene.add
        .rectangle(
          0,
          0,
          bounds.width + paddingX * 2,
          bounds.height + paddingY * 2,
          0x11192e,
          0.85
        )
        .setStrokeStyle(1, 0x4f5c9a)
        .setOrigin(0.5, 0.5);

      const container = scene.add.container(x, y, [bg, txt]);
      container.setAlpha(0.0);

      scene.tweens.add({
        targets: container,
        alpha: 1,
        y: y - 4,
        duration: 600,
        ease: "Sine.easeOut",
      });

      return container;
    }

    // ===== NPC：門市客服（可點擊） =====
    const npcCs = scene.add.image(
      store.container.x,
      store.container.y - store.displayHeight * 0.9,
      "npc-cs"
    );
    const npcCsScale = (w * 0.07) / npcCs.width;
    npcCs.setScale(npcCsScale).setInteractive({ useHandCursor: true });
    npcCs.setDepth(2);

    createNpcBubble(
      "有問題找我聊聊 💬",
      npcCs.x,
      npcCs.y - npcCs.displayHeight * npcCsScale - 12
    );

    npcCs.on("pointerdown", () => {
      if (window.chTownSwitchRoleFromMap) {
        window.chTownSwitchRoleFromMap("chCustomerService");
      }
      if (window.chTownNpcSay) {
        window.chTownNpcSay(
          "chCustomerService",
          "您好～我是 C.H 客服，有任何洗衣、洗鞋、洗包的問題都可以直接問我喔！"
        );
      }
      if (window.chTownFillUserInput) {
        window.chTownFillUserInput("想問一下這個髒污大概能處理到什麼程度？");
      }
    });

    scene.tweens.add({
      targets: npcCs,
      y: npcCs.y - 6,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ===== NPC：整燙師傅（可點擊）=====
    const npcIron = scene.add.image(
      ironing.container.x + w * 0.08,
      ironing.container.y + ironing.displayHeight * 0.2,
      "npc-ironing"
    );
    const npcIronScale = (w * 0.07) / npcIron.width;
    npcIron.setScale(npcIronScale).setInteractive({ useHandCursor: true });
    npcIron.setDepth(2);

    createNpcBubble(
      "想問西裝 / 禮服整理？",
      npcIron.x,
      npcIron.y - npcIron.displayHeight * npcIronScale - 10
    );

    npcIron.on("pointerdown", () => {
      if (window.chTownSwitchRoleFromMap) {
        window.chTownSwitchRoleFromMap("ironingMaster");
      }
      if (window.chTownNpcSay) {
        window.chTownNpcSay(
          "ironingMaster",
          "這裡是整燙 / 整理中心，想了解西裝、禮服、襯衫怎麼整理，可以直接問我。"
        );
      }
      if (window.chTownFillUserInput) {
        window.chTownFillUserInput(
          "我的西裝有點皺又怕傷布料，可以怎麼整理比較安全？"
        );
      }
    });

    scene.tweens.add({
      targets: npcIron,
      x: npcIron.x + 8,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ===== NPC：外送員（可點擊＋左右走動）=====
    const npcDelivery = scene.add.image(
      centerX + w * 0.32,
      h * 0.58,
      "npc-delivery"
    );
    const npcDelScale = (w * 0.09) / npcDelivery.width;
    npcDelivery
      .setScale(npcDelScale)
      .setInteractive({ useHandCursor: true });
    npcDelivery.setDepth(2);

    createNpcBubble(
      "想估洗鞋 / 問收送，就找我 🚚",
      npcDelivery.x,
      npcDelivery.y - npcDelivery.displayHeight * npcDelScale - 10
    );

    npcDelivery.on("pointerdown", () => {
      if (window.chTownSwitchRoleFromMap) {
        window.chTownSwitchRoleFromMap("deliveryStaff");
      }
      if (window.chTownNpcSay) {
        window.chTownNpcSay(
          "deliveryStaff",
          "我是收送外送員～想問板橋、中和、永和收送時間或改約，都可以丟給我。"
        );
      }
      if (window.chTownStartShoeQuote) {
        // 讓外送員直接帶你進「洗鞋估價流程」，但由清潔師傅回答
        window.chTownStartShoeQuote("cleanerMaster");
      }
    });

    scene.tweens.add({
      targets: npcDelivery,
      x: centerX + w * 0.05,
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  function update(time, delta) {
    const scene = this;
    const player = scene.player;
    if (!player) return;

    const speed = 0.22 * delta;

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

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(boot, 0);
  } else {
    window.addEventListener("DOMContentLoaded", boot);
  }
})();
