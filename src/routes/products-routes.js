const express=require('express')
const productController=require('../controllers/products-controller')
const { authMiddleware } = require("../middleware/auth-middleware");
const { adminMiddleware } = require("../middleware/admin-middleware");
const router=express.Router()

//user routes
router.get('/',productController.getAllProduct)
router.get('/:id',productController.getProductByID)






// Admin routes

// Create product
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    productController.createProduct
);


// Update product
router.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    productController.updateProduct
);


// Delete product
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    productController.deleteProduct
);

module.exports=router