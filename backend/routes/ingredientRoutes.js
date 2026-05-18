const express = require("express");
const router = express.Router();

const {
  getAllIngredients,
  addIngredient,
  updateIngredient,
  deleteIngredient
} = require("../controllers/ingredientController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// ================= 📦 GET ALL =================
router.get("/", verifyToken, isAdmin, getAllIngredients);

// ================= ➕ CREATE =================
router.post("/", verifyToken, isAdmin, addIngredient);

// ================= ✏️ UPDATE =================
router.put("/:id", verifyToken, isAdmin, updateIngredient);

// ================= 🗑 DELETE =================
router.delete("/:id", verifyToken, isAdmin, deleteIngredient);

module.exports = router;