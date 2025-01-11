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
router.post('/register', registerUser); // Register User
router.post('/login', loginUser); // Login User
router.post('/forgot-password', forgotPassword); // Forgot Password

// Protected Routes
router.get('/profile', protect, getUserProfile); // Get Profile
router.put('/profile', protect, updateUserProfile); // Update Profile
router.post('/reset-password', resetPassword); // Reset Password

// Export the router as default
export default router;
