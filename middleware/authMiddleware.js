import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'; // Ensure correct path

// ✅ Protect middleware - Verifies JWT token and authenticates the user
export const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;
    
    console.log(`🔍 JWT from Cookie: ${token}`);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No Token Provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        console.log(`✅ Verified User: ${req.user.email}`);
        next();
    } catch (error) {
        console.error('❌ Token Verification Error:', error.message);
        res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }
});

// ✅ Admin middleware - Ensures only admin users can access specific routes
export const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Access Denied - Admins Only' });
    }
};
