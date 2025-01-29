import express from 'express';
import {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    getUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ✅ Public Routes
 */

// Register a new user (POST)
router.post('/register', registerUser);

// Log in a user and return a token (POST)
router.post('/login', loginUser);

// Send a password reset email (POST)
router.post('/forgot-password', forgotPassword);

// Reset password using a valid token (POST)
router.post('/reset-password/:userId', resetPassword);

/**
 * ✅ Protected Routes (Requires Authentication)
 */

// Get user profile (GET)
router.get('/profile', protect, getUserProfile);

// Update user profile (PUT)
router.put('/profile', protect, updateUserProfile);

export default router;
