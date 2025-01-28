import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

// Setup Express App First
const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// ✅ Initialize Socket.IO and Configure CORS
const io = new Server(httpServer, {
    cors: {
        origin: 'https://outlandi-co.netlify.app', // Replace with your frontend URL
        methods: ['GET', 'POST'], // Specify allowed methods
        credentials: true, // Allow cookies and authentication
    },
});

console.log('✅ Socket.IO Server Initialized');

// ✅ Handle Client Connections
io.on('connection', (socket) => {
    console.log(`🟢 A user connected: ${socket.id}`);

    // Handle Stock Updates
    socket.on('updateStock', ({ productId, stock }) => {
        if (!productId || stock === undefined) {
            console.error('❌ Invalid Stock Update Payload:', { productId, stock });
            return;
        }

        console.log(`📦 Stock Updated: Product ID: ${productId}, New Stock: ${stock}`);
        io.emit('stockUpdated', { productId, stock }); // Broadcast update to all clients
    });

    // Handle Disconnections
    socket.on('disconnect', () => {
        console.log(`🔴 A user disconnected: ${socket.id}`);
    });

    // Example: Custom Event Handling (Optional)
    socket.on('customEvent', (data) => {
        console.log('🔹 Received Custom Event:', data);
        // Perform custom logic or emit events if needed
    });
});

// ✅ Function to Broadcast Stock Updates from Backend
export const updateStock = (productId, stock) => {
    if (!productId || stock === undefined) {
        console.error('❌ Invalid Stock Update Payload for Broadcast:', { productId, stock });
        return;
    }

    console.log(`📢 Broadcasting Stock Update: Product ID: ${productId}, Stock: ${stock}`);
    io.emit('stockUpdated', { productId, stock });
};

// ✅ Graceful Shutdown for Socket.IO and HTTP Server
const gracefulShutdown = async (signal) => {
    console.log(`🔄 Received ${signal}, shutting down gracefully...`);
    httpServer.close(() => {
        console.log('🛑 HTTP Server closed.');
    });

    io.close(() => {
        console.log('🛑 Socket.IO Server closed.');
    });

    process.exit(0);
};

// Handle Shutdown Signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
