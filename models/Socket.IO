import { Server } from 'socket.io';

const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173', // Update with your frontend URL
        methods: ['GET', 'POST'],
    },
});

// Emit stock updates to clients
io.on('connection', (socket) => {
    console.log('A user connected.');

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

export const updateStock = (productId, stock) => {
    io.emit('stockUpdated', { productId, stock });
};
