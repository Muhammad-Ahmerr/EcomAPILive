const mongoose = require("mongoose");

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