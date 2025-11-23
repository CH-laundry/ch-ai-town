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
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
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

    // ===== 建築物：三棟房子 =====
    const buildingScale = Math.min(w, h) / 900;

    // 門市（左上）
    const storeX = centerX - w * 0.18;
    const storeY = h * 0.25;
    const store = scene.add.image(storeX, storeY, "building-store");
    store.setScale(buildingScale);
    store.setInteractive({ useHandCursor: true });

    // 整燙中心（右上）
    const ironX = centerX + w * 0.18;
    const ironY = h * 0.25;
    const ironing = scene.add.image(ironX, ironY, "building-ironing");
    ironing.setScale(buildingScale);
    ironing.setInteractive({ useHandCursor: true });

    // 收送倉庫（左下）
    const deliX = centerX - w * 0.18;
    const deliY = h * 0.65;
    const delivery = scene.add.image(deliX, deliY, "building-delivery");
    delivery.setScale(buildingScale);
    delivery.setInteractive({ useHandCursor: true });

    // ===== 建築高亮框 =====
    const highlightPadding = 18 * buildingScale;
    function createHighlight(target) {
      const bounds = target.getBounds();
      const rect = scene.add
        .rectangle(
          bounds.centerX,
          bounds.centerY,
          bounds.width + highlightPadding,
          bounds.height + highlightPadding,
          0x000000,
          0
        )
        .setStrokeStyle(2, 0xffc970);
      rect.setVisible(false);
      return rect;
    }

    const storeHL = createHighlight(store);
    const ironingHL = createHighlight(ironing);
    const deliveryHL = createHighlight(delivery);

    function setActiveBuilding(roleId) {
      storeHL.setVisible(false);
      ironingHL.setVisible(false);
      deliveryHL.setVisible(false);

      if (roleId === "chCustomerService") storeHL.setVisible(true);
      if (roleId === "ironingMaster") ironingHL.setVisible(true);
      if (roleId === "deliveryStaff") deliveryHL.setVisible(true);
    }

    // ===== NPC：貼在房子旁邊的小人 =====
    const npcScale = buildingScale * 0.7;

    const npcCs = scene.add.image(storeX, storeY - 70 * buildingScale, "npc-cs");
    npcCs.setScale(npcScale);

    const npcIron = scene.add.image(
      ironX + 70 * buildingScale,
      ironY + 10 * buildingScale,
      "npc-ironing"
    );
    npcIron.setScale(npcScale);

    const npcDeli = scene.add.image(
      deliX,
      deliY - 70 * buildingScale,
      "npc-delivery"
    );
    npcDeli.setScale(npcScale);

    // NPC 都可以點擊
    [npcCs, npcIron, npcDeli].forEach((npc) =>
      npc.setInteractive({ useHandCursor: true })
    );

    // ===== 主角：小人物圖示（自動縮放） =====
    const startX = centerX;
    const startY = h * 0.55;

    // 使用 npc-delivery 當主角形象（之後你可以換成自己的 player.png）
    const playerSprite = scene.add.image(0, 0, "npc-delivery");
    playerSprite.setOrigin(0.5, 1);

    // 依照畫面高度自動縮放，主角大約佔左側面板高度 14%
    const targetHeight = h * 0.14;
    const scale = targetHeight / playerSprite.height;
    playerSprite.setScale(scale);

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

    // 鍵盤移動
    scene.cursors = scene.input.keyboard.createCursorKeys();
    scene.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // ===== 建築 / NPC 點擊 → 呼叫前端全域函式切換角色 =====
    function bindRoleClick(target, roleId, npcSuggestText) {
      target.on("pointerdown", () => {
        try {
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap(roleId);
          }
          if (window.chTownNpcSay && npcSuggestText) {
            window.chTownNpcSay(roleId, npcSuggestText);
          }
        } catch (e) {
          console.warn("角色切換呼叫失敗", e);
        }
        setActiveBuilding(roleId);
      });
    }

    bindRoleClick(
      store,
      "chCustomerService",
      "嗨～這裡是 C.H 門市，我可以幫你介紹整體服務和一般問題。"
    );
    bindRoleClick(
      npcCs,
      "chCustomerService",
      "歡迎來到 C.H 門市，有什麼想了解的服務或價格都可以問我！"
    );

    bindRoleClick(
      ironing,
      "ironingMaster",
      "這邊主要負責西裝、襯衫、洋裝的整燙與定型，有關版型跟皺摺可以問我。"
    );
    bindRoleClick(
      npcIron,
      "ironingMaster",
      "你好，我是整燙師傅，衣服要怎麼燙才好看又不傷布料可以問我。"
    );

    bindRoleClick(
      delivery,
      "deliveryStaff",
      "這裡是收送倉庫，想安排收送時間、改送回地址都可以先問問看。"
    );
    bindRoleClick(
      npcDeli,
      "deliveryStaff",
      "嗨，我是外送員，板橋、中永和、新莊一帶的收送都可以幫你安排。"
    );

    // 初始：高亮 C.H 門市
    setActiveBuilding("chCustomerService");

    // 提供給外部切換用
    window.chTownMapSetActiveRole = function (roleId) {
      setActiveBuilding(roleId);
    };
  }

  function update() {
    const scene = this;
    if (!scene.player) return;

    const speed = 2.2;
    let vx = 0;
    let vy = 0;

    if (scene.cursors.left.isDown || scene.wasd.left.isDown) vx = -1;
    else if (scene.cursors.right.isDown || scene.wasd.right.isDown) vx = 1;

    if (scene.cursors.up.isDown || scene.wasd.up.isDown) vy = -1;
    else if (scene.cursors.down.isDown || scene.wasd.down.isDown) vy = 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy) || 1;
      vx /= len;
      vy /= len;
      scene.player.x += vx * speed;
      scene.player.y += vy * speed;
      scene.playerTarget = null;
    } else if (scene.playerTarget) {
      const dx = scene.playerTarget.x - scene.player.x;
      const dy = scene.playerTarget.y - scene.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const eps = 3;
      if (dist <= eps) {
        scene.playerTarget = null;
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        scene.player.x += nx * speed;
        scene.player.y += ny * speed;
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
