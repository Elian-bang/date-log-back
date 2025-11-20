/**
 * Restaurant Service Layer
 * Business logic for restaurant operations with MongoDB/Mongoose
 */

import mongoose from 'mongoose';
import { Restaurant } from '../models/restaurant.model';
import {
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  RestaurantResponse,
  RestaurantQueryFilters,
  RestaurantType,
} from '../types/api.types';

/**
 * Transform Mongoose Restaurant to API response format
 */
const transformRestaurant = (restaurant: any): RestaurantResponse => ({
  id: restaurant._id.toString(),
  name: restaurant.name,
  type: restaurant.type as RestaurantType,
  memo: restaurant.memo ?? undefined,
  image: restaurant.image ?? undefined,
  link: restaurant.link ?? undefined,
  visited: restaurant.visited,
  latitude: restaurant.latitude ?? undefined,
  longitude: restaurant.longitude ?? undefined,
  dateEntryId: restaurant.dateEntryId.toString(),
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
  const query: any = {};

  // Apply type filter
  if (filters.type) {
    query.type = filters.type;
  }

  // Apply visited filter
  if (filters.visited !== undefined) {
    query.visited = filters.visited;
  }

  // Execute queries in parallel
  const [restaurants, total] = await Promise.all([
    Restaurant.find(query)
      .skip(skip)
      .limit(take)
      .sort({ createdAt: -1 })
      .lean(),
    Restaurant.countDocuments(query),
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const restaurant = await Restaurant.findById(id).lean();

  return restaurant ? transformRestaurant(restaurant) : null;
};

/**
 * Create a new restaurant
 */
export const createRestaurant = async (
  data: CreateRestaurantRequest & { dateEntryId: string }
): Promise<RestaurantResponse> => {
  const restaurant = new Restaurant({
    name: data.name,
    type: data.type,
    memo: data.memo,
    image: data.image,
    link: data.link,
    visited: data.visited ?? false,
    latitude: data.latitude,
    longitude: data.longitude,
    dateEntryId: data.dateEntryId,
  });

  await restaurant.save();

  return transformRestaurant(restaurant.toObject());
};

/**
 * Update an existing restaurant
 */
export const updateRestaurant = async (
  id: string,
  data: UpdateRestaurantRequest
): Promise<RestaurantResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.type) updateData.type = data.type;
  if (data.memo !== undefined) updateData.memo = data.memo;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.visited !== undefined) updateData.visited = data.visited;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;

  const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  return restaurant ? transformRestaurant(restaurant) : null;
};

/**
 * Delete a restaurant
 */
export const deleteRestaurant = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const restaurant = await Restaurant.findByIdAndDelete(id);

  return restaurant !== null;
};
