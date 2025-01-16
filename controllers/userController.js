//recover//

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import nodemailer from 'nodemailer'; // For sending emails
import crypto from 'crypto'; // Secure token generation
import bcrypt from 'bcryptjs'; // For hashing passwords

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('All fields are required.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists.');
    }

    const usernameToUse = username || email.split('@')[0];
    const user = await User.create({
        name,
        email,
        password,
        username: usernameToUse,
    });

    if (user) {
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(500);
        throw new Error('Failed to create user.');
    }
});

// @desc    Authenticate user and get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Email and password are required.');
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password.');
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (isPasswordMatch) {
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password.');
    }
});

// @desc    Forgot password (send reset link)
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    console.log('Forgot Password request received:', email);

    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error('No user found with that email address.');
    }

    console.log('Request received to reset password for:', email);

    const resetToken = user.generateResetToken();
    await user.save();

    console.log('Generated reset token:', resetToken);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Please use the following link to reset your password: ${resetURL}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', email);
        res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
    } catch (error) {
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        console.error('Error sending password reset email:', error.message);
        res.status(500);
        throw new Error('Email could not be sent.');
    }
});

// @desc    Reset password using reset token
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    console.log('Reset Password request received with token:', token);

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token.');
    }

    // Hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    console.log('Password successfully reset for user:', user.email);

    res.status(200).json({ message: 'Password has been successfully reset.' });
});
