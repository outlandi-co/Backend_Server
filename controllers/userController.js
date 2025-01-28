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

// ✅ Helper function to send emails
const sendEmail = async ({ email, subject, message }) => {
    console.log("📧 Sending email to:", email);

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text: message,
        });

        console.log(`✅ Email sent successfully to: ${email}`);
    } catch (error) {
        console.error(`❌ Error sending email:`, error.message);
        throw new Error('Failed to send email.');
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

        console.log("🔍 Checking if user already exists in the 'users' collection...");
        const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] });

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
            password: hashedPassword,
        });

        console.log("✅ User successfully saved to MongoDB:", newUser);

        // ✅ Generate JWT Token after successful registration
        const token = generateToken(newUser._id);
        console.log("🛡️ Token Generated:", token);

        // ✅ Return User Data + Token
        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
            },
            token, // ✅ Send Token
        });

    } catch (error) {
        console.error("❌ MongoDB Save Error:", error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// ✅ Login user & get token
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        console.log(`✅ Login successful for user: ${normalizedEmail}`);
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        console.error(`❌ Invalid password for user: ${normalizedEmail}`);
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});

// ✅ Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?userId=${user._id}&token=${resetToken}`;
    const message = `You requested a password reset. Click the link: ${resetUrl}`;

    try {
        await sendEmail({ email: user.email, subject: 'Password Reset Request', message });
        res.status(200).json({ message: 'Password reset email sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
});

// ✅ Reset password
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
