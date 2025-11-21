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
      backgroundColor: "#050712",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    new Phaser.Game(config);
  }

  function preload() {
    // 房子
    this.load.image("building-store", "/images/building-store.png");
    this.load.image("building-ironing", "/images/building-ironing.png");
    this.load.image("building-delivery", "/images/building-delivery.png");

    // NPC
    this.load.image("npc-cs", "/images/npc-cs.png");
    this.load.image("npc-ironing", "/images/npc-ironing.png");
    this.load.image("npc-delivery", "/images/npc-delivery.png");

    // 主角（目前先用和 npc-delivery 同一張圖，你之後可以換成自己的角色圖片）
    this.load.image("player", "/images/npc-delivery.png");
  }

  function create() {
    const scene = this;
    const w = scene.scale.width;
    const h = scene.scale.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // ===== 背景道路 =====
    const roadColor = 0x151b33;
    const laneColor = 0x3b425d;

    const verticalRoad = scene.add.rectangle(
      centerX,
      centerY,
      w * 0.18,
      h * 0.9,
      roadColor
    );
    verticalRoad.setAlpha(0.96);

    const horizontalRoad = scene.add.rectangle(
      centerX,
      h * 0.58,
      w * 0.9,
      h * 0.14,
      roadColor
    );
    horizontalRoad.setAlpha(0.96);

    // 路線虛線
    const laneCount = 6;
    const laneWidth = w * 0.08;
    const laneHeight = 3;

    for (let i = 0; i < laneCount; i++) {
      const x =
        centerX - (w * 0.38) + (i / (laneCount - 1 || 1)) * (w * 0.76);
      scene.add.rectangle(x, h * 0.58, laneWidth, laneHeight, laneColor);
    }

    const vLaneCount = 6;
    const vLaneWidth = 3;
    const vLaneHeight = h * 0.08;

    for (let i = 0; i < vLaneCount; i++) {
      const y =
        centerY - (h * 0.38) + (i / (vLaneCount - 1 || 1)) * (h * 0.76);
      scene.add.rectangle(centerX, y, vLaneWidth, vLaneHeight, laneColor);
    }

    // ===== 建築生成工具 =====
    function createBuilding(config) {
      const {
        x,
        y,
        key,
        title,
        subtitle,
        roleId,
        onClick,
        npcKey,
        npcOffsetX = 0,
        npcOffsetY = 0,
      } = config;

      const container = scene.add.container(x, y);

      const displayWidth = w * 0.22;
      const displayHeight = h * 0.22;

      const glow = scene.add
        .rectangle(0, 0, displayWidth * 1.15, displayHeight * 1.4, 0x253163, 0.85)
        .setOrigin(0.5, 0.5);
      glow.setStrokeStyle(2, 0x8ea2ff, 0.8);

      const house = scene.add
        .image(0, 0, key)
        .setDisplaySize(displayWidth, displayHeight)
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
          duration: 160,
          ease: "Quad.easeOut",
        });
      });

      hit.on("pointerdown", () => {
        if (onClick) onClick();
      });

      container.add(hit);

      // NPC
      let npcSprite = null;
      if (npcKey) {
        npcSprite = scene.add.image(
          npcOffsetX,
          npcOffsetY + displayHeight * 0.45,
          npcKey
        );
        npcSprite.setScale(0.92);
        container.add(npcSprite);
      }

      const tween = scene.tweens.add({
        targets: container,
        y: y - 4,
        duration: 1600,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });

      container.setScale(1.0);
      container.alpha = 0.9;

      container.setData("roleId", roleId);
      container.setData("house", house);
      container.setData("titleText", titleText);
      container.setData("glow", glow);
      container.setData("tween", tween);

      return {
        container,
        house,
        titleText,
        glow,
        npcSprite,
      };
    }

    // ===== 三棟建築 + NPC =====
    const buildingByRole = {};

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
      npcKey: "npc-cs",
      npcOffsetY: 6,
    });

    const ironing = createBuilding({
      x: centerX + w * 0.22,
      y: h * 0.24,
      key: "building-ironing",
      title: "整燙 / 整理",
      subtitle: "西裝 · 版型整燙",
      roleId: "ironingMaster",
      onClick: () => {
        if (window.chTownSwitchRoleFromMap) {
          window.chTownSwitchRoleFromMap("ironingMaster");
        }
      },
      npcKey: "npc-ironing",
      npcOffsetY: 8,
    });

    const delivery = createBuilding({
      x: centerX - w * 0.26,
      y: h * 0.73,
      key: "building-delivery",
      title: "收送倉庫",
      subtitle: "外送 · 調度",
      roleId: "deliveryStaff",
      onClick: () => {
        if (window.chTownSwitchRoleFromMap) {
          window.chTownSwitchRoleFromMap("deliveryStaff");
        }
      },
      npcKey: "npc-delivery",
      npcOffsetY: -8,
    });

    buildingByRole["chCustomerService"] = store;
    buildingByRole["ironingMaster"] = ironing;
    buildingByRole["deliveryStaff"] = delivery;

    // ===== 建築高亮：目前角色 =====
    function setActiveRoleOnMap(roleId) {
      Object.entries(buildingByRole).forEach(([key, info]) => {
        const { container, house, titleText, glow } = info;
        if (!container || !house || !titleText || !glow) return;

        if (key === roleId) {
          container.setScale(1.04);
          container.alpha = 1.0;
          house.setTint(0xffffff);
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

    // ===== 主角：改成小人物圖示 =====
    const startX = centerX;
    const startY = h * 0.55;

    // 使用一張小人物圖片當主角（目前先共用 npc-delivery，你之後可以換成 /images/player.png）
    const playerSprite = scene.add.image(0, 0, "player");
    playerSprite.setOrigin(0.5, 1); // 以腳底對準位置
    playerSprite.setScale(0.85);    // 視覺大小微調

    const playerGroup = scene.add.container(startX, startY, [playerSprite]);

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

      const bubbleText = scene.add.text(0, 0, text, {
        fontSize: 11,
        color: "#fdf0ff",
      });

      const bounds = bubbleText.getBounds();
      const bubbleWidth = bounds.width + paddingX * 2;
      const bubbleHeight = bounds.height + paddingY * 2;

      const bubbleRect = scene.add
        .roundedRectangle(0, 0, bubbleWidth, bubbleHeight, 10, 0x182347, 0.96)
        .setStrokeStyle(1, 0x9caeff, 0.9);

      const container = scene.add.container(x, y, [bubbleRect, bubbleText]);
      container.setDepth(999);

      return container;
    }

    // ===== NPC 點擊互動：呼叫 app.js =====
    function bindNpcInteraction(buildingInfo, roleId, sayText, quickQuestion) {
      if (!buildingInfo || !buildingInfo.npcSprite) return;
      const npcSprite = buildingInfo.npcSprite;

      npcSprite.setInteractive({ useHandCursor: true });

      npcSprite.on("pointerdown", () => {
        if (window.chTownSwitchRoleFromMap) {
          window.chTownSwitchRoleFromMap(roleId);
        }

        if (window.chTownNpcSay) {
          window.chTownNpcSay(roleId, sayText);
        }

        if (window.chTownFillUserInput && quickQuestion) {
          window.chTownFillUserInput(quickQuestion);
        }

        if (
          roleId === "deliveryStaff" &&
          window.chTownStartShoeQuote &&
          quickQuestion.includes("鞋")
        ) {
          window.chTownStartShoeQuote("cleanerMaster");
        }
      });

      npcSprite.on("pointerover", () => {
        scene.tweens.add({
          targets: npcSprite,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 140,
          ease: "Quad.easeOut",
        });
      });

      npcSprite.on("pointerout", () => {
        scene.tweens.add({
          targets: npcSprite,
          scaleX: 0.92,
          scaleY: 0.92,
          duration: 150,
          ease: "Quad.easeOut",
        });
      });
    }

    bindNpcInteraction(
      store,
      "chCustomerService",
      "嗨，我是 C.H 客服，有任何洗衣、洗鞋、洗包的問題都可以問我～",
      "這雙麂皮鞋發霉了，還洗得起來嗎？"
    );

    bindNpcInteraction(
      ironing,
      "ironingMaster",
      "版型、整燙、尺寸修整都可以問我，不確定能不能燙的衣服，也可以先拍照給我看。",
      "這件西裝可以整燙到很挺，但不要傷到布料嗎？"
    );

    bindNpcInteraction(
      delivery,
      "deliveryStaff",
      "我是外送員，想收送、改時間、想知道板橋哪裡可以免費收送，都可以問我！",
      "板橋收送大概什麼時間可以到？"
    );
  }

  function update(time, delta) {
    const scene = this;
    const player = scene.player;
    if (!player) return;

    const speed = 0.18 * delta;

    let vx = 0;
    let vy = 0;

    if (scene.cursors.left.isDown) vx -= speed;
    if (scene.cursors.right.isDown) vx += speed;
    if (scene.cursors.up.isDown) vy -= speed;
    if (scene.cursors.down.isDown) vy += speed;

    if (vx !== 0 || vy !== 0) {
      const w = scene.scale.width;
      const h = scene.scale.height;
      const centerX = w / 2;

      const newX = Phaser.Math.Clamp(
        player.x + vx,
        centerX - w * 0.38,
        centerX + w * 0.38
      );
      const newY = Phaser.Math.Clamp(
        player.y + vy,
        h * 0.16,
        h * 0.82
      );

      player.x = newX;
      player.y = newY;
      scene.playerTarget = null;
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
