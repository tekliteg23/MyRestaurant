const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// ================= AUTH ROUTES =================

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

router.put("/reset-password", authController.resetPassword);

module.exports = router;