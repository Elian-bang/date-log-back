/**
 * Date Entry Routes
 * Route definitions for date entry endpoints
 */

import { Router } from 'express';
import * as dateController from '../controllers/date.controller';

const router = Router();

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

export default router;
