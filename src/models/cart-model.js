const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: [true, "Product is required"]
        },

        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Variant is required"]
        },

        sku: {
            type: String,
            required: [true, "SKU is required"],
            trim: true
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"]
        }
    },
    {
        _id: true
    }
);


const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "User is required"],
            unique: true
        },

        items: {
            type: [cartItemSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("cart", cartSchema);