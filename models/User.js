import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // For generating reset tokens

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, unique: true, sparse: true }, // Allows null values for username
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        resetToken: { type: String }, // Token for password reset
        resetTokenExpires: { type: Date }, // Expiry for the reset token
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate a password reset token
userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // Hash the token
    this.resetTokenExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
    return resetToken; // Return plain text token for email
};

export default mongoose.model('User', userSchema);
