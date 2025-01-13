import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser); // Authenticate user and get token
router.post('/forgot-password', forgotPassword); // Trigger password reset email
router.post('/reset-password', resetPassword); // Reset password with token

// Protected Routes (Requires Authentication)
router.get('/profile', protect, getUserProfile); // Get user profile
router.put('/profile', protect, updateUserProfile); // Update user profile

// Export the router as default
export default router;
