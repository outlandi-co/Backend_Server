import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import nodemailer from 'nodemailer';  // For sending emails
import crypto from 'crypto'; // Secure token generation
import bcrypt from 'bcryptjs';  // For hashing passwords

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
        username: usernameToUse
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
        res.status(400);
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
        throw new Error('All fields are required.');
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
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

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

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
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

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
    user.resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

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
        text: `Please use the following link to reset your password: https://outlandi-co.netlify.app/reset-password?token=${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
});

// @desc    Reset password using reset token
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    // Find user by reset token and check if it has expired
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() }, // Check if the token has expired
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear the reset token and expiration time
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    // Save the user with the new password
    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset.' });
});