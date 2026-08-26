const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userModel = require("./src/models/user-model");

require("dotenv").config();
const dns=require('dns')
dns.setServers(["8.8.8.8"])

const createAdmin = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const existingAdmin = await userModel.findOne({
            role: "admin"
        });

        if (existingAdmin) {

            console.log("Admin already exists:");
           

            process.exit(0);
        }

        const password = process.env.ADMIN_PASSWORD;

        const hashedPassword = await bcrypt.hash(password, 12);

         await userModel.create({
            username: "admin",
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully");

        

        process.exit(0);

    } catch (error) {

        console.log("Error creating admin:", error);

        process.exit(1);
    }
};

createAdmin();