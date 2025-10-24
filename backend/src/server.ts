import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from 'dotenv';
import { AppDataSource } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocketIO } from './config/socket';

// Load environment variables
config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'StudySpot AI - Learning Platform API',
    version: process.env.API_VERSION || 'v1',
    status: 'operational',
    endpoints: {
      api: `/api/${process.env.API_VERSION || 'v1'}`,
      health: '/health',
      docs: '/api/docs',
    },
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// Initialize Socket.IO
initializeSocketIO(io);

// Database Connection and Server Start
const startServer = async () => {
  try {
    // Try to initialize TypeORM connection
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️  Database connection failed (this is OK for demo):', error instanceof Error ? error.message : 'Unknown error');
    console.warn('⚠️  Server will start without database. Install PostgreSQL to enable database features.');
  }

  // Start server regardless of database connection
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Docs available at http://localhost:${PORT}/api/docs`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`💻 Frontend: http://localhost:3000`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    await AppDataSource.destroy();
    process.exit(0);
  });
});

startServer();

export { io };
