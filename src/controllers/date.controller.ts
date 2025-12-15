/**
 * Date Entry Controller
 * HTTP request handlers for date entry endpoints
 */

import { Request, Response } from 'express';
import * as dateService from '../services/date.service';
import {
  sendSuccess,
  sendError,
  parsePaginationQuery,
  generatePaginationMeta,
  generatePaginationLinks,
} from '../utils/response.util';
import {
  CreateDateEntryRequest,
  UpdateDateEntryRequest,
  DateEntryQueryFilters,
} from '../types/api.types';

/**
 * GET /v1/dates
 * Get all date entries with optional filters and pagination
 */
export const getAllDateEntries = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { startDate, endDate, region } = req.query;
    const { page, limit, skip } = parsePaginationQuery(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const filters: DateEntryQueryFilters = {
      ...(startDate && { startDate: startDate as string }),
      ...(endDate && { endDate: endDate as string }),
      ...(region && { region: region as string }),
    };

    const { data, total } = await dateService.getAllDateEntries(filters, skip, limit);

    const meta = generatePaginationMeta(total, page, limit);
    const links = generatePaginationLinks(
      `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
      page,
      meta.totalPages,
      { ...filters, limit: limit.toString() }
    );

    return sendSuccess(res, data, 200, meta, links);
  } catch (error) {
    console.error('Error in getAllDateEntries:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve date entries',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * GET /v1/dates/:id
 * Get a single date entry by ID
 */
export const getDateEntryById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const dateEntry = await dateService.getDateEntryById(id);

    if (!dateEntry) {
      return sendError(res, 'NOT_FOUND', `Date entry with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, dateEntry);
  } catch (error) {
    console.error('Error in getDateEntryById:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve date entry',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * GET /v1/dates/by-date/:date
 * Get a date entry by specific date (YYYY-MM-DD)
 * Query params: region (optional) - Filter by specific region
 */
export const getDateEntryByDate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { date } = req.params;
    const { region } = req.query;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return sendError(res, 'INVALID_DATE_FORMAT', 'Date must be in YYYY-MM-DD format', 400);
    }

    // region 파라미터 있으면 복합 키 조회
    const dateEntry = await dateService.getDateEntryByDate(date, region as string | undefined);

    if (!dateEntry) {
      const errorMsg = region
        ? `Date entry for date '${date}' with region '${region}' not found`
        : `Date entry for date '${date}' not found`;
      return sendError(res, 'NOT_FOUND', errorMsg, 404);
    }

    return sendSuccess(res, dateEntry);
  } catch (error) {
    console.error('Error in getDateEntryByDate:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to retrieve date entry',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * POST /v1/dates
 * Create a new date entry
 */
export const createDateEntry = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body as CreateDateEntryRequest;

    // Validate required fields
    if (!body.date || !body.region) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Missing required fields: date and region are required',
        400
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return sendError(res, 'INVALID_DATE_FORMAT', 'Date must be in YYYY-MM-DD format', 400);
    }

    // Check if date entry already exists (복합 키 검증: date + region)
    const existing = await dateService.getDateEntryByDateAndRegion(body.date, body.region);
    if (existing) {
      return sendError(
        res,
        'DUPLICATE_DATE',
        `Date entry for date '${body.date}' with region '${body.region}' already exists`,
        409
      );
    }

    const dateEntry = await dateService.createDateEntry(body);

    return sendSuccess(res, dateEntry, 201);
  } catch (error) {
    console.error('Error in createDateEntry:', error);

    // MongoDB 에러 핸들링 (안전망)
    if (error instanceof Error && error.message.startsWith('DUPLICATE_ENTRY')) {
      return sendError(res, 'DUPLICATE_DATE', error.message, 409);
    }

    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to create date entry',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * PUT /v1/dates/:id
 * Update an existing date entry
 */
export const updateDateEntry = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateDateEntryRequest;

    // Validate date format if provided
    if (body.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.date)) {
        return sendError(res, 'INVALID_DATE_FORMAT', 'Date must be in YYYY-MM-DD format', 400);
      }
    }

    const dateEntry = await dateService.updateDateEntry(id, body);

    if (!dateEntry) {
      return sendError(res, 'NOT_FOUND', `Date entry with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, dateEntry);
  } catch (error) {
    console.error('Error in updateDateEntry:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to update date entry',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

/**
 * DELETE /v1/dates/:id
 * Delete a date entry
 */
export const deleteDateEntry = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const success = await dateService.deleteDateEntry(id);

    if (!success) {
      return sendError(res, 'NOT_FOUND', `Date entry with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, { message: 'Date entry deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDateEntry:', error);
    return sendError(
      res,
      'INTERNAL_ERROR',
      'Failed to delete date entry',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
