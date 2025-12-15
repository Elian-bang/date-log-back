/**
 * Date Entry Service Layer
 * Business logic for date entry operations with MongoDB/Mongoose
 */

import mongoose from 'mongoose';
import { DateEntry, IDateEntry } from '../models/dateEntry.model';
import { Cafe } from '../models/cafe.model';
import { Restaurant } from '../models/restaurant.model';
import { Spot } from '../models/spot.model';
import {
  CreateDateEntryRequest,
  UpdateDateEntryRequest,
  DateEntryResponse,
  DateEntryQueryFilters,
} from '../types/api.types';

/**
 * Transform Mongoose DateEntry to API response format
 */
const transformDateEntry = async (dateEntry: IDateEntry): Promise<DateEntryResponse> => {
  const [cafes, restaurants, spots] = await Promise.all([
    Cafe.find({ dateEntryId: dateEntry._id }).lean(),
    Restaurant.find({ dateEntryId: dateEntry._id }).lean(),
    Spot.find({ dateEntryId: dateEntry._id }).lean(),
  ]);

  return {
    id: dateEntry._id.toString(),
    date: dateEntry.date.toISOString().split('T')[0],
    region: dateEntry.region,
    cafes: cafes.map((cafe) => ({
      id: cafe._id.toString(),
      name: cafe.name,
      memo: cafe.memo,
      image: cafe.image,
      link: cafe.link,
      visited: cafe.visited,
      latitude: cafe.latitude,
      longitude: cafe.longitude,
      dateEntryId: cafe.dateEntryId.toString(),
      createdAt: cafe.createdAt.toISOString(),
      updatedAt: cafe.updatedAt.toISOString(),
    })),
    restaurants: restaurants.map((restaurant) => ({
      id: restaurant._id.toString(),
      name: restaurant.name,
      type: restaurant.type as DateEntryResponse['restaurants'][0]['type'],
      memo: restaurant.memo,
      image: restaurant.image,
      link: restaurant.link,
      visited: restaurant.visited,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      dateEntryId: restaurant.dateEntryId.toString(),
      createdAt: restaurant.createdAt.toISOString(),
      updatedAt: restaurant.updatedAt.toISOString(),
    })),
    spots: spots.map((spot) => ({
      id: spot._id.toString(),
      name: spot.name,
      memo: spot.memo,
      image: spot.image,
      link: spot.link,
      visited: spot.visited,
      latitude: spot.latitude,
      longitude: spot.longitude,
      dateEntryId: spot.dateEntryId.toString(),
      createdAt: spot.createdAt.toISOString(),
      updatedAt: spot.updatedAt.toISOString(),
    })),
    createdAt: dateEntry.createdAt.toISOString(),
    updatedAt: dateEntry.updatedAt.toISOString(),
  };
};

/**
 * Get all date entries with optional filters and pagination
 */
export const getAllDateEntries = async (
  filters: DateEntryQueryFilters,
  skip: number,
  take: number
): Promise<{ data: DateEntryResponse[]; total: number }> => {
  const query: any = {};

  // Apply date filters
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  // Apply region filter
  if (filters.region) {
    query.region = filters.region;
  }

  // Execute queries in parallel
  const [dateEntries, total] = await Promise.all([
    DateEntry.find(query).skip(skip).limit(take).sort({ date: -1 }).lean(),
    DateEntry.countDocuments(query),
  ]);

  // Transform all entries
  const transformedData = await Promise.all(
    dateEntries.map((entry) => transformDateEntry(entry as unknown as IDateEntry))
  );

  return {
    data: transformedData,
    total,
  };
};

/**
 * Get a single date entry by ID
 */
export const getDateEntryById = async (id: string): Promise<DateEntryResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const dateEntry = await DateEntry.findById(id).lean();

  return dateEntry ? transformDateEntry(dateEntry as unknown as IDateEntry) : null;
};

/**
 * Get a date entry by date and region (복합 키 조회)
 */
export const getDateEntryByDateAndRegion = async (
  date: string,
  region: string
): Promise<DateEntryResponse | null> => {
  const dateEntry = await DateEntry.findOne({
    date: new Date(date),
    region: region,
  }).lean();

  return dateEntry ? transformDateEntry(dateEntry as unknown as IDateEntry) : null;
};

/**
 * Get a date entry by specific date (backward compatibility)
 * Optional region 파라미터로 유연성 제공
 */
export const getDateEntryByDate = async (
  date: string,
  region?: string
): Promise<DateEntryResponse | null> => {
  const query: any = { date: new Date(date) };
  if (region) {
    query.region = region;
  }

  const dateEntry = await DateEntry.findOne(query).lean();

  return dateEntry ? transformDateEntry(dateEntry as unknown as IDateEntry) : null;
};

/**
 * Create a new date entry with nested cafes, restaurants, and spots
 */
export const createDateEntry = async (data: CreateDateEntryRequest): Promise<DateEntryResponse> => {
  try {
    // 1. Create DateEntry
    const dateEntry = new DateEntry({
      date: new Date(data.date),
      region: data.region,
    });

    await dateEntry.save();

    // 2. Create nested entities (cafes, restaurants, spots)
    const dateEntryId = dateEntry._id;
    const createPromises: Promise<any>[] = [];

    // Create cafes
    if (data.cafes && data.cafes.length > 0) {
      const cafePromises = data.cafes.map((cafeData) =>
        new Cafe({
          ...cafeData,
          dateEntryId,
          visited: cafeData.visited ?? false,
        }).save()
      );
      createPromises.push(...cafePromises);
    }

    // Create restaurants
    if (data.restaurants && data.restaurants.length > 0) {
      const restaurantPromises = data.restaurants.map((restaurantData) =>
        new Restaurant({
          ...restaurantData,
          dateEntryId,
          visited: restaurantData.visited ?? false,
        }).save()
      );
      createPromises.push(...restaurantPromises);
    }

    // Create spots
    if (data.spots && data.spots.length > 0) {
      const spotPromises = data.spots.map((spotData) =>
        new Spot({
          ...spotData,
          dateEntryId,
          visited: spotData.visited ?? false,
        }).save()
      );
      createPromises.push(...spotPromises);
    }

    // Execute all creations in parallel
    if (createPromises.length > 0) {
      await Promise.all(createPromises);
    }

    // 3. Return with all nested data
    return transformDateEntry(dateEntry);
  } catch (error: any) {
    // MongoDB 복합 유니크 인덱스 위반 처리 (race condition 방지)
    if (error.code === 11000) {
      throw new Error(
        `DUPLICATE_ENTRY: Date '${data.date}' with region '${data.region}' already exists`
      );
    }
    throw error;
  }
};

/**
 * Update an existing date entry
 */
export const updateDateEntry = async (
  id: string,
  data: UpdateDateEntryRequest
): Promise<DateEntryResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const updateData: any = {};
  if (data.date) {
    updateData.date = new Date(data.date);
  }
  if (data.region) {
    updateData.region = data.region;
  }

  const dateEntry = await DateEntry.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  return dateEntry ? transformDateEntry(dateEntry as unknown as IDateEntry) : null;
};

/**
 * Delete a date entry (CASCADE: also deletes related cafes, restaurants, spots)
 */
export const deleteDateEntry = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  try {
    const dateEntry = await DateEntry.findByIdAndDelete(id);

    if (!dateEntry) {
      return false;
    }

    // CASCADE DELETE: Delete all related entities
    await Promise.all([
      Cafe.deleteMany({ dateEntryId: id }),
      Restaurant.deleteMany({ dateEntryId: id }),
      Spot.deleteMany({ dateEntryId: id }),
    ]);

    return true;
  } catch (error) {
    console.error('Error deleting date entry:', error);
    return false;
  }
};
