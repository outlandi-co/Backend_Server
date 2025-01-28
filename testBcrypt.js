import bcrypt from 'bcryptjs';

const enteredPassword = "password";  // The password you tried logging in with
const storedHash = "$2a$10$rIfWpGM6P4WBSFLJolhIMuA8AEBkpcHmDJbGEEm2xswIulmqDX3lq"; // Replace with the stored hash from MongoDB

(async () => {
    const hashedPassword = await bcrypt.hash(enteredPassword, 10);
    console.log("🔍 Newly Hashed Password:", hashedPassword);
    console.log("🔍 Stored Hash:", storedHash);

    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    console.log("✅ Password Match:", isMatch);
})();
