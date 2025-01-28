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

// List all users (GET) – **For Debugging Only**
router.get('/register', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Don't return passwords
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve users.' });
    }
});

// Log in a user and return a token
router.post('/login', loginUser);

// Send a password reset email
router.post('/forgot-password', forgotPassword);

// Reset password using a valid token
router.post('/reset-password/:userId', resetPassword);

/**
 * ✅ Protected Routes (Requires Authentication)
 */
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
