import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Define User Schema
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true }, // Ensure username is required and unique
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        resetToken: { type: String },
        resetTokenExpires: { type: Date },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    }
);

// Pre-save middleware to hash the password
userSchema.pre('save', async function (next) {
    try {
        // Only hash the password if it is new or modified
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        next(error); // Pass error to the error handler
    }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Method to generate a password reset token
userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and set to resetToken field
    this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration time (1 hour)
    this.resetTokenExpires = Date.now() + 60 * 60 * 1000;

    return resetToken; // Return plain token for email
};

// Create and export User Model
const User = mongoose.model('User', userSchema);

export default User;
