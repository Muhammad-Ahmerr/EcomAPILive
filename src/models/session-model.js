const mongoose =require('mongoose')

const sessionScheme=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:[true,'user is required']
    },
    refreshTokenHash:{
        type:String,
        required:[true,'refreshToken Hash is required']
    },
    ip:{
        type:String,
        required:[true,'ip is requried']
    },
    userAgent:{
        type:String,
        required:[true,'user Agent is required']
    },
    revoked:{
        type:Boolean,
        default:false
    },

},{
    timestamps:true
})


module.exports=mongoose.model('sessions',sessionScheme)