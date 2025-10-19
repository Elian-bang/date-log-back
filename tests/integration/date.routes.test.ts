/**
 * Date Routes Integration Tests
 * Tests HTTP endpoints for date entry operations
 */

import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

// Mock Prisma client
jest.mock('../../src/config/database', () => ({
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

describe('Date Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/dates', () => {
    it('should return all date entries with default pagination', async () => {
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
      ];

      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue(mockDateEntries);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/v1/dates').expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.itemsPerPage).toBe(10);
      expect(response.body.meta.totalItems).toBe(1);
    });

    it('should support pagination with query params', async () => {
      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app).get('/v1/dates?page=2&limit=5').expect(200);

      expect(response.body.meta.currentPage).toBe(2);
      expect(response.body.meta.itemsPerPage).toBe(5);
      expect(prisma.dateEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should filter by date range', async () => {
      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(0);

      await request(app)
        .get('/v1/dates?startDate=2025-10-01&endDate=2025-10-31')
        .expect(200);

      expect(prisma.dateEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            date: {
              gte: new Date('2025-10-01'),
              lte: new Date('2025-10-31'),
            },
          },
        })
      );
    });

    it('should filter by region', async () => {
      (prisma.dateEntry.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.dateEntry.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/v1/dates?region=삼송').expect(200);

      expect(prisma.dateEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { region: '삼송' },
        })
      );
    });
  });

  describe('GET /v1/dates/:id', () => {
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

      const response = await request(app).get('/v1/dates/test-id').expect(200);

      expect(response.body.data.id).toBe('test-id');
      expect(response.body.data.region).toBe('삼송');
    });

    it('should return 404 if date entry not found', async () => {
      (prisma.dateEntry.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/v1/dates/non-existent-id').expect(404);

      expect(response.body.code).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /v1/dates/by-date/:date', () => {
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

      const response = await request(app).get('/v1/dates/by-date/2025-10-18').expect(200);

      expect(response.body.data.date).toBe('2025-10-18');
    });

    it('should return 404 if date entry not found', async () => {
      (prisma.dateEntry.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/v1/dates/by-date/2025-01-01').expect(404);

      expect(response.body.code).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /v1/dates', () => {
    it('should create a new date entry', async () => {
      const newDateEntry = {
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

      const response = await request(app).post('/v1/dates').send(newDateEntry).expect(201);

      expect(response.body.data.id).toBe('new-id');
      expect(response.body.data.region).toBe('삼송');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/v1/dates').send({}).expect(400);

      expect(response.body.code).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 if date format is invalid', async () => {
      const response = await request(app)
        .post('/v1/dates')
        .send({ date: 'invalid-date', region: '삼송' })
        .expect(400);

      expect(response.body.code).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });

  describe('PUT /v1/dates/:id', () => {
    it('should update a date entry', async () => {
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

      const response = await request(app)
        .put('/v1/dates/test-id')
        .send(updateData)
        .expect(200);

      expect(response.body.data.region).toBe('은평');
    });

    it('should return 404 if date entry not found', async () => {
      (prisma.dateEntry.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const response = await request(app)
        .put('/v1/dates/non-existent-id')
        .send({ region: '은평' })
        .expect(404);

      expect(response.body.code).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 if update data is invalid', async () => {
      const response = await request(app)
        .put('/v1/dates/test-id')
        .send({ date: 'invalid-date' })
        .expect(400);

      expect(response.body.code).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });

  describe('DELETE /v1/dates/:id', () => {
    it('should delete a date entry', async () => {
      (prisma.dateEntry.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete('/v1/dates/test-id').expect(200);

      expect(response.body.data.message).toContain('deleted');
    });

    it('should return 404 if date entry not found', async () => {
      (prisma.dateEntry.delete as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const response = await request(app).delete('/v1/dates/non-existent-id').expect(404);

      expect(response.body.code).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });
});
