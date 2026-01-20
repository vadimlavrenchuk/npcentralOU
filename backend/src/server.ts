import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { languageMiddleware } from './middleware/language.middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import inventoryRoutes from './routes/inventory.routes';
import statsRoutes from './routes/stats.routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Language detection middleware
app.use(languageMiddleware);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${corsOptions.origin}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
