import { Router } from 'express';
import dateRoutes from './date.routes';
import cafeRoutes from './cafe.routes';
import restaurantRoutes from './restaurant.routes';
import spotRoutes from './spot.routes';

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

// API routes
router.use('/dates', dateRoutes);
router.use('/cafes', cafeRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/spots', spotRoutes);

export default router;
