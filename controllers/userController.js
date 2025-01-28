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
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
        res.status(400).json({ message: 'All fields are required.' });
        return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    console.log("Normalized email during registration:", normalizedEmail);

    try {
        const user = await User.create({
            name,
            email: normalizedEmail,
            username,
            password: normalizedPassword,
        });

        console.log("User registered successfully:", user);

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Error during registration:", error);
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email or username already in use.' });
        } else {
            res.status(500).json({ message: 'Server error. Please try again.' });
        }
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

    console.log("Generated Reset Token:", resetToken);

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message,
        });

        res.status(200).json({ message: 'Password reset email sent successfully.' });
    } catch (error) {
        console.error('Error while sending the email:', error.message);
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
    console.log("Hashed Token for Comparison:", hashedToken);

    const user = await User.findOne({
        _id: userId,
        resetToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        console.error("Invalid or expired reset token.");
        res.status(400).json({ message: 'Invalid or expired reset token.' });
        return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    console.log(`Password reset successfully for user: ${user.email}`);

    res.status(200).json({ message: 'Password successfully reset.' });
});
