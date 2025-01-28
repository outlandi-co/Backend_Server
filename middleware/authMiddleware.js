import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

/**
 * @desc Protect Middleware
 * This middleware checks if the user is authenticated by verifying the JWT token.
 * It attaches the user's information to the `req` object, excluding the password.
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the authorization header
            token = req.headers.authorization.split(' ')[1];

            // Decode and verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user in the database and attach user info to req
            req.user = await User.findById(decoded.id).select('-password');

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error('Authorization Error:', error.message);

            // Check for specific token errors
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expired. Please log in again.' });
            } else {
                res.status(401).json({ message: 'Not authorized. Token verification failed.' });
            }
        }
    } else {
        res.status(401).json({ message: 'Not authorized. No token provided.' });
    }
});

/**
 * @desc Admin Middleware
 * This middleware checks if the authenticated user has admin privileges.
 */
export const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        // User has admin privileges, allow access
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
});
