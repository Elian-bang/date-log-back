/**
 * Restaurant Controller
 * HTTP request handlers for restaurant endpoints
 */

import { Request, Response } from 'express';
import * as restaurantService from '../services/restaurant.service';
import {
  sendSuccess,
  sendError,
  parsePaginationQuery,
  generatePaginationMeta,
  generatePaginationLinks,
} from '../utils/response.util';
import {
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  RestaurantQueryFilters,
  RestaurantType,
} from '../types/api.types';

/**
 * Validate restaurant type
 */
const isValidRestaurantType = (type: string): type is RestaurantType => {
  return Object.values(RestaurantType).includes(type as RestaurantType);
};

/**
 * GET /v1/restaurants
 * Get all restaurants with optional filters and pagination
 */
export const getAllRestaurants = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { type, visited } = req.query;
    const { page, limit, skip } = parsePaginationQuery(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    // Validate type if provided
    if (type && !isValidRestaurantType(type as string)) {
      return sendError(
        res,
        'INVALID_TYPE',
        `Invalid restaurant type. Must be one of: ${Object.values(RestaurantType).join(', ')}`,
        400
      );
    }

    const filters: RestaurantQueryFilters = {
      ...(type && { type: type as RestaurantType }),
      ...(visited !== undefined && { visited: visited === 'true' }),
    };

    const { data, total } = await restaurantService.getAllRestaurants(filters, skip, limit);

    const meta = generatePaginationMeta(total, page, limit);
    const links = generatePaginationLinks(
      `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
      page,
      meta.totalPages,
      {
        ...(filters.type && { type: filters.type }),
        ...(filters.visited !== undefined && { visited: filters.visited.toString() }),
        limit: limit.toString(),
      }
    );

    return sendSuccess(res, data, 200, meta, links);
  } catch (error) {
    console.error('Error in getAllRestaurants:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve restaurants',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * GET /v1/restaurants/:id
 * Get a single restaurant by ID
 */
export const getRestaurantById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const restaurant = await restaurantService.getRestaurantById(id);

    if (!restaurant) {
      return sendError(res, 'NOT_FOUND', `Restaurant with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, restaurant);
  } catch (error) {
    console.error('Error in getRestaurantById:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve restaurant',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * POST /v1/restaurants
 * Create a new restaurant
 */
export const createRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body as CreateRestaurantRequest & { dateEntryId: string };

    // Validate required fields
    if (!body.name || !body.type || !body.dateEntryId) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Missing required fields: name, type, and dateEntryId are required',
        400
      );
    }

    // Validate type
    if (!isValidRestaurantType(body.type)) {
      return sendError(
        res,
        'INVALID_TYPE',
        `Invalid restaurant type. Must be one of: ${Object.values(RestaurantType).join(', ')}`,
        400
      );
    }

    const restaurant = await restaurantService.createRestaurant(body);

    return sendSuccess(res, restaurant, 201);
  } catch (error) {
    console.error('Error in createRestaurant:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to create restaurant',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * PUT /v1/restaurants/:id
 * Update an existing restaurant
 */
export const updateRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateRestaurantRequest;

    // Validate type if provided
    if (body.type && !isValidRestaurantType(body.type)) {
      return sendError(
        res,
        'INVALID_TYPE',
        `Invalid restaurant type. Must be one of: ${Object.values(RestaurantType).join(', ')}`,
        400
      );
    }

    const restaurant = await restaurantService.updateRestaurant(id, body);

    if (!restaurant) {
      return sendError(res, 'NOT_FOUND', `Restaurant with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, restaurant);
  } catch (error) {
    console.error('Error in updateRestaurant:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to update restaurant',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * DELETE /v1/restaurants/:id
 * Delete a restaurant
 */
export const deleteRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const success = await restaurantService.deleteRestaurant(id);

    if (!success) {
      return sendError(res, 'NOT_FOUND', `Restaurant with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, { message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRestaurant:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to delete restaurant',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
