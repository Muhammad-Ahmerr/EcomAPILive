const express = require("express");

const router = express.Router();

const wishlistController = require("../controllers/wishlist-controller");

const { authMiddleware } = require("../middleware/auth-middleware");


// ======================================================
// WISHLIST
// ======================================================

// Get current user's wishlist
router.get(
    "/",
    authMiddleware,
    wishlistController.getWishlist
);


// Add product to wishlist
router.post(
    "/:productId",
    authMiddleware,
    wishlistController.addToWishlist
);



// Clear entire wishlist
router.delete(
    "/",
    authMiddleware,
    wishlistController.clearWishlist
);

// Remove product from wishlist
router.delete(
    "/:productId",
    authMiddleware,
    wishlistController.removeFromWishlist
);
module.exports = router;