// C.H AI TOWN v3 – 洗衣店 AI 小鎮
// 若有看到這行 log，代表載入的是這份新版 game.js
console.log(">>> CH AI TOWN game.js v3 loaded");

(function () {
  // 盡量自動找到地圖容器；找不到就掛在 body
  function detectParentId() {
    const ids = ["game-root", "town-map", "map-root", "map"];
    for (const id of ids) {
      if (document.getElementById(id)) return id;
    }
    return null;
  }

  // ---------- 小男孩主角（戶外用） ----------
  function createBoyPlayer(scene, x, y) {
    const c = scene.add.container(x, y);

    // 影子
    const shadow = scene.add.ellipse(0, 24, 26, 8, 0x000000, 0.35);
    shadow.setDepth(-1);

    // 身體
    const body = scene.add.rectangle(0, 10, 20, 28, 0xf4c89a);
    body.setStrokeStyle(2, 0x5b3b21);

    // 頭
    const head = scene.add.circle(0, -4, 9, 0xffe5bf);
    head.setStrokeStyle(2, 0x5b3b21);

    // 帽檐 + 帽頂
    const hatBrim = scene.add.rectangle(0, -11, 22, 4, 0x21507f);
    const hatTop = scene.add.rectangle(0, -18, 14, 8, 0x3376c4);
    hatTop.setStrokeStyle(1, 0x153152);

    c.add([shadow, body, head, hatBrim, hatTop]);
    return c;
  }

  // ---------- 戶外小鎮 Scene ----------
  class TownScene extends Phaser.Scene {
    constructor() {
      super("TownScene");
    }

    preload() {
      // 建築物圖片
      this.load.image("building-store", "/images/building-store.png");
      this.load.image("building-ironing", "/images/building-ironing.png");
      this.load.image("building-delivery", "/images/building-delivery.png");

      // NPC 頭像
      this.load.image("npc-cs", "/images/npc-cs.png");
      this.load.image("npc-ironing", "/images/npc-ironing.png");
      this.load.image("npc-delivery", "/images/npc-delivery.png");
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;
      const cx = w / 2;
      const cy = h / 2;

      // ===== 綠色背景 + 十字路口 =====
      this.add.rectangle(cx, cy, w, h, 0x050b10).setDepth(-10);

      // 草地
      this.add
        .rectangle(cx, cy, w * 0.96, h * 0.96, 0x071c16)
        .setStrokeStyle(2, 0x1c3a2c);

      // 垂直馬路
      const roadW = w * 0.11;
      this.add
        .rectangle(cx, cy, roadW, h * 0.9, 0x22252f)
        .setStrokeStyle(1, 0x414654);

      // 水平馬路
      this.add
        .rectangle(cx, h * 0.45, w * 0.9, roadW * 0.7, 0x22252f)
        .setStrokeStyle(1, 0x414654);

      // 水平虛線
      const dashCount = 7;
      const dashLen = (w * 0.7) / (dashCount * 2);
      for (let i = 0; i < dashCount; i++) {
        const x = cx - (w * 0.7) / 2 + dashLen / 2 + i * dashLen * 2;
        this.add.rectangle(x, h * 0.45, dashLen, 3, 0xf5d36c);
      }

      // 垂直虛線
      const vDashCount = 6;
      const vDashLen = (h * 0.6) / (vDashCount * 2);
      for (let i = 0; i < vDashCount; i++) {
        const y = cy - (h * 0.6) / 2 + vDashLen / 2 + i * vDashLen * 2;
        this.add.rectangle(cx, y, 3, vDashLen, 0xf5d36c);
      }

      // 人行道
      const sidewalkH = h * 0.03;
      this.add
        .rectangle(cx, h * 0.35, w * 0.9, sidewalkH, 0x0b2830)
        .setStrokeStyle(1, 0x32535b);
      this.add
        .rectangle(cx, h * 0.55, w * 0.9, sidewalkH, 0x0b2830)
        .setStrokeStyle(1, 0x32535b);

      // 樹
      const createTree = (x, y) => {
        this.add.rectangle(x, y + 16, 6, 22, 0x6f4a2b);
        this.add.circle(x - 5, y, 10, 0x36a86a);
        this.add.circle(x + 5, y - 4, 9, 0x36a86a);
      };
      createTree(cx - w * 0.35, h * 0.30);
      createTree(cx + w * 0.35, h * 0.30);
      createTree(cx - w * 0.35, h * 0.60);
      createTree(cx + w * 0.35, h * 0.60);

      // 路燈
      const createLamp = (x, y) => {
        this.add.rectangle(x, y + 20, 4, 32, 0x3b4657);
        const lamp = this.add.circle(x, y, 6, 0xf9f0c8);
        lamp.setShadow(0, 0, 0xf9f0c8, 8, true, true);
      };
      createLamp(cx - w * 0.20, h * 0.34);
      createLamp(cx + w * 0.20, h * 0.58);

      // 紅綠燈
      this.add.rectangle(cx + w * 0.36, h * 0.45 - 8, 4, 42, 0x3b4657);
      this.add
        .rectangle(cx + w * 0.36, h * 0.45, 14, 40, 0x181e26)
        .setStrokeStyle(1, 0x5a6479);
      this.add.circle(cx + w * 0.36, h * 0.45 - 10, 4, 0xff4b4b);
      this.add.circle(cx + w * 0.36, h * 0.45, 4, 0xffd15c);
      this.add.circle(cx + w * 0.36, h * 0.45 + 10, 4, 0x48d07a);

      // ===== 建築物位置 =====
      const bW = w * 0.23;
      const bH = h * 0.24;

      const storeX = cx;
      const storeY = h * 0.22;

      const ironingX = cx + w * 0.20;
      const ironingY = h * 0.68;

      const deliX = cx - w * 0.20;
      const deliY = h * 0.68;

      const mkBase = (x, y) =>
        this.add
          .rectangle(
            x,
            y + bH * 0.42,
            bW * 1.10,
            bH * 0.28,
            0x10151d
          )
          .setStrokeStyle(1, 0x27303d);

      mkBase(storeX, storeY);
      mkBase(ironingX, ironingY);
      mkBase(deliX, deliY);

      const store = this.add.image(storeX, storeY, "building-store");
      store.setDisplaySize(bW, bH);
      store.setInteractive({ useHandCursor: true });

      const ironing = this.add.image(
        ironingX,
        ironingY,
        "building-ironing"
      );
      ironing.setDisplaySize(bW, bH);
      ironing.setInteractive({ useHandCursor: true });

      const delivery = this.add.image(
        deliX,
        deliY,
        "building-delivery"
      );
      delivery.setDisplaySize(bW, bH);
      delivery.setInteractive({ useHandCursor: true });

      // 建築高亮框
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
      const deliHL = createHighlight(delivery);

      const setActiveBuilding = (roleId) => {
        storeHL.setVisible(false);
        ironingHL.setVisible(false);
        deliHL.setVisible(false);
        if (roleId === "chCustomerService") storeHL.setVisible(true);
        if (roleId === "ironingMaster") ironingHL.setVisible(true);
        if (roleId === "deliveryStaff") deliHL.setVisible(true);
      };

      // ===== NPC 在屋頂 =====
      const npcSize = Math.min(w, h) * 0.12;

      const npcCs = this.add.image(
        storeX,
        storeY - bH * 0.6,
        "npc-cs"
      );
      npcCs.setDisplaySize(npcSize, npcSize);

      const npcIron = this.add.image(
        ironingX,
        ironingY - bH * 0.6,
        "npc-ironing"
      );
      npcIron.setDisplaySize(npcSize, npcSize);

      const npcDeli = this.add.image(
        deliX,
        deliY - bH * 0.6,
        "npc-delivery"
      );
      npcDeli.setDisplaySize(npcSize, npcSize);

      // ===== 中央主角：戴帽子的小男孩 =====
      this.player = createBoyPlayer(this, cx, cy);
      this.playerTarget = null;

      // ===== 外部呼叫：切角色 / 說話 =====
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

      // 點建築：切角色 + 進室內
      store.on("pointerdown", () => {
        callSwitchRole(
          "chCustomerService",
          "這裡是門市櫃台，有任何服務與價格的問題先來找我。"
        );
        goInterior("StoreInteriorScene");
      });

      ironing.on("pointerdown", () => {
        callSwitchRole(
          "ironingMaster",
          "整燙與版型調整相關的細節，由我來跟你說明。"
        );
        goInterior("IroningInteriorScene");
      });

      delivery.on("pointerdown", () => {
        callSwitchRole(
          "deliveryStaff",
          "收送時間、路線與注意事項，我可以協助規劃。"
        );
        goInterior("DeliveryInteriorScene");
      });

      // 點 NPC 只切角色，不進室內
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
          "衣服材質與整燙溫度的疑問，都可以問我。"
        );
      });

      npcDeli.setInteractive({ useHandCursor: true });
      npcDeli.on("pointerdown", () => {
        callSwitchRole(
          "deliveryStaff",
          "想調整收送時間或地點，直接跟我說。"
        );
      });

      // 點地圖移動主角
      this.input.on("pointerdown", (pointer) => {
        const x = Phaser.Math.Clamp(pointer.x, cx - w * 0.45, cx + w * 0.45);
        const y = Phaser.Math.Clamp(pointer.y, h * 0.18, h * 0.82);
        this.playerTarget = { x, y };
      });

      // 操作提示
      this.add
        .text(
          cx,
          h * 0.94,
          "操作提示：點建築可進入室內；點地圖可移動小男孩；點 NPC 可切換對話角色。",
          { fontSize: "12px", color: "#d3ddff" }
        )
        .setOrigin(0.5, 0.5);

      // 提供給外部（右側角色切換時高亮建築）
      window.chTownMapSetActiveRole = (roleId) => {
        setActiveBuilding(roleId);
      };

      // 預設高亮門市
      setActiveBuilding("chCustomerService");

      console.log("TownScene created – v3 版本已啟動");
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

  // ---------- 室內共用：建立地圖 + 移動 ----------
  function createIndoorBase(scene, options) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const cx = w / 2;

    const title = options.title || "";
    const bgColor = options.bgColor || 0x050812;

    // 背景 & 牆面/地板
    scene.add.rectangle(cx, h / 2, w, h, bgColor);
    scene.add
      .rectangle(cx, h * 0.30, w * 0.90, h * 0.35, 0x101727)
      .setStrokeStyle(2, 0x24314a);
    scene.add
      .rectangle(cx, h * 0.70, w * 0.90, h * 0.40, 0x151d30)
      .setStrokeStyle(2, 0x24314a);

    // 招牌
    scene.add
      .rectangle(cx, h * 0.09, w * 0.55, 40, 0x1c2540, 1)
      .setStrokeStyle(2, 0xffc970);
    scene.add
      .text(cx, h * 0.09, title, {
        fontSize: "18px",
        color: "#ffe9b0",
      })
      .setOrigin(0.5, 0.5);

    // 回到小鎮
    const backBtn = scene.add
      .text(cx, h * 0.90, "← 回到小鎮地圖", {
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

    // 盆栽
    const potX = cx - w * 0.37;
    const potY = h * 0.62;
    scene.add.rectangle(potX, potY + 14, 20, 14, 0x6e4a2c);
    scene.add.circle(potX - 6, potY, 10, 0x3ca56d);
    scene.add.circle(potX + 4, potY - 6, 8, 0x3ca56d);

    // 室內主角（圓形）
    const player = scene.add.circle(cx, h * 0.70, 12, 0xf0b762);
    player.setStrokeStyle(2, 0x3a2a19);

    scene.indoorPlayer = player;
    scene.indoorTarget = null;

    scene.input.on("pointerdown", (pointer) => {
      const x = Phaser.Math.Clamp(pointer.x, cx - w * 0.42, cx + w * 0.42);
      const y = Phaser.Math.Clamp(pointer.y, h * 0.42, h * 0.82);
      scene.indoorTarget = { x, y };
    });
  }

  function updateIndoor(scene) {
    const p = scene.indoorPlayer;
    const t = scene.indoorTarget;
    if (!p || !t) return;

    const dx = t.x - p.x;
    const dy = t.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 2.0;

    if (dist < speed) {
      p.x = t.x;
      p.y = t.y;
      scene.indoorTarget = null;
    } else {
      p.x += (dx / dist) * speed;
      p.y += (dy / dist) * speed;
    }
  }

  // ---------- 門市室內 ----------
  class StoreInteriorScene extends Phaser.Scene {
    constructor() {
      super("StoreInteriorScene");
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;
      const cx = w / 2;

      createIndoorBase(this, { title: "C.H 門市櫃台" });

      // 櫃台
      const counter = this.add.rectangle(
        cx,
        h * 0.58,
        w * 0.70,
        h * 0.16,
        0x1f2940
      );
      counter.setStrokeStyle(2, 0xffc970);

      // 櫥窗
      const winX = cx;
      const winY = h * 0.32;
      this.add.rectangle(winX, winY, w * 0.60, h * 0.20, 0x151f33);
      this.add.rectangle(winX, winY - 30, w * 0.50, 4, 0x91b0ff);

      // 襯衫剪影
      this.add.rectangle(winX - 60, winY + 12, 32, 40, 0x2b3a55);
      // 洋裝剪影
      this.add.triangle(
        winX + 60,
        winY + 20,
        -20,
        24,
        20,
        24,
        0,
        -24,
        0x2b3a55
      );

      // 門市 NPC
      const npcSize = Math.min(w, h) * 0.13;
      const npc = this.add.image(cx, h * 0.50, "npc-cs");
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
        .text(cx, h * 0.40, "門市客服人員", {
          fontSize: "13px",
          color: "#d3ddff",
        })
        .setOrigin(0.5, 0.5);
    }

    update() {
      updateIndoor(this);
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
      const cx = w / 2;

      createIndoorBase(this, { title: "整燙 / 整理中心" });

      // 熨燙桌
      const table = this.add.rectangle(
        cx,
        h * 0.60,
        w * 0.72,
        h * 0.14,
        0x232c43
      );
      table.setStrokeStyle(2, 0x7fb4ff);

      // 熨斗剪影
      this.add.triangle(
        cx - 40,
        h * 0.56,
        -24,
        12,
        24,
        12,
        10,
        -12,
        0x7fb4ff
      );

      // 後方衣架
      const rackY = h * 0.32;
      this.add.rectangle(cx, rackY, w * 0.60, h * 0.20, 0x151f33);
      this.add.rectangle(cx, rackY - 28, w * 0.50, 4, 0x91b0ff);
      // 西裝外套
      this.add.rectangle(cx - 60, rackY + 4, 40, 56, 0x2b3a55);
      // 洋裝
      this.add.triangle(
        cx + 60,
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
      const npc = this.add.image(cx - 110, h * 0.56, "npc-ironing");
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
        .text(cx - 110, h * 0.44, "整燙師傅", {
          fontSize: "13px",
          color: "#d3ddff",
        })
        .setOrigin(0.5, 0.5);
    }

    update() {
      updateIndoor(this);
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
      const cx = w / 2;

      createIndoorBase(this, { title: "收送倉庫 / 排程區" });

      // 吊掛區
      const rackY = h * 0.32;
      this.add.rectangle(cx, rackY, w * 0.70, h * 0.22, 0x191f2d);
      this.add.rectangle(cx, rackY - 32, w * 0.60, 4, 0xffd48b);

      for (let i = -2; i <= 2; i++) {
        const x = cx + i * 40;
        this.add.rectangle(x, rackY + 10, 28, 44, 0x2b3a55);
      }

      // 箱子堆
      const baseY = h * 0.62;
      const boxColor = 0x8b5a2b;
      this.add.rectangle(cx - 60, baseY, 60, 40, boxColor);
      this.add.rectangle(cx, baseY + 6, 60, 40, boxColor);
      this.add.rectangle(cx + 60, baseY, 60, 40, boxColor);

      // 外送員 NPC
      const npcSize = Math.min(w, h) * 0.13;
      const npc = this.add.image(cx + 110, h * 0.60, "npc-delivery");
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
        .text(cx + 110, h * 0.48, "收送人員", {
          fontSize: "13px",
          color: "#d3ddff",
        })
        .setOrigin(0.5, 0.5);
    }

    update() {
      updateIndoor(this);
    }
  }

  // ---------- 啟動 Phaser ----------
  function boot() {
    const parentId = detectParentId();
    if (!parentId) {
      console.warn(
        "找不到 AI 小鎮容器 div，將直接掛在 <body>。若要指定位置，請在 HTML 加一個 id，例如 <div id=\"game-root\"></div>。"
      );
    } else {
      console.log("AI TOWN 掛載於容器 id =", parentId);
    }

    const width = parentId
      ? document.getElementById(parentId).clientWidth || 520
      : 520;
    const height = parentId
      ? document.getElementById(parentId).clientHeight || 520
      : 520;

    const config = {
      type: Phaser.AUTO,
      width,
      height,
      transparent: true,
      scene: [
        TownScene,
        StoreInteriorScene,
        IroningInteriorScene,
        DeliveryInteriorScene,
      ],
    };

    if (parentId) config.parent = parentId;

    // eslint-disable-next-line no-new
    new Phaser.Game(config);
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
