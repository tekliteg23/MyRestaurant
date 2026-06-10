const express = require("express");

const router = express.Router();

const paymentController =
  require("../controllers/paymentController");

// ================= INITIALIZE =================
router.post(
  "/initialize",
  paymentController.initializePayment
);

// ================= PAY EXISTING ORDER =================
router.post(
  "/initialize/:orderId",
  paymentController.initializePayment
);

// ================= VERIFY =================
router.get(
  "/verify/:tx_ref",
  paymentController.verifyPayment
);

module.exports = router;