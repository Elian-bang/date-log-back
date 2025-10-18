/**
 * Response Utility Functions
 * Standard response formatting for API endpoints
 */

import { Response } from 'express';
import { ApiResponse, ApiError, PaginationMeta } from '../types/api.types';

/**
 * Send successful API response
 * @param res Express response object
 * @param data Response data
 * @param statusCode HTTP status code (default: 200)
 * @param meta Optional pagination metadata
 * @param links Optional HATEOAS links
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
  links?: ApiResponse<T>['links']
): Response => {
  const response: ApiResponse<T> = {
    data,
    ...(meta && { meta }),
    ...(links && { links }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error API response
 * @param res Express response object
 * @param code Error code
 * @param message Error message
 * @param statusCode HTTP status code (default: 400)
 * @param details Optional error details
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: string | Record<string, unknown>
): Response => {
  const error: ApiError = {
    code,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(error);
};

/**
 * Generate pagination metadata
 * @param totalItems Total number of items
 * @param currentPage Current page number
 * @param itemsPerPage Items per page
 */
export const generatePaginationMeta = (
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

/**
 * Generate HATEOAS links for pagination
 * @param baseUrl Base URL for the resource
 * @param currentPage Current page number
 * @param totalPages Total number of pages
 * @param queryParams Optional query parameters
 */
export const generatePaginationLinks = (
  baseUrl: string,
  currentPage: number,
  totalPages: number,
  queryParams?: Record<string, string | number>
): ApiResponse<unknown>['links'] => {
  const buildUrl = (page: number): string => {
    const params = new URLSearchParams({
      ...queryParams,
      page: page.toString(),
    } as Record<string, string>);
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    self: buildUrl(currentPage),
    ...(currentPage < totalPages && { next: buildUrl(currentPage + 1) }),
    ...(currentPage > 1 && { prev: buildUrl(currentPage - 1) }),
    first: buildUrl(1),
    last: buildUrl(totalPages),
  };
};

/**
 * Parse pagination query parameters
 * @param page Page number from query
 * @param limit Items per page from query
 * @param defaultLimit Default items per page (default: 10)
 * @param maxLimit Maximum items per page (default: 100)
 */
export const parsePaginationQuery = (
  page?: string | number,
  limit?: string | number,
  defaultLimit = 10,
  maxLimit = 100
): { page: number; limit: number; skip: number } => {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(maxLimit, Math.max(1, Number(limit) || defaultLimit));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
};
