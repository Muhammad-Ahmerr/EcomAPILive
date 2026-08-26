const mongoose = require("mongoose");

if(!process.env.MONGO_URI){
   throw new Error('MONGO_URI is not present in .env')
    // process.exit(1)
}

if(!process.env.REFRESH_TOKEN_SECRET){
   throw new Error('REFRESH_TOKEN_SECRET is not present in .env')

}
if(!process.env.ACCESS_TOKEN_SECRET){
   throw new Error('ACCESS_TOKEN_SECRET is not present in .env')

}

const connectDB = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);

        console.log("DB connected successfully");

        return db;
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

module.exports = connectDB;