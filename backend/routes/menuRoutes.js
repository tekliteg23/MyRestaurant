const express = require("express");
const router = express.Router();

const controller = require("../controllers/menuController");

const {
  verifyToken,
  isAdmin
} = require("../middleware/authMiddleware");

const upload = require("../config/upload");


// ================= MENU ROUTES =================

// ✅ PUBLIC → View Menu
router.get("/", controller.getMenu);


// ✅ ADMIN → Add Menu Item
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  controller.addMenuItem
);


// ✅ ADMIN → Update Menu Item
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  controller.updateMenuItem
);


// ✅ ADMIN → Delete Menu Item
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  controller.deleteMenuItem
);

module.exports = router;