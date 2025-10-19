/**
 * Cafe Routes Integration Tests
 * Tests HTTP endpoints for cafe operations
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

// Mock Prisma client
jest.mock('../../src/config/database', () => ({
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

describe('Cafe Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/cafes', () => {
    it('should return all cafes with default pagination', async () => {
      const mockCafes = [
        {
          id: 'cafe-id',
          name: '나무사이로',
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

      (prisma.cafe.findMany as jest.Mock).mockResolvedValue(mockCafes);
      (prisma.cafe.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/v1/cafes').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('나무사이로');
    });

    it('should filter by visited status', async () => {
      (prisma.cafe.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.cafe.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/v1/cafes?visited=true').expect(200);

      expect(prisma.cafe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { visited: true },
        })
      );
    });
  });

  describe('GET /v1/cafes/:id', () => {
    it('should return a cafe by ID', async () => {
      const mockCafe = {
        id: 'cafe-id',
        name: '나무사이로',
        memo: null,
        image: null,
        link: null,
        visited: true,
        latitude: null,
        longitude: null,
        dateEntryId: 'date-id',
        createdAt: new Date('2025-10-18T10:00:00Z'),
        updatedAt: new Date('2025-10-18T10:00:00Z'),
      };

      (prisma.cafe.findUnique as jest.Mock).mockResolvedValue(mockCafe);

      const response = await request(app).get('/v1/cafes/cafe-id').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('cafe-id');
    });

    it('should return 404 if cafe not found', async () => {
      (prisma.cafe.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/v1/cafes/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v1/dates/:dateEntryId/cafes', () => {
    it('should create a new cafe', async () => {
      const newCafe = {
        name: '새로운 카페',
        memo: '테스트',
        visited: false,
      };

      const mockCreatedCafe = {
        id: 'new-cafe-id',
        name: '새로운 카페',
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

      (prisma.cafe.create as jest.Mock).mockResolvedValue(mockCreatedCafe);

      const response = await request(app)
        .post('/v1/dates/date-id/cafes')
        .send(newCafe)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('새로운 카페');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/v1/dates/date-id/cafes')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /v1/cafes/:id', () => {
    it('should update a cafe', async () => {
      const updateData = {
        name: '업데이트된 카페',
        visited: true,
      };

      const mockUpdatedCafe = {
        id: 'cafe-id',
        name: '업데이트된 카페',
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

      (prisma.cafe.update as jest.Mock).mockResolvedValue(mockUpdatedCafe);

      const response = await request(app).put('/v1/cafes/cafe-id').send(updateData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.visited).toBe(true);
    });

    it('should return 404 if cafe not found', async () => {
      (prisma.cafe.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const response = await request(app)
        .put('/v1/cafes/non-existent-id')
        .send({ name: '카페' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /v1/cafes/:id', () => {
    it('should delete a cafe', async () => {
      (prisma.cafe.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete('/v1/cafes/cafe-id').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 if cafe not found', async () => {
      (prisma.cafe.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const response = await request(app).delete('/v1/cafes/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
