import express from 'express';
import {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    updateUserProfile,
} from '../controllers/userController.js'; // Removed getUserProfile import
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @desc Public Routes
 */
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser); // Log in a user and get a token
router.post('/forgot-password', forgotPassword); // Send password reset email
router.post('/reset-password', resetPassword); // Reset password using a token

/**
 * @desc Protected Routes (Requires Authentication)
 */
router.put('/profile', protect, updateUserProfile); // Update user profile

// Export the router as default
export default router;
