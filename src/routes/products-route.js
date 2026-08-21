const express=require('express')
const productController=require('../controllers/products-con')
const router=express.Router()

router.get('/',productController.getAllProduct)
router.get('/testing',productController.getTesting)
router.get('/:id',productController.getProductByID)


module.exports=router