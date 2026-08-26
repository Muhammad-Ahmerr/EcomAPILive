const mongoose = require("mongoose");


// ======================================================
// REVIEW
// ======================================================

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "User is required"]
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: [true, "Product is required"]
        },

        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"]
        },

        comment: {
            type: String,
            required: [true, "Comment is required"],
            trim: true,
            minlength: [3, "Comment must be at least 3 characters"],
            maxlength: [1000, "Comment cannot exceed 1000 characters"]
        }
    },
    {
        timestamps: true
    }
);


// ======================================================
// ONE REVIEW PER USER PER PRODUCT
// ======================================================

reviewSchema.index(
    {
        user: 1,
        product: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model("review", reviewSchema);