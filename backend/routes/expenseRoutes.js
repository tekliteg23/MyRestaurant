const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// ================= 📋 GET ALL =================
router.get("/", verifyToken, isAdmin, expenseController.getExpenses);

// ================= ➕ ADD =================

router.post("/", expenseController.addExpense);
//router.post("/", verifyToken, isAdmin, expenseController.addExpense);

// ================= ✏️ UPDATE =================
router.put("/:id", verifyToken, isAdmin, expenseController.updateExpense);

// ================= 🗑 DELETE =================
router.delete("/:id", verifyToken, isAdmin, expenseController.deleteExpense);

module.exports = router;