import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    getUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ✅ Public Routes (No Authentication Required)
 */

// ✅ Register a new user (POST)
router.post('/register', registerUser);

// ✅ Log in a user (POST)
router.post('/login', loginUser);

// ✅ Log out a user (POST) - Clears JWT cookie
router.post('/logout', logoutUser);

// ✅ Forgot Password - Send Reset Link (POST)
router.post('/forgot-password', forgotPassword);

// ✅ Reset Password - With User ID and Token (POST)
router.post('/reset-password/:userId/:token', resetPassword);

/**
 * ✅ Protected Routes (Requires JWT Token)
 */

// ✅ Get user profile (GET) - Requires JWT in Cookie
router.get('/profile', protect, getUserProfile);

// ✅ Update user profile (PUT) - Requires JWT in Cookie
router.put('/profile', protect, updateUserProfile);

export default router;
