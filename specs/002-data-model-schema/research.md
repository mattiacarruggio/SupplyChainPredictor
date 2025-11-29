# Research: Data Model & Database Schema

**Feature**: Data Model & Database Schema
**Branch**: `002-data-model-schema`
**Date**: 2025-11-29
**Research Phase**: Phase 0 - Technology Selection & Patterns

## Overview

This document captures research findings and technology decisions for implementing the database schema and data access layer for the Supply Chain Risk & Disruption Predictor platform.

## Research Questions

1. Which ORM provides the best TypeScript integration, migration tooling, and multi-tenant support for PostgreSQL?
2. What migration strategy ensures safe, repeatable deployments with rollback capabilities?
3. How should multi-tenant data isolation be implemented at the application layer?
4. What tools and patterns should be used for generating realistic seed data?
5. How should database testing be structured to ensure isolation and reproducibility?

## Decision 1: ORM Selection

**Decision**: Prisma 6.x

**Options Considered**:

1. **Prisma 6.x**
   - Type-safe query builder with auto-generated TypeScript types
   - Declarative schema language (schema.prisma)
   - Built-in migration system with version control
   - Middleware support for cross-cutting concerns (tenant isolation)
   - Excellent PostgreSQL support (JSON fields, full-text search, native types)
   - Active development, strong ecosystem, comprehensive documentation

2. **TypeORM**
   - Decorator-based entity definitions
   - Supports both Active Record and Data Mapper patterns
   - Migration system requires manual SQL or class-based migrations
   - Larger bundle size, slower query performance vs Prisma
   - Less active development compared to Prisma

3. **Sequelize**
   - Mature ORM with broad database support
   - Promise-based API
   - Limited TypeScript support (types are community-maintained)
   - Migration system less robust than Prisma
   - Heavier runtime overhead

4. **Drizzle ORM**
   - Lightweight, SQL-first approach
   - Excellent TypeScript inference
   - Newer, smaller ecosystem than Prisma
   - Less tooling for migrations and code generation

5. **Raw SQL with `pg` driver**
   - Maximum control and performance
   - No type safety without manual type definitions
   - No automatic migration generation
   - Significantly more boilerplate code

**Rationale**:

Prisma 6.x chosen for:
- **Type Safety**: Auto-generated TypeScript types from schema prevent runtime errors
- **Developer Experience**: Declarative schema is easier to maintain than imperative code
- **Migration Tooling**: `prisma migrate` provides version-controlled, reversible migrations
- **Middleware System**: Essential for multi-tenant tenant_id injection
- **PostgreSQL Features**: First-class support for advanced PostgreSQL capabilities
- **Team Velocity**: Less boilerplate, faster iteration compared to alternatives

**Tradeoffs**:
- Learning curve for Prisma schema language (DSL) vs familiar TypeScript decorators
- Slight performance overhead vs raw SQL (negligible for our scale)
- Lock-in to Prisma ecosystem (mitigated by standard SQL migrations as escape hatch)

**References**:
- Prisma Documentation: https://www.prisma.io/docs
- Prisma vs TypeORM: https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-typeorm
- PostgreSQL Support: https://www.prisma.io/docs/concepts/database-connectors/postgresql

---

## Decision 2: Migration Strategy

**Decision**: Prisma Migrate for all environments

**Options Considered**:

1. **Prisma Migrate (Chosen)**
   - Declarative schema in `schema.prisma`
   - Automatic migration generation: `prisma migrate dev`
   - Version-controlled SQL files in `/prisma/migrations/`
   - Safe deployments: `prisma migrate deploy` applies pending migrations
   - Rollback via `prisma migrate reset` (dev) or manual SQL (prod)

2. **Manual SQL Migrations**
   - Write raw SQL migration scripts manually
   - Use migration runner like `node-pg-migrate` or custom scripts
   - Full control but error-prone and time-consuming

3. **TypeORM Migrations**
   - Class-based or SQL-based migrations
   - Less integrated than Prisma (requires separate config)

**Rationale**:

- **Integrated Workflow**: Schema changes in `schema.prisma` automatically generate migrations
- **Version Control**: Migration files are committed to git, providing full history
- **Idempotency**: Migrations track applied versions, safe to run multiple times
- **CI/CD Ready**: `prisma migrate deploy` is designed for automated pipelines
- **Rollback Support**: Dev environments use `prisma migrate reset`; production rollback via manual SQL (acceptable for MVP)

**Migration Workflow**:

**Development**:
```bash
# 1. Modify schema.prisma
# 2. Generate migration
prisma migrate dev --name add_suppliers_table

# 3. Review generated SQL in prisma/migrations/
# 4. Commit migration files to git
```

**Production**:
```bash
# Apply pending migrations (non-destructive)
prisma migrate deploy

# Rollback (manual - run previous migration's inverse SQL)
psql -f rollback_script.sql
```

**Best Practices**:
- Always review generated migration SQL before committing
- Test migrations on staging environment before production
- Create rollback scripts for critical schema changes
- Use shadow database for migration generation (Prisma default)

**References**:
- Prisma Migrate: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Production Migrations: https://www.prisma.io/docs/guides/deployment/deploy-database-changes-with-prisma-migrate

---

## Decision 3: Multi-Tenant Isolation

**Decision**: Prisma Middleware with `tenant_id` filtering

**Options Considered**:

1. **Prisma Middleware (Chosen)**
   - Application-layer filtering using Prisma middleware
   - Global middleware intercepts all queries and injects `where: { tenantId: currentTenant }`
   - Portable across environments, testable, debuggable

2. **PostgreSQL Row-Level Security (RLS)**
   - Database-level security policies enforce tenant isolation
   - More secure (bypasses impossible even with SQL injection)
   - Harder to test, debug, and requires PostgreSQL-specific knowledge
   - Requires `SET LOCAL app.current_tenant` on every connection

3. **Separate Schemas per Tenant**
   - Each tenant gets a dedicated PostgreSQL schema
   - Strong isolation but doesn't scale (schema limit ~10k)
   - Complex migrations (must run against all schemas)
   - Not suitable for multi-tenant SaaS at scale

**Rationale**:

Middleware approach chosen because:
- **Simplicity**: Easy to understand and debug in application code
- **Testability**: Can be unit tested by mocking Prisma client
- **Portability**: Not tied to PostgreSQL RLS (easier to migrate databases if needed)
- **Developer Experience**: Errors surface in application logs, not deep in database

**Implementation**:

```typescript
// backend/src/middleware/tenantIsolation.ts
import { PrismaClient } from '@prisma/client';

export function createTenantMiddleware(prisma: PrismaClient) {
  prisma.$use(async (params, next) => {
    const tenantId = getCurrentTenantId(); // From auth context

    if (!tenantId) {
      throw new Error('Tenant ID required for database access');
    }

    // Inject tenantId filter for all read/write operations
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, tenantId };
    } else if (params.action === 'findMany') {
      params.args.where = { ...params.args.where, tenantId };
    } else if (params.action === 'create') {
      params.args.data = { ...params.args.data, tenantId };
    } else if (params.action === 'update' || params.action === 'updateMany') {
      params.args.where = { ...params.args.where, tenantId };
    } else if (params.action === 'delete' || params.action === 'deleteMany') {
      params.args.where = { ...params.args.where, tenantId };
    }

    return next(params);
  });
}
```

**Schema Enforcement**:

Every multi-tenant table includes:
```prisma
model Supplier {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  // ... other fields

  @@index([tenantId])
  @@map("suppliers")
}
```

**Tradeoffs**:
- Application-layer filtering can be bypassed if middleware is misconfigured
- Requires developer discipline to include `tenantId` in all queries
- Performance: Extra WHERE clause on every query (mitigated by indexes)

**Security Measures**:
- Integration tests verify tenant isolation
- Code reviews enforce middleware usage
- Future: Add PostgreSQL RLS as defense-in-depth (Phase 6)

**References**:
- Prisma Middleware: https://www.prisma.io/docs/concepts/components/prisma-client/middleware
- Multi-Tenancy Patterns: https://www.prisma.io/docs/guides/database/multi-tenancy

---

## Decision 4: Seed Data Generation

**Decision**: Faker.js + Custom Domain Logic

**Options Considered**:

1. **Faker.js (Chosen)**
   - Generates realistic fake data (names, addresses, dates, numbers)
   - Localization support for international data
   - Stable, widely-used library

2. **Manual Seed Data**
   - Hardcoded fixture data in seed script
   - Predictable but tedious to maintain

3. **Chance.js**
   - Alternative to Faker.js with similar features
   - Smaller community, less active development

**Rationale**:

Faker.js chosen because:
- **Realism**: Generates data that resembles production scenarios
- **Volume**: Can easily create 100+ records with varied attributes
- **Customization**: Combine Faker with domain-specific logic (e.g., risk severity distribution)
- **Ecosystem**: Well-documented, TypeScript support via `@faker-js/faker`

**Seed Script Structure**:

```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'tenant-demo-001';

  // Create 20 suppliers
  const suppliers = await Promise.all(
    Array.from({ length: 20 }, () =>
      prisma.supplier.create({
        data: {
          tenantId,
          code: faker.string.alphanumeric(8).toUpperCase(),
          name: faker.company.name(),
          country: faker.location.country(),
          contactEmail: faker.internet.email(),
          rating: faker.number.int({ min: 1, max: 5 }),
        },
      })
    )
  );

  // Create 50 products linked to suppliers
  const products = await Promise.all(
    Array.from({ length: 50 }, () => {
      const supplier = faker.helpers.arrayElement(suppliers);
      return prisma.product.create({
        data: {
          tenantId,
          sku: faker.string.alphanumeric(12).toUpperCase(),
          name: faker.commerce.productName(),
          category: faker.commerce.department(),
          supplierId: supplier.id,
          leadTimeDays: faker.number.int({ min: 7, max: 90 }),
        },
      });
    })
  );

  // Create 10 locations
  // Create 30 risk events with varied severity
  // Create inventory records for product-location pairs
  // ...

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Seed Data Goals**:
- 20 suppliers across different countries
- 50 products across multiple categories
- 10 locations (warehouses, factories, ports)
- 15 shipment routes connecting locations
- 30 risk events (10 low, 15 medium, 5 high severity)
- 80 inventory records with realistic stock levels
- 5 users with different roles

**Execution**:
```bash
# Run seed script
pnpm prisma db seed

# Or reset database and re-seed
pnpm prisma migrate reset
```

**References**:
- Faker.js: https://fakerjs.dev/
- Prisma Seeding: https://www.prisma.io/docs/guides/database/seed-database

---

## Decision 5: Testing Strategy

**Decision**: Vitest + Test Database with Prisma Client

**Options Considered**:

1. **Vitest + Test Database (Chosen)**
   - Spin up isolated PostgreSQL instance for testing
   - Run migrations before test suite
   - Truncate tables or rollback transactions between tests
   - Fast, parallel test execution with Vitest

2. **In-Memory Database (SQLite)**
   - Faster than real PostgreSQL
   - SQL dialect differences can cause false positives/negatives
   - Doesn't test PostgreSQL-specific features

3. **Mocked Prisma Client**
   - No database required
   - Tests don't validate actual SQL or constraints
   - Brittle mocks break when Prisma updates

**Rationale**:

Test database approach chosen because:
- **Accuracy**: Tests run against actual PostgreSQL (same as production)
- **Isolation**: Each test suite gets a clean database state
- **Integration Testing**: Validates schema, constraints, relationships, and queries
- **CI/CD Friendly**: Docker Compose can spin up test database in CI pipeline

**Test Database Setup**:

```typescript
// backend/tests/integration/setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let prisma: PrismaClient;

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/supply_chain_test';

  // Run migrations
  execSync('pnpm prisma migrate deploy');

  prisma = new PrismaClient();
});

beforeEach(async () => {
  // Truncate all tables between tests
  const tables = ['suppliers', 'products', 'locations', 'risk_events', 'inventory', 'users'];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
```

**Test Example**:

```typescript
// backend/tests/integration/suppliers.test.ts
import { describe, it, expect } from 'vitest';
import { prisma } from './setup';

describe('Supplier CRUD', () => {
  it('should create and retrieve a supplier', async () => {
    const supplier = await prisma.supplier.create({
      data: {
        tenantId: 'test-tenant',
        code: 'SUP001',
        name: 'Acme Corp',
        country: 'USA',
        contactEmail: 'contact@acme.com',
        rating: 4,
      },
    });

    expect(supplier.id).toBeDefined();
    expect(supplier.name).toBe('Acme Corp');

    const retrieved = await prisma.supplier.findUnique({
      where: { id: supplier.id },
    });

    expect(retrieved).toEqual(supplier);
  });

  it('should enforce tenant isolation', async () => {
    await prisma.supplier.create({
      data: {
        tenantId: 'tenant-a',
        code: 'SUP001',
        name: 'Tenant A Supplier',
        country: 'USA',
        rating: 5,
      },
    });

    const results = await prisma.supplier.findMany({
      where: { tenantId: 'tenant-b' },
    });

    expect(results).toHaveLength(0);
  });
});
```

**Docker Compose Test Database**:

```yaml
# docker-compose.test.yml
services:
  db-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: supply_chain_test
    ports:
      - "5433:5432"
```

**CI/CD Integration**:

```yaml
# .github/workflows/ci.yml (add to existing)
- name: Start test database
  run: docker-compose -f docker-compose.test.yml up -d

- name: Run integration tests
  run: pnpm --filter backend test:integration

- name: Stop test database
  run: docker-compose -f docker-compose.test.yml down
```

**References**:
- Vitest: https://vitest.dev/
- Prisma Testing: https://www.prisma.io/docs/guides/testing/integration-testing

---

## Summary

All research questions resolved with concrete technology decisions:

| Question | Decision | Rationale |
|----------|----------|-----------|
| ORM Selection | Prisma 6.x | Type safety, migration tooling, middleware, PostgreSQL support |
| Migration Strategy | Prisma Migrate | Integrated, version-controlled, CI/CD-ready |
| Multi-Tenant Isolation | Prisma Middleware | Application-layer, testable, portable |
| Seed Data | Faker.js + Custom Logic | Realistic, high-volume, domain-specific |
| Testing | Vitest + Test Database | Accurate, isolated, CI/CD-friendly |

**Next Phase**: Proceed to Phase 1 (Data Model Design & Contracts Generation)

**Implementation Ready**: ✅ All technical decisions finalized
