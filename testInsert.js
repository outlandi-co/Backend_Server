import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js'; // Ensure correct import

dotenv.config();

const testInsertUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('✅ Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email: "testuser@test.com" });

        if (existingUser) {
            console.log("⚠️ User already exists in MongoDB:", existingUser);
            mongoose.connection.close();
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Create new user
        const newUser = new User({
            name: "Test User",
            email: "testuser@test.com",
            username: "testuser123",
            password: hashedPassword,
        });

        // Save the new user
        const savedUser = await newUser.save();
        console.log("✅ Test User Saved:", savedUser);

        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error inserting user:", error);
    }
};

testInsertUser();
