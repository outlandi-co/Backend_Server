const jwt = require('jsonwebtoken');
const JWT_SECRET = "your_secret_key"; // Make sure this matches your application
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing.' });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        req.user = user; // Attach user information to the request object
        next();
    });
};
module.exports = authenticateToken;
