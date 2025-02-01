import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser'; // ✅ Handles JWT in cookies
import { Server } from 'socket.io';

dotenv.config();
console.log("🔄 Starting server.js...");

const app = express();

// ✅ Security Middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'));
app.use(cookieParser());

// ✅ Rate Limiting (Prevents Abuse)
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // ⏳ 5 minutes
    max: 500, // 🔥 Increase limit to 500 requests per 5 minutes
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// ✅ CORS Configuration - Allows Cookies & Frontend Access
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true, // ✅ Required for cookies
    })
);// ✅ Ensures CORS Headers are Set
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// ✅ Middleware for Parsing JSON and URL-encoded Bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors()); // ✅ Handle Preflight Requests

// ✅ Health Check Routes
app.get('/', (req, res) => res.status(200).json({ message: 'Welcome to the API!' }));
app.get('/health', (req, res) => res.status(200).json({ message: 'Server is running and healthy!' }));

// ✅ Import API Routes
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// ✅ Define API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// ✅ MongoDB Connection with Retry Logic
const connectDB = async () => {
    try {
        console.log("🔄 Connecting to MongoDB...");
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is not set in environment variables.");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'Apparel', // ✅ Ensure correct database connection
        });

        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
        console.log(`📌 Using Database: ${conn.connection.db.databaseName}`);
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('🔄 Retrying in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};
connectDB();

// ✅ Handle 404 Errors
app.use((req, res) => {
    console.error(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'API endpoint not found.' });
});

// ✅ Global Error Handling Middleware
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

// ✅ Handle Server Shutdown Signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ✅ Initialize HTTP Server
const PORT = process.env.PORT || 5001;
const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// ✅ Initialize Socket.IO Server for Real-time Features
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins, // ✅ Allow frontend URL for WebSockets
        methods: ['GET', 'POST'],
    },
});
console.log('✅ Socket.IO Server Initialized');

// ✅ Handle Socket.IO Connections
io.on('connection', (socket) => {
    console.log(`🟢 A user connected: ${socket.id}`);

    // Handle stock updates
    socket.on('updateStock', ({ productId, stock }) => {
        console.log(`📦 Stock Updated: Product ID: ${productId}, New Stock: ${stock}`);
        io.emit('stockUpdated', { productId, stock });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`🔴 A user disconnected: ${socket.id}`);
    });
});

// ✅ Function to Broadcast Stock Updates
export const updateStock = (productId, stock) => {
    console.log(`📢 Broadcasting Stock Update: ${productId} - ${stock}`);
    io.emit('stockUpdated', { productId, stock });
};
