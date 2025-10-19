// Global test setup
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/datelog_test';

// Increase test timeout for integration tests
jest.setTimeout(10000);
