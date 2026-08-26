const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userModel = require("./src/models/user-model");

require("dotenv").config();
const dns=require('dns')
dns.setServers(["8.8.8.8"])

const resetPassword = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        const newPassword = process.env.TEST_PASSWORD;

        const hashedPassword = await bcrypt.hash(
            newPassword,
            12
        );

        const user = await userModel.findOneAndUpdate(
            {
                email: process.env.EMAIL
            },
            {
                password: hashedPassword
            },
            {
                new: true
            }
        );

        if (!user) {
            console.log("User not found");
            process.exit(1);
        }

        console.log("Password reset successfully");

        

        process.exit(0);

    } catch (error) {

        console.log("Error resetting password:", error);

        process.exit(1);
    }
};

resetPassword();