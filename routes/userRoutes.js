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
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:userId', resetPassword);

// Protected Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
