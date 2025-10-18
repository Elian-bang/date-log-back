import { Router } from 'express';
import dateRoutes from './date.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DateLog API',
    version: '1.0.0',
  });
});

// API documentation endpoint
router.get('/docs', (_req, res) => {
  res.json({
    message: 'API Documentation',
    swagger: '/docs/openapi.yaml',
    specification: '/docs/api-specification.md',
  });
});

// Date Entry routes
router.use('/dates', dateRoutes);

// Placeholder for future routes
// router.use('/regions', regionRoutes);

export default router;
