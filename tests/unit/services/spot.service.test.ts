/**
 * Spot Service Unit Tests
 * Tests business logic for spot operations
 */

import {
  getAllSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot,
} from '../../../src/services/spot.service';
import prisma from '../../../src/config/database';

// Mock Prisma client
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    spot: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Spot Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSpots', () => {
    const mockSpots = [
      {
        id: 'spot-id-1',
        name: '북한산 둘레길',
        memo: '산책로 좋음',
        image: null,
        link: null,
        visited: false,
        latitude: 37.6800,
        longitude: 126.9130,
        dateEntryId: 'date-id-1',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      },
      {
        id: 'spot-id-2',
        name: '북한산 등산로',
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

    it('should return all spots with pagination', async () => {
      (prisma.spot.findMany as jest.Mock).mockResolvedValue(mockSpots);
      (prisma.spot.count as jest.Mock).mockResolvedValue(2);

      const result = await getAllSpots({}, 0, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].id).toBe('spot-id-1');
      expect(result.data[0].name).toBe('북한산 둘레길');
      expect(prisma.spot.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by visited status', async () => {
      (prisma.spot.findMany as jest.Mock).mockResolvedValue([mockSpots[0]]);
      (prisma.spot.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllSpots({ visited: false }, 0, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].visited).toBe(false);
      expect(prisma.spot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { visited: false },
        })
      );
    });

    it('should handle empty results', async () => {
      (prisma.spot.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.spot.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllSpots({}, 0, 10);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should transform null fields to undefined', async () => {
      (prisma.spot.findMany as jest.Mock).mockResolvedValue([mockSpots[1]]);
      (prisma.spot.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllSpots({}, 0, 10);

      expect(result.data[0].memo).toBeUndefined();
      expect(result.data[0].image).toBeUndefined();
      expect(result.data[0].link).toBeUndefined();
      expect(result.data[0].latitude).toBeUndefined();
      expect(result.data[0].longitude).toBeUndefined();
    });
  });

  describe('getSpotById', () => {
    it('should return a spot by ID', async () => {
      const mockSpot = {
        id: 'spot-id',
        name: '북한산 둘레길',
        memo: '산책로 좋음',
        image: null,
        link: null,
        visited: false,
        latitude: 37.6800,
        longitude: 126.9130,
        dateEntryId: 'date-id',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.spot.findUnique as jest.Mock).mockResolvedValue(mockSpot);

      const result = await getSpotById('spot-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('spot-id');
      expect(result?.name).toBe('북한산 둘레길');
      expect(prisma.spot.findUnique).toHaveBeenCalledWith({
        where: { id: 'spot-id' },
      });
    });

    it('should return null if spot not found', async () => {
      (prisma.spot.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getSpotById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('createSpot', () => {
    it('should create a new spot with all fields', async () => {
      const createData = {
        name: '새로운 장소',
        memo: '테스트 메모',
        image: 'https://example.com/image.jpg',
        link: 'https://naver.me/spot',
        visited: true,
        latitude: 37.5,
        longitude: 127.0,
        dateEntryId: 'date-id',
      };

      const mockCreatedSpot = {
        id: 'new-spot-id',
        ...createData,
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.spot.create as jest.Mock).mockResolvedValue(mockCreatedSpot);

      const result = await createSpot(createData);

      expect(result.id).toBe('new-spot-id');
      expect(result.name).toBe('새로운 장소');
      expect(result.visited).toBe(true);
      expect(prisma.spot.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should create a spot with minimal fields', async () => {
      const createData = {
        name: '최소 장소',
        dateEntryId: 'date-id',
      };

      const mockCreatedSpot = {
        id: 'new-spot-id',
        name: '최소 장소',
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

      (prisma.spot.create as jest.Mock).mockResolvedValue(mockCreatedSpot);

      const result = await createSpot(createData);

      expect(result.id).toBe('new-spot-id');
      expect(result.visited).toBe(false);
    });
  });

  describe('updateSpot', () => {
    it('should update spot fields', async () => {
      const updateData = {
        name: '업데이트된 장소',
        memo: '업데이트된 메모',
        visited: true,
      };

      const mockUpdatedSpot = {
        id: 'spot-id',
        name: '업데이트된 장소',
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

      (prisma.spot.update as jest.Mock).mockResolvedValue(mockUpdatedSpot);

      const result = await updateSpot('spot-id', updateData);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('업데이트된 장소');
      expect(result?.visited).toBe(true);
    });

    it('should handle undefined optional fields', async () => {
      const updateData = {
        memo: undefined,
        image: undefined,
      };

      const mockUpdatedSpot = {
        id: 'spot-id',
        name: '장소',
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

      (prisma.spot.update as jest.Mock).mockResolvedValue(mockUpdatedSpot);

      const result = await updateSpot('spot-id', updateData);

      expect(result).not.toBeNull();
    });

    it('should return null if spot not found', async () => {
      (prisma.spot.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await updateSpot('non-existent-id', { name: '장소' });

      expect(result).toBeNull();
    });
  });

  describe('deleteSpot', () => {
    it('should delete a spot successfully', async () => {
      (prisma.spot.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteSpot('spot-id');

      expect(result).toBe(true);
      expect(prisma.spot.delete).toHaveBeenCalledWith({
        where: { id: 'spot-id' },
      });
    });

    it('should return false if spot not found', async () => {
      (prisma.spot.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await deleteSpot('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
