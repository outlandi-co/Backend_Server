import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect Middleware (for routes requiring authentication)
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from the header
            token = req.headers.authorization.split(' ')[1];

            // Decode the JWT token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user information to the request object, excluding the password
            req.user = await User.findById(decoded.id).select('-password');

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error('Authorization error:', error.message);

            // Handle expired token errors
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
        res.status(401).json({ message: 'Not authorized. No token provided.' });
    }
});

// Admin Middleware (for routes requiring admin access)
export const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        // User is an admin, allow access to the route
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
});
