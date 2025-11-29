/**
 * Zod Validation Schemas for Supply Chain Entities
 *
 * These schemas provide runtime validation for API requests and data mutations.
 * Auto-sync with Prisma schema to ensure consistency.
 */

import { z } from 'zod';

// =======================
// Enum Schemas
// =======================

export const LocationTypeSchema = z.enum([
  'WAREHOUSE',
  'FACTORY',
  'DISTRIBUTION_CENTER',
  'PORT',
  'SUPPLIER_SITE',
]);

export const LocationStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']);

export const TransportModeSchema = z.enum(['AIR', 'SEA', 'RAIL', 'TRUCK', 'MULTIMODAL']);

export const EventTypeSchema = z.enum([
  'WEATHER',
  'POLITICAL',
  'SUPPLIER_FAILURE',
  'DEMAND_SURGE',
  'TRANSPORTATION_DISRUPTION',
  'QUALITY_ISSUE',
  'REGULATORY_CHANGE',
  'NATURAL_DISASTER',
  'LABOR_STRIKE',
  'CYBER_ATTACK',
]);

export const RiskSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const RiskStatusSchema = z.enum(['ACTIVE', 'MONITORING', 'MITIGATED', 'RESOLVED']);

export const UserRoleSchema = z.enum(['ADMIN', 'ANALYST', 'VIEWER', 'PLANNER']);

export const UserStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);

// =======================
// Supplier Schemas
// =======================

export const CreateSupplierSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  country: z.string().min(2).max(100),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  rating: z.number().int().min(1).max(5).default(3),
  notes: z.string().optional(),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

// =======================
// Product Schemas
// =======================

export const CreateProductSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  unitOfMeasure: z.string().min(1).max(50).default('unit'),
  leadTimeDays: z.number().int().min(1).max(365),
  supplierId: z.string().uuid(),
});

export const UpdateProductSchema = CreateProductSchema.partial().omit({ sku: true });

// =======================
// Location Schemas
// =======================

export const CreateLocationSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  type: LocationTypeSchema,
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  capacity: z.number().int().positive().optional(),
  status: LocationStatusSchema.default('ACTIVE'),
});

export const UpdateLocationSchema = CreateLocationSchema.partial().omit({ code: true });

// =======================
// ShipmentRoute Schemas
// =======================

export const CreateShipmentRouteSchema = z
  .object({
    originLocationId: z.string().uuid(),
    destinationLocationId: z.string().uuid(),
    transitTimeDays: z.number().int().min(1).max(365),
    transportMode: TransportModeSchema,
    distance: z.number().positive().optional(),
    cost: z.number().positive().optional(),
  })
  .refine((data) => data.originLocationId !== data.destinationLocationId, {
    message: 'Origin and destination must be different locations',
    path: ['destinationLocationId'],
  });

export const UpdateShipmentRouteSchema = CreateShipmentRouteSchema.partial();

// =======================
// RiskEvent Schemas
// =======================

export const CreateRiskEventSchema = z
  .object({
    eventType: EventTypeSchema,
    severity: RiskSeveritySchema,
    status: RiskStatusSchema.default('ACTIVE'),
    startDate: z.coerce.date(),
    resolutionDate: z.coerce.date().optional(),
    title: z.string().min(1).max(255),
    description: z.string().min(1),
    impactAssessment: z.string().optional(),
    mitigationPlan: z.string().optional(),
    // Affected entities (many-to-many)
    supplierIds: z.array(z.string().uuid()).optional(),
    productIds: z.array(z.string().uuid()).optional(),
    locationIds: z.array(z.string().uuid()).optional(),
    routeIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      if (data.resolutionDate && data.startDate) {
        return data.resolutionDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'Resolution date must be after start date',
      path: ['resolutionDate'],
    }
  );

export const UpdateRiskEventSchema = CreateRiskEventSchema.partial();

// =======================
// Inventory Schemas
// =======================

export const CreateInventorySchema = z.object({
  productId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantityOnHand: z.number().int().min(0).default(0),
  quantityReserved: z.number().int().min(0).default(0),
  reorderPoint: z.number().int().min(0).default(0),
  lastCountDate: z.coerce.date().optional(),
});

export const UpdateInventorySchema = CreateInventorySchema.partial().omit({
  productId: true,
  locationId: true,
});

// =======================
// User Schemas
// =======================

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: UserRoleSchema,
  status: UserStatusSchema.default('ACTIVE'),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ email: true });

// =======================
// Type Exports
// =======================

export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema>;

export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export type CreateLocation = z.infer<typeof CreateLocationSchema>;
export type UpdateLocation = z.infer<typeof UpdateLocationSchema>;

export type CreateShipmentRoute = z.infer<typeof CreateShipmentRouteSchema>;
export type UpdateShipmentRoute = z.infer<typeof UpdateShipmentRouteSchema>;

export type CreateRiskEvent = z.infer<typeof CreateRiskEventSchema>;
export type UpdateRiskEvent = z.infer<typeof UpdateRiskEventSchema>;

export type CreateInventory = z.infer<typeof CreateInventorySchema>;
export type UpdateInventory = z.infer<typeof UpdateInventorySchema>;

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
