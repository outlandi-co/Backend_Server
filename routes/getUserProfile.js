const asyncHandler = require('express-async-handler');
const User = require('../models/User');
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // Find the user by ID attached to the request by the protect middleware
    const user = await User.findById(req.user._id);
    if (user) {
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
module.exports = {
    getUserProfile,
    // Export other controller functions here if needed
};
