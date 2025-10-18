/**
 * Spot Service Layer
 * Business logic for spot operations
 */

import prisma from '../config/database';
import {
  CreateSpotRequest,
  UpdateSpotRequest,
  SpotResponse,
  PlaceQueryFilters,
} from '../types/api.types';
import { Spot } from '@prisma/client';

/**
 * Transform Prisma Spot to API response format
 */
const transformSpot = (spot: Spot): SpotResponse => ({
  id: spot.id,
  name: spot.name,
  memo: spot.memo ?? undefined,
  image: spot.image ?? undefined,
  link: spot.link ?? undefined,
  visited: spot.visited,
  latitude: spot.latitude ?? undefined,
  longitude: spot.longitude ?? undefined,
  dateEntryId: spot.dateEntryId,
  createdAt: spot.createdAt.toISOString(),
  updatedAt: spot.updatedAt.toISOString(),
});

/**
 * Get all spots with optional filters and pagination
 */
export const getAllSpots = async (
  filters: PlaceQueryFilters,
  skip: number,
  take: number
): Promise<{ data: SpotResponse[]; total: number }> => {
  const where: {
    visited?: boolean;
  } = {};

  // Apply visited filter
  if (filters.visited !== undefined) {
    where.visited = filters.visited;
  }

  // Execute queries in parallel
  const [spots, total] = await Promise.all([
    prisma.spot.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.spot.count({ where }),
  ]);

  return {
    data: spots.map(transformSpot),
    total,
  };
};

/**
 * Get a single spot by ID
 */
export const getSpotById = async (id: string): Promise<SpotResponse | null> => {
  const spot = await prisma.spot.findUnique({
    where: { id },
  });

  return spot ? transformSpot(spot) : null;
};

/**
 * Create a new spot
 */
export const createSpot = async (
  data: CreateSpotRequest & { dateEntryId: string }
): Promise<SpotResponse> => {
  const spot = await prisma.spot.create({
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

  return transformSpot(spot);
};

/**
 * Update an existing spot
 */
export const updateSpot = async (
  id: string,
  data: UpdateSpotRequest
): Promise<SpotResponse | null> => {
  try {
    const spot = await prisma.spot.update({
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

    return transformSpot(spot);
  } catch (error) {
    // Handle record not found
    return null;
  }
};

/**
 * Delete a spot
 */
export const deleteSpot = async (id: string): Promise<boolean> => {
  try {
    await prisma.spot.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    // Handle record not found
    return false;
  }
};
