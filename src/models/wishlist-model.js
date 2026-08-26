const mongoose = require("mongoose");


// ======================================================
// WISHLIST
// ======================================================

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "User is required"],
            unique: true
        },

        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product"
            }
        ]
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("wishlist", wishlistSchema);