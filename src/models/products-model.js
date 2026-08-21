const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minLength: [2, ' name must be atleast 2 Character'],
        maxLength: [150, ' name cannot exceed 150 Character'],

    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        trim: true,
        min: [0, ' Product can\'t be negative'],

    },
    featured: {
        type: Boolean,
        default: false
    },

 

    rating: {
        type: Number,
        min:[0,'the Minimum rating should be 0'],
        max:[5,'max rating cannot be exceed to 5'],
        default:4.9
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },

    company: {
        type: String,
        enum: {
            values: ['apple', 'samsung', 'dell', 'mi'],
            message: `{VALUE} is not supported`
        }
    },
    
   // description: {
    //     type: String,
    //     // required: [true, "Product description is required"],
    //     trim: true,
    //     minlength: [10, "Description must be at least 10 characters"],
    //     maxlength: [5000, "Description cannot exceed 5000 characters"],
    // },

    // slug: {
    //     type: String,
    //     required: [true, "Product slug is required"],
    //     unique: true,
    //     lowercase: true,
    //     trim: true,
    //     index: true,
    // },


})

module.exports = new mongoose.model('Product', productSchema)
