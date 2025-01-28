import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

dotenv.config();

// Initialize the Express app
const app = express();

// Middleware for security headers
app.use(helmet());

// Middleware for detailed request logs
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev')); // Only use detailed logs in development mode
} else {
    app.use(morgan('common')); // Use less verbose logs in production
}

// Rate Limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT || 100, // Default 100 requests
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// Allowed origins (localhost for local development and Netlify domain for production)
const allowedOrigins = ['http://localhost:5173', 'https://outlandi-co.netlify.app'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed for this origin'));
        }
    },
    credentials: true,
}));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for server status
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running and healthy!' });
});

// Define your API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit the server if MongoDB connection fails
    });

// Catch-all route for undefined API endpoints
app.use((req, res, next) => {
    console.error(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'API endpoint not found.' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Global Error Handler:', err.stack);
    if (!res.headersSent) {
        res.status(err.status || 500).json({
            message: err.message || 'Internal Server Error',
        });
    }
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('🔄 Gracefully shutting down...');
    await mongoose.connection.close();
    process.exit(0);
});

// Start the server on the specified port (default 5001)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});
