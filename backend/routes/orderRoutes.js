const express = require("express");

const router = express.Router();

const orderController =
  require("../controllers/orderController");

const {
  verifyToken,
  isAdmin
} = require("../middleware/authMiddleware");


// ================= CUSTOMER ROUTES =================


// CREATE ORDER
router.post(
  "/",
  verifyToken,
  orderController.createOrder
);


// GET MY ORDERS
router.get(
  "/my-orders",
  verifyToken,
  orderController.getMyOrders
);
router.get(
"/:id",
verifyToken,
orderController.getSingleOrder
);

// DELETE MY PENDING ORDER
router.delete(
  "/my-orders/:id",
  verifyToken,
  orderController.deleteMyOrder
);


// CONFIRM ORDER RECEIVED
router.put(
  "/:id/confirm",
  verifyToken,
  orderController.confirmOrder
);


// ================= ADMIN ROUTES =================


// GET ALL ORDERS
router.get(
  "/",
  verifyToken,
  isAdmin,
  orderController.getOrders
);


// UPDATE ORDER STATUS
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  orderController.updateOrderStatus
);


// ADMIN DELETE ORDER
router.delete(
  "/admin/:id",
  verifyToken,
  isAdmin,
  orderController.deleteOrder
);


module.exports = router;