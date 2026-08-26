const userModel=require('../models/user-model')
const jwt=require('jsonwebtoken')


module.exports.authMiddleware=(req,res,next)=>{
    try {
     const authorization=req.headers.authorization
     if(!authorization || !authorization.startsWith('Bearer ')){
        return res.status(401).json({
         message:"Authrorization is requried",
          success:false
        })
     }

     const token=authorization.split(' ')[1]
     if(!token){
        return res.status(400).json({
             message:"Token is not Found",
          success:false
        })
     }

     const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     req.user=decoded
     next()
        
    } catch (error) {
        console.log(error);
        if (error.name === "JsonWebTokenError" || error.name === "SyntaxError" || error.name === "TokenExpiredError"){
       return res.status(401).json({
        message:"Token is Invalid OR Expired",
        success:false
       }) 
    }
}

}