/**
 * Spot Routes
 * Route definitions for spot endpoints
 */

import { Router } from 'express';
import * as spotController from '../controllers/spot.controller';

const router = Router();

/**
 * GET /v1/spots
 * Get all spots with optional filters and pagination
 * Query params: page, limit, visited
 */
router.get('/', spotController.getAllSpots);

/**
 * GET /v1/spots/:id
 * Get a single spot by ID
 */
router.get('/:id', spotController.getSpotById);

/**
 * POST /v1/spots
 * Create a new spot
 * Body: { name: string, dateEntryId: string, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.post('/', spotController.createSpot);

/**
 * PUT /v1/spots/:id
 * Update an existing spot
 * Body: { name?: string, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.put('/:id', spotController.updateSpot);

/**
 * DELETE /v1/spots/:id
 * Delete a spot
 */
router.delete('/:id', spotController.deleteSpot);

export default router;
