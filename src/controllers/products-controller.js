// const productModel=require('../models/products-model')



// exports.getProductByID=async (req,res)=>{
//    try {
//     const id=req.params.id
//     const product= await productModel.findById(id)

//     if(!product){
//        return res.status(404).json({
//         success:false,
//         message:"product not found"
//        })
//     }
//      res.status(200).json({product})
//    } catch (error) {
//     console.log(error);

//    }
// }


// exports.getAllProduct = async (req, res) => {
//     try {
//         const {company,name,featured,sort,select} = req.query;

//         const queryObject = {};

//         // Filter by company
//         if (company) {
//             queryObject.company = company;
//         }

//         // Search by name
//         if (name) {
//             queryObject.name = {
//                 $regex: name,
//                 $options: "i"
//             };
//         }

//         // Filter by featured
//         if (featured !== undefined) {
//             queryObject.featured = featured;
//         }

//         let productData = productModel.find(queryObject);

//         // Select fields
//         if (select) {
//             const fixSelect = select.split(",").join(" ");
//             productData = productData.select(fixSelect);
//         }

//         // Sort
//         if (sort) {
//             const fixSort = sort.split(",").join(" ");
//             productData = productData
//              .collation({
//             locale: "en",
//             strength: 2
//         })
//             .sort(fixSort);
//         }

//         // Pagination
//         const page = Number(req.query.page) || 1;
//         const limit = Number(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         productData = productData
//             .skip(skip)
//             .limit(limit);

//         const products = await productData;

//         res.status(200).json({
//             success: true,
//             nbHits: products.length,
//             products
//         });

//     } catch (error) {
//         console.log(error);

//         res.status(500).json({
//             success: false,
//             message: "Server error"
//         });
//     }
// };


const productModel = require("../models/products-model");


// ======================================================
// GET SINGLE PRODUCT
// ======================================================

exports.getProductByID = async (req, res) => {
    try {

        const { id } = req.params;
        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
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
// GET ALL PRODUCTS
// ======================================================

exports.getAllProduct = async (req, res) => {
    try {

        const {company,category,name,featured,color,size,minPrice,maxPrice,sort,select,page = 1,limit = 10} = req.query;

        const queryObject = {};

        if (company) {
            queryObject.company = company;
        }

        if (category) {
            queryObject.category = category;
        }


        if (name) {
            queryObject.name = {$regex: name,$options: "i"};
        }

        if (featured !== undefined) {

            if (featured === "true") {
                queryObject.featured = true;
            }

            if (featured === "false") {
                queryObject.featured = false;
            }
        }


        // Variant color
        if (color) {
            queryObject["variants.color"] = {$regex: `^${color}$`,$options: "i"};
        }


        // Variant size
        if (size) {
            queryObject["variants.size"] = {$regex: `^${size}$`,$options: "i"};
        }


        // Variant price
        if (minPrice || maxPrice) {

            queryObject.variants = {
                $elemMatch: {}
            };

            if (minPrice) {
                queryObject.variants.$elemMatch.price = {
                    $gte: Number(minPrice)
                };
            }

            if (maxPrice) {
                queryObject.variants.$elemMatch.price = {
                    ...(queryObject.variants.$elemMatch.price || {}),
                    $lte: Number(maxPrice)
                };
            }
        }


        // ----------------------------------------------
        // Query
        // ----------------------------------------------

        let productData = productModel.find(queryObject);


        // ----------------------------------------------
        // Select fields
        // ----------------------------------------------

        if (select) {

            const fixedSelect = select
                .split(",")
                .join(" ");

            productData = productData.select(fixedSelect);
        }


        // ----------------------------------------------
        // Sort
        // ----------------------------------------------

        if (sort) {

            const fixedSort = sort
                .split(",")
                .join(" ");

            productData = productData
                .collation({
                    locale: "en",
                    strength: 2
                })
                .sort(fixedSort);

        } else {

            // Newest products first
            productData = productData.sort("-createdAt");
        }


        // ----------------------------------------------
        // Pagination
        // ----------------------------------------------

        const currentPage = Math.max(Number(page) || 1, 1);

        const currentLimit = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );

        const skip = (currentPage - 1) * currentLimit;


        productData = productData
            .skip(skip)
            .limit(currentLimit);


        // ----------------------------------------------
        // Execute query
        // ----------------------------------------------

        const products = await productData;


        // Total products
        const totalProducts = await productModel.countDocuments(
            queryObject
        );


        const totalPages = Math.ceil(
            totalProducts / currentLimit
        );


        return res.status(200).json({

            success: true,

            nbHits: products.length,

            totalProducts,

            currentPage,

            totalPages,

            products

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
// CREATE PRODUCT
// ADMIN ONLY
// ======================================================

exports.createProduct = async (req, res) => {

    try {

        const {
            name,
            images,
            description,
            rating,
            category,
            company,
            variants,
            featured
        } = req.body;


        const product = await productModel.create({
            name,
            images,
            description,
            rating,
            category,
            company,
            variants,
            featured
        });


        return res.status(201).json({

            success: true,

            message: "Product created successfully",

            product

        });


    } catch (error) {

        console.log(error);


        if (error.name === "ValidationError") {

            return res.status(400).json({

                success: false,

                message: error.message

            });
        }


        return res.status(500).json({

            success: false,

            message: "Server error"

        });
    }
};


// ======================================================
// UPDATE PRODUCT
// ADMIN ONLY
// ======================================================

exports.updateProduct = async (req, res) => {

    try {

        const { id } = req.params;


        const product = await productModel.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });
        }


        return res.status(200).json({

            success: true,

            message: "Product updated successfully",

            product

        });


    } catch (error) {

        console.log(error);


        if (error.name === "ValidationError") {

            return res.status(400).json({

                success: false,

                message: error.message

            });
        }


        return res.status(500).json({

            success: false,

            message: "Server error"

        });
    }
};


// ======================================================
// DELETE PRODUCT
// ADMIN ONLY
// ======================================================

exports.deleteProduct = async (req, res) => {

    try {

        const { id } = req.params;


        const product = await productModel.findByIdAndDelete(id);


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });
        }


        return res.status(200).json({

            success: true,

            message: "Product deleted successfully"

        });


    } catch (error) {

        console.log(error);


        return res.status(500).json({

            success: false,

            message: "Server error"

        });
    }
};




