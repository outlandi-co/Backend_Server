import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    getUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ✅ Public Routes (No Authentication Required)
 */

// ✅ Register a new user (POST)
router.post('/register', (req, res, next) => {
    console.log(`🛠️ Register route hit | Email: ${req.body.email}`);
    next();
}, registerUser);

// ✅ Log in a user and return a token (POST)
router.post('/login', (req, res, next) => {
    console.log(`🔑 Login route hit | Email: ${req.body.email}`);
    next();
}, loginUser);

// ✅ Define Logout Route with DELETE Method
router.delete('/logout', (req, res, next) => {
    console.log("🚪 Logout route hit");
    next();
}, logoutUser);

// ✅ Send a password reset email (POST)
router.post('/forgot-password', (req, res, next) => {
    console.log(`📨 Forgot Password route hit | Email: ${req.body.email}`);
    next();
}, forgotPassword);

// ✅ Reset password using a valid token (POST)
router.post('/reset-password/:userId', (req, res, next) => {
    console.log(`🔑 Reset Password route hit | User ID: ${req.params.userId}`);
    next();
}, resetPassword);

/**
 * ✅ Protected Routes (Requires Authentication)
 */

// ✅ Get user profile (GET) - Requires JWT in Cookie
router.get('/profile', protect, (req, res, next) => {
    console.log(`🔍 Get Profile route hit | User ID: ${req.user.id}`);
    next();
}, getUserProfile);

// ✅ Update user profile (PUT) - Requires JWT in Cookie
router.put('/profile', protect, (req, res, next) => {
    console.log(`✏️ Update Profile route hit | User ID: ${req.user.id}`);
    next();
}, updateUserProfile);

export default router;
