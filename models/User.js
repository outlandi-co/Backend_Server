import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Define the User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true }, // Sparse allows multiple null values
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    resetToken: { type: String }, // Stores the reset token
    resetTokenExpires: { type: Date }, // Expiration time for the reset token
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Middleware: Hash the password before saving
userSchema.pre('save', async function (next) {
    // Only hash the password if it's new or modified
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method: Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Method: Generate a secure reset token
userSchema.methods.generateResetToken = function () {
    // Generate a 32-byte random token in hexadecimal format
    const token = crypto.randomBytes(32).toString('hex');
    // Save the token and expiration date in the user document
    this.resetToken = token;
    this.resetTokenExpires = Date.now() + 3600000; // Token valid for 1 hour
    return token;
};

export default mongoose.model('User', userSchema);
