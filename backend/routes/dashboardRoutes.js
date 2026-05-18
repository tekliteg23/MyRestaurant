const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// 👮 ADMIN ONLY DASHBOARD
router.get("/summary", verifyToken, isAdmin, dashboardController.getSummary);

router.get("/monthly-profit", verifyToken, isAdmin, dashboardController.getMonthlyProfit);

module.exports = router;