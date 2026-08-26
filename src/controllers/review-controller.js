const reviewModel = require("../models/review-model");
const productModel = require("../models/products-model");
const orderModel = require("../models/order-model");


// ======================================================
// GET PRODUCT REVIEWS
// ======================================================

exports.getProductReviews = async (req, res) => {

    try {

        const { productId } = req.params;


        // ----------------------------------------------
        // Check product exists
        // ----------------------------------------------

        const product = await productModel.findById(productId);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        // ----------------------------------------------
        // Get reviews
        // ----------------------------------------------

        const reviews = await reviewModel
            .find({
                product: productId
            })
            .populate("user", "username")
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            count: reviews.length,

            reviews

        });


    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// ======================================================
// CREATE REVIEW
// ======================================================

exports.createReview = async (req, res) => {

    try {

        const { productId } = req.params;

        const {
            rating,
            comment
        } = req.body;


        // ----------------------------------------------
        // Validate rating
        // ----------------------------------------------

        if (
            rating === undefined ||
            rating === null ||
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {

            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }


        // ----------------------------------------------
        // Validate comment
        // ----------------------------------------------

        if (
            !comment ||
            typeof comment !== "string" ||
            comment.trim().length < 3
        ) {

            return res.status(400).json({
                success: false,
                message: "Comment must be at least 3 characters"
            });
        }


        // ----------------------------------------------
        // Check product exists
        // ----------------------------------------------

        const product = await productModel.findById(productId);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        // ----------------------------------------------
        // Check whether user already reviewed product
        // ----------------------------------------------

        const existingReview = await reviewModel.findOne({
            user: req.user.id,
            product: productId
        });


        if (existingReview) {

            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }


        // ----------------------------------------------
        // Check whether user purchased product
        // ----------------------------------------------

        const deliveredOrder = await orderModel.findOne({
            user: req.user.id,
            orderStatus: "delivered",
            "items.product": productId
        });


        if (!deliveredOrder) {

            return res.status(403).json({
                success: false,
                message: "You can only review products you have purchased and received"
            });
        }


        // ----------------------------------------------
        // Create review
        // ----------------------------------------------

        const review = await reviewModel.create({

            user: req.user.id,

            product: productId,

            rating: Number(rating),

            comment: comment.trim()

        });


        // ----------------------------------------------
        // Update product rating
        // ----------------------------------------------

        const ratingStats = await reviewModel.aggregate([
            {
                $match: {
                    product: product._id
                }
            },
            {
                $group: {
                    _id: "$product",
                    averageRating: {
                        $avg: "$rating"
                    },
                    reviewCount: {
                        $sum: 1
                    }
                }
            }
        ]);


        if (ratingStats.length > 0) {

            product.rating = Number(
                ratingStats[0].averageRating.toFixed(1)
            );

            await product.save();
        }


        // ----------------------------------------------
        // Populate user
        // ----------------------------------------------

        await review.populate(
            "user",
            "username"
        );


        return res.status(201).json({

            success: true,

            message: "Review created successfully",

            review

        });


    } catch (error) {

        console.log(error);

        // Duplicate compound index protection
        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }


        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// ======================================================
// UPDATE REVIEW
// ======================================================

exports.updateReview = async (req, res) => {

    try {

        const { reviewId } = req.params;

        const {
            rating,
            comment
        } = req.body;


        // ----------------------------------------------
        // Validate rating
        // ----------------------------------------------

        if (
            rating === undefined ||
            rating === null ||
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {

            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }


        // ----------------------------------------------
        // Validate comment
        // ----------------------------------------------

        if (
            !comment ||
            typeof comment !== "string" ||
            comment.trim().length < 3
        ) {

            return res.status(400).json({
                success: false,
                message: "Comment must be at least 3 characters"
            });
        }


        // ----------------------------------------------
        // Find user's review
        // ----------------------------------------------

        const review = await reviewModel.findOne({
            _id: reviewId,
            user: req.user.id
        });


        if (!review) {

            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }


        // ----------------------------------------------
        // Update review
        // ----------------------------------------------

        review.rating = Number(rating);

        review.comment = comment.trim();


        await review.save();


        // ----------------------------------------------
        // Recalculate product rating
        // ----------------------------------------------

        const ratingStats = await reviewModel.aggregate([
            {
                $match: {
                    product: review.product
                }
            },
            {
                $group: {
                    _id: "$product",
                    averageRating: {
                        $avg: "$rating"
                    },
                    reviewCount: {
                        $sum: 1
                    }
                }
            }
        ]);


        const product = await productModel.findById(
            review.product
        );


        if (product && ratingStats.length > 0) {

            product.rating = Number(
                ratingStats[0].averageRating.toFixed(1)
            );

            await product.save();
        }


        await review.populate(
            "user",
            "username"
        );


        return res.status(200).json({

            success: true,

            message: "Review updated successfully",

            review

        });


    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// ======================================================
// DELETE REVIEW
// ======================================================

exports.deleteReview = async (req, res) => {

    try {

        const { reviewId } = req.params;


        // ----------------------------------------------
        // Find user's review
        // ----------------------------------------------

        const review = await reviewModel.findOne({
            _id: reviewId,
            user: req.user.id
        });


        if (!review) {

            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }


        const productId = review.product;


        // ----------------------------------------------
        // Delete review
        // ----------------------------------------------

        await review.deleteOne();


        // ----------------------------------------------
        // Recalculate product rating
        // ----------------------------------------------

        const ratingStats = await reviewModel.aggregate([
            {
                $match: {
                    product: productId
                }
            },
            {
                $group: {
                    _id: "$product",
                    averageRating: {
                        $avg: "$rating"
                    }
                }
            }
        ]);


        const product = await productModel.findById(
            productId
        );


        if (product) {

            if (ratingStats.length > 0) {

                product.rating = Number(
                    ratingStats[0].averageRating.toFixed(1)
                );

            } else {

                // No reviews remain
                product.rating = 0;
            }


            await product.save();
        }


        return res.status(200).json({

            success: true,

            message: "Review deleted successfully"

        });


    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};