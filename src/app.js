const express = require("express");
const morgan=require('morgan')
const cookieParser=require('cookie-parser')
const productRouter=require('./routes/products-routes')
const authRoute=require('./routes/auth-routes')
const cartRoutes = require("./routes/cart-routes");
const orderRoutes = require("./routes/order-routes");
const wishlistRoutes = require("./routes/wishlist-routes");
const reviewRoutes = require("./routes/review-routes");


const app = express();

app.use(express.json());
app.use(morgan('dev')) //its a logger for logging how manay request are,its method and and req/sec
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.json({msg:'I am live'})
})
app.use('/api/products',productRouter)
app.use('/api/auth',authRoute)
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);

module.exports = app;