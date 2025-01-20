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

// Public Routes
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser); // User login
router.post('/forgot-password', forgotPassword); // Request password reset link
router.post('/reset-password/:userId', resetPassword); // Reset password using token

// Protected Routes
router.get('/profile', protect, getUserProfile); // Get user profile (requires auth)
router.put('/profile', protect, updateUserProfile); // Update user profile (requires auth)

export default router;
