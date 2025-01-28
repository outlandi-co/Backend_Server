import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Insert a test user
        const testUser = new User({
            name: "Test User",
            email: "testuser@test.com",
            username: "testuser123",
            password: "hashedpassword"
        });

        await testUser.save();
        console.log("✅ Test User Saved:", testUser);

        mongoose.connection.close();
    })
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));
