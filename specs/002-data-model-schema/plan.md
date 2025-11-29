# Implementation Plan: Data Model & Database Schema

**Branch**: `002-data-model-schema` | **Date**: 2025-11-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-data-model-schema/spec.md`

## Summary

This feature establishes the foundational data layer for the Supply Chain Risk & Disruption Predictor platform. It defines the core database schema for tracking suppliers, products, locations, shipment routes, risk events, inventory, and users, along with migration tooling for automated schema deployment and rollback capabilities.

**Technical Approach**: PostgreSQL-based relational schema with Prisma ORM for type-safe data access, automated migrations, and seed data generation. Multi-tenant architecture with row-level `tenant_id` enforcement.

## Technical Context

**Language/Version**: TypeScript 5.7.2 with Node.js 20+
**Primary Dependencies**: Prisma 6.x (ORM & migrations), PostgreSQL 16
**Storage**: PostgreSQL 16 (already configured in docker-compose.yml)
**Testing**: Vitest for unit tests, Prisma Client for integration tests with test database
**Target Platform**: Linux/Docker containers (backend service)
**Project Type**: Web (monorepo with backend, frontend, shared packages)
**Performance Goals**: <500ms query response for common operations with up to 10,000 records
**Constraints**: <5 minutes deployment time for full schema setup, 100% data integrity constraint enforcement
**Scale/Scope**: 7 core entities, ~25 database tables (including join tables), support for <100 concurrent users and <1M total records initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Constitution Principles Evaluation

✅ **I. Real Operational Impact**:
- **Pass** - Foundational layer enabling all supply chain tracking features
- **Impact**: Enables entire platform; blocks zero value without this foundation

✅ **II. Prescriptive Over Predictive**:
- **N/A** - Infrastructure feature, no user-facing recommendations

✅ **III. Clarity Over Cleverness**:
- **Pass** - Relational schema design is straightforward and self-documenting
- **Approach**: Standard naming conventions, explicit relationships, clear constraints

✅ **IV. Vertical Slice Iteration**:
- **Pass** - Database layer is the foundational horizontal slice required before any vertical feature slices
- **Justification**: Data model must exist before any end-to-end feature can be built

✅ **V. Stable Core, Replaceable Edges**:
- **Pass** - Schema design is decoupled from ERP connectors
- **Design**: Domain entities (Supplier, Product, Location) are connector-agnostic

✅ **VI. Multi-Tenant by Design**:
- **Pass** - All entities include `tenant_id` column with ORM-level filtering
- **Implementation**: Prisma middleware will enforce tenant isolation on all queries

✅ **VII. Extensibility Over Premature Scaling**:
- **Pass** - Schema supports future extensions (ML features, additional connectors) through nullable columns and junction tables
- **Constraint**: No premature optimization; indexes added only for confirmed query patterns

✅ **VIII. Ask Before Assuming**:
- **Pass** - All ambiguities resolved in specification phase (no NEEDS CLARIFICATION markers)
- **Status**: Soft delete strategy, cascade behavior, data retention explicitly documented in assumptions

✅ **IX. Fail Fast but Safely**:
- **Pass** - Seed data scripts provide realistic test data before ERP integration
- **Approach**: Migration testing on isolated database instances before production

✅ **X. Documentation as Deliverable**:
- **Pass** - ERD diagrams, data-model.md, and migration documentation will be generated
- **Deliverables**: data-model.md (entity definitions), contracts/ (validation schemas), quickstart.md

✅ **XI. Security by Design & Legal Compliance**:
- **Pass** - Multi-tenant isolation, audit timestamps, GDPR-compliant data model
- **Security**: Row-level tenant_id filtering, encrypted at rest (PostgreSQL native), PII minimization
- **Compliance**: Right to erasure supported (hard delete or anonymization), audit trails via created_at/updated_at

**Gate Status**: ✅ **PASSED** - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-data-model-schema/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (ORM selection, migration strategy)
├── data-model.md        # Phase 1 output (ERD, entity definitions, relationships)
├── quickstart.md        # Phase 1 output (setup, migration commands, seed data)
├── contracts/           # Phase 1 output (Zod validation schemas, TypeScript types)
│   ├── entities.ts      # Shared entity type definitions
│   └── validations.ts   # Zod schemas for runtime validation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/
│   │   ├── env.ts                    # Environment variable validation
│   │   └── database.ts               # Prisma client initialization
│   ├── middleware/
│   │   └── tenantIsolation.ts        # Prisma middleware for tenant_id filtering
│   ├── models/                       # Prisma schema location
│   │   └── schema.prisma             # Main Prisma schema file
│   ├── services/
│   │   ├── suppliers.service.ts      # Supplier CRUD operations
│   │   ├── products.service.ts       # Product CRUD operations
│   │   ├── locations.service.ts      # Location CRUD operations
│   │   ├── routes.service.ts         # ShipmentRoute CRUD operations
│   │   ├── riskEvents.service.ts     # RiskEvent CRUD operations
│   │   ├── inventory.service.ts      # Inventory CRUD operations
│   │   └── users.service.ts          # User CRUD operations
│   └── migrations/                   # Prisma migration files (auto-generated)
│       └── [timestamp]_init/
│           └── migration.sql
├── prisma/
│   ├── schema.prisma                 # Symlink to src/models/schema.prisma
│   ├── seed.ts                       # Seed data script
│   └── migrations/                   # Migration history
└── tests/
    ├── integration/
    │   ├── setup.ts                  # Test database setup
    │   ├── suppliers.test.ts
    │   ├── products.test.ts
    │   ├── locations.test.ts
    │   ├── routes.test.ts
    │   ├── riskEvents.test.ts
    │   ├── inventory.test.ts
    │   └── users.test.ts
    └── unit/
        ├── middleware/
        │   └── tenantIsolation.test.ts
        └── services/
            ├── suppliers.service.test.ts
            └── [other service tests]

packages/shared/
├── src/
│   ├── types/
│   │   ├── entities.ts               # Shared entity TypeScript types
│   │   └── enums.ts                  # Shared enum definitions
│   └── validators/
│       └── schemas.ts                # Zod validation schemas
└── tests/
    └── validators/
        └── schemas.test.ts

frontend/
└── src/
    └── types/
        └── index.ts                  # Re-exports from packages/shared
```

**Structure Decision**: Web application (Option 2) selected because this is a monorepo with backend, frontend, and shared packages. The database schema and migrations reside in `/backend`, with shared TypeScript types exported from `/packages/shared` for use across backend and frontend.

## Complexity Tracking

*No constitution violations - this section is not applicable.*

## Phase 0: Research & Technology Selection

**Status**: ✅ Complete (research.md generated)

### Research Tasks

1. **ORM Selection for PostgreSQL with TypeScript**
   - **Decision**: Prisma 6.x
   - **Alternatives Considered**: TypeORM, Sequelize, Drizzle, raw SQL with pg
   - **Rationale**:
     - Type-safe query builder with auto-generated TypeScript types
     - Built-in migration system with version control
     - Excellent PostgreSQL support including JSON fields, full-text search
     - Middleware support for tenant isolation
     - Active development and strong ecosystem
   - **Tradeoffs**: Slight learning curve for Prisma schema language, but superior DX and safety

2. **Migration Strategy**
   - **Decision**: Prisma Migrate for development and production
   - **Approach**:
     - Declarative schema in `schema.prisma`
     - Automated migration generation via `prisma migrate dev`
     - Version-controlled SQL migration files
     - Rollback support through migration history
   - **Rationale**: Integrated with Prisma, reduces errors, enables CI/CD automation

3. **Multi-Tenant Isolation Pattern**
   - **Decision**: Prisma middleware with `tenant_id` filtering on all queries
   - **Alternatives Considered**: PostgreSQL RLS (row-level security), separate schemas per tenant
   - **Rationale**:
     - Middleware is application-layer and portable
     - Simpler to test and debug than database-level RLS
     - Separate schemas don't scale well for multi-tenant SaaS
   - **Implementation**: Global Prisma middleware intercepts all queries and injects `where: { tenantId }` clause

4. **Seed Data Generation**
   - **Decision**: Faker.js for realistic data generation + custom domain logic
   - **Approach**: Seed script creates 100+ records across all entities with realistic relationships
   - **Rationale**: Enables testing with production-like data volume and variety

5. **Testing Strategy**
   - **Decision**: Vitest + Prisma Test Client with isolated test database
   - **Approach**:
     - Spin up test PostgreSQL instance in Docker
     - Run migrations before test suite
     - Truncate tables between tests (or use transactions)
   - **Rationale**: Fast, isolated, reproducible tests without affecting development database

## Phase 1: Data Model & Contracts

**Status**: ✅ Complete (data-model.md, contracts/, quickstart.md generated)

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Supplier   │────────<│   Product    │>────────│  Inventory   │
│              │ 1     * │              │ *     * │              │
│ - id         │         │ - id         │         │ - id         │
│ - tenant_id  │         │ - tenant_id  │         │ - tenant_id  │
│ - name       │         │ - sku        │         │ - quantity   │
│ - code       │         │ - name       │         │ - location   │
│ - country    │         │ - category   │         └──────┬───────┘
│ - rating     │         │ - supplier_id│                │
└──────┬───────┘         └──────┬───────┘                │
       │                        │                        │
       │                        │                        │
       │                        │                        │
       │                        └────────────┬───────────┘
       │                                     │ *
       │                                     │
       │                              ┌──────▼───────┐
       │                              │   Location   │
       │                              │              │
       │                              │ - id         │
       │                              │ - tenant_id  │
       │                              │ - name       │
       │                              │ - type       │
       │                              │ - latitude   │
       │                              │ - longitude  │
       │                              └──────┬───────┘
       │                                     │
       │                                     │ *
       │                                     │
       │                              ┌──────▼─────────┐
       │                              │ ShipmentRoute  │
       │                              │                │
       │                              │ - id           │
       │                              │ - tenant_id    │
       │                              │ - origin_id    │
       │                              │ - destination  │
       │                              │ - transit_time │
       │                              │ - mode         │
       │                              └──────┬─────────┘
       │                                     │
       │                                     │
       └─────────────────┬───────────────────┘
                         │ *
                         │
                  ┌──────▼───────┐
                  │  RiskEvent   │
                  │              │
                  │ - id         │
                  │ - tenant_id  │
                  │ - type       │
                  │ - severity   │
                  │ - start_date │
                  │ - status     │
                  └──────────────┘

┌──────────────┐
│     User     │
│              │
│ - id         │
│ - tenant_id  │
│ - email      │
│ - role       │
│ - status     │
└──────────────┘
```

### Core Entities Summary

1. **Supplier**
   - Tracks vendors and suppliers in the supply chain
   - One-to-many relationship with Products
   - Many-to-many relationship with RiskEvents (via junction table)

2. **Product**
   - Represents materials, components, or finished goods
   - Belongs to one Supplier (many-to-one)
   - Many-to-many relationship with Locations via Inventory

3. **Location**
   - Physical sites (warehouses, factories, ports)
   - Many-to-many relationship with Products via Inventory
   - One-to-many relationship with ShipmentRoutes (as origin or destination)

4. **ShipmentRoute**
   - Transportation paths between two Locations
   - Two foreign keys: origin_location_id, destination_location_id
   - One-to-many relationship with RiskEvents

5. **RiskEvent**
   - Disruptions, delays, or threats to supply chain
   - Many-to-many relationships with Suppliers, Locations, Products, Routes
   - Enum fields for event type and severity level

6. **Inventory**
   - Stock levels at specific locations
   - Junction table linking Products and Locations
   - Includes quantity, reserved amount, reorder point

7. **User**
   - System users with role-based access
   - Used for audit trails and authentication
   - Tenant-scoped for multi-tenant isolation

### Data Model Documentation

Generated in [data-model.md](data-model.md):
- Complete Prisma schema definitions
- Field-level constraints and validations
- Index strategy for query performance
- Cascade and deletion behaviors
- Audit timestamp implementation

### Validation Contracts

Generated in [contracts/](contracts/):
- **entities.ts**: TypeScript types auto-generated from Prisma schema
- **validations.ts**: Zod schemas for runtime validation
  - CreateSupplierSchema
  - UpdateSupplierSchema
  - CreateProductSchema
  - UpdateProductSchema
  - CreateLocationSchema
  - CreateRiskEventSchema
  - CreateInventorySchema
  - CreateUserSchema

### Quickstart Documentation

Generated in [quickstart.md](quickstart.md):
- Local development database setup
- Migration commands (`prisma migrate dev`, `prisma migrate deploy`)
- Rollback procedures (`prisma migrate reset`)
- Seed data generation (`prisma db seed`)
- Testing database setup
- Troubleshooting common migration issues

## Phase 2: Task Breakdown

**Status**: ⏳ Pending - Run `/speckit.tasks` to generate task breakdown

Tasks will be generated from this plan and include:
- Prisma schema implementation for all 7 entities
- Multi-tenant middleware development
- Migration scripts and version control setup
- Seed data script with Faker.js integration
- Service layer CRUD operations for each entity
- Integration tests for database operations
- Unit tests for tenant isolation middleware
- Documentation updates (ERD, setup guides)

## Agent Context Update

**Status**: ⏳ Pending - Will be executed after Phase 1 completion

The following will be added to `.claude/context.md`:
- Prisma 6.x for TypeScript ORM
- PostgreSQL 16 multi-tenant patterns
- Zod for runtime validation
- Faker.js for test data generation
- Migration management best practices

## Next Steps

1. Review this implementation plan
2. Run `/speckit.tasks` to generate actionable task breakdown
3. Begin implementation with Prisma schema definition
4. Set up migration tooling and test database
5. Implement tenant isolation middleware
6. Develop service layer with CRUD operations
7. Write comprehensive integration tests
8. Generate seed data for development and testing

## Success Criteria Validation

This plan addresses all success criteria from the specification:

- **SC-001**: ✅ Prisma migrations deploy in <5 minutes (typically <1 minute)
- **SC-002**: ✅ All 7 entities supported with type-safe Prisma operations
- **SC-003**: ✅ Database-level constraints + Prisma validations ensure 100% integrity
- **SC-004**: ✅ Indexed queries + Prisma query optimization meet <500ms target
- **SC-005**: ✅ Prisma migrate provides built-in rollback capabilities
- **SC-006**: ✅ Seed script with Faker.js generates 100+ realistic records
- **SC-007**: ✅ Prisma schema is self-documenting with clear naming and relationships
