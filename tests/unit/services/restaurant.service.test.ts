/**
 * Restaurant Service Unit Tests
 * Tests business logic for restaurant operations
 */

import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../../../src/services/restaurant.service';
import prisma from '../../../src/config/database';
import { RestaurantType } from '../../../src/types/api.types';

// Mock Prisma client
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    restaurant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Restaurant Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRestaurants', () => {
    const mockRestaurants = [
      {
        id: 'restaurant-id-1',
        name: '이이요',
        type: '한식',
        memo: '고등어정식 맛있음',
        image: null,
        link: null,
        visited: true,
        latitude: 37.6790,
        longitude: 126.9125,
        dateEntryId: 'date-id-1',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      },
      {
        id: 'restaurant-id-2',
        name: '스시 하나',
        type: '일식',
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

    it('should return all restaurants with pagination', async () => {
      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue(mockRestaurants);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(2);

      const result = await getAllRestaurants({}, 0, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].id).toBe('restaurant-id-1');
      expect(result.data[0].name).toBe('이이요');
      expect(prisma.restaurant.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by type', async () => {
      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue([mockRestaurants[0]]);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllRestaurants({ type: RestaurantType.KOREAN }, 0, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('한식');
      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: RestaurantType.KOREAN },
        })
      );
    });

    it('should filter by visited status', async () => {
      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue([mockRestaurants[0]]);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllRestaurants({ visited: true }, 0, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].visited).toBe(true);
      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { visited: true },
        })
      );
    });

    it('should filter by both type and visited status', async () => {
      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue([mockRestaurants[0]]);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllRestaurants({ type: RestaurantType.KOREAN, visited: true }, 0, 10);

      expect(result.data).toHaveLength(1);
      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: RestaurantType.KOREAN, visited: true },
        })
      );
    });

    it('should handle empty results', async () => {
      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllRestaurants({}, 0, 10);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getRestaurantById', () => {
    it('should return a restaurant by ID', async () => {
      const mockRestaurant = {
        id: 'restaurant-id',
        name: '이이요',
        type: '한식',
        memo: '고등어정식 맛있음',
        image: null,
        link: null,
        visited: true,
        latitude: 37.6790,
        longitude: 126.9125,
        dateEntryId: 'date-id',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(mockRestaurant);

      const result = await getRestaurantById('restaurant-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('restaurant-id');
      expect(result?.name).toBe('이이요');
      expect(result?.type).toBe('한식');
      expect(prisma.restaurant.findUnique).toHaveBeenCalledWith({
        where: { id: 'restaurant-id' },
      });
    });

    it('should return null if restaurant not found', async () => {
      (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getRestaurantById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('createRestaurant', () => {
    it('should create a new restaurant with all fields', async () => {
      const createData = {
        name: '새로운 식당',
        type: RestaurantType.CHINESE,
        memo: '테스트 메모',
        image: 'https://example.com/image.jpg',
        link: 'https://naver.me/restaurant',
        visited: true,
        latitude: 37.5,
        longitude: 127.0,
        dateEntryId: 'date-id',
      };

      const mockCreatedRestaurant = {
        id: 'new-restaurant-id',
        ...createData,
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.restaurant.create as jest.Mock).mockResolvedValue(mockCreatedRestaurant);

      const result = await createRestaurant(createData);

      expect(result.id).toBe('new-restaurant-id');
      expect(result.name).toBe('새로운 식당');
      expect(result.type).toBe('중식');
      expect(result.visited).toBe(true);
      expect(prisma.restaurant.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should create a restaurant with minimal fields', async () => {
      const createData = {
        name: '최소 식당',
        type: RestaurantType.MEAT,
        dateEntryId: 'date-id',
      };

      const mockCreatedRestaurant = {
        id: 'new-restaurant-id',
        name: '최소 식당',
        type: '고기집',
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

      (prisma.restaurant.create as jest.Mock).mockResolvedValue(mockCreatedRestaurant);

      const result = await createRestaurant(createData);

      expect(result.id).toBe('new-restaurant-id');
      expect(result.visited).toBe(false);
    });
  });

  describe('updateRestaurant', () => {
    it('should update restaurant fields', async () => {
      const updateData = {
        name: '업데이트된 식당',
        type: RestaurantType.JAPANESE,
        memo: '업데이트된 메모',
        visited: true,
      };

      const mockUpdatedRestaurant = {
        id: 'restaurant-id',
        name: '업데이트된 식당',
        type: '일식',
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

      (prisma.restaurant.update as jest.Mock).mockResolvedValue(mockUpdatedRestaurant);

      const result = await updateRestaurant('restaurant-id', updateData);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('업데이트된 식당');
      expect(result?.type).toBe('일식');
      expect(result?.visited).toBe(true);
    });

    it('should handle undefined optional fields', async () => {
      const updateData = {
        memo: undefined,
        image: undefined,
      };

      const mockUpdatedRestaurant = {
        id: 'restaurant-id',
        name: '식당',
        type: '한식',
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

      (prisma.restaurant.update as jest.Mock).mockResolvedValue(mockUpdatedRestaurant);

      const result = await updateRestaurant('restaurant-id', updateData);

      expect(result).not.toBeNull();
    });

    it('should return null if restaurant not found', async () => {
      (prisma.restaurant.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await updateRestaurant('non-existent-id', { name: '식당' });

      expect(result).toBeNull();
    });
  });

  describe('deleteRestaurant', () => {
    it('should delete a restaurant successfully', async () => {
      (prisma.restaurant.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteRestaurant('restaurant-id');

      expect(result).toBe(true);
      expect(prisma.restaurant.delete).toHaveBeenCalledWith({
        where: { id: 'restaurant-id' },
      });
    });

    it('should return false if restaurant not found', async () => {
      (prisma.restaurant.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await deleteRestaurant('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
