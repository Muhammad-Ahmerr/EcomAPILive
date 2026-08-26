const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
            maxlength: [150, "Name cannot exceed 150 characters"]
        },

        images: {
            type: [String],
            default: []
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: [20, "Description must be at least 20 characters"],
            maxlength: [2000, "Description cannot exceed 2000 characters"]
        },

        rating: {
            type: Number,
            min: [0, "Rating cannot be below 0"],
            max: [5, "Rating cannot exceed 5"],
            default: 0
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            enum: {
                values: [
                    "mobile",
                    "laptop",
                    "computer",
                    "accessories",
                    "watch"
                ],
                message: "{VALUE} is not a supported category"
            }
        },

        company: {
            type: String,
            required: [true, "Company is required"],
            enum: {
                values: [
                    "apple",
                    "samsung",
                    "dell",
                    "mi",
                    "nokia"
                ],
                message: "{VALUE} is not a supported company"
            }
        },

        variants: [
            {
                color: {
                    type: String,
                    trim: true
                },

                size: {
                    type: String,
                    trim: true
                },

                price: {
                    type: Number,
                    required: [true, "Variant price is required"],
                    min: [0, "Variant price cannot be negative"]
                },

                stock: {
                    type: Number,
                    required: [true, "Variant stock is required"],
                    min: [0, "Stock cannot be negative"],
                    default: 0
                },

                sku: {
                    type: String,
                    required: [true, "SKU is required"],
                    trim: true,
                    uppercase: true
                }
            }
        ],

        featured: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("product", productSchema);