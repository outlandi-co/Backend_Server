import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

dotenv.config();

// Ensure required environment variables are set
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set in the environment variables.');
    process.exit(1); // Exit the process if MONGO_URI is not set
}

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is not set. Payment routes may not function properly.');
}

const app = express();

// Middleware for dynamic CORS configuration
const allowedOrigins = ['http://localhost:5173', 'https://outlandi-co.netlify.app'];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.error(`❌ CORS Error: Origin ${origin} not allowed`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow cookies and authorization headers
    })
);

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy!' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true, // Ensures compatibility with older connection strings
        useUnifiedTopology: true, // Handles server discovery and monitoring
    })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit the process if the connection fails
    });

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

// Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
