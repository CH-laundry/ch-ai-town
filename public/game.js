// C.H AI TOWN 小鎮 v2：更有質感的街景 + 建築室內畫面

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
    scene.add
      .rectangle(centerX, h * 0.42, w * 0.8, roadWidth * 0.72, 0x1f2438)
      .setStrokeStyle(1, 0x3a415d);

    // 中間虛線
    const dashCount = 7;
    const dashLen = (w * 0.8) / (dashCount * 2);
    for (let i = 0; i < dashCount; i++) {
      const x = centerX - (w * 0.8) / 2 + dashLen / 2 + i * dashLen * 2;
      scene.add.rectangle(x, h * 0.42, dashLen, 3, 0x4a536f);
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
      scene.add.rectangle(centerX + w * 0.36, h * 0.42 - 10, 4, 40, 0x444b63);
      scene.add
        .rectangle(centerX + w * 0.36, h * 0.42, 14, 36, 0x222632)
        .setStrokeStyle(1, 0x585f7a);
      scene.add.circle(centerX + w * 0.36, h * 0.42 - 10, 4, 0xff4b4b);
      scene.add.circle(centerX + w * 0.36, h * 0.42, 4, 0xffd15c);
      scene.add.circle(centerX + w * 0.36, h * 0.42 + 10, 4, 0x44d07a);
    })();

    // ===== 房子：固定顯示尺寸 + 底座 =====
    const buildingDisplayWidth = w * 0.23;
    const buildingDisplayHeight = h * 0.24;

    // 門市 C.H（右上）
    const storeX = centerX + w * 0.18;
    const storeY = h * 0.26;
    const storeBase = scene.add
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
    const ironingBase = scene.add
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
    const deliveryBase = scene.add
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
      .text(centerX, centerY, "", {
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

    function openInterior(kind) {
      let title = "";
      let desc = "";

      if (kind === "store") {
        title = "C.H 門市櫃台";
        desc =
          "這裡是 C.H 精緻洗衣的門市櫃台。\n\n可以想像前方有收件檯面、價目表與常見問題說明，專門協助客人了解洗衣／洗鞋／洗包服務、價格區間，以及收送方式。右側 AI 會以「客服」視角回答你的問題。";
      } else if (kind === "ironing") {
        title = "整燙 / 定型工作區";
        desc =
          "這一間是專門做西裝、襯衫、洋裝等衣物整燙與定型的工作區。\n\n你可以把這裡想成有大型蒸氣熨斗、整燙台與吊掛區，主要負責版型調整與細節燙線。右側 AI 會以「熨燙師傅」視角，說明哪些材質能燙、溫度怎麼抓比較安全。";
      } else if (kind === "delivery") {
        title = "收送倉庫 / 排程區";
        desc =
          "這裡是收送倉庫，負責整理當日要收件與送回的訂單。\n\n你可以想像有一整面吊掛區與貨架，上面標註日期、路線與客戶姓名。右側 AI 會以「外送員」視角，說明收送流程、時間區間與注意事項。";
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

    // ===== 主角（圓形） =====
    const playerRadius = Math.min(w, h) * 0.035;
    const player = scene.add.circle(
      centerX - w * 0.25,
      h * 0.25,
      playerRadius,
      0xf0b762
    );
    player.setStrokeStyle(2, 0x3a2a19);
    scene.player = player;
    scene.playerTarget = null;

    const cursors = scene.input.keyboard.createCursorKeys();
    scene.cursors = cursors;

    // 操作提示
    const hintText = scene.add.text(
      centerX,
      h * 0.94,
      "💡 提示：點建築可以進入室內畫面；鍵盤方向鍵可以移動主角。",
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
      const localY = Phaser.Math.Clamp(pointer.y, h * 0.18, h * 0.86);
      const localX = Phaser.Math.Clamp(
        pointer.x,
        centerX - w * 0.42,
        centerX + w * 0.42
      );
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
    const target = scene.playerTarget;

    if (!player || !target || scene.isInInterior) return;

    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const speed = 2.0;
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
