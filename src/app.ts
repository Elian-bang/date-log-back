import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Routes
app.use('/v1', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'DateLog API Server',
    version: '1.0.0',
    documentation: '/v1/docs',
    health: '/v1/health',
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
