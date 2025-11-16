/**
 * Spot Routes Integration Tests
 * Tests HTTP endpoints for spot operations
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

// Mock Prisma client
jest.mock('../../src/config/database', () => ({
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

describe('Spot Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/spots', () => {
    it('should return all spots with default pagination', async () => {
      const mockSpots = [
        {
          id: 'spot-id',
          name: '북한산 둘레길',
          memo: '산책로 좋음',
          image: null,
          link: null,
          visited: false,
          latitude: null,
          longitude: null,
          dateEntryId: 'date-id',
          createdAt: new Date('2025-10-18T10:00:00Z'),
          updatedAt: new Date('2025-10-18T10:00:00Z'),
        },
      ];

      (prisma.spot.findMany as jest.Mock).mockResolvedValue(mockSpots);
      (prisma.spot.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/v1/spots').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('북한산 둘레길');
    });

    it('should filter by visited status', async () => {
      (prisma.spot.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.spot.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/v1/spots?visited=true').expect(200);

      expect(prisma.spot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { visited: true },
        })
      );
    });
  });

  describe('GET /v1/spots/:id', () => {
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

      const response = await request(app).get('/v1/spots/spot-id').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('spot-id');
      expect(response.body.data.name).toBe('북한산 둘레길');
    });

    it('should return 404 if spot not found', async () => {
      (prisma.spot.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/v1/spots/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v1/dates/:dateEntryId/spots', () => {
    it('should create a new spot', async () => {
      const newSpot = {
        name: '새로운 장소',
        memo: '테스트',
        visited: false,
      };

      const mockCreatedSpot = {
        id: 'new-spot-id',
        name: '새로운 장소',
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

      (prisma.spot.create as jest.Mock).mockResolvedValue(mockCreatedSpot);

      const response = await request(app)
        .post('/v1/dates/date-id/spots')
        .send(newSpot)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('새로운 장소');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/v1/dates/date-id/spots')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('PUT /v1/spots/:id', () => {
    it('should update a spot', async () => {
      const updateData = {
        name: '업데이트된 장소',
        visited: true,
      };

      const mockUpdatedSpot = {
        id: 'spot-id',
        name: '업데이트된 장소',
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

      (prisma.spot.update as jest.Mock).mockResolvedValue(mockUpdatedSpot);

      const response = await request(app).put('/v1/spots/spot-id').send(updateData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.visited).toBe(true);
    });

    it('should return 404 if spot not found', async () => {
      (prisma.spot.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const response = await request(app)
        .put('/v1/spots/non-existent-id')
        .send({ name: '장소' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /v1/spots/:id', () => {
    it('should delete a spot', async () => {
      (prisma.spot.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete('/v1/spots/spot-id').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('deleted');
    });

    it('should return 404 if spot not found', async () => {
      (prisma.spot.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const response = await request(app).delete('/v1/spots/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
