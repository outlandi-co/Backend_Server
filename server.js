import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

// Import API route files
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

dotenv.config();

// ✅ Debugging Log
console.log("🔄 Starting server.js...");

// Initialize Express app
const app = express();

// Middleware for security headers
app.use(helmet());

// Middleware for detailed request logs
app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'));

// ✅ Rate Limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT || 100, 10), // Default 100 requests
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// ✅ Log all incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.url}`);
    next();
});

// ✅ CORS Configuration
const allowedOrigins = ['http://localhost:5173', 'https://outlandi-co.netlify.app'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`❌ CORS Error: Origin ${origin} is not allowed`);
            callback(new Error('CORS not allowed for this origin'));
        }
    },
    credentials: true, // Allow cookies/credentials
}));

// ✅ Preflight request handling for all routes
app.options('*', cors());

// ✅ Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Root endpoint for basic health check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the API!' });
});

// ✅ Health check endpoint for server status
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running and healthy!' });
});

// ✅ Define API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// ✅ MongoDB Connection with retry logic
const connectDB = async () => {
  try {
      console.log("🔄 Connecting to MongoDB...");

      const conn = await mongoose.connect(process.env.MONGO_URI, {
          dbName: 'Apparel', // ✅ Ensure it connects to the Apparel database
      });

      console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
      console.log(`📌 Using Database: ${conn.connection.db.databaseName}`); // Should output "Apparel"
  } catch (err) {
      console.error('❌ MongoDB Connection Error:', err.message);
      setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

connectDB();

// ✅ Catch-all route for undefined API endpoints
app.use((req, res) => {
    console.error(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'API endpoint not found.' });
});

// ✅ Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Global Error Handler:', err.stack);
    if (!res.headersSent) {
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error',
        });
    }
});

// ✅ Graceful Shutdown for MongoDB and Socket.IO
const gracefulShutdown = async (signal) => {
    console.log(`🔄 Received ${signal}, shutting down gracefully...`);
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed.');
    process.exit(0);
};

// Handle server shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ✅ Initialize HTTP server
const PORT = process.env.PORT || 5001;
const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});

// ✅ Initialize Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: 'https://outlandi-co.netlify.app', // Replace with frontend URL
        methods: ['GET', 'POST'],
    },
});
console.log('✅ Socket.IO Server Initialized');

// ✅ Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log(`🟢 A user connected: ${socket.id}`);

    // Handle stock updates
    socket.on('updateStock', ({ productId, stock }) => {
        console.log(`📦 Stock Updated: Product ID: ${productId}, New Stock: ${stock}`);
        io.emit('stockUpdated', { productId, stock }); // Broadcast update
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log(`🔴 A user disconnected: ${socket.id}`);
    });
});

// ✅ Function to broadcast stock updates
export const updateStock = (productId, stock) => {
    console.log(`📢 Broadcasting Stock Update: ${productId} - ${stock}`);
    io.emit('stockUpdated', { productId, stock });
};
