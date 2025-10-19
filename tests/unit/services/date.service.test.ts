/**
 * Date Service Unit Tests
 * Tests business logic for date entry operations
 */

import {
  getAllDateEntries,
  getDateEntryById,
  getDateEntryByDate,
  createDateEntry,
  updateDateEntry,
  deleteDateEntry,
} from '../../../src/services/date.service';
import prisma from '../../../src/config/database';

// Mock Prisma client
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    dateEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Date Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDateEntries', () => {
    const mockDateEntries = [
      {
        id: 'test-id-1',
        date: new Date('2025-10-18'),
        region: '삼송',
        cafes: [],
        restaurants: [],
        spots: [],
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      },
      {
        id: 'test-id-2',
        date: new Date('2025-10-25'),
        region: '은평',
        cafes: [],
        restaurants: [],
        spots: [],
        createdAt: new Date('2025-10-25T10:00:00Z'),
        updatedAt: new Date('2025-10-25T10:00:00Z'),
      },
    ];

    it('should return all date entries with pagination', async () => {
      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue(mockDateEntries);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(2);

      const result = await getAllDateEntries({}, 0, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].id).toBe('test-id-1');
      expect(result.data[0].date).toBe('2025-10-18');
      expect(prisma.dateEntry.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          cafes: true,
          restaurants: true,
          spots: true,
        },
      });
    });

    it('should filter by date range', async () => {
      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue([mockDateEntries[0]]);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllDateEntries(
        { startDate: '2025-10-18', endDate: '2025-10-20' },
        0,
        10
      );

      expect(result.data).toHaveLength(1);
      expect(prisma.dateEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            date: {
              gte: new Date('2025-10-18'),
              lte: new Date('2025-10-20'),
            },
          },
        })
      );
    });

    it('should filter by region', async () => {
      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue([mockDateEntries[1]]);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllDateEntries({ region: '은평' }, 0, 10);

      expect(result.data).toHaveLength(1);
      expect(prisma.dateEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { region: '은평' },
        })
      );
    });

    it('should handle empty results', async () => {
      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllDateEntries({}, 0, 10);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getDateEntryById', () => {
    it('should return a date entry by ID', async () => {
      const mockDateEntry = {
        id: 'test-id',
        date: new Date('2025-10-18'),
        region: '삼송',
        cafes: [],
        restaurants: [],
        spots: [],
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.dateEntry.findUnique as jest.Mock).mockResolvedValue(mockDateEntry);

      const result = await getDateEntryById('test-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(result?.date).toBe('2025-10-18');
      expect(prisma.dateEntry.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          cafes: true,
          restaurants: true,
          spots: true,
        },
      });
    });

    it('should return null if date entry not found', async () => {
      (prisma.dateEntry.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getDateEntryById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getDateEntryByDate', () => {
    it('should return a date entry by date', async () => {
      const mockDateEntry = {
        id: 'test-id',
        date: new Date('2025-10-18'),
        region: '삼송',
        cafes: [],
        restaurants: [],
        spots: [],
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.dateEntry.findUnique as jest.Mock).mockResolvedValue(mockDateEntry);

      const result = await getDateEntryByDate('2025-10-18');

      expect(result).not.toBeNull();
      expect(result?.date).toBe('2025-10-18');
      expect(prisma.dateEntry.findUnique).toHaveBeenCalledWith({
        where: { date: new Date('2025-10-18') },
        include: {
          cafes: true,
          restaurants: true,
          spots: true,
        },
      });
    });

    it('should return null if date entry not found', async () => {
      (prisma.dateEntry.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getDateEntryByDate('2025-01-01');

      expect(result).toBeNull();
    });
  });

  describe('createDateEntry', () => {
    it('should create a new date entry', async () => {
      const createData = {
        date: '2025-10-18',
        region: '삼송',
      };

      const mockCreatedEntry = {
        id: 'new-id',
        date: new Date('2025-10-18'),
        region: '삼송',
        cafes: [],
        restaurants: [],
        spots: [],
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.dateEntry.create as jest.Mock).mockResolvedValue(mockCreatedEntry);

      const result = await createDateEntry(createData);

      expect(result.id).toBe('new-id');
      expect(result.date).toBe('2025-10-18');
      expect(result.region).toBe('삼송');
      expect(prisma.dateEntry.create).toHaveBeenCalledWith({
        data: {
          date: new Date('2025-10-18'),
          region: '삼송',
        },
        include: {
          cafes: true,
          restaurants: true,
          spots: true,
        },
      });
    });
  });

  describe('updateDateEntry', () => {
    it('should update an existing date entry', async () => {
      const updateData = {
        region: '은평',
      };

      const mockUpdatedEntry = {
        id: 'test-id',
        date: new Date('2025-10-18'),
        region: '은평',
        cafes: [],
        restaurants: [],
        spots: [],
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T11:00:00Z'),
      };

      (prisma.dateEntry.update as jest.Mock).mockResolvedValue(mockUpdatedEntry);

      const result = await updateDateEntry('test-id', updateData);

      expect(result).not.toBeNull();
      expect(result?.region).toBe('은평');
      expect(prisma.dateEntry.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { region: '은평' },
        include: {
          cafes: true,
          restaurants: true,
          spots: true,
        },
      });
    });

    it('should update date field', async () => {
      const updateData = {
        date: '2025-10-25',
      };

      const mockUpdatedEntry = {
        id: 'test-id',
        date: new Date('2025-10-25'),
        region: '삼송',
        cafes: [],
        restaurants: [],
        spots: [],
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T11:00:00Z'),
      };

      (prisma.dateEntry.update as jest.Mock).mockResolvedValue(mockUpdatedEntry);

      const result = await updateDateEntry('test-id', updateData);

      expect(result).not.toBeNull();
      expect(result?.date).toBe('2025-10-25');
      expect(prisma.dateEntry.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { date: new Date('2025-10-25') },
        include: {
          cafes: true,
          restaurants: true,
          spots: true,
        },
      });
    });

    it('should return null if date entry not found', async () => {
      (prisma.dateEntry.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await updateDateEntry('non-existent-id', { region: '은평' });

      expect(result).toBeNull();
    });
  });

  describe('deleteDateEntry', () => {
    it('should delete a date entry successfully', async () => {
      (prisma.dateEntry.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteDateEntry('test-id');

      expect(result).toBe(true);
      expect(prisma.dateEntry.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should return false if date entry not found', async () => {
      (prisma.dateEntry.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await deleteDateEntry('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
