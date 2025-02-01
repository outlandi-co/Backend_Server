import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

/**
 * ✅ Protect Middleware - Verifies JWT Token
 * - Checks for token in Authorization Header (`Bearer <token>`)
 * - If not found, checks cookies (`jwt`)
 * - Attaches authenticated user to `req.user`
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    console.log("🔍 Checking for authentication token...");

    // ✅ Check Authorization Header for Bearer Token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("📌 Found Bearer Token in Headers:", token);
    }
    // ✅ If no Bearer Token, check for JWT in Cookies
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
        console.log("🍪 Found JWT Token in Cookies:", token);
    }

    if (!token) {
        console.error("❌ No token provided. User not authorized.");
        return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    try {
        // ✅ Decode and verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Attach user to request (excluding password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.error("❌ User not found in database.");
            return res.status(401).json({ message: "Not authorized. User not found." });
        }

        console.log(`✅ User Authenticated: ${req.user.email}`);
        next();
    } catch (error) {
        console.error("❌ Authorization Error:", error.message);

        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: "Token expired. Please log in again." });
        } else {
            res.status(401).json({ message: "Not authorized. Token verification failed." });
        }
    }
});

/**
 * ✅ Admin Middleware - Restricts access to Admin Users
 * - Ensures `req.user` exists and `isAdmin` is `true`
 */
export const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        console.log(`🔑 Admin Access Granted: ${req.user.email}`);
        next();
    } else {
        console.error(`🚫 Access Denied: ${req.user ? req.user.email : "No User"}`);
        res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
});
