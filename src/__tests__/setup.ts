/**
 * Jest Test Setup
 * MongoDB Memory Server for isolated testing
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

/**
 * Connect to in-memory MongoDB before all tests
 */
beforeAll(async () => {
  // Create MongoDB Memory Server instance
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect mongoose to in-memory database
  await mongoose.connect(uri);
});

/**
 * Disconnect and stop MongoDB after all tests
 */
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

/**
 * Clear all collections after each test
 */
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// Suppress console logs during tests (optional)
// Uncomment if you want cleaner test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };
