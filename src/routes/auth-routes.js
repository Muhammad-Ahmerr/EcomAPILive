const express=require('express')
const authController=require('../controllers/auth-con')
const {authMiddleware}=require('../middleware/auth-middleware')

const router=express.Router()



router.get('/get-me',authMiddleware,authController.GetMe)
router.post('/register',authController.Registration)
router.post('/login',authController.Login)
router.post('/refresh-token',authController.RefreshToken)
router.post('/logout',authController.Logout)


module.exports=router