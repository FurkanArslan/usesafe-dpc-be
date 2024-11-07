import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';
import { initializeDatabase } from './config/database';
import { logger } from './utils/logger';
import { config } from './config';
import { specs } from './config/swagger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes setup
setupRoutes(app);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`API Documentation available at http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();