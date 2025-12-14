/**
 * Cafe Service Layer
 * Business logic for cafe operations with MongoDB/Mongoose
 */

import mongoose from 'mongoose';
import { Cafe } from '../models/cafe.model';
import {
  CreateCafeRequest,
  UpdateCafeRequest,
  CafeResponse,
  PlaceQueryFilters,
} from '../types/api.types';

/**
 * Transform Mongoose Cafe to API response format
 */
const transformCafe = (cafe: any): CafeResponse => ({
  id: cafe._id.toString(),
  name: cafe.name,
  memo: cafe.memo ?? undefined,
  image: cafe.image ?? undefined,
  link: cafe.link ?? undefined,
  visited: cafe.visited,
  latitude: cafe.latitude ?? undefined,
  longitude: cafe.longitude ?? undefined,
  dateEntryId: cafe.dateEntryId.toString(),
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
  const query: any = {};

  // Apply visited filter
  if (filters.visited !== undefined) {
    query.visited = filters.visited;
  }

  // Execute queries in parallel
  const [cafes, total] = await Promise.all([
    Cafe.find(query).skip(skip).limit(take).sort({ createdAt: -1 }).lean(),
    Cafe.countDocuments(query),
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const cafe = await Cafe.findById(id).lean();

  return cafe ? transformCafe(cafe) : null;
};

/**
 * Create a new cafe
 */
export const createCafe = async (
  data: CreateCafeRequest & { dateEntryId: string }
): Promise<CafeResponse> => {
  const cafe = new Cafe({
    name: data.name,
    memo: data.memo,
    image: data.image,
    link: data.link,
    visited: data.visited ?? false,
    latitude: data.latitude,
    longitude: data.longitude,
    dateEntryId: data.dateEntryId,
  });

  await cafe.save();

  return transformCafe(cafe.toObject());
};

/**
 * Update an existing cafe
 */
export const updateCafe = async (
  id: string,
  data: UpdateCafeRequest
): Promise<CafeResponse | null> => {
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

  const cafe = await Cafe.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  return cafe ? transformCafe(cafe) : null;
};

/**
 * Delete a cafe
 */
export const deleteCafe = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const cafe = await Cafe.findByIdAndDelete(id);

  return cafe !== null;
};
