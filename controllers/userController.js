import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * ✅ Generate JWT Token
 */
const generateToken = (id) => {
    try {
        const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        console.log("🔑 Token Successfully Created:", token);
        return token;
    } catch (error) {
        console.error("❌ JWT Token Generation Error:", error.message);
        return null;
    }
};

/**
 * ✅ Set JWT in HTTP-Only Cookie
 */
const setTokenCookie = (res, token) => {
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    });
};

/**
 * ✅ Register a New User
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    console.log("🛠️ Registering User:", email);

    const userExists = await User.findOne({ email });
    if (userExists) {
        console.error("❌ User already exists:", email);
        return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const user = await User.create({ name, email, username, password: hashedPassword });

    if (user) {
        console.log("✅ User Registered Successfully!");
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        res.status(201).json({ id: user._id, name: user.name, email: user.email, username: user.username, token });
    } else {
        console.error("❌ Error creating user.");
        res.status(400).json({ message: "Invalid user data." });
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log(`🔑 Attempting login for email: ${email}`);

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
        console.warn("🚨 Invalid email or password!");
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    // ✅ Set JWT in HTTP-only Cookie
res.cookie('jwt', token, {
    httpOnly: true, // ✅ Prevents access from JavaScript
    secure: process.env.NODE_ENV === 'production', // ✅ Secure in production
    sameSite: 'None', // ✅ Important for cross-site requests
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
    
    console.log(`✅ Login successful for: ${email}`);

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    });
});

export const logoutUser = asyncHandler(async (req, res) => {
    console.log("🚪 Logging out user...");

    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), // Expire the cookie
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * ✅ Forgot Password (Send Reset Link)
 */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Generate Reset Token (Valid for 15 min)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    console.log(`📧 Sending reset email to ${email} with token: ${resetToken}`);

    res.json({ message: 'Reset email sent', resetToken, userId: user._id });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { userId, token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.id !== userId) {
            return res.status(401).json({ message: 'Invalid token or user mismatch' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.json({ success: true, message: 'Password reset successful!' });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

/**
 * ✅ Get User Profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Returning user profile:", user);
    res.json(user);
});

/**
 * ✅ Update User Profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await user.save();
        res.status(200).json({ id: updatedUser._id, name: updatedUser.name, email: updatedUser.email });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});


