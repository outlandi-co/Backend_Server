import bcrypt from 'bcrypt';

const saltRounds = 10;
const enteredPassword = "Rootbeer7!";  // Replace with what you used at signup

// Hash the entered password
bcrypt.hash(enteredPassword.trim(), saltRounds)
  .then(hashedPassword => {
    console.log("🔒 Hashed Entered Password:", hashedPassword);
  })
  .catch(err => console.error("Error in bcrypt.hash():", err));
