const cartModel = require("../models/cart-model");
const productModel = require("../models/products-model");


// ======================================================
// GET CART
// ======================================================

exports.getCart = async (req, res) => {

    try {

        const cart = await cartModel
            .findOne({
                user: req.user.id
            })
            .populate("items.product");


        if (!cart) {

            return res.status(200).json({
                success: true,
                cart: {
                    items: []
                }
            });
        }


        return res.status(200).json({
            success: true,
            cart
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
// ADD TO CART
// ======================================================

exports.addToCart = async (req, res) => {

    try {

        const {
            productId,
            variantId,
            quantity = 1
        } = req.body;


        if (!productId || !variantId) {

            return res.status(400).json({
                success: false,
                message: "Product and variant are required"
            });
        }


        if (!Number.isInteger(quantity) || quantity < 1) {

            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }


        // Find product
        const product = await productModel.findById(productId);


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        // Find selected variant
        const variant = product.variants.id(variantId);


        if (!variant) {

            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }


        // Check stock
        if (variant.stock < quantity) {

            return res.status(400).json({
                success: false,
                message: `Only ${variant.stock} item(s) available`
            });
        }


        // Find user's cart
        let cart = await cartModel.findOne({
            user: req.user.id
        });


        // Create cart if doesn't exist
        if (!cart) {

            cart = new cartModel({
                user: req.user.id,
                items: []
            });
        }


        // Check whether variant already exists
        const existingItem = cart.items.find(
            item =>
                item.product.toString() === productId &&
                item.variantId.toString() === variantId
        );


        if (existingItem) {

            const newQuantity =
                existingItem.quantity + quantity;


            if (newQuantity > variant.stock) {

                return res.status(400).json({
                    success: false,
                    message: `Only ${variant.stock} item(s) available`
                });
            }


            existingItem.quantity = newQuantity;

        } else {

            cart.items.push({
                product: productId,
                variantId: variantId,
                sku: variant.sku,
                quantity
            });
        }


        await cart.save();


        await cart.populate("items.product");


        return res.status(200).json({

            success: true,

            message: "Product added to cart",

            cart
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
// UPDATE CART ITEM
// ======================================================

exports.updateCartItem = async (req, res) => {

    try {

        const { itemId } = req.params;

        const { quantity } = req.body;


        if (!Number.isInteger(quantity) || quantity < 1) {

            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }


        const cart = await cartModel.findOne({
            user: req.user.id
        });


        if (!cart) {

            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }


        const cartItem = cart.items.id(itemId);


        if (!cartItem) {

            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }


        // Find product
        const product = await productModel.findById(
            cartItem.product
        );


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }


        // Find variant
        const variant = product.variants.id(
            cartItem.variantId
        );


        if (!variant) {

            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }


        // Check stock
        if (quantity > variant.stock) {

            return res.status(400).json({
                success: false,
                message: `Only ${variant.stock} item(s) available`
            });
        }


        cartItem.quantity = quantity;


        await cart.save();


        await cart.populate("items.product");


        return res.status(200).json({

            success: true,

            message: "Cart updated successfully",

            cart
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
// REMOVE CART ITEM
// ======================================================

exports.removeCartItem = async (req, res) => {

    try {

        const { itemId } = req.params;


        const cart = await cartModel.findOne({
            user: req.user.id
        });


        if (!cart) {

            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }


        const cartItem = cart.items.id(itemId);


        if (!cartItem) {

            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }


        cartItem.deleteOne();


        await cart.save();


        return res.status(200).json({

            success: true,

            message: "Item removed from cart",

            cart

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
// CLEAR CART
// ======================================================

exports.clearCart = async (req, res) => {

    try {

        const cart = await cartModel.findOne({
            user: req.user.id
        });


        if (!cart) {

            return res.status(200).json({
                success: true,
                message: "Cart already empty"
            });
        }


        cart.items = [];


        await cart.save();


        return res.status(200).json({

            success: true,

            message: "Cart cleared successfully",

            cart

        });


    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};