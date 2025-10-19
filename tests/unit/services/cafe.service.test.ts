/**
 * Cafe Service Unit Tests
 * Tests business logic for cafe operations
 */

import {
  getAllCafes,
  getCafeById,
  createCafe,
  updateCafe,
  deleteCafe,
} from '../../../src/services/cafe.service';
import prisma from '../../../src/config/database';

// Mock Prisma client
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    cafe: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Cafe Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCafes', () => {
    const mockCafes = [
      {
        id: 'cafe-id-1',
        name: '나무사이로',
        memo: '분위기 좋은 창가 자리',
        image: null,
        link: 'https://naver.me/cafe1',
        visited: true,
        latitude: 37.6789,
        longitude: 126.9123,
        dateEntryId: 'date-id-1',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      },
      {
        id: 'cafe-id-2',
        name: '카페 이태리',
        memo: null,
        image: null,
        link: null,
        visited: false,
        latitude: null,
        longitude: null,
        dateEntryId: 'date-id-2',
        createdAt: new Date('2025-10-25T10:00:00Z'),
        updatedAt: new Date('2025-10-25T10:00:00Z'),
      },
    ];

    it('should return all cafes with pagination', async () => {
      (prisma.cafe.findMany as jest.Mock).mockResolvedValue(mockCafes);
      (prisma.cafe.count as jest.Mock).mockResolvedValue(2);

      const result = await getAllCafes({}, 0, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].id).toBe('cafe-id-1');
      expect(result.data[0].name).toBe('나무사이로');
      expect(prisma.cafe.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by visited status', async () => {
      (prisma.cafe.findMany as jest.Mock).mockResolvedValue([mockCafes[0]]);
      (prisma.cafe.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllCafes({ visited: true }, 0, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].visited).toBe(true);
      expect(prisma.cafe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { visited: true },
        })
      );
    });

    it('should handle empty results', async () => {
      (prisma.cafe.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.cafe.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllCafes({}, 0, 10);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should transform null fields to undefined', async () => {
      (prisma.cafe.findMany as jest.Mock).mockResolvedValue([mockCafes[1]]);
      (prisma.cafe.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllCafes({}, 0, 10);

      expect(result.data[0].memo).toBeUndefined();
      expect(result.data[0].image).toBeUndefined();
      expect(result.data[0].link).toBeUndefined();
      expect(result.data[0].latitude).toBeUndefined();
      expect(result.data[0].longitude).toBeUndefined();
    });
  });

  describe('getCafeById', () => {
    it('should return a cafe by ID', async () => {
      const mockCafe = {
        id: 'cafe-id',
        name: '나무사이로',
        memo: '분위기 좋음',
        image: null,
        link: null,
        visited: true,
        latitude: 37.6789,
        longitude: 126.9123,
        dateEntryId: 'date-id',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.cafe.findUnique as jest.Mock).mockResolvedValue(mockCafe);

      const result = await getCafeById('cafe-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('cafe-id');
      expect(result?.name).toBe('나무사이로');
      expect(prisma.cafe.findUnique).toHaveBeenCalledWith({
        where: { id: 'cafe-id' },
      });
    });

    it('should return null if cafe not found', async () => {
      (prisma.cafe.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getCafeById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('createCafe', () => {
    it('should create a new cafe with all fields', async () => {
      const createData = {
        name: '새로운 카페',
        memo: '테스트 메모',
        image: 'https://example.com/image.jpg',
        link: 'https://naver.me/cafe',
        visited: true,
        latitude: 37.5,
        longitude: 127.0,
        dateEntryId: 'date-id',
      };

      const mockCreatedCafe = {
        id: 'new-cafe-id',
        ...createData,
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.cafe.create as jest.Mock).mockResolvedValue(mockCreatedCafe);

      const result = await createCafe(createData);

      expect(result.id).toBe('new-cafe-id');
      expect(result.name).toBe('새로운 카페');
      expect(result.visited).toBe(true);
      expect(prisma.cafe.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should create a cafe with minimal fields', async () => {
      const createData = {
        name: '최소 카페',
        dateEntryId: 'date-id',
      };

      const mockCreatedCafe = {
        id: 'new-cafe-id',
        name: '최소 카페',
        memo: null,
        image: null,
        link: null,
        visited: false,
        latitude: null,
        longitude: null,
        dateEntryId: 'date-id',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.cafe.create as jest.Mock).mockResolvedValue(mockCreatedCafe);

      const result = await createCafe(createData);

      expect(result.id).toBe('new-cafe-id');
      expect(result.visited).toBe(false);
    });
  });

  describe('updateCafe', () => {
    it('should update cafe fields', async () => {
      const updateData = {
        name: '업데이트된 카페',
        memo: '업데이트된 메모',
        visited: true,
      };

      const mockUpdatedCafe = {
        id: 'cafe-id',
        name: '업데이트된 카페',
        memo: '업데이트된 메모',
        image: null,
        link: null,
        visited: true,
        latitude: null,
        longitude: null,
        dateEntryId: 'date-id',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T11:00:00Z'),
      };

      (prisma.cafe.update as jest.Mock).mockResolvedValue(mockUpdatedCafe);

      const result = await updateCafe('cafe-id', updateData);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('업데이트된 카페');
      expect(result?.visited).toBe(true);
    });

    it('should handle undefined optional fields', async () => {
      const updateData = {
        memo: undefined,
        image: undefined,
      };

      const mockUpdatedCafe = {
        id: 'cafe-id',
        name: '카페',
        memo: null,
        image: null,
        link: null,
        visited: false,
        latitude: null,
        longitude: null,
        dateEntryId: 'date-id',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T11:00:00Z'),
      };

      (prisma.cafe.update as jest.Mock).mockResolvedValue(mockUpdatedCafe);

      const result = await updateCafe('cafe-id', updateData);

      expect(result).not.toBeNull();
      expect(prisma.cafe.update).toHaveBeenCalledWith({
        where: { id: 'cafe-id' },
        data: { memo: undefined, image: undefined },
      });
    });

    it('should return null if cafe not found', async () => {
      (prisma.cafe.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await updateCafe('non-existent-id', { name: '카페' });

      expect(result).toBeNull();
    });
  });

  describe('deleteCafe', () => {
    it('should delete a cafe successfully', async () => {
      (prisma.cafe.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteCafe('cafe-id');

      expect(result).toBe(true);
      expect(prisma.cafe.delete).toHaveBeenCalledWith({
        where: { id: 'cafe-id' },
      });
    });

    it('should return false if cafe not found', async () => {
      (prisma.cafe.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await deleteCafe('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
