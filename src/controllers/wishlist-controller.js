const wishlistModel = require("../models/wishlist-model");
const productModel = require("../models/products-model");


// ======================================================
// GET WISHLIST
// ======================================================

exports.getWishlist = async (req, res) => {

    try {

        let wishlist = await wishlistModel
            .findOne({
                user: req.user.id
            })
            .populate("products");


        // No wishlist yet
        if (!wishlist) {

            return res.status(200).json({
                success: true,
                wishlist: {
                    products: []
                }
            });
        }


        return res.status(200).json({
            success: true,
            wishlist
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
// ADD PRODUCT TO WISHLIST
// ======================================================

exports.addToWishlist = async (req, res) => {

    try {

        const { productId } = req.params;


        // ----------------------------------------------
        // Validate product ID
        // ----------------------------------------------

        if (!productId) {

            return res.status(400).json({
                success: false,
                message: "Product ID is required"
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
        // Find user's wishlist
        // ----------------------------------------------

        let wishlist = await wishlistModel.findOne({
            user: req.user.id
        });


        // ----------------------------------------------
        // Create wishlist if it doesn't exist
        // ----------------------------------------------

        if (!wishlist) {

            wishlist = new wishlistModel({
                user: req.user.id,
                products: []
            });
        }


        // ----------------------------------------------
        // Check duplicate
        // ----------------------------------------------

        const alreadyExists = wishlist.products.some(
            id => id.toString() === productId
        );


        if (alreadyExists) {

            return res.status(409).json({
                success: false,
                message: "Product already exists in wishlist"
            });
        }


        // ----------------------------------------------
        // Add product
        // ----------------------------------------------

        wishlist.products.push(productId);


        await wishlist.save();


        // Populate products before response
        await wishlist.populate("products");


        return res.status(201).json({

            success: true,

            message: "Product added to wishlist",

            wishlist
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
// REMOVE PRODUCT FROM WISHLIST
// ======================================================

exports.removeFromWishlist = async (req, res) => {

    try {

        const { productId } = req.params;


        if (!productId) {

            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }


        // ----------------------------------------------
        // Find user's wishlist
        // ----------------------------------------------

        const wishlist = await wishlistModel.findOne({
            user: req.user.id
        });


        if (!wishlist) {

            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }


        // ----------------------------------------------
        // Check product exists in wishlist
        // ----------------------------------------------

        const productExists = wishlist.products.some(
            id => id.toString() === productId
        );


        if (!productExists) {

            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }


        // ----------------------------------------------
        // Remove product
        // ----------------------------------------------

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== productId
        );


        await wishlist.save();


        await wishlist.populate("products");


        return res.status(200).json({

            success: true,

            message: "Product removed from wishlist",

            wishlist
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
// CLEAR WISHLIST
// ======================================================

exports.clearWishlist = async (req, res) => {

    try {

        const wishlist = await wishlistModel.findOne({
            user: req.user.id
        });


        if (!wishlist) {

            return res.status(200).json({
                success: true,
                message: "Wishlist already empty"
            });
        }


        wishlist.products = [];


        await wishlist.save();


        return res.status(200).json({

            success: true,

            message: "Wishlist cleared successfully",

            wishlist

        });


    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};