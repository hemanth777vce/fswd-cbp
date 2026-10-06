const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (Phase 1 Requirement)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DevPulse API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// Mount Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Fallback for unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[DevPulse Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[DevPulse Server] Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('\n[DevPulse Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[DevPulse Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    return server;
  } catch (error) {
    console.error(`[DevPulse Server] Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
