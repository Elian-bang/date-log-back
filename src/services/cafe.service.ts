/**
 * Cafe Service Layer
 * Business logic for cafe operations
 */

import prisma from '../config/database';
import {
  CreateCafeRequest,
  UpdateCafeRequest,
  CafeResponse,
  PlaceQueryFilters,
} from '../types/api.types';
import { Cafe } from '@prisma/client';

/**
 * Transform Prisma Cafe to API response format
 */
const transformCafe = (cafe: Cafe): CafeResponse => ({
  id: cafe.id,
  name: cafe.name,
  memo: cafe.memo ?? undefined,
  image: cafe.image ?? undefined,
  link: cafe.link ?? undefined,
  visited: cafe.visited,
  latitude: cafe.latitude ?? undefined,
  longitude: cafe.longitude ?? undefined,
  dateEntryId: cafe.dateEntryId,
  createdAt: cafe.createdAt.toISOString(),
  updatedAt: cafe.updatedAt.toISOString(),
});

/**
 * Get all cafes with optional filters and pagination
 */
export const getAllCafes = async (
  filters: PlaceQueryFilters,
  skip: number,
  take: number
): Promise<{ data: CafeResponse[]; total: number }> => {
  const where: {
    visited?: boolean;
  } = {};

  // Apply visited filter
  if (filters.visited !== undefined) {
    where.visited = filters.visited;
  }

  // Execute queries in parallel
  const [cafes, total] = await Promise.all([
    prisma.cafe.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.cafe.count({ where }),
  ]);

  return {
    data: cafes.map(transformCafe),
    total,
  };
};

/**
 * Get a single cafe by ID
 */
export const getCafeById = async (id: string): Promise<CafeResponse | null> => {
  const cafe = await prisma.cafe.findUnique({
    where: { id },
  });

  return cafe ? transformCafe(cafe) : null;
};

/**
 * Create a new cafe
 */
export const createCafe = async (
  data: CreateCafeRequest & { dateEntryId: string }
): Promise<CafeResponse> => {
  const cafe = await prisma.cafe.create({
    data: {
      name: data.name,
      memo: data.memo,
      image: data.image,
      link: data.link,
      visited: data.visited ?? false,
      latitude: data.latitude,
      longitude: data.longitude,
      dateEntryId: data.dateEntryId,
    },
  });

  return transformCafe(cafe);
};

/**
 * Update an existing cafe
 */
export const updateCafe = async (
  id: string,
  data: UpdateCafeRequest
): Promise<CafeResponse | null> => {
  try {
    const cafe = await prisma.cafe.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.memo !== undefined && { memo: data.memo }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.link !== undefined && { link: data.link }),
        ...(data.visited !== undefined && { visited: data.visited }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
      },
    });

    return transformCafe(cafe);
  } catch (error) {
    // Handle record not found
    return null;
  }
};

/**
 * Delete a cafe
 */
export const deleteCafe = async (id: string): Promise<boolean> => {
  try {
    await prisma.cafe.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    // Handle record not found
    return false;
  }
};
