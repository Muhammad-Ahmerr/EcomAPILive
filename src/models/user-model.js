const mongose = require('mongoose')

const userModel = new mongose.Schema({
    username: {
        type: String,
        required: [true, 'name is required'],
        trim: true,
        unique:true,
        minLength: [3, 'name must be at least 3 characters'],
        maxLength: [150, "name can't be exceed 150 characters"]
    },
      email: {
        type: String,
        required: [true, 'email is required'],
        unique:true,
        trim: true,
        lowercase: true,
        match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
    ]
    },
    password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false
        },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }
    
},{
    timestamps:true
})


module.exports=mongose.model('user',userModel)