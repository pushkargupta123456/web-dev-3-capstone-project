import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import connectDB from './config/database';
import { initializeSocket } from './sockets';
import { initializeEventListeners } from './utils/eventBus';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeSocket(io);
initializeEventListeners(io);

app.set('io', io);

const startServer = async (): Promise<void> => {
  await connectDB();
  
  httpServer.listen(PORT, () => {
    console.log(`
=====================================================
  University Campus Management System Server
  Running on port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  API Base: http://localhost:${PORT}/api
  Health Check: http://localhost:${PORT}/health
=====================================================
    `);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
