import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import { resetPassword } from './controllers/userController.js'; // Import resetPassword

dotenv.config();

// Initialize the Express app
const app = express();

// Allowed origins (localhost for local development and Netlify domain for production)
const allowedOrigins = ['http://localhost:5173', 'https://outlandi-co.netlify.app'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true); // Allow the request
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow cookies to be sent with requests
    })
);

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for server status
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running and healthy!' });
});

// Temporary direct route for testing /reset-password
app.post('/api/users/reset-password', resetPassword);

// Define your API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// MongoDB Connection with error handling
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Exit the server if MongoDB connection fails
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

// Start the server on the specified port (default 5001)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});
