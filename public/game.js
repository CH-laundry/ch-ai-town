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
      transparent: true,
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER,
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
    bg.setDepth(-1);

    // ===== 馬路：垂直 + 水平 =====
    const roadWidth = w * 0.08;

    // 垂直道路
    scene.add
      .rectangle(centerX, centerY, roadWidth, h * 0.8, 0x1f2438)
      .setStrokeStyle(1, 0x3a415d);

    // 水平道路
    const horizontalRoadY = h * 0.42;
    scene.add
      .rectangle(centerX, horizontalRoadY, w * 0.8, roadWidth * 0.72, 0x1f2438)
      .setStrokeStyle(1, 0x3a415d);

    // 中間虛線
    const dashCount = 7;
    const dashLen = (w * 0.8) / (dashCount * 2);
    for (let i = 0; i < dashCount; i++) {
      const x = centerX - (w * 0.8) / 2 + dashLen / 2 + i * dashLen * 2;
      scene.add.rectangle(x, horizontalRoadY, dashLen, 3, 0x4a536f);
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

      function createLamp(x, y) {
        scene.add.rectangle(x, y + 20, 4, 32, 0x444b63);
        scene.add.circle(x, y, 6, 0xf7e6a4);
      }

      createLamp(centerX - w * 0.18, h * 0.3);
      createLamp(centerX + w * 0.18, h * 0.54);

      // 紅綠燈
      scene.add.rectangle(centerX + w * 0.36, horizontalRoadY - 10, 4, 40, 0x444b63);
      scene.add
        .rectangle(centerX + w * 0.36, horizontalRoadY, 14, 36, 0x222632)
        .setStrokeStyle(1, 0x585f7a);
      scene.add.circle(centerX + w * 0.36, horizontalRoadY - 10, 4, 0xff4b4b);
      scene.add.circle(centerX + w * 0.36, horizontalRoadY, 4, 0xffd15c);
      scene.add.circle(centerX + w * 0.36, horizontalRoadY + 10, 4, 0x44d07a);
    })();

    // ===== 房子：固定顯示尺寸 + 底座 =====
    const buildingDisplayWidth = w * 0.23;
    const buildingDisplayHeight = h * 0.24;

    // 門市 C.H（右上）
    const storeX = centerX + w * 0.18;
    const storeY = h * 0.26;
    scene.add
      .rectangle(
        storeX,
        storeY + buildingDisplayHeight * 0.42,
        buildingDisplayWidth * 1.08,
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
          bounds.height + 14,
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

    // ===== NPC：人物圖片 =====
    const npcSize = Math.min(w, h) * 0.12;

    const npcCs = scene.add.image(
      storeX,
      storeY - buildingDisplayHeight * 0.55,
      "npc-cs"
    );
    npcCs.setDisplaySize(npcSize, npcSize);

    const npcIron = scene.add.image(
      ironingX,
      ironingY - buildingDisplayHeight * 0.55,
      "npc-ironing"
    );
    npcIron.setDisplaySize(npcSize, npcSize);

    const npcDeli = scene.add.image(
      deliX,
      deliY - buildingDisplayHeight * 0.55,
      "npc-delivery"
    );
    npcDeli.setDisplaySize(npcSize, npcSize);

    // ===== 室內畫面 overlay =====
    const overlay = scene.add
      .rectangle(centerX, centerY, w * 0.96, h * 0.96, 0x000000, 0.65)
      .setDepth(50);
    overlay.setVisible(false);

    const interiorPanel = scene.add
      .rectangle(centerX, centerY, w * 0.82, h * 0.7, 0x151826, 1)
      .setStrokeStyle(2, 0xffc970)
      .setDepth(51);
    interiorPanel.setVisible(false);

    const interiorTitle = scene.add
      .text(centerX, h * 0.23, "C.H 門市", {
        fontSize: "20px",
        color: "#ffe9b0",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(52);
    interiorTitle.setVisible(false);

    const interiorDesc = scene.add
      .text(centerX, centerY + h * 0.08, "", {
        fontSize: "14px",
        color: "#d3ddff",
        wordWrap: { width: w * 0.7 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(52);
    interiorDesc.setVisible(false);

    const backBtn = scene.add
      .text(centerX, h * 0.74, "← 回到小鎮地圖", {
        fontSize: "14px",
        color: "#ffd48b",
        backgroundColor: "#262c3e",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(52)
      .setInteractive({ useHandCursor: true });
    backBtn.setVisible(false);

    // 室內擺設容器（每次打開會重畫）
    const interiorDecor = scene.add.container(0, 0).setDepth(52);
    interiorDecor.setVisible(false);

    function drawStoreInterior() {
      const objs = [];
      // 地板
      const floor = scene.add.rectangle(
        centerX,
        centerY + h * 0.06,
        w * 0.74,
        h * 0.36,
        0x1a1f30
      );
      floor.setStrokeStyle(1, 0x333a54);
      objs.push(floor);

      // 背景牆櫃
      const shelf = scene.add.rectangle(
        centerX,
        centerY - h * 0.02,
        w * 0.6,
        h * 0.16,
        0x20263b
      );
      shelf.setStrokeStyle(1, 0x424a63);
      objs.push(shelf);

      // 幾排「洗劑瓶子」
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

      // 前方櫃台
      const counter = scene.add.rectangle(
        centerX,
        centerY + h * 0.16,
        w * 0.5,
        h * 0.14,
        0x22263a
      );
      counter.setStrokeStyle(1, 0x494f6b);
      objs.push(counter);

      const counterTop = scene.add.rectangle(
        centerX,
        centerY + h * 0.1,
        w * 0.5,
        h * 0.03,
        0x343b5d
      );
      objs.push(counterTop);

      // 櫃台上小立牌
      const board = scene.add.rectangle(
        centerX - w * 0.12,
        centerY + h * 0.08,
        w * 0.12,
        h * 0.06,
        0xffc970
      );
      const boardText = scene.add
        .text(board.x, board.y, "價目表", {
          fontSize: "12px",
          color: "#4b2a00",
        })
        .setOrigin(0.5, 0.5);
      objs.push(board, boardText);

      // 櫃台右側小花盆
      const pot = scene.add.rectangle(
        centerX + w * 0.16,
        centerY + h * 0.12,
        16,
        10,
        0xcc7b4a
      );
      const leaf1 = scene.add.circle(pot.x - 4, pot.y - 10, 6, 0x3ea86b);
      const leaf2 = scene.add.circle(pot.x + 4, pot.y - 13, 5, 0x3ea86b);
      objs.push(pot, leaf1, leaf2);

      interiorDecor.add(objs);
    }

    function drawIroningInterior() {
      const objs = [];
      // 地板
      const floor = scene.add.rectangle(
        centerX,
        centerY + h * 0.06,
        w * 0.74,
        h * 0.36,
        0x1a202f
      );
      floor.setStrokeStyle(1, 0x333a54);
      objs.push(floor);

      // 後方吊掛衣物桿
      const bar = scene.add.rectangle(
        centerX,
        centerY - h * 0.02,
        w * 0.6,
        4,
        0x505978
      );
      objs.push(bar);

      const hangerCount = 6;
      for (let i = 0; i < hangerCount; i++) {
        const x = centerX - w * 0.26 + (w * 0.52 * i) / (hangerCount - 1);
        const y = centerY - h * 0.01;
        const pole = scene.add.rectangle(x, y + 14, 2, 24, 0x707793);
        const cloth = scene.add.rectangle(x, y + 32, 26, 40, 0xffb8c4);
        cloth.setStrokeStyle(1, 0x87485a);
        objs.push(pole, cloth);
      }

      // 熨燙台
      const board = scene.add.rectangle(
        centerX,
        centerY + h * 0.16,
        w * 0.46,
        h * 0.06,
        0x22263a
      );
      board.setStrokeStyle(1, 0x444b63);
      objs.push(board);

      const boardLegLeft = scene.add.rectangle(
        centerX - w * 0.16,
        centerY + h * 0.22,
        8,
        h * 0.08,
        0x444b63
      );
      const boardLegRight = scene.add.rectangle(
        centerX + w * 0.16,
        centerY + h * 0.22,
        8,
        h * 0.08,
        0x444b63
      );
      objs.push(boardLegLeft, boardLegRight);

      // 熨斗
      const ironBase = scene.add.rectangle(
        centerX + w * 0.08,
        centerY + h * 0.13,
        46,
        20,
        0x4eb7ff
      );
      const ironTop = scene.add.rectangle(
        centerX + w * 0.08,
        centerY + h * 0.11,
        30,
        12,
        0xffffff
      );
      objs.push(ironBase, ironTop);

      interiorDecor.add(objs);
    }

    function drawDeliveryInterior() {
      const objs = [];
      // 地板
      const floor = scene.add.rectangle(
        centerX,
        centerY + h * 0.06,
        w * 0.74,
        h * 0.36,
        0x181f2c
      );
      floor.setStrokeStyle(1, 0x333a54);
      objs.push(floor);

      // 左側貨架
      const shelf = scene.add.rectangle(
        centerX - w * 0.2,
        centerY + h * 0.04,
        w * 0.28,
        h * 0.28,
        0x202637
      );
      shelf.setStrokeStyle(1, 0x424a63);
      objs.push(shelf);

      // 貨架上的箱子
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
          const tape = scene.add.rectangle(x, y, 34, 4, 0xf5d7a7);
          objs.push(box, tape);
        }
      }

      // 右側吊掛區
      const rail = scene.add.rectangle(
        centerX + w * 0.16,
        centerY - h * 0.02,
        w * 0.26,
        4,
        0x505978
      );
      objs.push(rail);

      const hangerCount = 4;
      for (let i = 0; i < hangerCount; i++) {
        const x = centerX + w * 0.05 + (w * 0.22 * i) / (hangerCount - 1);
        const y = centerY;
        const bag = scene.add.rectangle(x, y + 16, 26, 34, 0x4eb7ff);
        bag.setStrokeStyle(1, 0x284d75);
        const tag = scene.add.rectangle(x, y + 4, 10, 10, 0xfff2c0);
        objs.push(bag, tag);
      }

      // 前景小推車
      const cartBody = scene.add.rectangle(
        centerX,
        centerY + h * 0.2,
        w * 0.32,
        h * 0.08,
        0x22263a
      );
      cartBody.setStrokeStyle(1, 0x494f6b);
      const wheelL = scene.add.circle(
        centerX - w * 0.12,
        centerY + h * 0.24,
        10,
        0x444b63
      );
      const wheelR = scene.add.circle(
        centerX + w * 0.12,
        centerY + h * 0.24,
        10,
        0x444b63
      );
      objs.push(cartBody, wheelL, wheelR);

      interiorDecor.add(objs);
    }

    function openInterior(kind) {
      let title = "";
      let desc = "";

      // 每次開啟先清空舊的室內擺設
      interiorDecor.removeAll(true);
      interiorDecor.setVisible(true);

      if (kind === "store") {
        title = "C.H 門市櫃台";
        desc =
          "這裡是 C.H 精緻洗衣的門市櫃台，可以想像前方有收件檯面、價目表與常見問題說明，專門協助客人了解洗衣／洗鞋／洗包服務、價格區間，以及收送方式。";
        drawStoreInterior();
      } else if (kind === "ironing") {
        title = "整燙 / 定型工作區";
        desc =
          "這一間是專門做西裝、襯衫、洋裝等衣物整燙與定型的工作區，有大型蒸氣熨斗、整燙台與吊掛區，主要負責版型調整與細節燙線。";
        drawIroningInterior();
      } else if (kind === "delivery") {
        title = "收送倉庫 / 排程區";
        desc =
          "這裡是收送倉庫，負責整理當日要收件與送回的訂單，包含吊掛區、貨架與路線排程，讓外送可以準時、準確送達。";
        drawDeliveryInterior();
      }

      overlay.setVisible(true);
      interiorPanel.setVisible(true);
      interiorTitle.setText(title);
      interiorTitle.setVisible(true);
      interiorDesc.setText(desc);
      interiorDesc.setVisible(true);
      backBtn.setVisible(true);

      scene.isInInterior = true;
    }

    function closeInterior() {
      overlay.setVisible(false);
      interiorPanel.setVisible(false);
      interiorTitle.setVisible(false);
      interiorDesc.setVisible(false);
      backBtn.setVisible(false);
      interiorDecor.setVisible(false);
      scene.isInInterior = false;
    }

    backBtn.on("pointerdown", () => {
      closeInterior();
    });

    // ===== 點建築 / NPC：切換右側角色 + 可選擇打開室內畫面 =====
    function bindRoleClick(target, roleId, npcSuggestText, interiorKind) {
      target.on("pointerdown", () => {
        // 在室內畫面時，若點到 NPC，只關閉 overlay 不再疊加
        if (scene.isInInterior && !interiorKind) {
          closeInterior();
        }

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

        // 只有建築本體會開啟室內畫面
        if (interiorKind) {
          openInterior(interiorKind);
        }
      });
    }

    // 建築：切換角色 + 進入室內
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

    // NPC：只切換角色 / 說一句話，不切換室內畫面
    bindRoleClick(
      npcCs,
      "chCustomerService",
      "歡迎來到 C.H 門市，有什麼想了解的服務或價格都可以問我！"
    );
    bindRoleClick(
      npcIron,
      "ironingMaster",
      "你好，我是整燙師傅，衣服要怎麼燙才好看又不傷布料可以問我。"
    );
    bindRoleClick(
      npcDeli,
      "deliveryStaff",
      "我是外送員，可以幫你安排收送時間與路線，有需要都可以問我。"
    );

    // ===== 主角：帶帽子的小男生（可移動） =====
    const playerSize = Math.min(w, h) * 0.06;
    const player = scene.add.container(centerX, h * 0.5);

    // 腳
    const feet = scene.add.rectangle(0, playerSize * 0.9, playerSize * 0.7, playerSize * 0.2, 0x3a3a4f);
    // 身體
    const body = scene.add.rectangle(0, playerSize * 0.4, playerSize * 0.7, playerSize, 0xff8f73);
    // 頭
    const head = scene.add.circle(0, -playerSize * 0.05, playerSize * 0.38, 0xffe0c2);
    // 帽子
    const hatBrim = scene.add.rectangle(0, -playerSize * 0.6, playerSize, playerSize * 0.18, 0x3382ff);
    const hatTop = scene.add.rectangle(0, -playerSize * 0.9, playerSize * 0.7, playerSize * 0.4, 0x3382ff);
    // 簡單的背包帶
    const strap = scene.add.rectangle(-playerSize * 0.1, playerSize * 0.2, 6, playerSize * 0.9, 0xf3c08b);

    player.add([feet, body, head, hatBrim, hatTop, strap]);
    scene.player = player;
    scene.playerTarget = null;

    const cursors = scene.input.keyboard.createCursorKeys();
    scene.cursors = cursors;

    // 操作提示
    const hintText = scene.add.text(
      centerX,
      h * 0.94,
      "💡 提示：點地圖或使用鍵盤方向鍵，可以操作戴帽子的小男生在街道上走動；點建築可查看室內畫面。",
      {
        fontSize: "12px",
        color: "#d3ddff",
      }
    );
    hintText.setOrigin(0.5, 0.5);
    hintText.setAlpha(0.9);

    // 點地圖：主角走到指定位置（室外時才生效）
    scene.input.on("pointerdown", (pointer) => {
      if (scene.isInInterior) {
        // 室內畫面由按鈕處理點擊
        return;
      }
      const localY = Phaser.Math.Clamp(pointer.y, scene.mapBounds.minY, scene.mapBounds.maxY);
      const localX = Phaser.Math.Clamp(pointer.x, scene.mapBounds.minX, scene.mapBounds.maxX);
      scene.playerTarget = { x: localX, y: localY };
    });

    // 提供給外部切換用（app.js 用）
    window.chTownMapSetActiveRole = function (roleId) {
      setActiveBuilding(roleId);
    };

    // 初始高亮 C.H 門市
    setActiveBuilding("chCustomerService");
  }

  function update() {
    const scene = this;
    const player = scene.player;
    if (!player || scene.isInInterior) return;

    const speed = 2.0;

    // 鍵盤控制（優先於點擊目標）
    if (scene.cursors) {
      let vx = 0;
      let vy = 0;

      if (scene.cursors.left.isDown) vx -= speed;
      if (scene.cursors.right.isDown) vx += speed;
      if (scene.cursors.up.isDown) vy -= speed;
      if (scene.cursors.down.isDown) vy += speed;

      if (vx !== 0 || vy !== 0) {
        scene.playerTarget = null; // 手動控制時取消既定目標
        const bounds = scene.mapBounds;
        player.x = Phaser.Math.Clamp(player.x + vx, bounds.minX, bounds.maxX);
        player.y = Phaser.Math.Clamp(player.y + vy, bounds.minY, bounds.maxY);
        return;
      }
    }

    // 點擊目標移動
    const target = scene.playerTarget;
    if (!target) return;

    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed) {
      player.x = target.x;
      player.y = target.y;
      scene.playerTarget = null;
    } else {
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
