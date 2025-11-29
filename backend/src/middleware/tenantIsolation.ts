/**
 * Tenant Isolation Middleware for Prisma
 *
 * This middleware automatically injects tenantId filters on all database queries
 * to enforce multi-tenant data isolation at the application layer.
 *
 * Implementation based on research.md Decision 3.
 */

import { Prisma } from '@prisma/client';

// Thread-local storage for current tenant context
let currentTenantId: string | null = null;

/**
 * Set the current tenant ID for the request context
 */
export function setCurrentTenant(tenantId: string): void {
  currentTenantId = tenantId;
}

/**
 * Get the current tenant ID from the request context
 */
export function getCurrentTenant(): string | null {
  return currentTenantId;
}

/**
 * Clear the current tenant context
 */
export function clearCurrentTenant(): void {
  currentTenantId = null;
}

/**
 * Prisma middleware function that enforces tenant isolation
 *
 * This middleware:
 * 1. Injects `tenantId` filter on all read queries (findUnique, findFirst, findMany, etc.)
 * 2. Automatically adds `tenantId` to all create operations
 * 3. Ensures update/delete operations are scoped to current tenant
 * 4. Throws error if no tenant context is set
 */
export const tenantIsolationMiddleware: Prisma.Middleware = async (params, next) => {
  const tenantId = getCurrentTenant();

  // Require tenant ID for all operations (except raw queries)
  if (!tenantId && params.action !== 'executeRaw' && params.action !== 'queryRaw') {
    throw new Error(
      'Tenant ID required for database access. ' +
      'Use setCurrentTenant() to set the tenant context before database operations.'
    );
  }

  // Models that require tenant isolation
  // (All models except junction tables have tenantId at the model level)
  const tenantedModels = [
    'supplier',
    'product',
    'location',
    'shipmentRoute',
    'riskEvent',
    'inventory',
    'user',
    'riskEventSupplier',
    'riskEventProduct',
    'riskEventLocation',
    'riskEventRoute',
  ];

  const modelName = params.model?.toLowerCase();
  const isTenantedModel = modelName && tenantedModels.includes(modelName);

  if (!isTenantedModel) {
    // Non-tenanted model or no model specified, skip middleware
    return next(params);
  }

  // Handle different query types
  switch (params.action) {
    case 'findUnique':
    case 'findFirst':
    case 'findFirstOrThrow':
    case 'findUniqueOrThrow':
      // Add tenantId to where clause
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
      break;

    case 'findMany':
    case 'count':
    case 'aggregate':
    case 'groupBy':
      // Add tenantId to where clause
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
      break;

    case 'create':
      // Auto-inject tenantId into create data
      params.args.data = {
        ...params.args.data,
        tenantId,
      };
      break;

    case 'createMany':
      // Auto-inject tenantId into each record
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((record: any) => ({
          ...record,
          tenantId,
        }));
      } else {
        params.args.data = {
          ...params.args.data,
          tenantId,
        };
      }
      break;

    case 'update':
    case 'updateMany':
    case 'upsert':
      // Ensure updates only affect current tenant's data
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
      break;

    case 'delete':
    case 'deleteMany':
      // Ensure deletes only affect current tenant's data
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
      break;
  }

  return next(params);
};

/**
 * Helper function to execute database operations with a specific tenant context
 *
 * @example
 * const suppliers = await withTenant('tenant-123', async () => {
 *   return supplierService.findAll();
 * });
 */
export async function withTenant<T>(
  tenantId: string,
  operation: () => Promise<T>
): Promise<T> {
  const previousTenant = getCurrentTenant();
  try {
    setCurrentTenant(tenantId);
    return await operation();
  } finally {
    if (previousTenant) {
      setCurrentTenant(previousTenant);
    } else {
      clearCurrentTenant();
    }
  }
}
