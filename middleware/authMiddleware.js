import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// ✅ Middleware to protect routes (requires valid JWT)
export const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.jwt;

    if (!token) {
        console.warn("🔴 No token provided in request.");
        return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    try {
        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // ✅ Fetch user from database (excluding password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.warn("🚫 Unauthorized - User not found.");
            return res.status(401).json({ message: "Unauthorized - User Not Found" });
        }

        console.log(`✅ User authenticated: ${req.user.email}`);
        next();
    } catch (error) {
        console.error("❌ Token Verification Failed:", error.message);
        return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
});

// ✅ Middleware to check if user is an admin
export const admin = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        console.warn("🔴 No user found in request. Access denied.");
        return res.status(403).json({ message: "Access Denied - Not Logged In" });
    }

    if (req.user.isAdmin) {
        console.log("✅ Admin access granted.");
        next();
    } else {
        console.warn("🚫 Access Denied: Admins only.");
        return res.status(403).json({ message: "Access Denied - Admins Only" });
    }
});
