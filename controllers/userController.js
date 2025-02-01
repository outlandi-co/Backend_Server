import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { sendEmail } from '../utils/sendEmail.js'; // ✅ Use named import

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

/**
 * ✅ Login User
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`🛠️ Login Attempt: Email: ${email}, Password: ${password}`);

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        console.log(`✅ Login Successful for: ${user.email}`);
        
        const token = generateToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        console.warn('❌ Invalid email or password');
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

/**
 * ✅ Forgot Password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log("📨 Forgot Password Request for:", email);

    const user = await User.findOne({ email });
    if (!user) {
        console.error("❌ No user found with email:", email);
        return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    const frontendURL = process.env.NODE_ENV === "development" ? "http://localhost:5173" : process.env.FRONTEND_URL;
    const resetURL = `${frontendURL}/reset-password?userId=${user._id}&token=${resetToken}`;

    console.log("📧 Reset URL:", resetURL);

    try {
        await sendEmail({ to: user.email, subject: "Password Reset Request", text: `Click the link to reset your password: ${resetURL}` });
        console.log("✅ Email Sent Successfully!");
        res.json({ message: "Reset email sent" });
    } catch (error) {
        console.error("❌ Email Sending Failed:", error.message);
        res.status(500).json({ message: "Email sending failed" });
    }
});

/**
 * ✅ Reset Password
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const { userId } = req.params;

    console.log("📨 Reset Password Request for User:", userId);

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ _id: userId, resetToken: hashedToken, resetTokenExpires: { $gt: Date.now() } });

    if (!user) {
        console.error("❌ Invalid or expired reset token.");
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: '✅ Password successfully reset.' });
});


/**
 * ✅ Logout User
 * @route DELETE /api/users/logout
 * @access Private
 */
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in production
        sameSite: 'Strict',
        expires: new Date(0), // ✅ Expire immediately
    });

    console.log("🚪 User Logged Out");
    res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * ✅ Get User Profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
    console.log("🔍 Checking cookies:", req.cookies);

    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    console.log("🛠 Token Received:", token);

    if (!token) {
        console.error("❌ No token found!");
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔑 Decoded Token:", decoded);

        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            console.error("❌ User not found for token ID:", decoded.id);
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log("✅ Found User:", user);
        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Invalid Token:", error);
        res.status(401).json({ message: 'Invalid token.' });
    }
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
