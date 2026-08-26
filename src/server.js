require('dotenv').config()
const app=require('./app')
const connectDB=require('./conn/db')
const dns=require('dns')
dns.setServers(["8.8.8.8"])


const PORT=process.env.PORT||3000


const startSever= async()=>{
try {
   await connectDB()

app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))
} catch (error) {
    console.log('Server Failed');
    process.exit(1)
    
}
}


startSever()