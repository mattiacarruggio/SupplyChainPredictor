/**
 * Shared Package Exports
 * 
 * Central export point for types, validators, and utilities
 * shared across backend and frontend.
 */

// Export Zod validation schemas
export * from './validators/schemas';

// Re-export Prisma-generated types (when needed by frontend)
// Note: Frontend will primarily use inferred types from Zod schemas
