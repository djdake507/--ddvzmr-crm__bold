import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from '@utils/logger';
import errorHandler from '@middleware/errorHandler';
import { initializeDatabase } from '@database/init';
import contactRoutes from '@api/routes/contactRoutes';
import dealRoutes from '@api/routes/dealRoutes';
import agentRoutes from '@api/routes/agentRoutes';
import authRoutes from '@api/routes/authRoutes';
import workflowRoutes from '@api/routes/workflowRoutes';
import { authMiddleware } from '@middleware/authMiddleware';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Public API Routes
app.use('/api/auth', authRoutes);

// Protected API Routes (require authentication)
app.use('/api/contacts', authMiddleware, contactRoutes);
app.use('/api/deals', authMiddleware, dealRoutes);
app.use('/api/agents', authMiddleware, agentRoutes);
app.use('/api/workflows', workflowRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info('API Documentation available at /api/docs');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
