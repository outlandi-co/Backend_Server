import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect Middleware (for routes requiring authentication)
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Extract token from the header

            // Decode the JWT token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user information to the request object, excluding the password
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(401).json({
                message: 'Not authorized, token failed.',
                error: error.message,
            }); // Added error message to response
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token provided.' }); // Added error message to response
    }
});

// Admin Middleware (for routes requiring admin access)
export const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); // User is an admin, allow access to the route
    } else {
        res.status(403).json({ message: 'Not authorized as admin.' }); // Return 403 for unauthorized admin access
    }
});
