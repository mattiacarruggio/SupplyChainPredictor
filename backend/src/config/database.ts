/**
 * Prisma Client Initialization and Configuration
 *
 * This module provides a singleton instance of the Prisma Client
 * with logging and middleware configuration, including tenant isolation.
 */

import { PrismaClient } from '@prisma/client';
import { tenantIsolationMiddleware } from '../middleware/tenantIsolation';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });

// Register tenant isolation middleware
prisma.$use(tenantIsolationMiddleware);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect from database on shutdown
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export default prisma;
