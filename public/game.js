// public/game.js
// C.H AI Town V2.0+V2.1：2D 圖片建築 + NPC 巡邏系統

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
      backgroundColor: "#1a1d2e", //稍微改深一點，讓 2D 圖比較跳
      scene: {
        preload,
        create,
        update,
      },
    };

    const game = new Phaser.Game(config);

    // === 1. 載入素材 (Preload) ===
    function preload() {
      const scene = this;
      
      // 設定讀取路徑
      scene.load.setPath('/images/');

      // 載入建築物 (請確保你有這些圖片，否則會顯示綠色缺圖方塊)
      scene.load.image('buildingStore', 'building-store.png');     // C.H 門市
      scene.load.image('buildingIroning', 'building-ironing.png'); // 整燙中心
      scene.load.image('buildingDelivery', 'building-delivery.png'); // 收送倉庫

      // 載入 NPC
      scene.load.image('npcCs', 'npc-cs.png');           // 客服
      scene.load.image('npcIroning', 'npc-ironing.png'); // 師傅
      scene.load.image('npcDelivery', 'npc-delivery.png'); // 外送員
    }

    function create() {
      const scene = this;
      const w = scene.scale.width;
      const h = scene.scale.height;
      const centerX = w / 2;

      // --- 地圖背景 ---
      // 地板
      scene.add.rectangle(centerX, h/2, w, h, 0x2b3045).setDepth(0);
      
      // 馬路 (簡單畫，未來可用圖片取代)
      const roadColor = 0x1e2130;
      scene.add.rectangle(centerX, h/2, w * 0.12, h, roadColor).setDepth(1); // 垂直路
      scene.add.rectangle(centerX, h * 0.45, w, w * 0.12, roadColor).setDepth(1); // 水平路

      // --- 工廠函式：建立 2D 建築 ---
      function createImageBuilding(key, x, y, scale, roleId) {
        const b = scene.add.image(x, y, key);
        b.setDepth(10); // 確保在馬路上面
        
        // 自動縮放：依照畫面寬度調整 (讓房子大約佔畫面的 1/4 寬)
        const targetWidth = w * 0.28;
        const scaleFactor = targetWidth / b.width; 
        b.setScale(scaleFactor * scale); // 乘上額外參數微調

        b.setInteractive({ useHandCursor: true });

        // 點擊效果
        b.on('pointerdown', () => {
          // 縮放動畫
          scene.tweens.add({
            targets: b,
            scaleX: b.scaleX * 0.95,
            scaleY: b.scaleY * 0.95,
            yoyo: true,
            duration: 100
          });
          // 切換角色
          if (window.chTownSwitchRoleFromMap) {
            window.chTownSwitchRoleFromMap(roleId);
          }
        });
        
        return b; // 回傳物件以便後續取得位置
      }

      // --- 建立三棟房子 ---
      // 1. 門市 (左上)
      const store = createImageBuilding('buildingStore', centerX - w * 0.25, h * 0.25, 1.0, 'chCustomerService');
      
      // 2. 整燙 (右上)
      const ironing = createImageBuilding('buildingIroning', centerX + w * 0.25, h * 0.25, 1.0, 'ironingMaster');

      // 3. 倉庫 (左下)
      const delivery = createImageBuilding('buildingDelivery', centerX - w * 0.25, h * 0.7, 1.1, 'deliveryStaff');


      // --- 工廠函式：建立 NPC (會走路) ---
      function createNPC(key, x, y) {
        const npc = scene.add.image(x, y, key);
        npc.setDepth(15); // 在房子前面
        
        // 大小調整 (約 50px 寬)
        const targetSize = 50;
        npc.setScale(targetSize / npc.width);

        // 走路動畫 (左右來回)
        scene.tweens.add({
          targets: npc,
          x: x + 30, // 往右走 30px
          duration: 2000 + Math.random() * 1000, // 隨機時間比較自然
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: Math.random() * 1000 // 隨機延遲起步
        });

        // 簡單的呼吸效果 (看起來像活的)
        scene.tweens.add({
          targets: npc,
          scaleY: npc.scaleY * 0.95,
          yoyo: true,
          repeat: -1,
          duration: 500
        });
      }

      // --- 放置 NPC (放在建築物門口附近) ---
      // 雖然 store.x 是中心點，我們往下加一點 y 讓它站在門口
      createNPC('npcCs', store.x, store.y + h * 0.12); 
      createNPC('npcIroning', ironing.x, ironing.y + h * 0.12);
      createNPC('npcDelivery', delivery.x + 20, delivery.y + h * 0.12); // 外送員稍微偏一點


      // --- 主角 (玩家) ---
      const player = scene.add.circle(centerX, h * 0.55, 10, 0xff6b81).setDepth(20);
      scene.player = player;
      scene.playerTarget = null;

      // 點擊移動邏輯
      scene.input.on("pointerdown", (pointer) => {
        // 忽略點擊到房子時的觸發 (讓房子自己處理點擊)
        if (pointer.y < h * 0.1) return; 

        scene.playerTarget = { x: pointer.x, y: pointer.y };
      });

      scene.cursors = scene.input.keyboard.createCursorKeys();
    }

    function update(time, delta) {
      const scene = this;
      const player = scene.player;
      if (!player) return;

      const speed = 0.25 * delta;
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
        if (dist < 4) {
          scene.playerTarget = null;
        } else {
          player.x += (dx / dist) * speed;
          player.y += (dy / dist) * speed;
        }
      }
    }
    
    // RWD
    window.addEventListener("resize", () => {
      const r = root.getBoundingClientRect();
      game.scale.resize(r.width, r.height);
    });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 0);
  } else {
    window.addEventListener("DOMContentLoaded", boot);
  }
})();
