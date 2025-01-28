import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper function to send emails
const sendEmail = async ({ email, subject, message }) => {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "*****" : "Not Set");

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
        console.error(`❌ Error sending email to ${email}:`, error.message);
        throw new Error('Failed to send email.');
    }
};

// @desc Register a new user
// @route POST /api/users/register
// @access Public
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Simulate successful registration (replace with DB logic)
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// @desc Login user & get token
// @route POST /api/users/login
// @access Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});

// @desc Forgot password
// @route POST /api/users/forgot-password
// @access Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Email is required.' });
        return;
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?userId=${user._id}&token=${resetToken}`;
    const message = `You requested a password reset. Please use the following link: ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message,
        });

        res.status(200).json({ message: 'Password reset email sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
});

// @desc Reset password
// @route POST /api/users/reset-password/:userId
// @access Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const { userId } = req.params;

    if (!token || !newPassword) {
        res.status(400).json({ message: 'Token and new password are required.' });
        return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        _id: userId,
        resetToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400).json({ message: 'Invalid or expired reset token.' });
        return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password successfully reset.' });
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await user.save();
        res.status(200).json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});
