const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user-model')
const sessionModel = require('../models/session-model')





module.exports.Registration = async (req, res) => {
    try {

        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "username, email and password are required",
                success: false
            })
        }

        const isAlreadyexist = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        })

        if (isAlreadyexist) {
            return res.status(409).json({
                message: "User is already registered",
                success: false
            })
        }

        const hashPasword = await bcrypt.hash(password, 12)

        const user = await userModel.create({
            username,
            email,
            password: hashPasword,
            role: 'user'
        })

        const session = new sessionModel({
            user: user._id,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            revoked: false
        })

        const refreshToken = jwt.sign({
            id: user._id,
            role: user.role,
            sessionId: session._id
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '7d'
        })

        const refreshTokenHash = await bcrypt.hash(refreshToken, 12)
        session.refreshTokenHash = refreshTokenHash
        await session.save()


        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const accessToken = jwt.sign({
            id: user._id,
            role: user.role,
            sessionId: session._id
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m'
        })


        return res.status(201).json({
            accessToken,
            message: "User Registered Successfully",
            success: true
        })



    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: `${error.message}`,
                success: false
            })
        }
        return res.status(500).json({
            message: "Server Error",
            success: false
        })

    }

}


module.exports.GetMe = async (req, res) => {

    try {
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(401).json({
                message: "User not found",
                success: false
            })
        }

        return res.status(200).json({
            success: true,
            user: {
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Server Error",
            success: false
        })

    }
}

module.exports.RefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh Token not found",
                success: false
            })
        }

        const decoded = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        const session = await sessionModel.findOne({
            _id: decoded.sessionId,
            user: decoded.id,
            revoked: false
        })

        if (!session) {
            return res.status(401).json({
                message: "Invalid Refresh",
                success: false
            })
        }

        const isValidRefreshToken = await bcrypt.compare(refreshToken, session.refreshTokenHash)
        if (!isValidRefreshToken) {
            return res.status(401).json({
                message: "Invalid Refresh",
                success: false
            })
        }

        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                success: false
            })
        }



        const newRefreshToken = jwt.sign({
            id: user._id,
            role: user.role,
            sessionId: session._id
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '7d'
        })

        
        const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 12)
        session.refreshTokenHash = newRefreshTokenHash
        await session.save()

        const accessToken = jwt.sign({
            id: user._id,
            role: user.role,
            sessionId: session._id
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m'
        })

       res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({
            accessToken,
            success: true
        })


    } catch (error) {
    console.log(error)

    if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
    ) {
        return res.status(401).json({
            message: "Invalid or expired refresh token",
            success: false
        })
    }

    return res.status(500).json({
        message: "Server Error",
        success: false
    })
}
}

module.exports.Logout = async (req, res) => {
    try {
         const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh Token not found",
                success: false
            })
        }
        
        const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
        const session=await sessionModel.findOne({
            _id: decoded.sessionId,
            user:decoded.id,
            revoked:false
        })

        if(!session){
            return res.status(401).json({
                message:"Invalid Refresh Token",
                success:false
            })
        }

        const isValidRefreshToken=await bcrypt.compare(refreshToken,session.refreshTokenHash)
        if(!isValidRefreshToken){
            return res.status(401).json({
                message:"Invalid Refresh Token",
                success:false
            })
        }

        session.revoked=true
        await session.save()

         res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.status(200).json({
            message:"Logout Successfully",
                success:true
        })


    } catch (error) {
    console.log(error)

    if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
    ) {
        return res.status(401).json({
            message: "Invalid or expired refresh token",
            success: false
        })
    }

    return res.status(500).json({
        message: "Server Error",
        success: false
    })
}
}



module.exports.Login=async(req,res)=>{
    try {
        const {username,email,password}=req.body
        if((!username &&!email)|| !password){
            return res.status(400).json({
                message:"username and password OR email and password are required!",
                success:false
            })
        }

        const user=await userModel.findOne(
               email
                ? { email }
                : { username }
            ).select("+password")

        if(!user){
            return res.status(401).json({
                message:"Invalid username/email or password"
            })
        }
       const isValidPassword=await bcrypt.compare(password,user.password)
        
        if(!isValidPassword){
            return res.status(401).json({
                message:"Invalid username/email or password",
                success:false
            })
        }

       const session=new sessionModel({
        user:user._id,
        revoked:false,
        ip:req.ip,
        userAgent:req.headers['user-agent']
       })

        const refreshToken=jwt.sign({
         id:user._id,
         role:user.role,
         sessionId:session._id
        },process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:"7d"
        })

        const refreshTokenHash=await bcrypt.hash(refreshToken,12)
        session.refreshTokenHash=refreshTokenHash
        await session.save()

        const accessToken=jwt.sign({
         id:user._id,
         role:user.role,
         sessionId:session._id
        },process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"15m"
        })

        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'lax',
            maxAge:7*24*60*60*1000
        })

        return res.status(200).json({
            accessToken,
            message:"LogIn Successfully",
            user:{
                username:user.username,
                email:user.email
            }
        }) 
       

    } catch (error) {
    console.log(error)

    return res.status(500).json({
        message: "Server Error",
        success: false
    })
}
}


