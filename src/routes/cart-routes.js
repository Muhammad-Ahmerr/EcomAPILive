const express = require("express");

const router = express.Router();

const cartController = require("../controllers/cart-controller");

const { authMiddleware } = require("../middleware/auth-middleware");


// Get current user's cart
router.get(
    "/",
    authMiddleware,
    cartController.getCart
);


// Add item to cart
router.post(
    "/",
    authMiddleware,
    cartController.addToCart
);


// Update cart item quantity
router.patch(
    "/:itemId",
    authMiddleware,
    cartController.updateCartItem
);


// Remove item from cart
router.delete(
    "/:itemId",
    authMiddleware,
    cartController.removeCartItem
);


// Clear entire cart
router.delete(
    "/",
    authMiddleware,
    cartController.clearCart
);


module.exports = router;