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

    const role = roleMap[roleId];
    if (!role) {
      return res.status(400).json({ error: "Invalid roleId" });
    }

    const reply = await role(message, userId);
    return res.json(reply);

  } catch (err) {
    console.error("[ERROR] /api/chat:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
