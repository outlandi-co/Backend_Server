import bcrypt from 'bcrypt';

const enteredPassword = "yourTestPassword";
const storedHashedPassword = "$2a$10$hashFromDB"; // Replace with an actual hash from your DB

const isMatch = await bcrypt.compare(enteredPassword, storedHashedPassword);
console.log("Password Match:", isMatch);
