import bcrypt from 'bcrypt';

const enteredPassword = "Rootbeer7!";  // Exact password you registered with
const storedHash = "$2b$10$6DFGSg2YGlzqc.xbOeOnjOcbVY8IfcgOZeTMgqYhwaKU5hDnw0Tfm";  // Hash from MongoDB

bcrypt.compare(enteredPassword, storedHash)
  .then(match => {
    if (match) {
      console.log("✅ Passwords Match: Login should work!");
    } else {
      console.log("❌ Passwords Do NOT Match: Check password hashing.");
    }
  })
  .catch(err => console.error("Error in bcrypt.compare():", err));
