import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define User Schema
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt`
        collection: 'users', // ✅ Explicitly specify the collection name
    }
);

// ❌ REMOVE Pre-Save Middleware - NO DOUBLE HASHING!
// userSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
// });

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Create and export User Model
const User = mongoose.model('User', userSchema);

export default User;
