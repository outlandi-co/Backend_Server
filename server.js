import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

dotenv.config(); // Load environment variables from .env file

// Initialize the Express app
const app = express();

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Allowed origins (localhost for local development and Netlify domain for production)
const allowedOrigins = [
    'http://localhost:5173',
    'https://outlandi-co.netlify.app',
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true); // Allow the request
            } else {
                console.error(`CORS error: origin '${origin}' not allowed`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow cookies and credentials in requests
    })
);

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running and healthy!' });
});

// Define API routes
app.use('/api/users', userRoutes); // User-related routes
app.use('/api/products', productRoutes); // Product routes
app.use('/api/uploads', uploadRoutes); // File upload routes
app.use('/api/payments', paymentRoutes); // Payment processing routes
app.use('/api/cart', cartRoutes); // Cart-related routes

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit if connection fails
    });

// Catch-all route for undefined API endpoints
app.use((req, res, next) => {
    res.status(404).json({ message: `API endpoint '${req.originalUrl}' not found.` });
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

// Start the server on the specified port
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});
