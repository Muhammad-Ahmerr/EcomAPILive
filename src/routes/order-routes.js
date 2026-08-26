const express = require("express");

const router = express.Router();

const orderController = require("../controllers/order-controller");

const { authMiddleware } = require("../middleware/auth-middleware");
const { adminMiddleware } = require("../middleware/admin-middleware");


// ==========================================
// CUSTOMER
// ==========================================

router.post(
    "/",
    authMiddleware,
    orderController.createOrder
);

router.get(
    "/my-orders",
    authMiddleware,
    orderController.getMyOrders
);

router.get(
    "/:id",
    authMiddleware,
    orderController.getMyOrderById
);

router.patch(
    "/:id/cancel",
    authMiddleware,
    orderController.cancelMyOrder
);


// ==========================================
// ADMIN
// ==========================================

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    orderController.getAllOrders
);

router.patch(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    orderController.updateOrderStatus
);

router.patch(
    "/:id/payment-status",
    authMiddleware,
    adminMiddleware,
    orderController.updatePaymentStatus
);

module.exports = router;