/**
 * Restaurant Routes Integration Tests
 * Tests HTTP endpoints for restaurant operations
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

// Mock Prisma client
jest.mock('../../src/config/database', () => ({
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

describe('Restaurant Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/restaurants', () => {
    it('should return all restaurants with default pagination', async () => {
      const mockRestaurants = [
        {
          id: 'restaurant-id',
          name: '이이요',
          type: '한식',
          memo: null,
          image: null,
          link: null,
          visited: true,
          latitude: null,
          longitude: null,
          dateEntryId: 'date-id',
          createdAt: new Date('2025-10-18T10:00:00Z'),
          updatedAt: new Date('2025-10-18T10:00:00Z'),
        },
      ];

      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue(mockRestaurants);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/v1/restaurants').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('이이요');
      expect(response.body.data[0].type).toBe('한식');
    });

    it('should filter by type', async () => {
      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/v1/restaurants?type=한식').expect(200);

      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: '한식' },
        })
      );
    });

    it('should filter by visited status', async () => {
      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/v1/restaurants?visited=false').expect(200);

      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { visited: false },
        })
      );
    });

    it('should filter by both type and visited', async () => {
      (prisma.restaurant.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.restaurant.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/v1/restaurants?type=일식&visited=true').expect(200);

      expect(prisma.restaurant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: '일식', visited: true },
        })
      );
    });
  });

  describe('GET /v1/restaurants/:id', () => {
    it('should return a restaurant by ID', async () => {
      const mockRestaurant = {
        id: 'restaurant-id',
        name: '이이요',
        type: '한식',
        memo: '고등어정식 맛있음',
        image: null,
        link: null,
        visited: true,
        latitude: null,
        longitude: null,
        dateEntryId: 'date-id',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(mockRestaurant);

      const response = await request(app).get('/v1/restaurants/restaurant-id').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('restaurant-id');
      expect(response.body.data.type).toBe('한식');
    });

    it('should return 404 if restaurant not found', async () => {
      (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/v1/restaurants/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v1/dates/:dateEntryId/restaurants', () => {
    it('should create a new restaurant', async () => {
      const newRestaurant = {
        name: '새로운 식당',
        type: '중식',
        memo: '테스트',
        visited: false,
      };

      const mockCreatedRestaurant = {
        id: 'new-restaurant-id',
        name: '새로운 식당',
        type: '중식',
        memo: '테스트',
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

      const response = await request(app)
        .post('/v1/dates/date-id/restaurants')
        .send(newRestaurant)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('새로운 식당');
      expect(response.body.data.type).toBe('중식');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/v1/dates/date-id/restaurants')
        .send({ name: '식당' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 400 if type is invalid', async () => {
      const response = await request(app)
        .post('/v1/dates/date-id/restaurants')
        .send({ name: '식당', type: 'invalid-type' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /v1/restaurants/:id', () => {
    it('should update a restaurant', async () => {
      const updateData = {
        name: '업데이트된 식당',
        type: '일식',
        visited: true,
      };

      const mockUpdatedRestaurant = {
        id: 'restaurant-id',
        name: '업데이트된 식당',
        type: '일식',
        memo: null,
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

      const response = await request(app)
        .put('/v1/restaurants/restaurant-id')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('일식');
      expect(response.body.data.visited).toBe(true);
    });

    it('should return 404 if restaurant not found', async () => {
      (prisma.restaurant.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const response = await request(app)
        .put('/v1/restaurants/non-existent-id')
        .send({ name: '식당' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if type is invalid', async () => {
      const response = await request(app)
        .put('/v1/restaurants/restaurant-id')
        .send({ type: 'invalid-type' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /v1/restaurants/:id', () => {
    it('should delete a restaurant', async () => {
      (prisma.restaurant.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete('/v1/restaurants/restaurant-id').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted');
    });

    it('should return 404 if restaurant not found', async () => {
      (prisma.restaurant.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const response = await request(app)
        .delete('/v1/restaurants/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
