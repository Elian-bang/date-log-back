/**
 * Date Entry Service Layer
 * Business logic for date entry operations
 */

import prisma from '../config/database';
import {
  CreateDateEntryRequest,
  UpdateDateEntryRequest,
  DateEntryResponse,
  DateEntryQueryFilters,
} from '../types/api.types';
import { DateEntry, Cafe, Restaurant, Spot } from '@prisma/client';

/**
 * Date Entry with relations type
 */
type DateEntryWithRelations = DateEntry & {
  cafes: Cafe[];
  restaurants: Restaurant[];
  spots: Spot[];
};

/**
 * Transform Prisma DateEntry to API response format
 */
const transformDateEntry = (dateEntry: DateEntryWithRelations): DateEntryResponse => ({
  id: dateEntry.id,
  date: dateEntry.date.toISOString().split('T')[0],
  region: dateEntry.region,
  cafes: dateEntry.cafes.map((cafe) => ({
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
  })),
  restaurants: dateEntry.restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    type: restaurant.type as DateEntryResponse['restaurants'][0]['type'],
    memo: restaurant.memo ?? undefined,
    image: restaurant.image ?? undefined,
    link: restaurant.link ?? undefined,
    visited: restaurant.visited,
    latitude: restaurant.latitude ?? undefined,
    longitude: restaurant.longitude ?? undefined,
    dateEntryId: restaurant.dateEntryId,
    createdAt: restaurant.createdAt.toISOString(),
    updatedAt: restaurant.updatedAt.toISOString(),
  })),
  spots: dateEntry.spots.map((spot) => ({
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
  })),
  createdAt: dateEntry.createdAt.toISOString(),
  updatedAt: dateEntry.updatedAt.toISOString(),
});

/**
 * Get all date entries with optional filters and pagination
 */
export const getAllDateEntries = async (
  filters: DateEntryQueryFilters,
  skip: number,
  take: number
): Promise<{ data: DateEntryResponse[]; total: number }> => {
  const where: {
    date?: { gte?: Date; lte?: Date };
    region?: string;
  } = {};

  // Apply date filters
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  // Apply region filter
  if (filters.region) {
    where.region = filters.region;
  }

  // Execute queries in parallel
  const [dateEntries, total] = await Promise.all([
    prisma.dateEntry.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: {
        cafes: true,
        restaurants: true,
        spots: true,
      },
    }),
    prisma.dateEntry.count({ where }),
  ]);

  return {
    data: dateEntries.map(transformDateEntry),
    total,
  };
};

/**
 * Get a single date entry by ID
 */
export const getDateEntryById = async (id: string): Promise<DateEntryResponse | null> => {
  const dateEntry = await prisma.dateEntry.findUnique({
    where: { id },
    include: {
      cafes: true,
      restaurants: true,
      spots: true,
    },
  });

  return dateEntry ? transformDateEntry(dateEntry) : null;
};

/**
 * Get a date entry by specific date
 */
export const getDateEntryByDate = async (date: string): Promise<DateEntryResponse | null> => {
  const dateEntry = await prisma.dateEntry.findUnique({
    where: { date: new Date(date) },
    include: {
      cafes: true,
      restaurants: true,
      spots: true,
    },
  });

  return dateEntry ? transformDateEntry(dateEntry) : null;
};

/**
 * Create a new date entry
 */
export const createDateEntry = async (data: CreateDateEntryRequest): Promise<DateEntryResponse> => {
  const dateEntry = await prisma.dateEntry.create({
    data: {
      date: new Date(data.date),
      region: data.region,
    },
    include: {
      cafes: true,
      restaurants: true,
      spots: true,
    },
  });

  return transformDateEntry(dateEntry);
};

/**
 * Update an existing date entry
 */
export const updateDateEntry = async (
  id: string,
  data: UpdateDateEntryRequest
): Promise<DateEntryResponse | null> => {
  try {
    const dateEntry = await prisma.dateEntry.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.region && { region: data.region }),
      },
      include: {
        cafes: true,
        restaurants: true,
        spots: true,
      },
    });

    return transformDateEntry(dateEntry);
  } catch (error) {
    // Handle record not found
    return null;
  }
};

/**
 * Delete a date entry
 */
export const deleteDateEntry = async (id: string): Promise<boolean> => {
  try {
    await prisma.dateEntry.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    // Handle record not found
    return false;
  }
};
