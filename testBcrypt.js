import bcrypt from 'bcryptjs';

const enteredPassword = "password"; // The password you are testing
const storedHash = "$2a$10$rIfWpGM6P4WBSFLJolhIMuA8AEBkpcHmDJbGEEm2xswIulmqDX3lq"; // The hash from MongoDB

(async () => {
    const newHash = await bcrypt.hash(enteredPassword, 10);
    console.log("🔍 Newly Hashed Password:", newHash);
    console.log("🔍 Stored Hash:", storedHash);

    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    console.log("✅ Password Match:", isMatch);
})();
