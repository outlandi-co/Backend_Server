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

// Validate required environment variables
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in the environment variables.');
    process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is not defined. Payment functionality may not work as expected.');
}

const app = express();

// Dynamic CORS Configuration
const allowedOrigins = ['http://localhost:5173', 'https://outlandi-co.netlify.app'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.error(`CORS Error: ${origin} not allowed`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);


// Middleware to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running and healthy!' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    if (!res.headersSent) {
        res.status(err.status || 500).json({
            message: err.message || 'Internal Server Error',
        });
    }
});


// Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});
