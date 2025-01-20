import express from 'express';
import {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword, // Import the resetPassword controller here
    updateUserProfile,
    getUserProfile,
} from '../controllers/userController.js'; // Ensure the path to the userController is correct
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser); // Route for user registration
router.post('/login', loginUser); // Route for user login
router.post('/forgot-password', forgotPassword); // Route for requesting password reset link
router.post('/reset-password/:userId', resetPassword); // Route for resetting password

// Protected Routes
router.get('/profile', protect, getUserProfile); // Get user profile (requires auth)
router.put('/profile', protect, updateUserProfile); // Update user profile (requires auth)

export default router;
