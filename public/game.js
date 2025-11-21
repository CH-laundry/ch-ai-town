/* ===========================================================
 *  C.H AI TOWN — Phaser 小鎮主程式（完整版本）
 * ===========================================================
 */

window.CHTown = {
  phaserGame: null,
  scene: null,
  initTown() {
    const config = {
      type: Phaser.AUTO,
      parent: "game-root",
      width: "100%",
      height: "100%",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      transparent: true,
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    this.phaserGame = new Phaser.Game(config);
  },
};

/* -----------------------------------------------------------
 * preload：載入圖片
 * ----------------------------------------------------------- */
function preload() {
  this.load.image("store-ch", "/images/store_ch.png");
  this.load.image("store-iron", "/images/store_iron.png");
  this.load.image("store-delivery", "/images/store_delivery.png");

  this.load.image("road-h", "/images/road_h.png");
  this.load.image("road-v", "/images/road_v.png");

  // 主角（你可以之後換成自己的角色圖）
  this.load.image("player", "/images/player.png");
}

/* -----------------------------------------------------------
 * create：生成小鎮場景
 * ----------------------------------------------------------- */
function create() {
  const scene = this;
  CHTown.scene = scene;

  const w = scene.scale.width;
  const h = scene.scale.height;

  const centerX = w * 0.5;
  const centerY = h * 0.5;

  /* --------------------- 道路 --------------------- */
  const roadV = scene.add.image(centerX, centerY, "road-v").setOrigin(0.5);
  roadV.displayHeight = h * 0.8;
  roadV.displayWidth = roadV.width * (roadV.displayHeight / roadV.height);

  const roadH = scene.add.image(centerX, centerY, "road-h").setOrigin(0.5);
  roadH.displayWidth = w * 0.9;
  roadH.displayHeight = roadH.height * (roadH.displayWidth / roadH.width);

  /* --------------------- 建築物 --------------------- */

  // C.H 門市（左上）
  const storeCh = createBuilding(
    scene,
    centerX - w * 0.22,
    centerY - h * 0.22,
    "store-ch",
    "cs"
  );

  // 整燙 / 整理（右上）
  const storeIron = createBuilding(
    scene,
    centerX + w * 0.22,
    centerY - h * 0.22,
    "store-iron",
    "iron"
  );

  // 收送倉庫（左下）
  const storeDelivery = createBuilding(
    scene,
    centerX - w * 0.22,
    centerY + h * 0.22,
    "store-delivery",
    "delivery"
  );

  /* --------------------- 主角（自動縮放，不會撐爆畫面） --------------------- */
  const startX = centerX + w * 0.1;
  const startY = centerY + h * 0.1;

  // 主角人物
  const playerSprite = scene.add.image(0, 0, "player");
  playerSprite.setOrigin(0.5, 1);

  // ★核心：主角自動縮放 — 不會像剛剛那樣放大爆畫面
  const targetHeight = h * 0.13; // 主角高度 ≈ 地圖的 13%
  const scale = targetHeight / playerSprite.height;
  playerSprite.setScale(scale);

  // 主角容器（為了能夠套陰影、碰撞）
  const player = scene.add.container(startX, startY, [playerSprite]);
  player.setDepth(20);

  scene.player = player;
  scene.playerTarget = null;

  /* --------------------- 點擊地圖移動 --------------------- */
  scene.input.on("pointerdown", (pointer) => {
    const { worldX, worldY } = pointer;
    scene.playerTarget = { x: worldX, y: worldY };
  });

  /* --------------------- 鍵盤移動 --------------------- */
  scene.keys = scene.input.keyboard.addKeys({
    up: "W",
    down: "S",
    left: "A",
    right: "D",
    up2: "UP",
    down2: "DOWN",
    left2: "LEFT",
    right2: "RIGHT",
  });

  /* --------------------- 建築按下 → 切換右側角色 --------------------- */
  function createBuilding(scene, x, y, key, role) {
    const img = scene.add.image(x, y, key).setInteractive();
    img.setScale(0.85);

    img.on("pointerdown", () => {
      window.setActiveRole(role); // ← 右邊對話視窗角色切換
    });

    return img;
  }
}

/* -----------------------------------------------------------
 * update：更新（移動邏輯）
 * ----------------------------------------------------------- */
function update() {
  const scene = this;
  if (!scene.player) return;

  const speed = 3.2;
  let moved = false;

  const keys = scene.keys;
  const p = scene.player;

  /* ----- 鍵盤移動 ----- */
  if (keys.left.isDown || keys.left2.isDown) {
    p.x -= speed;
    moved = true;
  }
  if (keys.right.isDown || keys.right2.isDown) {
    p.x += speed;
    moved = true;
  }
  if (keys.up.isDown || keys.up2.isDown) {
    p.y -= speed;
    moved = true;
  }
  if (keys.down.isDown || keys.down2.isDown) {
    p.y += speed;
    moved = true;
  }

  /* ----- 點擊移動 ----- */
  if (scene.playerTarget && !moved) {
    const dx = scene.playerTarget.x - p.x;
    const dy = scene.playerTarget.y - p.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 6) {
      scene.playerTarget = null;
    } else {
      p.x += (dx / dist) * speed * 1.1;
      p.y += (dy / dist) * speed * 1.1;
    }
  }
}
