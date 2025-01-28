import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ✅ Helper function to generate JWT
const generateToken = (id) => {
    try {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    } catch (error) {
        console.error("❌ JWT Token Generation Error:", error.message);
        return null;
    }
};

// ✅ Register a new user
export const registerUser = asyncHandler(async (req, res) => {
    console.log("📝 Incoming Registration Request:", req.body);
    
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
        console.error("❌ Missing Fields:", { name, email, username, password });
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase();

        console.log("🔍 Checking existing users...");
        const existingUser = await User.findOne({ 
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }] 
        });

        if (existingUser) {
            console.error("❌ User already exists:", { email: normalizedEmail, username: normalizedUsername });
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log("🔍 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("📝 Creating new user...");
        const newUser = await User.create({
            name,
            email: normalizedEmail,
            username: normalizedUsername,
            password: hashedPassword, // ✅ Ensure hashed password is used
        });

        console.log("✅ User successfully saved to MongoDB:", newUser);

        const token = generateToken(newUser._id);
        console.log("🛡️ Token Generated:", token);

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
            },
            token,
        });

    } catch (error) {
        console.error("❌ MongoDB Save Error:", error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ✅ Login user
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
    console.log("🔍 Comparing Entered Password:", password);

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("🔍 bcrypt.compare Result:", isMatch);

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

// ✅ Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
    console.log("📧 Forgot Password Request:", req.body);
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        console.error("❌ User not found with email:", email);
        return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?userId=${user._id}&token=${resetToken}`;
    console.log("📧 Reset URL:", resetUrl);

    res.status(200).json({
        message: 'Password reset email sent successfully.',
        resetUrl, // For development only, remove in production
    });
});

// ✅ Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const { userId } = req.params;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        _id: userId,
        resetToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password successfully reset.' });
});

// ✅ Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        res.status(200).json({ id: user._id, name: user.name, email: user.email });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});

// ✅ Update user profile
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
