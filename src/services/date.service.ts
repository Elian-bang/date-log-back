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
    DateEntry.find(query)
      .skip(skip)
      .limit(take)
      .sort({ date: -1 })
      .lean(),
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
 * Get a date entry by specific date
 */
export const getDateEntryByDate = async (date: string): Promise<DateEntryResponse | null> => {
  const dateEntry = await DateEntry.findOne({ date: new Date(date) }).lean();

  return dateEntry ? transformDateEntry(dateEntry as unknown as IDateEntry) : null;
};

/**
 * Create a new date entry
 */
export const createDateEntry = async (data: CreateDateEntryRequest): Promise<DateEntryResponse> => {
  const dateEntry = new DateEntry({
    date: new Date(data.date),
    region: data.region,
  });

  await dateEntry.save();

  return transformDateEntry(dateEntry);
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dateEntry = await DateEntry.findByIdAndDelete(id).session(session);

    if (!dateEntry) {
      await session.abortTransaction();
      return false;
    }

    // CASCADE DELETE: Delete all related entities
    await Promise.all([
      Cafe.deleteMany({ dateEntryId: id }).session(session),
      Restaurant.deleteMany({ dateEntryId: id }).session(session),
      Spot.deleteMany({ dateEntryId: id }).session(session),
    ]);

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    return false;
  } finally {
    session.endSession();
  }
};
