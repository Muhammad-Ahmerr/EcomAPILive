const express = require("express");

const router = express.Router();

const reviewController = require("../controllers/review-controller");

const { authMiddleware } = require("../middleware/auth-middleware");


// ======================================================
// REVIEWS
// ======================================================

// Get all reviews for a product
// Public endpoint
router.get(
    "/product/:productId",
    reviewController.getProductReviews
);


// Create review
// Customer must be authenticated
router.post(
    "/product/:productId",
    authMiddleware,
    reviewController.createReview
);


// Update own review
router.patch(
    "/:reviewId",
    authMiddleware,
    reviewController.updateReview
);


// Delete own review
router.delete(
    "/:reviewId",
    authMiddleware,
    reviewController.deleteReview
);


module.exports = router;