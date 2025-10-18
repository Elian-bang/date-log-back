/**
 * Restaurant Routes
 * Route definitions for restaurant endpoints
 */

import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';

const router = Router();

/**
 * GET /v1/restaurants
 * Get all restaurants with optional filters and pagination
 * Query params: page, limit, type, visited
 */
router.get('/', restaurantController.getAllRestaurants);

/**
 * GET /v1/restaurants/:id
 * Get a single restaurant by ID
 */
router.get('/:id', restaurantController.getRestaurantById);

/**
 * POST /v1/restaurants
 * Create a new restaurant
 * Body: { name: string, type: string, dateEntryId: string, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.post('/', restaurantController.createRestaurant);

/**
 * PUT /v1/restaurants/:id
 * Update an existing restaurant
 * Body: { name?: string, type?: string, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.put('/:id', restaurantController.updateRestaurant);

/**
 * DELETE /v1/restaurants/:id
 * Delete a restaurant
 */
router.delete('/:id', restaurantController.deleteRestaurant);

export default router;
