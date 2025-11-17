const express = require("express");
const router = express.Router();

const chCustomerService = require("./roles/chCustomerService");
const storeManager = require("./roles/storeManager");
const cleanerMaster = require("./roles/cleanerMaster");
const ironingMaster = require("./roles/ironingMaster");
const deliveryStaff = require("./roles/deliveryStaff");

const roleMap = {
  ch_customer_service: chCustomerService,
  store_manager: storeManager,
  cleaner_master: cleanerMaster,
  ironing_master: ironingMaster,
  delivery_staff: deliveryStaff
};

router.post("/chat", async (req, res) => {
  try {
    const { userId, roleId, message } = req.body;

    if (!roleId || !message)
      return res.status(400).json({ error: "Missing roleId or message" });

    const roleFn = roleMap[roleId];
    if (!roleFn) return res.status(400).json({ error: "Invalid roleId" });

    const reply = await roleFn(message, userId);
    return res.json(reply);

  } catch (err) {
    console.error("[ERROR /chat]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/roles", (req, res) => {
  res.json({
    roles: [
      { id: "ch_customer_service", name: "C.H 客服" },
      { id: "store_manager", name: "店長" },
      { id: "cleaner_master", name: "清潔師傅" },
      { id: "ironing_master", name: "熨燙師傅" },
      { id: "delivery_staff", name: "外送員" }
    ]
  });
});

module.exports = router;
