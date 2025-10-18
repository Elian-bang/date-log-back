/**
 * Cafe Routes
 * Route definitions for cafe endpoints
 */

import { Router } from 'express';
import * as cafeController from '../controllers/cafe.controller';

const router = Router();

/**
 * GET /v1/cafes
 * Get all cafes with optional filters and pagination
 * Query params: page, limit, visited
 */
router.get('/', cafeController.getAllCafes);

/**
 * GET /v1/cafes/:id
 * Get a single cafe by ID
 */
router.get('/:id', cafeController.getCafeById);

/**
 * POST /v1/cafes
 * Create a new cafe
 * Body: { name: string, dateEntryId: string, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.post('/', cafeController.createCafe);

/**
 * PUT /v1/cafes/:id
 * Update an existing cafe
 * Body: { name?: string, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.put('/:id', cafeController.updateCafe);

/**
 * DELETE /v1/cafes/:id
 * Delete a cafe
 */
router.delete('/:id', cafeController.deleteCafe);

export default router;
