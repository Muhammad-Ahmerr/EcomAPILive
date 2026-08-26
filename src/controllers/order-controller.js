const mongoose = require("mongoose");
const cartModel = require("../models/cart-model");
const productModel = require("../models/products-model");
const orderModel = require("../models/order-model");

const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);

    return `ORD-${timestamp}-${random}`;
};
// ======================================================
// CREATE ORDER
// ======================================================

exports.createOrder = async (req, res) => {

    const mongoSession = await mongoose.startSession();

    try {

        const { shippingAddress } = req.body;


        // ==========================================
        // VALIDATE SHIPPING ADDRESS
        // ==========================================

        if (
            !shippingAddress ||
            !shippingAddress.fullName ||
            !shippingAddress.phone ||
            !shippingAddress.address ||
            !shippingAddress.city ||
            !shippingAddress.postalCode ||
            !shippingAddress.country
        ) {
            return res.status(400).json({
                success: false,
                message: "Complete shipping address is required"
            });
        }


        // ==========================================
        // START TRANSACTION
        // ==========================================

        mongoSession.startTransaction();


        // ==========================================
        // GET USER CART
        // ==========================================

        const cart = await cartModel
            .findOne({
                user: req.user.id
            })
            .session(mongoSession);


        if (!cart || cart.items.length === 0) {

            await mongoSession.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }


        const orderItems = [];

        let subtotal = 0;


        // ==========================================
        // PROCESS CART ITEMS
        // ==========================================

        for (const cartItem of cart.items) {

            const product = await productModel
                .findById(cartItem.product)
                .session(mongoSession);


            if (!product) {
                throw new Error(
                    `Product not found: ${cartItem.product}`
                );
            }


            // ======================================
            // FIND SELECTED VARIANT
            // ======================================

            const variant = product.variants.id(
                cartItem.variantId
            );


            if (!variant) {
                throw new Error(
                    `Variant not found for ${product.name}`
                );
            }


            // ======================================
            // CHECK STOCK
            // ======================================

            if (variant.stock < cartItem.quantity) {

                throw new Error(
                    `${product.name} (${variant.sku}) has only ${variant.stock} item(s) available`
                );
            }


            // ======================================
            // CALCULATE ITEM SUBTOTAL
            // ======================================

            const itemSubtotal =
                variant.price * cartItem.quantity;


            subtotal += itemSubtotal;


            // ======================================
            // CREATE ORDER ITEM SNAPSHOT
            // ======================================

            orderItems.push({

                product: product._id,

                variantId: variant._id,

                sku: variant.sku,

                name: product.name,

                image: product.images?.[0] || "",

                color: variant.color || "",

                size: variant.size || "",

                price: variant.price,

                quantity: cartItem.quantity,

                subtotal: itemSubtotal

            });


            // ======================================
            // REDUCE STOCK
            // ======================================

            variant.stock -= cartItem.quantity;


            await product.save({
                session: mongoSession
            });
        }


        // ==========================================
        // SHIPPING FEE
        // ==========================================

        const shippingFee = subtotal >= 100 ? 0 : 10;


        // ==========================================
        // TOTAL
        // ==========================================

        const total = subtotal + shippingFee;


        // ==========================================
        // CREATE COD ORDER
        // ==========================================

        const [order] = await orderModel.create(
            [
                {
                    user: req.user.id,

                    orderNumber: generateOrderNumber(),

                    items: orderItems,

                    shippingAddress,

                    subtotal,

                    shippingFee,

                    total,

                    paymentMethod: "cod",

                    paymentStatus: "pending",

                    orderStatus: "pending"
                }
            ],
            {
                session: mongoSession
            }
        );


        // ==========================================
        // CLEAR CART
        // ==========================================

        cart.items = [];

        await cart.save({
            session: mongoSession
        });


        // ==========================================
        // COMMIT TRANSACTION
        // ==========================================

        await mongoSession.commitTransaction();


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message: "Order created successfully",

            order

        });


    } catch (error) {

        console.log(error);


        // Only abort if transaction is still active
        if (mongoSession.inTransaction()) {
            await mongoSession.abortTransaction();
        }


        return res.status(400).json({

            success: false,

            message: error.message || "Unable to create order"

        });


    } finally {

        await mongoSession.endSession();

    }
};


// ======================================================
// GET MY ORDERS
// ======================================================

exports.getMyOrders = async (req, res) => {

    try {

        const orders = await orderModel
            .find({
                user: req.user.id
            })
            .sort("-createdAt");


        return res.status(200).json({

            success: true,

            count: orders.length,

            orders

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
// GET MY ORDER BY ID
// ======================================================

exports.getMyOrderById = async (req, res) => {

    try {

        const { id } = req.params;


        const order = await orderModel.findOne({

            _id: id,

            user: req.user.id

        });


        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });
        }


        return res.status(200).json({

            success: true,

            order

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
// GET ALL ORDERS
// ADMIN ONLY
// ======================================================

exports.getAllOrders = async (req, res) => {

    try {

        const orders = await orderModel
            .find()
            .populate("user", "username email")
            .sort("-createdAt");


        return res.status(200).json({

            success: true,

            count: orders.length,

            orders

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
// UPDATE ORDER STATUS
// ADMIN ONLY
// ======================================================
// ======================================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// ======================================================

exports.updateOrderStatus = async (req, res) => {

    const mongoSession = await mongoose.startSession();

    try {

        const { id } = req.params;
        const { orderStatus } = req.body;


        // ==========================================
        // VALIDATE STATUS
        // ==========================================

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(orderStatus)) {

            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }


        // ==========================================
        // START TRANSACTION
        // ==========================================

        mongoSession.startTransaction();


        // ==========================================
        // FIND ORDER
        // ==========================================

        const order = await orderModel
            .findById(id)
            .session(mongoSession);


        if (!order) {

            await mongoSession.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }


        // ==========================================
        // PREVENT CHANGING CANCELLED ORDER
        // ==========================================

        if (order.orderStatus === "cancelled") {

            await mongoSession.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Cancelled order cannot be updated"
            });
        }


        // ==========================================
        // ORDER STATUS TRANSITIONS
        // ==========================================

        const allowedTransitions = {

            pending: [
                "confirmed",
                "cancelled"
            ],

            confirmed: [
                "processing",
                "cancelled"
            ],

            processing: [
                "shipped",
                "cancelled"
            ],

            shipped: [
                "delivered"
            ],

            delivered: [],

            cancelled: []

        };


        const currentStatus = order.orderStatus;

        const nextStatuses = allowedTransitions[currentStatus];


        if (!nextStatuses.includes(orderStatus)) {

            await mongoSession.abortTransaction();

            return res.status(400).json({
                success: false,
                message: `Cannot change order status from "${currentStatus}" to "${orderStatus}"`
            });
        }


        // ==========================================
        // CANCEL ORDER
        // RESTORE STOCK
        // ==========================================

        if (orderStatus === "cancelled") {

            for (const item of order.items) {

                const product = await productModel
                    .findById(item.product)
                    .session(mongoSession);


                if (!product) {

                    throw new Error(
                        `Product not found: ${item.product}`
                    );
                }


                const variant = product.variants.id(
                    item.variantId
                );


                if (!variant) {

                    throw new Error(
                        `Variant not found: ${item.variantId}`
                    );
                }


                // Restore stock
                variant.stock += item.quantity;


                await product.save({
                    session: mongoSession
                });
            }
        }


        // ==========================================
        // UPDATE ORDER STATUS
        // ==========================================

        order.orderStatus = orderStatus;


        await order.save({
            session: mongoSession
        });


        // ==========================================
        // COMMIT TRANSACTION
        // ==========================================

        await mongoSession.commitTransaction();


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message: "Order status updated successfully",

            order

        });


    } catch (error) {

        console.log(error);


        if (mongoSession.inTransaction()) {
            await mongoSession.abortTransaction();
        }


        return res.status(500).json({

            success: false,

            message: error.message || "Server error"

        });


    } finally {

        await mongoSession.endSession();

    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { paymentStatus } = req.body;


        // ==========================================
        // ONLY ALLOW PENDING → PAID
        // ==========================================

        if (paymentStatus !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Payment can only be marked as paid"
            });
        }


        // ==========================================
        // FIND ORDER
        // ==========================================

        const order = await orderModel.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }


        // ==========================================
        // ONLY COD
        // ==========================================

        if (order.paymentMethod !== "cod") {
            return res.status(400).json({
                success: false,
                message: "This order is not a COD order"
            });
        }


        // ==========================================
        // CANCELLED ORDER
        // ==========================================

        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cancelled order payment cannot be updated"
            });
        }


        // ==========================================
        // ALREADY PAID
        // ==========================================

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order payment is already marked as paid"
            });
        }


        // ==========================================
        // UPDATE PAYMENT
        // ==========================================

        order.paymentStatus = "paid";

        await order.save();


        return res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            order
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

exports.cancelMyOrder = async (req, res) => {

    const mongoSession = await mongoose.startSession();

    try {

        const { id } = req.params;

        mongoSession.startTransaction();


        const order = await orderModel
            .findOne({
                _id: id,
                user: req.user.id
            })
            .session(mongoSession);


        if (!order) {

            await mongoSession.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }


        // ==========================================
        // CHECK WHETHER CANCELLATION IS ALLOWED
        // ==========================================

        const cancellableStatuses = [
            "pending",
            "confirmed",
            "processing"
        ];


        if (!cancellableStatuses.includes(order.orderStatus)) {

            await mongoSession.abortTransaction();

            return res.status(400).json({

                success: false,

                message:
                    "This order can no longer be cancelled"

            });
        }


        // ==========================================
        // RESTORE STOCK
        // ==========================================

        for (const item of order.items) {

            const product = await productModel
                .findById(item.product)
                .session(mongoSession);


            if (!product) {
                throw new Error(
                    `Product not found: ${item.product}`
                );
            }


            const variant = product.variants.id(
                item.variantId
            );


            if (!variant) {
                throw new Error(
                    `Variant not found: ${item.variantId}`
                );
            }


            variant.stock += item.quantity;


            await product.save({
                session: mongoSession
            });
        }


        // ==========================================
        // CANCEL ORDER
        // ==========================================

        order.orderStatus = "cancelled";


        await order.save({
            session: mongoSession
        });


        await mongoSession.commitTransaction();


        return res.status(200).json({

            success: true,

            message: "Order cancelled successfully",

            order

        });


    } catch (error) {

        if (mongoSession.inTransaction()) {
        await mongoSession.abortTransaction();
    }

        console.log(error);


        return res.status(500).json({

            success: false,

            message: error.message || "Server error"

        });


    } finally {

        mongoSession.endSession();
    }
};