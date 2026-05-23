const express = require("express");
const router = express.Router();

const dashboardController =
  require("../controllers/dashboardController");

const {
  verifyToken,
  isAdmin
} = require("../middleware/authMiddleware");

// ================= ADMIN DASHBOARD SUMMARY =================

router.get(
  "/summary",
  verifyToken,
  isAdmin,
  dashboardController.getSummary
);

// ================= DASHBOARD STATS =================
// ✅ Added compatibility route

router.get(
  "/stats",
  verifyToken,
  isAdmin,
  dashboardController.getSummary
);

// ================= MONTHLY PROFIT =================

router.get(
  "/monthly-profit",
  verifyToken,
  isAdmin,
  dashboardController.getMonthlyProfit
);

module.exports = router;