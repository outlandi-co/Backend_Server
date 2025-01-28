import bcrypt from 'bcryptjs';

const testHashing = async () => {
    const originalPassword = "password123"; // Replace with the password you're testing
    console.log("Original password:", originalPassword);

    // Hash the password
    const hashedPassword = await bcrypt.hash(originalPassword, 10);
    console.log("Hashed password:", hashedPassword);

    // Compare the password
    const isMatch = await bcrypt.compare(originalPassword, hashedPassword);
    console.log("Password match:", isMatch);
};

testHashing();
