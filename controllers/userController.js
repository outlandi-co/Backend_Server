// Updated userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// @desc    Forgot password (send reset link)
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error('No user found with that email address');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Please use the following link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
});

// @desc    Reset password using reset token
// @route   POST /api/users/reset-password/:userId
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { token, newPassword } = req.body;

    const user = await User.findOne({
        _id: userId,
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset.' });
});