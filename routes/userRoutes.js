import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser); // Register User
router.post('/login', loginUser); // Login User

// Protected Routes
router.get('/profile', protect, getUserProfile); // Get Profile
router.put('/profile', protect, updateUserProfile); // Update Profile

// Export the router as default
export default router;
