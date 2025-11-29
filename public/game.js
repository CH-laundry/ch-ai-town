// C.H AI TOWN 小鎮 v3：街景強化 + 帶帽小男生主角 + 建築室內擺設

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
      scene: {
        preload,
        create,
        update,
      },
    };

    new Phaser.Game(config);
  }

  function preload() {
    const scene = this;
    scene.load.image("building-store", "/images/building-store.png");
    scene.load.image("building-ironing", "/images/building-ironing.png");
    scene.load.image("building-delivery", "/images/building-delivery.png");

    scene.load.image("npc-cs", "/images/npc-cs.png");
    scene.load.image("npc-ironing", "/images/npc-ironing.png");
    scene.load.image("npc-delivery", "/images/npc-delivery.png");
  }

  function create() {
    const scene = this;
    const w = scene.scale.width;
    const h = scene.scale.height;

    const centerX = w / 2;
    const centerY = h / 2;

    // ===== 地圖可移動範圍 =====
    scene.mapBounds = {
      minX: centerX - w * 0.42,
      maxX: centerX + w * 0.42,
      minY: h * 0.18,
      maxY: h * 0.86,
    };

    // ===== 背景面板 =====
    const bg = scene.add
      .rectangle(centerX, centerY, w * 0.96, h * 0.96, 0x111528)
      .setStrokeStyle(2, 0x343b5d);
    bg.setOrigin(0.5, 0.5);

    // ===== 漸層夜空 =====
    const sky = scene.add.graphics();
    const skyRect = new Phaser.Geom.Rectangle(
      centerX - (w * 0.9) / 2,
      h * 0.06,
      w * 0.9,
      h * 0.4
    );
    const skyGradient = sky.createGradientTexture(
      0,
      0,
      0,
      skyRect.height,
      [0, 0.4, 1],
      [0x141933, 0x101426, 0x080912]
    );
    sky.fillStyle(skyGradient);
    sky.fillRectShape(skyRect);

    // ===== 道路（垂直） =====
    const roadWidth = w * 0.24;
    const road = scene.add.rectangle(
      centerX,
      centerY,
      roadWidth,
      h * 0.8,
      0x1c2435
    );
    road.setStrokeStyle(2, 0x2c3448);

    // 中線虛線
    const dashCount = 10;
    const dashLen = h * 0.04;
    for (let i = 0; i < dashCount; i++) {
      const y = centerY - (h * 0.7) / 2 + dashLen / 2 + i * dashLen * 1.6;
      scene.add.rectangle(centerX, y, 4, dashLen, 0xe5e5f5);
    }

    // ===== 橫向道路 =====
    const horizontalRoadY = h * 0.42;
    const horizontalRoad = scene.add.rectangle(
      centerX,
      horizontalRoadY,
      w * 0.8,
      h * 0.12,
      0x1a2133
    );
    horizontalRoad.setStrokeStyle(2, 0x2a3244);

    // 橫向道路虛線
    const hrDashCount = 10;
    const hrDashLen = w * 0.04;
    for (let i = 0; i < hrDashCount; i++) {
      const x = centerX - (w * 0.8) / 2 + hrDashLen / 2 + i * hrDashLen * 2;
      scene.add.rectangle(x, horizontalRoadY, hrDashLen, 3, 0x4a536f);
    }

    // ===== 街景裝飾：人行道 / 樹木 / 路燈 / 紅綠燈 =====
    (function createTownDecor() {
      const sidewalkHeight = h * 0.035;
      // 上方人行道
      scene.add
        .rectangle(centerX, h * 0.32, w * 0.82, sidewalkHeight, 0x181e2e)
        .setStrokeStyle(1, 0x424a63);
      // 下方人行道
      scene.add
        .rectangle(centerX, h * 0.52, w * 0.82, sidewalkHeight, 0x181e2e)
        .setStrokeStyle(1, 0x424a63);

      function createTree(x, y) {
        // 樹幹
        scene.add.rectangle(x, y + 18, 6, 24, 0x7a4a27);
        // 樹冠
        scene.add.circle(x - 6, y, 12, 0x3ea86b);
        scene.add.circle(x + 6, y - 4, 10, 0x3ea86b);
      }

      // 左右兩側的樹
      createTree(centerX - w * 0.34, h * 0.26);
      createTree(centerX + w * 0.34, h * 0.26);
      createTree(centerX - w * 0.34, h * 0.6);
      createTree(centerX + w * 0.34, h * 0.6);

      // 中間小草叢
      for (let i = -2; i <= 2; i++) {
        const x = centerX + i * (w * 0.08);
        const y = h * 0.24;
        scene.add.circle(x, y, 6, 0x3ea86b);
      }

      // 路燈
      function createLamp(x, y) {
        const pole = scene.add.rectangle(x, y + 22, 3, 44, 0x404862);
        const head = scene.add.rectangle(x, y, 14, 10, 0x242b3a);
        const light = scene.add.circle(x, y + 10, 6, 0xfff2b3);
        light.setAlpha(0.9);
        pole.setDepth(3);
        head.setDepth(3);
        light.setDepth(3);
      }
      createLamp(centerX - w * 0.2, h * 0.18);
      createLamp(centerX + w * 0.2, h * 0.18);

      // 紅綠燈
      const lightPole = scene.add.rectangle(
        centerX + w * 0.28,
        h * 0.34,
        4,
        70,
        0x3a4158
      );
      const lightBox = scene.add.rectangle(
        centerX + w * 0.28,
        h * 0.305,
        18,
        40,
        0x222737
      );
      const redLight = scene.add.circle(
        centerX + w * 0.28,
        h * 0.29,
        5,
        0xff5c5c
      );
      const yellowLight = scene.add.circle(
        centerX + w * 0.28,
        h * 0.305,
        5,
        0xfff08a
      );
      const greenLight = scene.add.circle(
        centerX + w * 0.28,
        h * 0.32,
        5,
        0x6bff9a
      );
      lightPole.setDepth(3);
      lightBox.setDepth(3);
      redLight.setDepth(3);
      yellowLight.setDepth(3);
      greenLight.setDepth(3);
    })();

    // ===== 建築：門市 / 整燙中心 / 收送倉庫 =====
    const buildingDisplayWidth = w * 0.22;
    const buildingDisplayHeight = h * 0.22;

    // 門市（上方）
    const storeX = centerX;
    const storeY = h * 0.25;
    scene.add
      .rectangle(
        storeX,
        storeY + buildingDisplayHeight * 0.42,
        buildingDisplayWidth * 1.1,
        buildingDisplayHeight * 0.26,
        0x151b2c
      )
      .setStrokeStyle(1, 0x2a3144);
    const store = scene.add.image(storeX, storeY, "building-store");
    store.setDisplaySize(buildingDisplayWidth, buildingDisplayHeight);
    store.setInteractive({ useHandCursor: true });

    // 整燙中心（右下）
    const ironingX = centerX + w * 0.18;
    const ironingY = h * 0.66;
    scene.add
      .rectangle(
        ironingX,
        ironingY + buildingDisplayHeight * 0.42,
        buildingDisplayWidth * 1.08,
        buildingDisplayHeight * 0.26,
        0x151b2c
      )
      .setStrokeStyle(1, 0x2a3144);
    const ironing = scene.add.image(ironingX, ironingY, "building-ironing");
    ironing.setDisplaySize(buildingDisplayWidth, buildingDisplayHeight);
    ironing.setInteractive({ useHandCursor: true });

    // 收送倉庫（左下）
    const deliX = centerX - w * 0.18;
    const deliY = h * 0.66;
    scene.add
      .rectangle(
        deliX,
        deliY + buildingDisplayHeight * 0.42,
        buildingDisplayWidth * 1.08,
        buildingDisplayHeight * 0.26,
        0x151b2c
      )
      .setStrokeStyle(1, 0x2a3144);
    const delivery = scene.add.image(deliX, deliY, "building-delivery");
    delivery.setDisplaySize(buildingDisplayWidth, buildingDisplayHeight);
    delivery.setInteractive({ useHandCursor: true });

    // ===== 建築高亮框 =====
    function createHighlight(target) {
      const bounds = target.getBounds();
      const rect = scene.add
        .rectangle(
          bounds.centerX,
          bounds.centerY,
          bounds.width + 14,
          bounds.height + 14
        )
        .setStrokeStyle(3, 0xffa6c7);
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

    // ===== NPC：人物圖片 =====
    const npcSize = Math.min(w, h) * 0.12;

    const npcCs = scene.add.image(
      storeX + buildingDisplayWidth * 0.42,
      storeY - buildingDisplayHeight * 0.35,
      "npc-cs"
    );
    npcCs.setDisplaySize(npcSize, npcSize);
    npcCs.setInteractive({ useHandCursor: true });

    const npcIron = scene.add.image(
      ironingX,
      ironingY - buildingDisplayHeight * 0.7,
      "npc-ironing"
    );
    npcIron.setDisplaySize(npcSize, npcSize);
    npcIron.setInteractive({ useHandCursor: true });

    const npcDeli = scene.add.image(
      deliX,
      deliY - buildingDisplayHeight * 0.7,
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

      const floor = scene.add.rectangle(centerX, centerY, w * 0.8, h * 0.56, 0x151828);
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

        const logo = scene.add.rectangle(
          centerX,
          centerY - h * 0.28,
          w * 0.36,
          h * 0.08,
          0x293454
        );
        logo.setStrokeStyle(1, 0x7686ff);
        objs.push(logo);
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

        const ironBase = scene.add.rectangle(
          centerX - w * 0.1,
          centerY + h * 0.08,
          w * 0.14,
          h * 0.05,
          0x3f4a6a
        );
        const ironTop = scene.add.rectangle(
          centerX - w * 0.1,
          centerY + h * 0.06,
          w * 0.12,
          h * 0.04,
          0x9fd3ff
        );
        objs.push(ironBase, ironTop);
      } else if (kind === "delivery") {
        const floor = scene.add.rectangle(
          centerX,
          centerY + h * 0.04,
          w * 0.72,
          h * 0.36,
          0x181f2c
        );
        floor.setStrokeStyle(1, 0x333a54);
        objs.push(floor);

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

        const dock = scene.add.rectangle(
          centerX + w * 0.18,
          centerY + h * 0.08,
          w * 0.18,
          h * 0.18,
          0x1f2637
        );
        dock.setStrokeStyle(1, 0x3e465c);
        objs.push(dock);
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

    // ===== 主角：帶帽子的小男生（可移動） =====
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

    const cursors = scene.input.keyboard.createCursorKeys();
    scene.cursors = cursors;

    scene.input.on("pointerdown", (pointer) => {
      if (scene.isInInterior) return;
      const localY = Phaser.Math.Clamp(
        pointer.y,
        scene.mapBounds.minY,
        scene.mapBounds.maxY
      );
      const localX = Phaser.Math.Clamp(
        pointer.x,
        scene.mapBounds.minX,
        scene.mapBounds.maxX
      );
      scene.playerTarget = { x: localX, y: localY };
    });

    // 提供給外部切換用（app.js 用）
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

  if (
    typeof document !== "undefined" &&
    (document.readyState === "complete" ||
      document.readyState === "interactive")
  ) {
    setTimeout(boot, 0);
  } else if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", boot);
  }
})();
