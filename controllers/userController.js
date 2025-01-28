import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ✅ Helper function to generate JWT
const generateToken = (id) => {
    try {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    } catch (error) {
        console.error("❌ JWT Token Generation Error:", error.message);
        return null;
    }
};

// ✅ Login user & get token
export const loginUser = asyncHandler(async (req, res) => {
    console.log("🛠️ Login Attempt:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        console.error("❌ Missing email or password");
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log("🔍 Checking for user in database with email:", normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        console.error("❌ User not found with email:", normalizedEmail);
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log("✅ Found User:", user.email);
    console.log("🔍 Stored Hashed Password:", user.password);
    console.log("🔍 Comparing with Entered Password:", password);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        console.error("❌ Password mismatch for user:", user.email);
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    console.log("✅ Password Match! Logging in...");
    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        token: generateToken(user._id),
    });
});

export default loginUser;
