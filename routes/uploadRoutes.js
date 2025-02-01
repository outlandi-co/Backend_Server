import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,  // ✅ Ensure logoutUser is imported
    forgotPassword,
    resetPassword,
    updateUserProfile,
    getUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js'; // Ensure User is imported for debug route

const router = express.Router();

/**
 * ✅ Public Routes
 */

// ✅ Register a new user (POST)
router.post('/register', registerUser);

// ✅ Log in a user and return a token (POST)
router.post('/login', loginUser);

// ✅ Logout user and clear JWT (DELETE)
router.delete('/logout', logoutUser);

// ✅ Send a password reset email (POST)
router.post('/forgot-password', forgotPassword);

// ✅ Reset password using a valid token (POST)
router.post('/reset-password/:userId', resetPassword);

/**
 * ✅ Protected Routes (Requires Authentication)
 */
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

/**
 * 🚨 Debug Route (List all users) – **For Debugging Only**
 * Ensure this is removed in production or secured behind admin middleware
 */
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from results
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error.message);
        res.status(500).json({ message: 'Failed to retrieve users.' });
    }
});

export default router;
