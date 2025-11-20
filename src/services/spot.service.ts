/**
 * Spot Service Layer
 * Business logic for spot operations with MongoDB/Mongoose
 */

import mongoose from 'mongoose';
import { Spot } from '../models/spot.model';
import {
  CreateSpotRequest,
  UpdateSpotRequest,
  SpotResponse,
  PlaceQueryFilters,
} from '../types/api.types';

/**
 * Transform Mongoose Spot to API response format
 */
const transformSpot = (spot: any): SpotResponse => ({
  id: spot._id.toString(),
  name: spot.name,
  memo: spot.memo ?? undefined,
  image: spot.image ?? undefined,
  link: spot.link ?? undefined,
  visited: spot.visited,
  latitude: spot.latitude ?? undefined,
  longitude: spot.longitude ?? undefined,
  dateEntryId: spot.dateEntryId.toString(),
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
  const query: any = {};

  // Apply visited filter
  if (filters.visited !== undefined) {
    query.visited = filters.visited;
  }

  // Execute queries in parallel
  const [spots, total] = await Promise.all([
    Spot.find(query)
      .skip(skip)
      .limit(take)
      .sort({ createdAt: -1 })
      .lean(),
    Spot.countDocuments(query),
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const spot = await Spot.findById(id).lean();

  return spot ? transformSpot(spot) : null;
};

/**
 * Create a new spot
 */
export const createSpot = async (
  data: CreateSpotRequest & { dateEntryId: string }
): Promise<SpotResponse> => {
  const spot = new Spot({
    name: data.name,
    memo: data.memo,
    image: data.image,
    link: data.link,
    visited: data.visited ?? false,
    latitude: data.latitude,
    longitude: data.longitude,
    dateEntryId: data.dateEntryId,
  });

  await spot.save();

  return transformSpot(spot.toObject());
};

/**
 * Update an existing spot
 */
export const updateSpot = async (
  id: string,
  data: UpdateSpotRequest
): Promise<SpotResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.memo !== undefined) updateData.memo = data.memo;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.visited !== undefined) updateData.visited = data.visited;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;

  const spot = await Spot.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  return spot ? transformSpot(spot) : null;
};

/**
 * Delete a spot
 */
export const deleteSpot = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const spot = await Spot.findByIdAndDelete(id);

  return spot !== null;
};
