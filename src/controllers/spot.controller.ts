/**
 * Spot Controller
 * HTTP request handlers for spot endpoints
 */

import { Request, Response } from 'express';
import * as spotService from '../services/spot.service';
import {
  sendSuccess,
  sendError,
  parsePaginationQuery,
  generatePaginationMeta,
  generatePaginationLinks,
} from '../utils/response.util';
import { CreateSpotRequest, UpdateSpotRequest, PlaceQueryFilters } from '../types/api.types';

/**
 * GET /v1/spots
 * Get all spots with optional filters and pagination
 */
export const getAllSpots = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { visited } = req.query;
    const { page, limit, skip } = parsePaginationQuery(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const filters: PlaceQueryFilters = {
      ...(visited !== undefined && { visited: visited === 'true' }),
    };

    const { data, total } = await spotService.getAllSpots(filters, skip, limit);

    const meta = generatePaginationMeta(total, page, limit);
    const links = generatePaginationLinks(
      `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
      page,
      meta.totalPages,
      {
        ...(filters.visited !== undefined && { visited: filters.visited.toString() }),
        limit: limit.toString(),
      }
    );

    return sendSuccess(res, data, 200, meta, links);
  } catch (error) {
    console.error('Error in getAllSpots:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve spots',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * GET /v1/spots/:id
 * Get a single spot by ID
 */
export const getSpotById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const spot = await spotService.getSpotById(id);

    if (!spot) {
      return sendError(res, 'NOT_FOUND', `Spot with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, spot);
  } catch (error) {
    console.error('Error in getSpotById:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve spot',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * POST /v1/spots
 * Create a new spot
 */
export const createSpot = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body as CreateSpotRequest & { dateEntryId: string };

    // Validate required fields
    if (!body.name || !body.dateEntryId) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Missing required fields: name and dateEntryId are required',
        400
      );
    }

    const spot = await spotService.createSpot(body);

    return sendSuccess(res, spot, 201);
  } catch (error) {
    console.error('Error in createSpot:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to create spot',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * PUT /v1/spots/:id
 * Update an existing spot
 */
export const updateSpot = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateSpotRequest;

    const spot = await spotService.updateSpot(id, body);

    if (!spot) {
      return sendError(res, 'NOT_FOUND', `Spot with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, spot);
  } catch (error) {
    console.error('Error in updateSpot:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to update spot',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * DELETE /v1/spots/:id
 * Delete a spot
 */
export const deleteSpot = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const success = await spotService.deleteSpot(id);

    if (!success) {
      return sendError(res, 'NOT_FOUND', `Spot with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, { message: 'Spot deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSpot:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to delete spot',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
