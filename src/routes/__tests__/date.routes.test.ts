/**
 * Date Routes Integration Tests
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { DateEntry } from '../../models/dateEntry.model';
import { Cafe } from '../../models/cafe.model';
import { Restaurant } from '../../models/restaurant.model';
import { Spot } from '../../models/spot.model';

describe('Date Routes', () => {
  describe('GET /v1/dates', () => {
    it('should return empty array initially', async () => {
      const res = await request(app).get('/v1/dates').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.totalItems).toBe(0);
    });

    it('should return all date entries', async () => {
      await DateEntry.create([
        { date: new Date('2025-01-01'), region: '삼송' },
        { date: new Date('2025-01-02'), region: '연신내' },
      ]);

      const res = await request(app).get('/v1/dates').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should support pagination', async () => {
      await DateEntry.create([
        { date: new Date('2025-01-01'), region: '삼송' },
        { date: new Date('2025-01-02'), region: '연신내' },
        { date: new Date('2025-01-03'), region: '홍대' },
      ]);

      const res = await request(app).get('/v1/dates?page=1&limit=2').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.totalItems).toBe(3);
    });

    it('should filter by region', async () => {
      await DateEntry.create([
        { date: new Date('2025-01-01'), region: '삼송' },
        { date: new Date('2025-01-02'), region: '연신내' },
      ]);

      const res = await request(app).get('/v1/dates?region=삼송').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].region).toBe('삼송');
    });
  });

  describe('POST /v1/dates', () => {
    it('should create a new date entry', async () => {
      const newEntry = {
        date: '2025-01-15',
        region: '삼송',
      };

      const res = await request(app).post('/v1/dates').send(newEntry).expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.date).toBe('2025-01-15');
      expect(res.body.data.region).toBe('삼송');
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/v1/dates').send({ date: '2025-01-15' }).expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid date format', async () => {
      const res = await request(app)
        .post('/v1/dates')
        .send({ date: 'invalid-date', region: '삼송' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should return 409 for duplicate date+region', async () => {
      await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const res = await request(app)
        .post('/v1/dates')
        .send({ date: '2025-01-15', region: '삼송' })
        .expect(409);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /v1/dates/:id', () => {
    it('should return a date entry by id', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const res = await request(app).get(`/v1/dates/${entry._id}`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.region).toBe('삼송');
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/v1/dates/${fakeId}`).expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 for invalid id format', async () => {
      const res = await request(app).get('/v1/dates/invalid-id').expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should include related entities', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      await Cafe.create({
        dateEntryId: entry._id,
        name: '스타벅스',
        visited: false,
      });

      const res = await request(app).get(`/v1/dates/${entry._id}`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.cafes).toHaveLength(1);
      expect(res.body.data.cafes[0].name).toBe('스타벅스');
    });
  });

  describe('PUT /v1/dates/:id', () => {
    it('should update a date entry', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const res = await request(app)
        .put(`/v1/dates/${entry._id}`)
        .send({ region: '연신내' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.region).toBe('연신내');
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/v1/dates/${fakeId}`)
        .send({ region: '연신내' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /v1/dates/:id', () => {
    it('should delete a date entry', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

      const res = await request(app).delete(`/v1/dates/${entry._id}`).expect(200);

      expect(res.body.success).toBe(true);

      // Verify deletion
      const deleted = await DateEntry.findById(entry._id);
      expect(deleted).toBeNull();
    });

    it('should cascade delete related entities', async () => {
      const entry = await DateEntry.create({
        date: new Date('2025-01-15'),
        region: '삼송',
      });

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

      await request(app).delete(`/v1/dates/${entry._id}`).expect(200);

      // Verify cascade deletion
      const cafes = await Cafe.find({ dateEntryId: entry._id });
      const restaurants = await Restaurant.find({ dateEntryId: entry._id });
      const spots = await Spot.find({ dateEntryId: entry._id });

      expect(cafes).toHaveLength(0);
      expect(restaurants).toHaveLength(0);
      expect(spots).toHaveLength(0);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/v1/dates/${fakeId}`).expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});

describe('Health Check', () => {
  it('GET /v1/health should return ok status', async () => {
    const res = await request(app).get('/v1/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Root Endpoint', () => {
  it('GET / should return API info', async () => {
    const res = await request(app).get('/').expect(200);

    expect(res.body.message).toBe('DateLog API Server');
    expect(res.body.version).toBeDefined();
  });
});
