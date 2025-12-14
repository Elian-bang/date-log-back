/**
 * Date Entry Routes
 * Route definitions for date entry endpoints
 */

import { Router, Request, Response } from 'express';
import * as dateController from '../controllers/date.controller';
import * as cafeController from '../controllers/cafe.controller';
import * as restaurantController from '../controllers/restaurant.controller';
import * as spotController from '../controllers/spot.controller';

const router = Router();

/**
 * Wrapper to inject dateEntryId from URL params into request body
 */
const injectDateEntryId = (controller: (req: Request, res: Response) => Promise<Response>) => {
  return async (req: Request, res: Response): Promise<Response> => {
    req.body.dateEntryId = req.params.dateEntryId;
    return controller(req, res);
  };
};

/**
 * GET /v1/dates
 * Get all date entries with optional filters and pagination
 * Query params: page, limit, startDate, endDate, region
 */
router.get('/', dateController.getAllDateEntries);

/**
 * GET /v1/dates/by-date/:date
 * Get a date entry by specific date (YYYY-MM-DD)
 */
router.get('/by-date/:date', dateController.getDateEntryByDate);

/**
 * GET /v1/dates/:id
 * Get a single date entry by ID
 */
router.get('/:id', dateController.getDateEntryById);

/**
 * POST /v1/dates
 * Create a new date entry
 * Body: { date: string, region: string }
 */
router.post('/', dateController.createDateEntry);

/**
 * PUT /v1/dates/:id
 * Update an existing date entry
 * Body: { date?: string, region?: string }
 */
router.put('/:id', dateController.updateDateEntry);

/**
 * DELETE /v1/dates/:id
 * Delete a date entry
 */
router.delete('/:id', dateController.deleteDateEntry);

/**
 * Nested resource routes for creating child entities under a date entry
 */

/**
 * POST /v1/dates/:dateEntryId/cafes
 * Create a new cafe under a date entry
 * Body: { name: string, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.post('/:dateEntryId/cafes', injectDateEntryId(cafeController.createCafe));

/**
 * POST /v1/dates/:dateEntryId/restaurants
 * Create a new restaurant under a date entry
 * Body: { name: string, type: RestaurantType, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.post('/:dateEntryId/restaurants', injectDateEntryId(restaurantController.createRestaurant));

/**
 * POST /v1/dates/:dateEntryId/spots
 * Create a new spot under a date entry
 * Body: { name: string, memo?: string, image?: string, link?: string, visited?: boolean, latitude?: number, longitude?: number }
 */
router.post('/:dateEntryId/spots', injectDateEntryId(spotController.createSpot));

export default router;
