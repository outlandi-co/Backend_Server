import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

dotenv.config();
console.log("🔄 Starting server.js...");

const app = express();

// ✅ Security Middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'));
app.use(cookieParser());

// ✅ Fix: Proper CORS Configuration for Secure Cookies
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];

app.use(
    cors({
        origin: allowedOrigins,  // ✅ Allow frontend URL
        credentials: true,        // ✅ Allow cookies to be sent
        optionsSuccessStatus: 200 // ✅ Handle preflight requests properly
    })
);

// ✅ Handle Preflight Requests (CORS)
app.options('*', cors());

// ✅ Middleware for Parsing JSON and URL-encoded Bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ensure Cookies & Headers Are Set Correctly
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// ✅ Import API Routes
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// ✅ Define API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// ✅ Connect to MongoDB
const connectDB = async () => {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'Apparel',
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        setTimeout(connectDB, 5000); // Retry in 5 seconds
    }
};
connectDB();

// ✅ MongoDB Event Listeners for Better Debugging
mongoose.connection.on("connected", () => console.log("🟢 MongoDB Connected"));
mongoose.connection.on("error", (err) => console.error("🔴 MongoDB Connection Error:", err));
mongoose.connection.on("disconnected", () => console.warn("🟡 MongoDB Disconnected"));

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
