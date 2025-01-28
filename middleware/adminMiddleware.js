import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect Middleware (for routes requiring authentication)
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for authorization header and ensure it starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from the header
            token = req.headers.authorization.split(' ')[1];

            // Verify and decode the JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user information to the request object, excluding sensitive fields like password
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(404).json({ message: 'User not found. Invalid token.' });
                return;
            }

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error('Authorization error:', error.message);

            // Differentiate between token expiration and other verification errors
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({
                    message: 'Token expired. Please log in again.',
                });
            } else {
                res.status(401).json({
                    message: 'Not authorized. Token verification failed.',
                });
            }
        }
    } else {
        // Handle missing token
        res.status(401).json({ message: 'Not authorized. No token provided.' });
    }
});

// Admin Middleware (for routes requiring admin access)
export const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        // User has admin privileges, allow access
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
});
