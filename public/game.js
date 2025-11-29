// C.H AI TOWN 小鎮 v3
// - 夜景街道 + 綠樹 + 人行道
// - 帶帽子小男生可移動
// - 建築點擊：切換右側角色 + 開啟室內擺設畫面
// - 紅綠燈自動循環變色

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
      backgroundColor: "#050615",
      scene: { preload, create, update },
    };

    new Phaser.Game(config);
  }

  function preload() {
    const scene = this;
    // 用相對路徑，避免在 LIFF / 子路徑上 404
    scene.load.image("building-store", "images/building-store.png");
    scene.load.image("building-ironing", "images/building-ironing.png");
    scene.load.image("building-delivery", "images/building-delivery.png");

    scene.load.image("npc-cs", "images/npc-cs.png");
    scene.load.image("npc-ironing", "images/npc-ironing.png");
    scene.load.image("npc-delivery", "images/npc-delivery.png");
  }

  function create() {
    const scene = this;
    const w = scene.scale.width;
    const h = scene.scale.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // ===== 可移動範圍 =====
    scene.mapBounds = {
      minX: centerX - w * 0.42,
      maxX: centerX + w * 0.42,
      minY: h * 0.18,
      maxY: h * 0.86,
    };

    // ===== 外框面板 =====
    const frame = scene.add
      .rectangle(centerX, centerY, w * 0.96, h * 0.96, 0x111528)
      .setStrokeStyle(2, 0x343b5d);
    frame.setOrigin(0.5, 0.5);

    // 背景街景底色
    scene.add.rectangle(centerX, centerY, w * 0.9, h * 0.8, 0x090d1c);

    // ===== 道路與人行道 =====
    const roadWidth = w * 0.24;

    // 垂直道路
    const vRoad = scene.add.rectangle(centerX, centerY, roadWidth, h * 0.8, 0x1c2435);
    vRoad.setStrokeStyle(2, 0x2c3448);

    // 水平道路
    const hRoadY = h * 0.42;
    const hRoad = scene.add.rectangle(
      centerX,
      hRoadY,
      w * 0.82,
      roadWidth * 0.7,
      0x1a2133
    );
    hRoad.setStrokeStyle(2, 0x2a3244);

    // 垂直道路虛線
    const vDashCount = 9;
    const vDashLen = h * 0.05;
    for (let i = 0; i < vDashCount; i++) {
      const y = centerY - (h * 0.7) / 2 + vDashLen / 2 + i * vDashLen * 1.4;
      scene.add.rectangle(centerX, y, 4, vDashLen, 0xe5e5f5);
    }

    // 水平道路虛線
    const hDashCount = 9;
    const hDashLen = w * 0.05;
    for (let i = 0; i < hDashCount; i++) {
      const x = centerX - (w * 0.82) / 2 + hDashLen / 2 + i * hDashLen * 1.8;
      scene.add.rectangle(x, hRoadY, hDashLen, 3, 0x4a536f);
    }

    // ===== 街景裝飾（樹、人行道、路燈、紅綠燈） =====
    (function createTownDecor() {
      const sidewalkH = h * 0.035;
      // 上下人行道
      scene.add
        .rectangle(centerX, h * 0.32, w * 0.84, sidewalkH, 0x181e2e)
        .setStrokeStyle(1, 0x424a63);
      scene.add
        .rectangle(centerX, h * 0.52, w * 0.84, sidewalkH, 0x181e2e)
        .setStrokeStyle(1, 0x424a63);

      function addTree(x, y) {
        scene.add.rectangle(x, y + 18, 6, 24, 0x7a4a27); // 樹幹
        scene.add.circle(x, y, 14, 0x3ea86b);
        scene.add.circle(x + 10, y - 6, 10, 0x3ea86b);
        scene.add.circle(x - 10, y - 4, 9, 0x3ea86b);
      }

      addTree(centerX - w * 0.34, h * 0.26);
      addTree(centerX + w * 0.34, h * 0.26);
      addTree(centerX - w * 0.34, h * 0.6);
      addTree(centerX + w * 0.34, h * 0.6);

      // 草叢
      for (let i = -2; i <= 2; i++) {
        const x = centerX + i * (w * 0.08);
        const y = h * 0.24;
        scene.add.circle(x, y, 6, 0x3ea86b);
      }

      function addLamp(x, y) {
        const pole = scene.add.rectangle(x, y + 22, 3, 44, 0x404862);
        const head = scene.add.rectangle(x, y, 14, 10, 0x242b3a);
        const glow = scene.add.circle(x, y + 10, 6, 0xfff2b3);
        glow.setAlpha(0.9);
        pole.setDepth(3);
        head.setDepth(3);
        glow.setDepth(3);
      }
      addLamp(centerX - w * 0.2, h * 0.18);
      addLamp(centerX + w * 0.2, h * 0.18);

      // 紅綠燈
      const pole = scene.add.rectangle(centerX + w * 0.28, h * 0.34, 4, 70, 0x3a4158);
      const box = scene.add.rectangle(centerX + w * 0.28, h * 0.305, 18, 40, 0x222737);
      const red = scene.add.circle(centerX + w * 0.28, h * 0.29, 5, 0xff5c5c);
      const yellow = scene.add.circle(centerX + w * 0.28, h * 0.305, 5, 0xfff08a);
      const green = scene.add.circle(centerX + w * 0.28, h * 0.32, 5, 0x6bff9a);
      pole.setDepth(3);
      box.setDepth(3);
      red.setDepth(4);
      yellow.setDepth(4);
      green.setDepth(4);

      // 紅綠燈自動變色
      let phase = 0; // 0=紅 1=黃 2=綠
      function applyPhase() {
        red.setAlpha(phase === 0 ? 1 : 0.2);
        yellow.setAlpha(phase === 1 ? 1 : 0.2);
        green.setAlpha(phase === 2 ? 1 : 0.2);
      }
      applyPhase();
      scene.time.addEvent({
        delay: 900,
        loop: true,
        callback: () => {
          phase = (phase + 1) % 3;
          applyPhase();
        },
      });
    })();

    // ===== 建築（門市 / 整燙中心 / 收送倉庫） =====
    const buildingW = w * 0.22;
    const buildingH = h * 0.22;

    function createBuildingImage(x, y, key) {
      let img;
      if (scene.textures.exists(key)) {
        img = scene.add.image(x, y, key);
        img.setDisplaySize(buildingW, buildingH);
      } else {
        // 圖片載不到時的備案，不用 Phaser 綠色錯誤圖
        img = scene.add.rectangle(x, y, buildingW, buildingH, 0x111111);
      }
      img.setInteractive({ useHandCursor: true });
      return img;
    }

    // 門市（上方）
    const storeX = centerX;
    const storeY = h * 0.25;
    scene.add
      .rectangle(
        storeX,
        storeY + buildingH * 0.42,
        buildingW * 1.1,
        buildingH * 0.26,
        0x151b2c
      )
      .setStrokeStyle(1, 0x2a3144);
    const store = createBuildingImage(storeX, storeY, "building-store");

    // 整燙中心（右下）
    const ironX = centerX + w * 0.18;
    const ironY = h * 0.66;
    scene.add
      .rectangle(
        ironX,
        ironY + buildingH * 0.42,
        buildingW * 1.08,
        buildingH * 0.26,
        0x151b2c
      )
      .setStrokeStyle(1, 0x2a3144);
    const ironing = createBuildingImage(ironX, ironY, "building-ironing");

    // 收送倉庫（左下）
    const deliX = centerX - w * 0.18;
    const deliY = h * 0.66;
    scene.add
      .rectangle(
        deliX,
        deliY + buildingH * 0.42,
        buildingW * 1.08,
        buildingH * 0.26,
        0x151b2c
      )
      .setStrokeStyle(1, 0x2a3144);
    const delivery = createBuildingImage(deliX, deliY, "building-delivery");

    // ===== 建築高亮框 =====
    function createHighlight(target) {
      const bounds = target.getBounds();
      const rect = scene.add.rectangle(
        bounds.centerX,
        bounds.centerY,
        bounds.width + 12,
        bounds.height + 12
      );
      rect.setStrokeStyle(3, 0xffa6c7);
      rect.setVisible(false);
      return rect;
    }
    const storeHL = createHighlight(store);
    const ironHL = createHighlight(ironing);
    const deliHL = createHighlight(delivery);

    function setActiveBuilding(roleId) {
      storeHL.setVisible(false);
      ironHL.setVisible(false);
      deliHL.setVisible(false);
      if (roleId === "chCustomerService") storeHL.setVisible(true);
      if (roleId === "ironingMaster") ironHL.setVisible(true);
      if (roleId === "deliveryStaff") deliHL.setVisible(true);
    }

    // ===== NPC 圖像 =====
    const npcSize = Math.min(w, h) * 0.12;

    const npcCs = scene.add.image(
      storeX + buildingW * 0.42,
      storeY - buildingH * 0.35,
      "npc-cs"
    );
    npcCs.setDisplaySize(npcSize, npcSize);
    npcCs.setInteractive({ useHandCursor: true });

    const npcIron = scene.add.image(
      ironX,
      ironY - buildingH * 0.7,
      "npc-ironing"
    );
    npcIron.setDisplaySize(npcSize, npcSize);
    npcIron.setInteractive({ useHandCursor: true });

    const npcDeli = scene.add.image(
      deliX,
      deliY - buildingH * 0.7,
      "npc-delivery"
    );
    npcDeli.setDisplaySize(npcSize, npcSize);
    npcDeli.setInteractive({ useHandCursor: true });

    // ===== 室內場景容器 =====
    scene.interiorContainer = scene.add.container(centerX, centerY);
    scene.interiorContainer.setDepth(50);
    scene.interiorContainer.setVisible(false);
    scene.isInInterior = false;

    function clearInterior() {
      scene.interiorContainer.removeAll(true);
      scene.isInInterior = false;
      scene.interiorContainer.setVisible(false);
    }

    function openInterior(kind) {
      clearInterior();
      const container = scene.interiorContainer;
      const objs = [];

      const floor = scene.add.rectangle(
        centerX,
        centerY,
        w * 0.8,
        h * 0.56,
        0x151828
      );
      floor.setStrokeStyle(2, 0x2c3248);
      objs.push(floor);

      if (kind === "store") {
        const shelf = scene.add.rectangle(
          centerX,
          centerY - h * 0.12,
          w * 0.68,
          h * 0.16,
          0x20263b
        );
        shelf.setStrokeStyle(1, 0x424a63);
        objs.push(shelf);

        const bottleRows = 3;
        const bottleCols = 7;
        const startX = centerX - w * 0.26;
        const startY = centerY - h * 0.08;
        const gapX = (w * 0.52) / (bottleCols - 1);
        const gapY = (h * 0.11) / (bottleRows - 1);
        for (let r = 0; r < bottleRows; r++) {
          for (let c = 0; c < bottleCols; c++) {
            const x = startX + gapX * c;
            const y = startY + gapY * r;
            const bottle = scene.add.rectangle(x, y, 8, 14, 0x4eb7ff);
            const cap = scene.add.rectangle(x, y - 9, 6, 4, 0xffffff);
            objs.push(bottle, cap);
          }
        }

        const counter = scene.add.rectangle(
          centerX,
          centerY + h * 0.16,
          w * 0.5,
          h * 0.14,
          0x22263a
        );
        counter.setStrokeStyle(1, 0x424a63);
        objs.push(counter);
      } else if (kind === "ironing") {
        const rack = scene.add.rectangle(
          centerX,
          centerY - h * 0.18,
          w * 0.7,
          6,
          0x2b3346
        );
        objs.push(rack);

        for (let i = -3; i <= 3; i++) {
          const x = centerX + i * (w * 0.1);
          const cloth = scene.add.rectangle(
            x,
            centerY - h * 0.08,
            w * 0.09,
            h * 0.18,
            0x4a5677
          );
          cloth.setStrokeStyle(1, 0x6c7898);
          objs.push(cloth);
        }

        const table = scene.add.rectangle(
          centerX,
          centerY + h * 0.12,
          w * 0.6,
          h * 0.12,
          0x262d42
        );
        table.setStrokeStyle(1, 0x424a63);
        objs.push(table);
      } else if (kind === "delivery") {
        const floor2 = scene.add.rectangle(
          centerX,
          centerY + h * 0.04,
          w * 0.72,
          h * 0.36,
          0x181f2c
        );
        floor2.setStrokeStyle(1, 0x333a54);
        objs.push(floor2);

        const shelf = scene.add.rectangle(
          centerX - w * 0.2,
          centerY + h * 0.04,
          w * 0.28,
          h * 0.28,
          0x202637
        );
        shelf.setStrokeStyle(1, 0x424a63);
        objs.push(shelf);

        const boxRows = 3;
        const boxCols = 2;
        const startX = shelf.x - w * 0.11;
        const startY = shelf.y - h * 0.1;
        const gapX = w * 0.11;
        const gapY = h * 0.09;
        for (let r = 0; r < boxRows; r++) {
          for (let c = 0; c < boxCols; c++) {
            const x = startX + gapX * c;
            const y = startY + gapY * r;
            const box = scene.add.rectangle(x, y, 40, 26, 0xcc9a5b);
            box.setStrokeStyle(1, 0x8a6437);
            objs.push(box);
          }
        }
      }

      objs.forEach((o) => container.add(o));
      container.setVisible(true);
      scene.isInInterior = true;

      const exitZone = scene.add
        .rectangle(centerX, centerY - h * 0.3, w * 0.7, h * 0.08, 0x000000)
        .setAlpha(0.01)
        .setInteractive({ useHandCursor: true });
      exitZone.on("pointerdown", clearInterior);
      container.add(exitZone);
    }

    function bindRoleClick(target, roleId, text, interiorKind) {
      target.on("pointerdown", () => {
        if (window.chTownNpcSay) {
          window.chTownNpcSay(roleId, text);
        }
        setActiveBuilding(roleId);
        if (interiorKind) {
          openInterior(interiorKind);
        }
      });
    }

    bindRoleClick(
      store,
      "chCustomerService",
      "嗨～這裡是 C.H 門市，我可以幫你介紹整體服務和一般問題。",
      "store"
    );
    bindRoleClick(
      ironing,
      "ironingMaster",
      "這邊主要負責西裝、襯衫、洋裝的整燙與定型，有關版型跟皺摺可以問我。",
      "ironing"
    );
    bindRoleClick(
      delivery,
      "deliveryStaff",
      "這裡是收送倉庫，想安排收送時間、改送回地址都可以先問問看。",
      "delivery"
    );

    bindRoleClick(
      npcCs,
      "chCustomerService",
      "你好～我是 C.H 客服，有關服務內容、價格、流程都可以問我。",
      null
    );
    bindRoleClick(
      npcIron,
      "ironingMaster",
      "我是熨燙師傅，衣服皺摺、定型、版型問題都可以來找我。",
      null
    );
    bindRoleClick(
      npcDeli,
      "deliveryStaff",
      "我是外送員，可以幫你安排收送時間與路線，有需要都可以問我。",
      null
    );

    // ===== 主角：帶帽子小男生 =====
    const playerSize = Math.min(w, h) * 0.06;
    const player = scene.add.container(centerX, h * 0.5);

    const feet = scene.add.rectangle(
      0,
      playerSize * 0.9,
      playerSize * 0.7,
      playerSize * 0.2,
      0x3a3a4f
    );
    const body = scene.add.rectangle(
      0,
      playerSize * 0.4,
      playerSize * 0.7,
      playerSize,
      0xff8f73
    );
    const head = scene.add.circle(
      0,
      -playerSize * 0.05,
      playerSize * 0.38,
      0xffe0c2
    );
    const hatBrim = scene.add.rectangle(
      0,
      -playerSize * 0.6,
      playerSize,
      playerSize * 0.18,
      0x3382ff
    );
    const hatTop = scene.add.rectangle(
      0,
      -playerSize * 0.9,
      playerSize * 0.7,
      playerSize * 0.4,
      0x3382ff
    );
    const strap = scene.add.rectangle(
      -playerSize * 0.1,
      playerSize * 0.2,
      6,
      playerSize * 0.9,
      0xf3c08b
    );

    player.add([feet, body, head, hatBrim, hatTop, strap]);
    scene.player = player;
    scene.playerTarget = null;

    scene.cursors = scene.input.keyboard.createCursorKeys();

    // 點地圖移動
    scene.input.on("pointerdown", (pointer) => {
      if (scene.isInInterior) return;
      const tgtX = Phaser.Math.Clamp(
        pointer.x,
        scene.mapBounds.minX,
        scene.mapBounds.maxX
      );
      const tgtY = Phaser.Math.Clamp(
        pointer.y,
        scene.mapBounds.minY,
        scene.mapBounds.maxY
      );
      scene.playerTarget = { x: tgtX, y: tgtY };
    });

    // 外部可切換高亮
    window.chTownMapSetActiveRole = function (roleId) {
      setActiveBuilding(roleId);
    };
    setActiveBuilding("chCustomerService");
  }

  function update() {
    const scene = this;
    const player = scene.player;
    if (!player || scene.isInInterior) return;

    const speed = 2.0;

    if (scene.cursors) {
      let vx = 0;
      let vy = 0;
      if (scene.cursors.left.isDown) vx = -1;
      else if (scene.cursors.right.isDown) vx = 1;
      if (scene.cursors.up.isDown) vy = -1;
      else if (scene.cursors.down.isDown) vy = 1;

      if (vx !== 0 || vy !== 0) {
        const len = Math.sqrt(vx * vx + vy * vy) || 1;
        vx /= len;
        vy /= len;
        const nx = Phaser.Math.Clamp(
          player.x + vx * speed,
          scene.mapBounds.minX,
          scene.mapBounds.maxX
        );
        const ny = Phaser.Math.Clamp(
          player.y + vy * speed,
          scene.mapBounds.minY,
          scene.mapBounds.maxY
        );
        player.x = nx;
        player.y = ny;
        scene.playerTarget = null;
        return;
      }
    }

    if (scene.playerTarget) {
      const tx = scene.playerTarget.x;
      const ty = scene.playerTarget.y;
      const dx = tx - player.x;
      const dy = ty - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) {
        scene.playerTarget = null;
        return;
      }
      player.x += (dx / dist) * speed;
      player.y += (dy / dist) * speed;
    }
  }

  if (typeof document !== "undefined") {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      setTimeout(boot, 0);
    } else {
      window.addEventListener("DOMContentLoaded", boot);
    }
  }
})();
