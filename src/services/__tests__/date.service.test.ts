/**
 * Date Service Unit Tests
 */

import mongoose from 'mongoose';
import { DateEntry } from '../../models/dateEntry.model';
import { Cafe } from '../../models/cafe.model';
import { Restaurant } from '../../models/restaurant.model';
import { Spot } from '../../models/spot.model';
import * as dateService from '../date.service';

describe('DateService', () => {
  describe('createDateEntry', () => {
    it('should create a new date entry', async () => {
      const data = {
        date: '2025-01-15',
        region: '삼송',
      };

      const result = await dateService.createDateEntry(data);

      expect(result).toBeDefined();
      expect(result.date).toBe('2025-01-15');
      expect(result.region).toBe('삼송');
      expect(result.id).toBeDefined();
      expect(result.cafes).toEqual([]);
      expect(result.restaurants).toEqual([]);
      expect(result.spots).toEqual([]);
    });

    it('should enforce unique date+region constraint', async () => {
      const data = {
        date: '2025-01-15',
        region: '삼송',
      };

      await dateService.createDateEntry(data);

      await expect(dateService.createDateEntry(data)).rejects.toThrow();
    });

    it('should allow same date with different region', async () => {
      await dateService.createDateEntry({
        date: '2025-01-15',
        region: '삼송',
      });

      const result = await dateService.createDateEntry({
        date: '2025-01-15',
        region: '연신내',
      });

      expect(result).toBeDefined();
      expect(result.region).toBe('연신내');
    });
  });

  describe('getAllDateEntries', () => {
    it('should return empty array when no entries exist', async () => {
      const result = await dateService.getAllDateEntries({}, 0, 10);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should return all entries with pagination', async () => {
      // Create test data
      await DateEntry.create([
        { date: new Date('2025-01-01'), region: '삼송' },
        { date: new Date('2025-01-02'), region: '연신내' },
        { date: new Date('2025-01-03'), region: '홍대' },
      ]);

      const result = await dateService.getAllDateEntries({}, 0, 10);

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should apply pagination correctly', async () => {
      // Create test data
      await DateEntry.create([
        { date: new Date('2025-01-01'), region: '삼송' },
        { date: new Date('2025-01-02'), region: '연신내' },
        { date: new Date('2025-01-03'), region: '홍대' },
      ]);

      const result = await dateService.getAllDateEntries({}, 0, 2);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it('should filter by region', async () => {
      await DateEntry.create([
        { date: new Date('2025-01-01'), region: '삼송' },
        { date: new Date('2025-01-02'), region: '연신내' },
        { date: new Date('2025-01-03'), region: '삼송' },
      ]);

      const result = await dateService.getAllDateEntries({ region: '삼송' }, 0, 10);

      expect(result.data).toHaveLength(2);
      expect(result.data.every((entry) => entry.region === '삼송')).toBe(true);
    });

    it('should filter by date range', async () => {
      await DateEntry.create([
        { date: new Date('2025-01-01'), region: '삼송' },
        { date: new Date('2025-01-15'), region: '연신내' },
        { date: new Date('2025-01-31'), region: '홍대' },
      ]);

      const result = await dateService.getAllDateEntries(
        {
          startDate: '2025-01-10',
          endDate: '2025-01-20',
        },
        0,
        10
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].date).toBe('2025-01-15');
    });
  });

  describe('getDateEntryById', () => {
    it('should return entry by id', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const result = await dateService.getDateEntryById(entry._id.toString());

      expect(result).toBeDefined();
      expect(result?.region).toBe('삼송');
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await dateService.getDateEntryById(fakeId);
      expect(result).toBeNull();
    });

    it('should return null for invalid id format', async () => {
      const result = await dateService.getDateEntryById('invalid-id');
      expect(result).toBeNull();
    });

    it('should include related cafes, restaurants, and spots', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      // Create related entities
      await Cafe.create({
        dateEntryId: entry._id,
        name: '스타벅스',
        visited: false,
      });

      await Restaurant.create({
        dateEntryId: entry._id,
        name: '맛있는 식당',
        type: '한식',
        visited: true,
      });

      await Spot.create({
        dateEntryId: entry._id,
        name: '한강공원',
        visited: false,
      });

      const result = await dateService.getDateEntryById(entry._id.toString());

      expect(result).toBeDefined();
      expect(result?.cafes).toHaveLength(1);
      expect(result?.cafes[0].name).toBe('스타벅스');
      expect(result?.restaurants).toHaveLength(1);
      expect(result?.restaurants[0].name).toBe('맛있는 식당');
      expect(result?.spots).toHaveLength(1);
      expect(result?.spots[0].name).toBe('한강공원');
    });
  });

  describe('updateDateEntry', () => {
    it('should update date entry region', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const result = await dateService.updateDateEntry(entry._id.toString(), {
        region: '연신내',
      });

      expect(result).toBeDefined();
      expect(result?.region).toBe('연신내');
    });

    it('should update date entry date', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const result = await dateService.updateDateEntry(entry._id.toString(), {
        date: '2025-02-20',
      });

      expect(result).toBeDefined();
      expect(result?.date).toBe('2025-02-20');
    });

    it('should return null for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await dateService.updateDateEntry(fakeId, { region: '홍대' });
      expect(result).toBeNull();
    });
  });

  describe('deleteDateEntry', () => {
    it('should delete entry and return true', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const result = await dateService.deleteDateEntry(entry._id.toString());

      expect(result).toBe(true);

      const deleted = await DateEntry.findById(entry._id);
      expect(deleted).toBeNull();
    });

    it('should cascade delete related entities', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      // Create related entities
      await Cafe.create({
        dateEntryId: entry._id,
        name: '테스트 카페',
        visited: false,
      });

      await Restaurant.create({
        dateEntryId: entry._id,
        name: '테스트 식당',
        type: '한식',
        visited: false,
      });

      await Spot.create({
        dateEntryId: entry._id,
        name: '테스트 장소',
        visited: false,
      });

      const result = await dateService.deleteDateEntry(entry._id.toString());

      expect(result).toBe(true);

      // Verify cascade delete
      const cafes = await Cafe.find({ dateEntryId: entry._id });
      const restaurants = await Restaurant.find({ dateEntryId: entry._id });
      const spots = await Spot.find({ dateEntryId: entry._id });

      expect(cafes).toHaveLength(0);
      expect(restaurants).toHaveLength(0);
      expect(spots).toHaveLength(0);
    });

    it('should return false for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await dateService.deleteDateEntry(fakeId);
      expect(result).toBe(false);
    });

    it('should return false for invalid id format', async () => {
      const result = await dateService.deleteDateEntry('invalid-id');
      expect(result).toBe(false);
    });
  });

  describe('getDateEntryByDate', () => {
    it('should return entry by date', async () => {
      await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const result = await dateService.getDateEntryByDate('2025-01-15');

      expect(result).toBeDefined();
      expect(result?.region).toBe('삼송');
    });

    it('should return null for non-existent date', async () => {
      const result = await dateService.getDateEntryByDate('2025-12-31');
      expect(result).toBeNull();
    });
  });
});
