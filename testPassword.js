import bcrypt from 'bcrypt';

const enteredPassword = "your_actual_password";  // Replace with the real password you used at signup
const storedHash = "$2a$10$0mxrujxagubNwW6mXv2csuqrFhc6YMyzJwaeWYqki7KFvHa8q8SX6";  // Copy from your MongoDB user data

bcrypt.compare(enteredPassword, storedHash)
  .then(match => {
    if (match) {
      console.log("✅ Passwords Match: Login should work!");
    } else {
      console.log("❌ Passwords Do NOT Match: Check if passwords are being hashed properly.");
    }
  })
  .catch(err => console.error("Error in bcrypt.compare():", err));