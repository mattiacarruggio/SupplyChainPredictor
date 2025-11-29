# Task Breakdown: Data Model & Database Schema

**Feature**: Data Model & Database Schema
**Branch**: `002-data-model-schema`
**Date**: 2025-11-29
**Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)

## Overview

This task breakdown implements the foundational database layer for the Supply Chain Risk & Disruption Predictor platform. Tasks are organized by user story priority to enable independent, incremental delivery.

**Total Tasks**: 64
**Parallelizable Tasks**: 28
**User Stories**: 3 (P1: Data Foundation, P2: Migrations & Seeding, P3: Validation & Integrity)

---

## Implementation Strategy

**MVP Scope**: User Story 1 (Data Foundation Setup)
**Incremental Delivery**: Each user story delivers independently testable functionality

**Execution Order**:
1. Phase 1: Setup (project initialization, dependencies)
2. Phase 2: Foundational (Prisma configuration, database connection)
3. Phase 3: User Story 1 - Data Foundation (schema, entities, basic CRUD)
4. Phase 4: User Story 2 - Migrations & Seeding (automation, tooling)
5. Phase 5: User Story 3 - Validation & Integrity (constraints, error handling)
6. Phase 6: Polish & Documentation

---

## Dependencies & Parallel Execution

### User Story Dependencies

```
Setup (Phase 1)
  ↓
Foundational (Phase 2)
  ↓
User Story 1 (P1) ← MVP (can ship independently)
  ↓
User Story 2 (P2) ← Builds on US1 schema
  ↓
User Story 3 (P3) ← Enhances US1 + US2
  ↓
Polish (Phase 6)
```

### Parallel Execution Opportunities

**Phase 1 (Setup)**: All tasks sequential (project structure must exist first)

**Phase 2 (Foundational)**: 2 parallel streams
- Stream A: Prisma configuration
- Stream B: Environment setup

**Phase 3 (US1)**: 7 parallel streams (one per entity)
- Each entity can be implemented independently:
  - Supplier, Product, Location, ShipmentRoute, RiskEvent, Inventory, User

**Phase 4 (US2)**: 2 parallel streams
- Stream A: Migration automation
- Stream B: Seed data generation

**Phase 5 (US3)**: 3 parallel streams
- Stream A: Zod schema integration
- Stream B: Service layer validation
- Stream C: Integration tests

---

## Phase 1: Setup

**Goal**: Initialize project structure and install dependencies
**Blockers**: None (foundational setup)
**Duration**: ~15-30 minutes

### Tasks

- [X] T001 Install Prisma CLI and dependencies in backend package
  - Run: `cd backend && pnpm add -D prisma @prisma/client`
  - Run: `cd backend && pnpm add @prisma/client`
  - Verify: Check backend/package.json includes Prisma dependencies

- [X] T002 Install Zod validation library in shared package
  - Run: `cd packages/shared && pnpm add zod`
  - Verify: Check packages/shared/package.json includes zod

- [X] T003 Install Faker.js for seed data generation
  - Run: `cd backend && pnpm add -D @faker-js/faker`
  - Verify: Check backend/package.json includes @faker-js/faker

- [X] T004 Create Prisma directory structure in backend
  - Create: `backend/prisma/` directory
  - Create: `backend/prisma/migrations/` directory
  - Verify: Directories exist with correct permissions

---

## Phase 2: Foundational

**Goal**: Configure Prisma ORM and establish database connection
**Blockers**: Phase 1 must complete
**Duration**: ~30-45 minutes

### Tasks

- [X] T005 Initialize Prisma configuration
  - Run: `cd backend && pnpm prisma init`
  - Edit: `backend/prisma/schema.prisma` with datasource and generator config
  - Verify: schema.prisma exists with PostgreSQL datasource

- [X] T006 [P] Configure database connection in backend/.env
  - Create: `backend/.env` from `.env.example`
  - Set: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/supply_chain_dev"`
  - Verify: Connection string matches docker-compose.yml database config

- [X] T007 [P] Create Prisma client initialization utility
  - Create: `backend/src/config/database.ts`
  - Implement: PrismaClient singleton pattern with logging
  - Export: `prisma` instance for use across application
  - Reference: See plan.md Phase 1 for structure

- [X] T008 [P] Set up environment variable validation
  - Update: `backend/src/config/env.ts`
  - Add: DATABASE_URL validation
  - Verify: Throws error if DATABASE_URL not set

---

## Phase 3: User Story 1 - Data Foundation Setup (P1)

**Goal**: Implement core database schema with all 7 entities
**Priority**: P1 (MVP - must complete first)
**Blockers**: Phase 2 must complete
**Duration**: ~3-4 hours

### Independent Test Criteria

✅ **US1 Complete When**:
1. All 7 entities defined in Prisma schema with correct fields and relationships
2. Can create, read, update, delete records for each entity
3. Database constraints prevent invalid data (unique codes, foreign key integrity)
4. Can query parent entities and traverse to related children (e.g., Supplier → Products)
5. Multi-tenant `tenantId` field exists on all entities with indexes

### Tasks

#### Core Schema Definition

- [X] T009 [US1] Define base Prisma schema structure
  - Edit: `backend/prisma/schema.prisma`
  - Add: Generator and datasource configuration
  - Add: Common enum definitions (LocationType, TransportMode, etc.)
  - Reference: See data-model.md for complete enum list

- [X] T010 [P] [US1] Define Supplier entity in Prisma schema
  - Edit: `backend/prisma/schema.prisma`
  - Add: Supplier model with all fields (id, tenantId, code, name, country, rating, etc.)
  - Add: Indexes on tenantId, country, rating
  - Add: Unique constraint on code
  - Reference: See data-model.md Supplier section

- [X] T011 [P] [US1] Define Product entity in Prisma schema
  - Edit: `backend/prisma/schema.prisma`
  - Add: Product model with all fields (id, tenantId, sku, name, category, leadTimeDays, supplierId, etc.)
  - Add: Relationship to Supplier (many-to-one)
  - Add: Indexes on tenantId, supplierId, category
  - Add: Unique constraint on sku
  - Reference: See data-model.md Product section

- [X] T012 [P] [US1] Define Location entity in Prisma schema
  - Edit: `backend/prisma/schema.prisma`
  - Add: Location model with all fields (id, tenantId, code, name, type, latitude, longitude, capacity, status, etc.)
  - Add: Indexes on tenantId, type, country, status
  - Add: Unique constraint on code
  - Reference: See data-model.md Location section

- [X] T013 [P] [US1] Define ShipmentRoute entity in Prisma schema
  - Edit: `backend/prisma/schema.prisma`
  - Add: ShipmentRoute model with origin/destination location relationships
  - Add: Fields: transitTimeDays, transportMode, distance, cost
  - Add: Indexes on tenantId, originLocationId, destinationLocationId
  - Add: Unique constraint on [tenantId, originLocationId, destinationLocationId, transportMode]
  - Reference: See data-model.md ShipmentRoute section

- [X] T014 [P] [US1] Define RiskEvent entity in Prisma schema
  - Edit: `backend/prisma/schema.prisma`
  - Add: RiskEvent model with all fields (eventType, severity, status, startDate, resolutionDate, etc.)
  - Add: Indexes on tenantId, eventType, severity, status, startDate
  - Reference: See data-model.md RiskEvent section

- [X] T015 [P] [US1] Define Inventory entity in Prisma schema
  - Edit: `backend/prisma/schema.prisma`
  - Add: Inventory model with product and location relationships
  - Add: Fields: quantityOnHand, quantityReserved, reorderPoint, lastCountDate
  - Add: Unique constraint on [tenantId, productId, locationId]
  - Add: Indexes on tenantId, productId, locationId, quantityOnHand
  - Reference: See data-model.md Inventory section

- [X] T016 [P] [US1] Define User entity in Prisma schema
  - Edit: `backend/prisma/schema.prisma`
  - Add: User model with all fields (email, name, role, status, lastLoginAt)
  - Add: Indexes on tenantId, role, status
  - Add: Unique constraint on email
  - Reference: See data-model.md User section

- [X] T017 [P] [US1] Define junction tables for RiskEvent many-to-many relationships
  - Edit: `backend/prisma/schema.prisma`
  - Add: RiskEventSupplier junction table
  - Add: RiskEventProduct junction table
  - Add: RiskEventLocation junction table
  - Add: RiskEventRoute junction table
  - Add: Appropriate indexes and unique constraints
  - Reference: See data-model.md junction tables section

#### Initial Migration

- [X] T018 [US1] Generate Prisma Client from schema
  - Run: `cd backend && pnpm prisma generate`
  - Verify: `backend/node_modules/.prisma/client` directory created
  - Verify: TypeScript types generated for all entities

- [X] T019 [US1] Create initial database migration
  - Run: `cd backend && pnpm prisma migrate dev --name init`
  - Review: Generated SQL in `backend/prisma/migrations/[timestamp]_init/migration.sql`
  - Verify: All tables, indexes, and constraints created
  - Commit: Migration files to git

- [X] T020 [US1] Verify schema deployment and test database connection
  - Run: `cd backend && pnpm prisma migrate status`
  - Verify: Migration shows as "Applied"
  - Test: Connect to database and query tables
  - Run: `cd backend && pnpm prisma studio` to visually inspect schema

#### Service Layer (Basic CRUD)

- [X] T021 [P] [US1] Implement Supplier service with CRUD operations
  - Create: `backend/src/services/suppliers.service.ts`
  - Implement: create, findAll, findById, update, delete methods
  - Use: Prisma Client for database operations
  - Include: TypeScript types from generated Prisma Client

- [X] T022 [P] [US1] Implement Product service with CRUD operations
  - Create: `backend/src/services/products.service.ts`
  - Implement: create, findAll, findById, update, delete methods
  - Include: Supplier relationship queries

- [X] T023 [P] [US1] Implement Location service with CRUD operations
  - Create: `backend/src/services/locations.service.ts`
  - Implement: create, findAll, findById, update, delete methods

- [X] T024 [P] [US1] Implement ShipmentRoute service with CRUD operations
  - Create: `backend/src/services/routes.service.ts`
  - Implement: create, findAll, findById, update, delete methods
  - Include: Origin/destination location relationship queries

- [X] T025 [P] [US1] Implement RiskEvent service with CRUD operations
  - Create: `backend/src/services/riskEvents.service.ts`
  - Implement: create, findAll, findById, update, delete methods
  - Include: Junction table operations for many-to-many relationships

- [X] T026 [P] [US1] Implement Inventory service with CRUD operations
  - Create: `backend/src/services/inventory.service.ts`
  - Implement: create, findAll, findById, update, delete methods
  - Include: Product and Location relationship queries

- [X] T027 [P] [US1] Implement User service with CRUD operations
  - Create: `backend/src/services/users.service.ts`
  - Implement: create, findAll, findById, findByEmail, update, delete methods

#### Multi-Tenant Middleware

- [X] T028 [US1] Implement Prisma middleware for tenant isolation
  - Create: `backend/src/middleware/tenantIsolation.ts`
  - Implement: Middleware to inject `tenantId` filter on all queries
  - Implement: Auto-add `tenantId` to all create operations
  - Reference: See research.md Decision 3 for implementation pattern

- [X] T029 [US1] Configure tenant middleware in database initialization
  - Update: `backend/src/config/database.ts`
  - Register: Tenant isolation middleware with Prisma Client
  - Add: Helper function to set current tenant context

#### Integration Testing

- [X] T030 [US1] Set up integration test environment
  - Create: `backend/tests/integration/setup.ts`
  - Implement: Test database initialization (use DATABASE_URL with test DB)
  - Implement: Table truncation between tests
  - Reference: See research.md Decision 5 for test setup pattern

- [X] T031 [P] [US1] Write integration tests for Supplier entity
  - Create: `backend/tests/integration/suppliers.test.ts`
  - Test: Create, read, update, delete operations
  - Test: Unique constraint on supplier code
  - Test: Relationship with Products

- [X] T032 [P] [US1] Write integration tests for Product entity
  - Create: `backend/tests/integration/products.test.ts`
  - Test: Create, read, update, delete operations
  - Test: Foreign key constraint to Supplier
  - Test: Unique constraint on SKU

- [X] T033 [P] [US1] Write integration tests for Location entity
  - Create: `backend/tests/integration/locations.test.ts`
  - Test: Create, read, update, delete operations
  - Test: Enum validation for type and status fields

- [X] T034 [P] [US1] Write integration tests for ShipmentRoute entity
  - Create: `backend/tests/integration/routes.test.ts`
  - Test: Create, read, update, delete operations
  - Test: Origin/destination relationships
  - Test: Unique constraint on route combination

- [X] T035 [P] [US1] Write integration tests for RiskEvent entity
  - Create: `backend/tests/integration/riskEvents.test.ts`
  - Test: Create, read, update, delete operations
  - Test: Many-to-many relationships via junction tables

- [X] T036 [P] [US1] Write integration tests for Inventory entity
  - Create: `backend/tests/integration/inventory.test.ts`
  - Test: Create, read, update, delete operations
  - Test: Unique constraint on product-location combination

- [X] T037 [P] [US1] Write integration tests for User entity
  - Create: `backend/tests/integration/users.test.ts`
  - Test: Create, read, update, delete operations
  - Test: Unique constraint on email

- [X] T038 [US1] Write integration tests for tenant isolation middleware
  - Create: `backend/tests/integration/tenantIsolation.test.ts`
  - Test: Queries only return data for current tenant
  - Test: Cross-tenant data access is blocked
  - Test: Create operations auto-assign tenantId

---

## Phase 4: User Story 2 - Data Migration & Seeding (P2)

**Goal**: Automated migration tooling and seed data for testing
**Priority**: P2 (enhances US1)
**Blockers**: US1 must complete
**Duration**: ~2-3 hours

### Independent Test Criteria

✅ **US2 Complete When**:
1. Can run `pnpm prisma migrate dev` to create new migrations
2. Can run `pnpm prisma migrate deploy` in production mode
3. Can run `pnpm prisma migrate reset` to rollback and re-run migrations
4. Seed script generates 100+ realistic records across all entities
5. Seed script is idempotent (can run multiple times without errors)
6. Migration status tracking works (`pnpm prisma migrate status`)

### Tasks

#### Migration Automation

- [X] T039 [US2] Configure Prisma migrate scripts in package.json
  - Edit: `backend/package.json`
  - Add: Script `"migrate:dev": "prisma migrate dev"`
  - Add: Script `"migrate:deploy": "prisma migrate deploy"`
  - Add: Script `"migrate:reset": "prisma migrate reset"`
  - Add: Script `"migrate:status": "prisma migrate status"`

- [X] T040 [P] [US2] Create migration testing workflow
  - Create: `backend/tests/migrations/test-migration.sh`
  - Test: Fresh database migration
  - Test: Idempotent migration (run twice)
  - Test: Migration status tracking

- [X] T041 [P] [US2] Document migration procedures in quickstart.md
  - Update: `specs/002-data-model-schema/quickstart.md`
  - Add: Migration command reference
  - Add: Troubleshooting common migration issues
  - Already exists - verify completeness

#### Seed Data Generation

- [X] T042 [US2] Implement base seed data structure
  - Create: `backend/prisma/seed.ts`
  - Implement: Main seed function with error handling
  - Implement: Cleanup function to truncate tables (optional)
  - Add: TypeScript configuration for seed script

- [X] T043 [P] [US2] Generate seed data for Suppliers (20 records)
  - Update: `backend/prisma/seed.ts`
  - Use: @faker-js/faker for realistic company names, countries, emails
  - Generate: 20 suppliers with varied ratings and countries
  - Include: Realistic supplier codes (e.g., "SUP-001")

- [X] T044 [P] [US2] Generate seed data for Products (50 records)
  - Update: `backend/prisma/seed.ts`
  - Link: Products to random suppliers
  - Generate: 50 products with varied categories, SKUs, lead times
  - Use: Faker for product names and categories

- [X] T045 [P] [US2] Generate seed data for Locations (10 records)
  - Update: `backend/prisma/seed.ts`
  - Generate: 10 locations across different types (warehouse, factory, port)
  - Include: Realistic addresses and geographic coordinates
  - Use: Faker for addresses and coordinates

- [X] T046 [P] [US2] Generate seed data for ShipmentRoutes (15 records)
  - Update: `backend/prisma/seed.ts`
  - Link: Routes between existing locations
  - Generate: 15 routes with varied transport modes and transit times
  - Ensure: No duplicate origin-destination-mode combinations

- [X] T047 [P] [US2] Generate seed data for RiskEvents (30 records)
  - Update: `backend/prisma/seed.ts`
  - Generate: 30 risk events with distribution: 10 low, 15 medium, 5 high severity
  - Link: Risk events to suppliers, products, locations via junction tables
  - Include: Realistic event types and descriptions

- [X] T048 [P] [US2] Generate seed data for Inventory (80 records)
  - Update: `backend/prisma/seed.ts`
  - Link: Products to locations with realistic quantity levels
  - Generate: 80 inventory records with varied stock levels
  - Include: Reorder points and last count dates

- [X] T049 [P] [US2] Generate seed data for Users (5 records)
  - Update: `backend/prisma/seed.ts`
  - Generate: 5 users with different roles (admin, analyst, viewer, planner)
  - Use: Faker for names and emails
  - Include: Realistic lastLoginAt timestamps

- [X] T050 [US2] Configure seed script in package.json
  - Edit: `backend/package.json`
  - Add: `"prisma": { "seed": "ts-node prisma/seed.ts" }`
  - Add: Script `"db:seed": "prisma db seed"`
  - Test: Run seed script and verify data creation

- [X] T051 [US2] Test seed script idempotency
  - Run: Seed script twice consecutively
  - Verify: No duplicate key errors (either skip or use upsert)
  - Verify: Record counts remain consistent

---

## Phase 5: User Story 3 - Data Validation & Integrity (P3)

**Goal**: Runtime validation with Zod schemas and service-layer constraints
**Priority**: P3 (enhances data quality)
**Blockers**: US1 must complete
**Duration**: ~2-3 hours

### Independent Test Criteria

✅ **US3 Complete When**:
1. Zod schemas defined for all entity create/update operations
2. Service layer validates input data before database operations
3. Invalid data is rejected with clear, specific error messages
4. Enum fields only accept valid values
5. Business rules enforced (e.g., resolution date after start date)
6. Integration tests verify validation errors are thrown correctly

### Tasks

#### Zod Schema Implementation

- [X] T052 [US3] Copy Zod validation schemas to shared package
  - Source: `specs/002-data-model-schema/contracts/validations.ts`
  - Target: `packages/shared/src/validators/schemas.ts`
  - Verify: All enum and entity schemas present

- [X] T053 [P] [US3] Integrate Zod validation in Supplier service
  - Update: `backend/src/services/suppliers.service.ts`
  - Import: CreateSupplierSchema, UpdateSupplierSchema from shared package
  - Add: Validation before database operations
  - Throw: Detailed validation errors with field-level messages

- [X] T054 [P] [US3] Integrate Zod validation in Product service
  - Update: `backend/src/services/products.service.ts`
  - Add: Validation for create and update operations
  - Validate: SKU format, leadTimeDays > 0, supplierId exists

- [X] T055 [P] [US3] Integrate Zod validation in Location service
  - Update: `backend/src/services/locations.service.ts`
  - Add: Validation for create and update operations
  - Validate: Latitude (-90 to 90), longitude (-180 to 180)

- [X] T056 [P] [US3] Integrate Zod validation in ShipmentRoute service
  - Update: `backend/src/services/routes.service.ts`
  - Add: Validation for create and update operations
  - Validate: Origin ≠ destination, transitTimeDays > 0

- [X] T057 [P] [US3] Integrate Zod validation in RiskEvent service
  - Update: `backend/src/services/riskEvents.service.ts`
  - Add: Validation for create and update operations
  - Validate: startDate < resolutionDate (if resolution date provided)

- [X] T058 [P] [US3] Integrate Zod validation in Inventory service
  - Update: `backend/src/services/inventory.service.ts`
  - Add: Validation for create and update operations
  - Validate: Quantities ≥ 0, reorderPoint ≥ 0

- [X] T059 [P] [US3] Integrate Zod validation in User service
  - Update: `backend/src/services/users.service.ts`
  - Add: Validation for create and update operations
  - Validate: Email format, role enum, status enum

#### Validation Testing

- [X] T060 [P] [US3] Write validation tests for Supplier service
  - Create: `backend/tests/unit/services/suppliers.service.test.ts`
  - Test: Invalid email format rejected
  - Test: Rating outside 1-5 range rejected
  - Test: Empty required fields rejected

- [X] T061 [P] [US3] Write validation tests for Product service
  - Create: `backend/tests/unit/services/products.service.test.ts`
  - Test: Negative leadTimeDays rejected
  - Test: Invalid supplier ID rejected

- [X] T062 [P] [US3] Write validation tests for RiskEvent service
  - Create: `backend/tests/unit/services/riskEvents.service.test.ts`
  - Test: Resolution date before start date rejected
  - Test: Invalid severity enum rejected

---

## Phase 6: Polish & Documentation

**Goal**: Final testing, documentation, and cleanup
**Priority**: Final polish
**Blockers**: All user stories complete
**Duration**: ~1-2 hours

### Tasks

- [X] T063 Update shared package exports with new types
  - Update: `packages/shared/src/index.ts`
  - Export: All Zod schemas, TypeScript types, enum definitions
  - Verify: Frontend can import types from shared package

- [X] T064 Run full integration test suite
  - Run: `cd backend && pnpm test`
  - Verify: All tests pass (suppliers, products, locations, routes, risk events, inventory, users, tenant isolation)
  - Fix: Any failing tests before marking complete

---

## Task Summary

| Phase | Tasks | Parallel | Duration | Story |
|-------|-------|----------|----------|-------|
| Phase 1: Setup | 4 | 0 | 15-30 min | - |
| Phase 2: Foundational | 4 | 3 | 30-45 min | - |
| Phase 3: US1 - Data Foundation | 30 | 19 | 3-4 hours | P1 |
| Phase 4: US2 - Migrations & Seeding | 13 | 10 | 2-3 hours | P2 |
| Phase 5: US3 - Validation & Integrity | 11 | 9 | 2-3 hours | P3 |
| Phase 6: Polish | 2 | 0 | 1-2 hours | - |
| **Total** | **64** | **28** | **8-12 hours** | - |

---

## Parallel Execution Plan

### Phase 3 (US1) - Entity Implementation

**7 Parallel Streams** (can be implemented simultaneously):

**Stream 1 - Supplier**:
- T010 → T021 → T031

**Stream 2 - Product**:
- T011 → T022 → T032

**Stream 3 - Location**:
- T012 → T023 → T033

**Stream 4 - ShipmentRoute**:
- T013 → T024 → T034

**Stream 5 - RiskEvent**:
- T014 → T025 → T035

**Stream 6 - Inventory**:
- T015 → T026 → T036

**Stream 7 - User**:
- T016 → T027 → T037

**Sequential After Streams**:
- T017 (junction tables) - requires T014 complete
- T018 (generate Prisma Client) - requires all entity definitions
- T019-T020 (migration) - requires T018
- T028-T029 (middleware) - can run parallel with entity services
- T030 (test setup) - can run parallel with entity services
- T038 (tenant tests) - requires T028-T029

### Phase 4 (US2) - Seed Data

**10 Parallel Streams** (after T042 base structure):
- T043, T044, T045, T046, T047, T048, T049 can all run in parallel

### Phase 5 (US3) - Validation

**9 Parallel Streams** (after T052):
- T053-T059 (service integration) can run in parallel
- T060-T062 (tests) can run in parallel

---

## MVP Delivery

**Minimum Viable Product**: Complete Phase 1 through Phase 3 (User Story 1)

**MVP Deliverables**:
- ✅ 7 core entities with Prisma schema
- ✅ Database migrations working
- ✅ CRUD operations for all entities
- ✅ Multi-tenant isolation enforced
- ✅ Integration tests passing
- ✅ Basic data persistence layer functional

**Post-MVP Enhancements**:
- Phase 4 (US2): Automation and tooling
- Phase 5 (US3): Enhanced validation
- Phase 6: Polish and optimization

---

## Quality Gates

**US1 Complete Checklist**:
- [ ] All 7 entities in Prisma schema
- [ ] Initial migration applied successfully
- [ ] All service layer CRUD operations implemented
- [ ] Multi-tenant middleware active
- [ ] Integration tests passing (>80% coverage)
- [ ] Can create, query, and delete records for each entity

**US2 Complete Checklist**:
- [ ] Migration scripts in package.json
- [ ] Seed script generates 100+ records
- [ ] Seed script is idempotent
- [ ] Migration rollback tested

**US3 Complete Checklist**:
- [ ] Zod schemas integrated in all services
- [ ] Invalid data rejected with clear errors
- [ ] Validation tests passing
- [ ] Business rules enforced (date ordering, enum constraints)

---

## File Structure After Completion

```
backend/
├── prisma/
│   ├── schema.prisma          ✅ Complete Prisma schema
│   ├── seed.ts                ✅ Seed data script
│   └── migrations/            ✅ Version-controlled migrations
├── src/
│   ├── config/
│   │   ├── database.ts        ✅ Prisma client + middleware
│   │   └── env.ts             ✅ Environment validation
│   ├── middleware/
│   │   └── tenantIsolation.ts ✅ Multi-tenant middleware
│   └── services/
│       ├── suppliers.service.ts
│       ├── products.service.ts
│       ├── locations.service.ts
│       ├── routes.service.ts
│       ├── riskEvents.service.ts
│       ├── inventory.service.ts
│       └── users.service.ts
└── tests/
    ├── integration/
    │   ├── setup.ts
    │   ├── suppliers.test.ts
    │   ├── products.test.ts
    │   ├── locations.test.ts
    │   ├── routes.test.ts
    │   ├── riskEvents.test.ts
    │   ├── inventory.test.ts
    │   ├── users.test.ts
    │   └── tenantIsolation.test.ts
    └── unit/
        └── services/
            ├── suppliers.service.test.ts
            ├── products.service.test.ts
            └── riskEvents.service.test.ts

packages/shared/
├── src/
│   ├── types/
│   │   ├── entities.ts        ✅ Shared entity types
│   │   └── enums.ts           ✅ Shared enums
│   └── validators/
│       └── schemas.ts         ✅ Zod validation schemas
└── tests/
    └── validators/
        └── schemas.test.ts
```

---

## References

- [Feature Specification](spec.md) - User stories and acceptance criteria
- [Implementation Plan](plan.md) - Technical approach and architecture
- [Data Model Documentation](data-model.md) - Complete schema reference
- [Research Decisions](research.md) - Technology selection rationale
- [Quickstart Guide](quickstart.md) - Setup and migration instructions
- [Validation Schemas](contracts/validations.ts) - Zod schema definitions
