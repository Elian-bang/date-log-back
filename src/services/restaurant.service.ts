/**
 * Restaurant Service Layer
 * Business logic for restaurant operations
 */

import prisma from '../config/database';
import {
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  RestaurantResponse,
  RestaurantQueryFilters,
  RestaurantType,
} from '../types/api.types';
import { Restaurant } from '@prisma/client';

/**
 * Transform Prisma Restaurant to API response format
 */
const transformRestaurant = (restaurant: Restaurant): RestaurantResponse => ({
  id: restaurant.id,
  name: restaurant.name,
  type: restaurant.type as RestaurantType,
  memo: restaurant.memo ?? undefined,
  image: restaurant.image ?? undefined,
  link: restaurant.link ?? undefined,
  visited: restaurant.visited,
  latitude: restaurant.latitude ?? undefined,
  longitude: restaurant.longitude ?? undefined,
  dateEntryId: restaurant.dateEntryId,
  createdAt: restaurant.createdAt.toISOString(),
  updatedAt: restaurant.updatedAt.toISOString(),
});

/**
 * Get all restaurants with optional filters and pagination
 */
export const getAllRestaurants = async (
  filters: RestaurantQueryFilters,
  skip: number,
  take: number
): Promise<{ data: RestaurantResponse[]; total: number }> => {
  const where: {
    type?: string;
    visited?: boolean;
  } = {};

  // Apply type filter
  if (filters.type) {
    where.type = filters.type;
  }

  // Apply visited filter
  if (filters.visited !== undefined) {
    where.visited = filters.visited;
  }

  // Execute queries in parallel
  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return {
    data: restaurants.map(transformRestaurant),
    total,
  };
};

/**
 * Get a single restaurant by ID
 */
export const getRestaurantById = async (id: string): Promise<RestaurantResponse | null> => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  return restaurant ? transformRestaurant(restaurant) : null;
};

/**
 * Create a new restaurant
 */
export const createRestaurant = async (
  data: CreateRestaurantRequest & { dateEntryId: string }
): Promise<RestaurantResponse> => {
  const restaurant = await prisma.restaurant.create({
    data: {
      name: data.name,
      type: data.type,
      memo: data.memo,
      image: data.image,
      link: data.link,
      visited: data.visited ?? false,
      latitude: data.latitude,
      longitude: data.longitude,
      dateEntryId: data.dateEntryId,
    },
  });

  return transformRestaurant(restaurant);
};

/**
 * Update an existing restaurant
 */
export const updateRestaurant = async (
  id: string,
  data: UpdateRestaurantRequest
): Promise<RestaurantResponse | null> => {
  try {
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.memo !== undefined && { memo: data.memo }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.link !== undefined && { link: data.link }),
        ...(data.visited !== undefined && { visited: data.visited }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
      },
    });

    return transformRestaurant(restaurant);
  } catch (error) {
    // Handle record not found
    return null;
  }
};

/**
 * Delete a restaurant
 */
export const deleteRestaurant = async (id: string): Promise<boolean> => {
  try {
    await prisma.restaurant.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    // Handle record not found
    return false;
  }
};
