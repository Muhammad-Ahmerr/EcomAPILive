const mongoose = require("mongoose");


// ======================================================
// ORDER ITEM
// ======================================================

const orderItemSchema = new mongoose.Schema(
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

        name: {
            type: String,
            required: [true, "Product name is required"]
        },

        image: {
            type: String,
            default: ""
        },

        color: {
            type: String,
            default: ""
        },

        size: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: 0
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: 1
        },

        subtotal: {
            type: Number,
            required: [true, "Subtotal is required"],
            min: 0
        }
    }
);


// ======================================================
// SHIPPING ADDRESS
// ======================================================

const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },

        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },

        state: {
            type: String,
            default: "",
            trim: true
        },

        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true
        },

        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true
        }
    },
    {
        _id: false
    }
);


// ======================================================
// ORDER
// ======================================================

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "User is required"]
        },
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        items: {
            type: [orderItemSchema],
            required: [true, "Order items are required"],
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Order must contain at least one item"
            }
        },

        shippingAddress: {
            type: shippingAddressSchema,
            required: true
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        shippingFee: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        total: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: {
                values: ["cod"],
                message: "{VALUE} is not a supported payment method"
            },
            default: "cod"
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid"
            ],
            default: "pending"
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("order", orderSchema);