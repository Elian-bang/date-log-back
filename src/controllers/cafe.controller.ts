/**
 * Cafe Controller
 * HTTP request handlers for cafe endpoints
 */

import { Request, Response } from 'express';
import * as cafeService from '../services/cafe.service';
import {
  sendSuccess,
  sendError,
  parsePaginationQuery,
  generatePaginationMeta,
  generatePaginationLinks,
} from '../utils/response.util';
import { CreateCafeRequest, UpdateCafeRequest, PlaceQueryFilters } from '../types/api.types';

/**
 * GET /v1/cafes
 * Get all cafes with optional filters and pagination
 */
export const getAllCafes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { visited } = req.query;
    const { page, limit, skip } = parsePaginationQuery(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const filters: PlaceQueryFilters = {
      ...(visited !== undefined && { visited: visited === 'true' }),
    };

    const { data, total } = await cafeService.getAllCafes(filters, skip, limit);

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
    console.error('Error in getAllCafes:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve cafes',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * GET /v1/cafes/:id
 * Get a single cafe by ID
 */
export const getCafeById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const cafe = await cafeService.getCafeById(id);

    if (!cafe) {
      return sendError(res, 'NOT_FOUND', `Cafe with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, cafe);
  } catch (error) {
    console.error('Error in getCafeById:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve cafe',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * POST /v1/cafes
 * Create a new cafe
 */
export const createCafe = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body as CreateCafeRequest & { dateEntryId: string };

    // Validate required fields
    if (!body.name || !body.dateEntryId) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Missing required fields: name and dateEntryId are required',
        400
      );
    }

    const cafe = await cafeService.createCafe(body);

    return sendSuccess(res, cafe, 201);
  } catch (error) {
    console.error('Error in createCafe:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to create cafe',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * PUT /v1/cafes/:id
 * Update an existing cafe
 */
export const updateCafe = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateCafeRequest;

    const cafe = await cafeService.updateCafe(id, body);

    if (!cafe) {
      return sendError(res, 'NOT_FOUND', `Cafe with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, cafe);
  } catch (error) {
    console.error('Error in updateCafe:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to update cafe',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * DELETE /v1/cafes/:id
 * Delete a cafe
 */
export const deleteCafe = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const success = await cafeService.deleteCafe(id);

    if (!success) {
      return sendError(res, 'NOT_FOUND', `Cafe with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, { message: 'Cafe deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCafe:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to delete cafe',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
