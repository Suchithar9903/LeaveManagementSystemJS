const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin.js');
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
dotenv.config();
connectDB();

async function seedAdmin() {
    const email = "shadaksharid12@gmail.com"; 
    const password = "123456789"; 

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        console.log("Admin already exists!");
        return mongoose.connection.close();
    }

    const admin = new Admin({ email, password: hashedPassword });
    await admin.save();
    console.log("Admin created successfully!");

    mongoose.connection.close();
}

seedAdmin();