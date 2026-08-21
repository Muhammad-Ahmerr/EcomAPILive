const express = require("express");
const productRouter=require('./routes/products-route')
const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.json({msg:'I am live'})
})
app.use('/api/products',productRouter)

module.exports = app;