import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    registerAdminUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Ensure correct import of middleware

const router = express.Router();

// Public Routes (No token required)
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser); // Login a user

// Protected Routes (Token required)
router.get('/profile', protect, getUserProfile); // Get logged-in user's profile
router.put('/profile', protect, updateUserProfile); // Update logged-in user's profile

// Admin-Protected Routes (Admin token required)
router.post('/admin/register', protect, admin, registerAdminUser); // Register an admin user

export default router;
