import bcrypt from 'bcryptjs';

const testPassword = async () => {
    const plaintextPassword = "password123"; // Password used during registration
    const storedHashedPassword = "PLACE_STORED_HASH_HERE"; // Replace with actual hash from DB

    const isMatch = await bcrypt.compare(plaintextPassword, storedHashedPassword);
    console.log("Password match:", isMatch);
};

testPassword();
