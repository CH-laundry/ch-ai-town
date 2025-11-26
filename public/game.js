// C.H AI TOWN v3
console.log(">>> CH-AI-TOWN game.js v3 loaded");
// C.H AI TOWN v3
// - 有綠色街道背景
// - 中央主角改成戴帽子的小男孩
// - 每間店都有室內可走動地圖（獨立 Scene）

(function () {
  const ROOT_ID = "game-root";

  // ---------- 工具函式：建立小男孩主角（戶外用） ----------
  function createBoyPlayer(scene, x, y) {
    const container = scene.add.container(x, y);

    // 身體
    const body = scene.add.rectangle(0, 14, 20, 30, 0xf4c89a);
    body.setStrokeStyle(2, 0x5b3b21);

    // 頭
    const head = scene.add.circle(0, -4, 9, 0xffe5bf);
    head.setStrokeStyle(2, 0x5b3b21);

    // 帽檐
    const hatBrim = scene.add.rectangle(0, -11, 22, 4, 0x21507f);

    // 帽頂
    const hatTop = scene.add.rectangle(0, -18, 14, 8, 0x3376c4);
    hatTop.setStrokeStyle(1, 0x153152);

    // 簡單影子
    const shadow = scene.add.ellipse(0, 26, 26, 8, 0x000000, 0.35);
    shadow.setDepth(-1);

    container.add([shadow, body, head, hatBrim, hatTop]);
    return container;
  }

  // ---------- 戶外小鎮 Scene ----------
  class TownScene extends Phaser.Scene {
    constructor() {
      super("TownScene");
    }

    preload() {
      this.load.image("building-store", "/images/building-store.png");
      this.load.image("building-ironing", "/images/building-ironing.png");
      this.load.image("building-delivery", "/images/building-delivery.png");

      this.load.image("npc-cs", "/images/npc-cs.png");
      this.load.image("npc-ironing", "/images/npc-ironing.png");
      this.load.image("npc-delivery", "/images/npc-delivery.png");
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // ----- 綠色街道背景 -----
      // 深色底
      const bg = this.add.rectangle(centerX, centerY, w, h, 0x050b10);
      bg.setDepth(-10);

      // 草地區域
      this.add
        .rectangle(centerX, centerY, w * 0.96, h * 0.96, 0x071c16)
        .setStrokeStyle(2, 0x1c3a2c);

      // 垂直馬路
      const roadW = w * 0.11;
      this.add
        .rectangle(centerX, centerY, roadW, h * 0.9, 0x22252f)
        .setStrokeStyle(1, 0x414654);

      // 水平馬路
      this.add
        .rectangle(centerX, h * 0.45, w * 0.9, roadW * 0.7, 0x22252f)
        .setStrokeStyle(1, 0x414654);

      // 水平馬路中線
      const dashCount = 7;
      const dashLen = (w * 0.7) / (dashCount * 2);
      for (let i = 0; i < dashCount; i++) {
        const x =
          centerX - (w * 0.7) / 2 + dashLen / 2 + i * dashLen * 2;
        this.add.rectangle(x, h * 0.45, dashLen, 3, 0xf5d36c);
      }

      // 垂直馬路中線
      const vDashCount = 6;
      const vDashLen = (h * 0.6) / (vDashCount * 2);
      for (let i = 0; i < vDashCount; i++) {
        const y =
          centerY - (h * 0.6) / 2 + vDashLen / 2 + i * vDashLen * 2;
        this.add.rectangle(centerX, y, 3, vDashLen, 0xf5d36c);
      }

      // ----- 人行道 + 草地裝飾 -----
      const sidewalkH = h * 0.03;
      this.add
        .rectangle(centerX, h * 0.35, w * 0.9, sidewalkH, 0x0b2830)
        .setStrokeStyle(1, 0x32535b);
      this.add
        .rectangle(centerX, h * 0.55, w * 0.9, sidewalkH, 0x0b2830)
        .setStrokeStyle(1, 0x32535b);

      // 樹
      const createTree = (x, y) => {
        this.add.rectangle(x, y + 16, 6, 22, 0x6f4a2b);
        this.add.circle(x - 5, y, 10, 0x36a86a);
        this.add.circle(x + 5, y - 4, 9, 0x36a86a);
      };
      createTree(centerX - w * 0.35, h * 0.30);
      createTree(centerX + w * 0.35, h * 0.30);
      createTree(centerX - w * 0.35, h * 0.60);
      createTree(centerX + w * 0.35, h * 0.60);

      // 路燈
      const createLamp = (x, y) => {
        this.add.rectangle(x, y + 20, 4, 32, 0x3b4657);
        const lamp = this.add.circle(x, y, 6, 0xf9f0c8);
        lamp.setShadow(0, 0, 0xf9f0c8, 8, true, true);
      };
      createLamp(centerX - w * 0.20, h * 0.34);
      createLamp(centerX + w * 0.20, h * 0.58);

      // 紅綠燈
      this.add.rectangle(
        centerX + w * 0.36,
        h * 0.45 - 8,
        4,
        42,
        0x3b4657
      );
      this.add
        .rectangle(
          centerX + w * 0.36,
          h * 0.45,
          14,
          40,
          0x181e26
        )
        .setStrokeStyle(1, 0x5a6479);
      this.add.circle(centerX + w * 0.36, h * 0.45 - 10, 4, 0xff4b4b);
      this.add.circle(centerX + w * 0.36, h * 0.45, 4, 0xffd15c);
      this.add.circle(centerX + w * 0.36, h * 0.45 + 10, 4, 0x48d07a);

      // ----- 建築物（門市 / 整燙 / 收送） -----
      const buildingDisplayWidth = w * 0.23;
      const buildingDisplayHeight = h * 0.24;

      const storeX = centerX;
      const storeY = h * 0.22;

      const ironingX = centerX + w * 0.20;
      const ironingY = h * 0.68;

      const deliX = centerX - w * 0.20;
      const deliY = h * 0.68;

      const mkBase = (x, y) =>
        this.add
          .rectangle(
            x,
            y + buildingDisplayHeight * 0.42,
            buildingDisplayWidth * 1.10,
            buildingDisplayHeight * 0.28,
            0x10151d
          )
          .setStrokeStyle(1, 0x27303d);

      mkBase(storeX, storeY);
      mkBase(ironingX, ironingY);
      mkBase(deliX, deliY);

      const store = this.add.image(storeX, storeY, "building-store");
      store.setDisplaySize(
        buildingDisplayWidth,
        buildingDisplayHeight
      );
      store.setInteractive({ useHandCursor: true });

      const ironing = this.add.image(
        ironingX,
        ironingY,
        "building-ironing"
      );
      ironing.setDisplaySize(
        buildingDisplayWidth,
        buildingDisplayHeight
      );
      ironing.setInteractive({ useHandCursor: true });

      const delivery = this.add.image(
        deliX,
        deliY,
        "building-delivery"
      );
      delivery.setDisplaySize(
        buildingDisplayWidth,
        buildingDisplayHeight
      );
      delivery.setInteractive({ useHandCursor: true });

      // 高亮框
      const createHighlight = (target) => {
        const b = target.getBounds();
        const r = this.add
          .rectangle(
            b.centerX,
            b.centerY,
            b.width + 16,
            b.height + 16,
            0x000000,
            0
          )
          .setStrokeStyle(2, 0xffc970);
        r.setVisible(false);
        return r;
      };
      const storeHL = createHighlight(store);
      const ironingHL = createHighlight(ironing);
      const deliveryHL = createHighlight(delivery);

      const setActiveBuilding = (roleId) => {
        storeHL.setVisible(false);
        ironingHL.setVisible(false);
        deliveryHL.setVisible(false);
        if (roleId === "chCustomerService") storeHL.setVisible(true);
        if (roleId === "ironingMaster") ironingHL.setVisible(true);
        if (roleId === "deliveryStaff") deliveryHL.setVisible(true);
      };

      // ----- NPC（站在屋頂的角色） -----
      const npcSize = Math.min(w, h) * 0.12;

      const npcCs = this.add.image(storeX, storeY - buildingDisplayHeight * 0.6, "npc-cs");
      npcCs.setDisplaySize(npcSize, npcSize);

      const npcIron = this.add.image(ironingX, ironingY - buildingDisplayHeight * 0.6, "npc-ironing");
      npcIron.setDisplaySize(npcSize, npcSize);

      const npcDeli = this.add.image(deliX, deliY - buildingDisplayHeight * 0.6, "npc-delivery");
      npcDeli.setDisplaySize(npcSize, npcSize);

      // ----- 中央主角：戴帽子的小男孩 -----
      const player = createBoyPlayer(this, centerX, centerY);
      this.player = player;
      this.playerTarget = null;

      // ----- 點建築 / NPC：切角色 + 進入室內 -----
      const callSwitchRole = (roleId, hintText) => {
        try {
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap(roleId);
          }
          if (window.chTownNpcSay && hintText) {
            window.chTownNpcSay(roleId, hintText);
          }
        } catch (e) {
          console.warn("切換角色失敗", e);
        }
        setActiveBuilding(roleId);
      };

      const goInterior = (sceneKey) => {
        this.scene.start(sceneKey);
      };

      // 建築：門市
      store.on("pointerdown", () => {
        callSwitchRole(
          "chCustomerService",
          "這裡是門市櫃台，任何服務內容或價格區間都可以先問我。"
        );
        goInterior("StoreInteriorScene");
      });

      // 建築：整燙中心
      ironing.on("pointerdown", () => {
        callSwitchRole(
          "ironingMaster",
          "我是整燙師傅，衣服怎麼燙、版型怎麼調整可以問我。"
        );
        goInterior("IroningInteriorScene");
      });

      // 建築：收送倉庫
      delivery.on("pointerdown", () => {
        callSwitchRole(
          "deliveryStaff",
          "我是外送員，收送路線與時間區間可以跟我討論。"
        );
        goInterior("DeliveryInteriorScene");
      });

      // NPC：只切角色，不進室內
      npcCs.setInteractive({ useHandCursor: true });
      npcCs.on("pointerdown", () => {
        callSwitchRole(
          "chCustomerService",
          "歡迎來到 C.H 精緻洗衣，有什麼想了解的嗎？"
        );
      });

      npcIron.setInteractive({ useHandCursor: true });
      npcIron.on("pointerdown", () => {
        callSwitchRole(
          "ironingMaster",
          "整燙溫度、材質禁忌或定型方式都可以問我。"
        );
      });

      npcDeli.setInteractive({ useHandCursor: true });
      npcDeli.on("pointerdown", () => {
        callSwitchRole(
          "deliveryStaff",
          "收送時間、樓層搬運等實務問題，我最清楚。"
        );
      });

      // ----- 點地圖移動主角 -----
      this.input.on("pointerdown", (pointer) => {
        const localX = Phaser.Math.Clamp(
          pointer.x,
          centerX - w * 0.45,
          centerX + w * 0.45
        );
        const localY = Phaser.Math.Clamp(
          pointer.y,
          h * 0.18,
          h * 0.82
        );
        this.playerTarget = { x: localX, y: localY };
      });

      // 操作提示
      const hint = this.add.text(
        centerX,
        h * 0.94,
        "操作提示：點建築可進入室內；點地圖可移動小男孩；點 NPC 可切換對話角色。",
        {
          fontSize: "12px",
          color: "#d3ddff",
        }
      );
      hint.setOrigin(0.5, 0.5);

      // 提供給外部呼叫：高亮建築
      window.chTownMapSetActiveRole = (roleId) => {
        setActiveBuilding(roleId);
      };

      // 預設高亮門市
      setActiveBuilding("chCustomerService");
    }

    update() {
      const player = this.player;
      const target = this.playerTarget;
      if (!player || !target) return;

      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 2.2;

      if (dist < speed) {
        player.x = target.x;
        player.y = target.y;
        this.playerTarget = null;
      } else {
        player.x += (dx / dist) * speed;
        player.y += (dy / dist) * speed;
      }
    }
  }

  // ---------- 室內 Scene 共用：建立內部地圖 ----------
  function createIndoorBase(scene, options) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const centerX = w / 2;
    const centerY = h / 2;

    const title = options.title || "";
    const bgColor = options.bgColor || 0x050812;

    // 深色背景
    scene.add.rectangle(centerX, centerY, w, h, bgColor);

    // 牆面 + 地板
    scene.add
      .rectangle(centerX, h * 0.30, w * 0.90, h * 0.35, 0x101727)
      .setStrokeStyle(2, 0x24314a);
    scene.add
      .rectangle(centerX, h * 0.70, w * 0.90, h * 0.40, 0x151d30)
      .setStrokeStyle(2, 0x24314a);

    // 招牌
    scene.add
      .rectangle(centerX, h * 0.09, w * 0.55, 40, 0x1c2540, 1)
      .setStrokeStyle(2, 0xffc970);
    scene.add
      .text(centerX, h * 0.09, title, {
        fontSize: "18px",
        color: "#ffe9b0",
      })
      .setOrigin(0.5, 0.5);

    // 回到小鎮按鈕
    const backBtn = scene.add
      .text(centerX, h * 0.90, "← 回到小鎮地圖", {
        fontSize: "14px",
        color: "#ffd48b",
        backgroundColor: "#262c3e",
        padding: { x: 18, y: 8 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    backBtn.on("pointerdown", () => {
      scene.scene.start("TownScene");
    });

    // 盆栽（左側）
    const potX = centerX - w * 0.37;
    const potY = h * 0.62;
    scene.add.rectangle(potX, potY + 14, 20, 14, 0x6e4a2c);
    scene.add.circle(potX - 6, potY, 10, 0x3ca56d);
    scene.add.circle(potX + 4, potY - 6, 8, 0x3ca56d);

    // 主角（室內用的圓形）
    const player = scene.add.circle(
      centerX,
      h * 0.70,
      12,
      0xf0b762
    );
    player.setStrokeStyle(2, 0x3a2a19);

    scene.player = player;
    scene.playerTarget = null;

    scene.input.on("pointerdown", (pointer) => {
      const localX = Phaser.Math.Clamp(
        pointer.x,
        centerX - w * 0.42,
        centerX + w * 0.42
      );
      const localY = Phaser.Math.Clamp(
        pointer.y,
        h * 0.42,
        h * 0.82
      );
      scene.playerTarget = { x: localX, y: localY };
    });

    scene.events.on("update", () => {
      const p = scene.player;
      const t = scene.playerTarget;
      if (!p || !t) return;
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 2.0;
      if (dist < speed) {
        p.x = t.x;
        p.y = t.y;
        scene.playerTarget = null;
      } else {
        p.x += (dx / dist) * speed;
        p.y += (dy / dist) * speed;
      }
    });
  }

  // ---------- 門市室內 ----------
  class StoreInteriorScene extends Phaser.Scene {
    constructor() {
      super("StoreInteriorScene");
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;
      const centerX = w / 2;

      createIndoorBase(this, { title: "C.H 門市櫃台" });

      // 櫃台
      const counter = this.add.rectangle(
        centerX,
        h * 0.58,
        w * 0.70,
        h * 0.16,
        0x1f2940
      );
      counter.setStrokeStyle(2, 0xffc970);

      // 櫃台上方玻璃
      this.add.rectangle(
        centerX,
        h * 0.53,
        w * 0.64,
        h * 0.06,
        0x1a2235,
        0.9
      );

      // 櫥窗衣架
      const winX = centerX;
      const winY = h * 0.32;
      this.add.rectangle(
        winX,
        winY,
        w * 0.60,
        h * 0.20,
        0x151f33
      );
      this.add.rectangle(
        winX,
        winY - 30,
        w * 0.50,
        4,
        0x91b0ff
      );

      // 襯衫剪影
      this.add.rectangle(winX - 60, winY + 10, 38, 52, 0x2b3a55, 0);
      this.add.rectangle(winX - 60, winY + 12, 32, 40, 0x2b3a55);
      // 洋裝剪影
      this.add.triangle(
        winX + 60,
        winY + 20,
        -20,
        20,
        20,
        20,
        0,
        -30,
        0x2b3a55
      );

      // 門市 NPC
      const npcSize = Math.min(w, h) * 0.13;
      const npc = this.add.image(centerX, h * 0.50, "npc-cs");
      npc.setDisplaySize(npcSize, npcSize);
      npc.setInteractive({ useHandCursor: true });

      npc.on("pointerdown", () => {
        try {
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap("chCustomerService");
          }
        } catch (e) {
          console.warn(e);
        }
      });

      this.add
        .text(centerX, h * 0.40, "門市客服人員", {
          fontSize: "13px",
          color: "#d3ddff",
        })
        .setOrigin(0.5, 0.5);
    }
  }

  // ---------- 整燙 / 整理中心室內 ----------
  class IroningInteriorScene extends Phaser.Scene {
    constructor() {
      super("IroningInteriorScene");
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;
      const centerX = w / 2;

      createIndoorBase(this, { title: "整燙 / 整理中心" });

      // 熨燙工作桌
      const table = this.add.rectangle(
        centerX,
        h * 0.60,
        w * 0.72,
        h * 0.14,
        0x232c43
      );
      table.setStrokeStyle(2, 0x7fb4ff);

      // 熨斗剪影
      this.add.triangle(
        centerX - 40,
        h * 0.56,
        -24,
        12,
        24,
        12,
        10,
        -12,
        0x7fb4ff
      );

      // 後方吊掛衣架
      const rackY = h * 0.32;
      this.add.rectangle(centerX, rackY, w * 0.60, h * 0.18, 0x151f33);
      this.add.rectangle(centerX, rackY - 28, w * 0.50, 4, 0x91b0ff);

      // 西裝外套
      this.add.rectangle(centerX - 60, rackY + 4, 40, 56, 0x2b3a55);
      // 洋裝
      this.add.triangle(
        centerX + 60,
        rackY + 16,
        -20,
        24,
        20,
        24,
        0,
        -24,
        0x2b3a55
      );

      // 整燙師傅 NPC
      const npcSize = Math.min(w, h) * 0.13;
      const npc = this.add.image(centerX - 110, h * 0.56, "npc-ironing");
      npc.setDisplaySize(npcSize, npcSize);
      npc.setInteractive({ useHandCursor: true });

      npc.on("pointerdown", () => {
        try {
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap("ironingMaster");
          }
        } catch (e) {
          console.warn(e);
        }
      });

      this.add
        .text(centerX - 110, h * 0.44, "整燙師傅", {
          fontSize: "13px",
          color: "#d3ddff",
        })
        .setOrigin(0.5, 0.5);
    }
  }

  // ---------- 收送倉庫室內 ----------
  class DeliveryInteriorScene extends Phaser.Scene {
    constructor() {
      super("DeliveryInteriorScene");
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;
      const centerX = w / 2;

      createIndoorBase(this, { title: "收送倉庫 / 排程區" });

      // 吊掛區
      const rackY = h * 0.32;
      this.add.rectangle(centerX, rackY, w * 0.70, h * 0.22, 0x191f2d);
      this.add.rectangle(centerX, rackY - 32, w * 0.60, 4, 0xffd48b);

      // 幾個吊掛袋子 / 衣物
      for (let i = -2; i <= 2; i++) {
        const x = centerX + i * 40;
        this.add.rectangle(x, rackY + 10, 28, 44, 0x2b3a55);
      }

      // 箱子堆
      const baseY = h * 0.62;
      const boxColor = 0x8b5a2b;
      this.add.rectangle(centerX - 60, baseY, 60, 40, boxColor);
      this.add.rectangle(centerX, baseY + 6, 60, 40, boxColor);
      this.add.rectangle(centerX + 60, baseY, 60, 40, boxColor);

      // 外送員 NPC
      const npcSize = Math.min(w, h) * 0.13;
      const npc = this.add.image(centerX + 110, h * 0.60, "npc-delivery");
      npc.setDisplaySize(npcSize, npcSize);
      npc.setInteractive({ useHandCursor: true });

      npc.on("pointerdown", () => {
        try {
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap("deliveryStaff");
          }
        } catch (e) {
          console.warn(e);
        }
      });

      this.add
        .text(centerX + 110, h * 0.48, "收送人員", {
          fontSize: "13px",
          color: "#d3ddff",
        })
        .setOrigin(0.5, 0.5);
    }
  }

  // ---------- 啟動 Phaser ----------
  function boot() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    const width = root.clientWidth || 520;
    const height = root.clientHeight || 520;

    new Phaser.Game({
      type: Phaser.AUTO,
      parent: ROOT_ID,
      width,
      height,
      transparent: true,
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      scene: [
        TownScene,
        StoreInteriorScene,
        IroningInteriorScene,
        DeliveryInteriorScene,
      ],
    });
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
