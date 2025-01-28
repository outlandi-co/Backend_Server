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
 * @desc Public Routes
 * These routes do not require authentication
 */

// Register a new user
router.post('/register', registerUser);

// Log in a user and return a token
router.post('/login', loginUser);

// Send a password reset email
router.post('/forgot-password', forgotPassword);

// Reset password using a valid token
router.post('/reset-password/:userId', resetPassword);


/**
 * @desc Protected Routes
 * These routes require a valid authentication token
 */

// Get the authenticated user's profile
router.get('/profile', protect, getUserProfile);

// Update the authenticated user's profile
router.put('/profile', protect, updateUserProfile);

export default router;
