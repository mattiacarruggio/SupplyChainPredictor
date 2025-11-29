/**
 * Integration Test Setup
 *
 * Provides test-specific Prisma instance and setup/teardown utilities
 * for integration tests with tenant isolation.
 */

import { PrismaClient } from '@prisma/client';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { tenantIsolationMiddleware, setCurrentTenant, clearCurrentTenant } from '../../src/middleware/tenantIsolation';

// Export tenant middleware helpers for use in tests
export { setCurrentTenant, clearCurrentTenant };

// Create test-specific Prisma instance
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/supply_chain_test',
    },
  },
  log: ['error'],
});

// Register tenant isolation middleware on test instance
prisma.$use(tenantIsolationMiddleware);

/**
 * Setup test database connection before all tests
 */
beforeAll(async () => {
  // Set TEST_DATABASE_URL environment variable
  if (!process.env.TEST_DATABASE_URL) {
    process.env.TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/supply_chain_test';
  }

  // Verify database connection
  await prisma.$connect();
});

/**
 * Clean up all data before each test to ensure isolation
 */
beforeEach(async () => {
  // Clear tenant context
  clearCurrentTenant();

  // Truncate all tables in reverse dependency order to avoid foreign key violations
  // Junction tables first
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "risk_event_routes" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "risk_event_locations" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "risk_event_products" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "risk_event_suppliers" CASCADE');

  // Core tables
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "inventory" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "risk_events" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "shipment_routes" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "products" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "suppliers" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "locations" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE');
});

/**
 * Disconnect from database after all tests
 */
afterAll(async () => {
  clearCurrentTenant();
  await prisma.$disconnect();
});
