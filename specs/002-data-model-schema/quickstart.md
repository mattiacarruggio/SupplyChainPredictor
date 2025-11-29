# Quickstart Guide: Database Setup & Migrations

**Feature**: Data Model & Database Schema
**Branch**: `002-data-model-schema`
**Date**: 2025-11-29

## Prerequisites

- Node.js 20+ installed
- pnpm 8+ installed
- Docker and Docker Compose installed
- PostgreSQL 16 running (via docker-compose.yml)

## Initial Setup

### 1. Install Dependencies

```bash
# From repository root
pnpm install

# Install Prisma CLI globally (optional, for convenience)
pnpm add -g prisma
```

### 2. Start PostgreSQL Database

```bash
# Start PostgreSQL container
docker-compose up -d db

# Verify database is running
docker-compose ps

# Check database logs
docker-compose logs db
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your database credentials
# Default PostgreSQL connection string:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/supply_chain_dev"
```

## Database Migrations

### Generate Initial Migration

```bash
# Navigate to backend directory
cd backend

# Generate Prisma Client from schema
pnpm prisma generate

# Create initial migration
pnpm prisma migrate dev --name init

# This will:
# 1. Read prisma/schema.prisma
# 2. Generate SQL migration file
# 3. Apply migration to database
# 4. Re-generate Prisma Client with types
```

**Expected Output**:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "supply_chain_dev"

Applying migration `20251129120000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251129120000_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (5.22.0) to ./node_modules/@prisma/client
```

### Apply Migrations to Different Environments

**Development**:
```bash
pnpm prisma migrate dev
```

**Production**:
```bash
pnpm prisma migrate deploy
```

**Staging/Testing**:
```bash
DATABASE_URL="postgresql://user:pass@staging-db:5432/db" pnpm prisma migrate deploy
```

### View Migration Status

```bash
pnpm prisma migrate status
```

### Rollback Migrations (Development Only)

```bash
# Reset database to last migration
pnpm prisma migrate reset

# This will:
# 1. Drop all tables
# 2. Re-run all migrations
# 3. Run seed script (if configured)
```

**⚠️ WARNING**: `migrate reset` is destructive and will delete all data!

## Seed Data

### Run Seed Script

```bash
# Execute seed script (creates sample data)
pnpm prisma db seed

# Or run directly
pnpm ts-node prisma/seed.ts
```

**Seed Data Created**:
- 20 suppliers across different countries
- 50 products linked to suppliers
- 10 locations (warehouses, factories, ports)
- 15 shipment routes connecting locations
- 30 risk events with varied severity levels
- 80 inventory records
- 5 users with different roles

### Configure Seed Script

Edit `package.json` to add seed configuration:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Prisma Studio (Database GUI)

```bash
# Launch Prisma Studio to view/edit data
pnpm prisma studio

# Opens browser at http://localhost:5555
```

Prisma Studio provides:
- Visual table browser
- CRUD operations without SQL
- Relationship navigation
- Filtered queries

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `prisma generate` | Generate Prisma Client from schema |
| `prisma migrate dev` | Create and apply migration (dev) |
| `prisma migrate deploy` | Apply pending migrations (prod) |
| `prisma migrate reset` | Reset database and re-run migrations |
| `prisma migrate status` | Check migration status |
| `prisma db seed` | Run seed script |
| `prisma studio` | Launch database GUI |
| `prisma format` | Format schema.prisma file |
| `prisma validate` | Validate schema syntax |

## Testing Setup

### Test Database Configuration

```bash
# Create test database
docker-compose -f docker-compose.test.yml up -d

# Configure test environment
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/supply_chain_test"

# Run migrations on test database
pnpm prisma migrate deploy

# Run tests
pnpm test
```

### Integration Test Database

```typescript
// tests/integration/setup.ts
import { execSync } from 'child_process';

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/supply_chain_test';

  // Run migrations
  execSync('pnpm prisma migrate deploy');
});

beforeEach(async () => {
  // Truncate all tables
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE suppliers, products, locations, shipment_routes,
                  risk_events, inventory, users
    RESTART IDENTITY CASCADE;
  `);
});
```

## Troubleshooting

### Issue: "Error: P1001: Can't reach database server"

**Solution**:
```bash
# 1. Verify PostgreSQL is running
docker-compose ps db

# 2. Check database logs
docker-compose logs db

# 3. Restart database
docker-compose restart db

# 4. Verify connection string in .env
cat backend/.env | grep DATABASE_URL
```

### Issue: "Error: P3009: migrate found failed migration"

**Solution**:
```bash
# 1. Check migration status
pnpm prisma migrate status

# 2. Mark failed migration as rolled back
pnpm prisma migrate resolve --rolled-back "20251129120000_init"

# 3. Re-run migration
pnpm prisma migrate deploy
```

### Issue: "Error: Schema parsing failed"

**Solution**:
```bash
# Validate schema syntax
pnpm prisma validate

# Format schema file
pnpm prisma format

# Check for syntax errors in prisma/schema.prisma
```

### Issue: Migration takes too long

**Solution**:
- Check for large data volumes (migration may be slow)
- Ensure database has sufficient resources
- Use `migrate deploy` for faster, non-interactive migrations

## Best Practices

1. **Always Review Generated Migrations**
   - Check `prisma/migrations/[timestamp]/migration.sql`
   - Ensure SQL is correct before committing

2. **Test Migrations on Staging First**
   - Never apply untested migrations to production
   - Use `migrate deploy` in CI/CD pipelines

3. **Commit Migration Files to Git**
   - Migration files are source-controlled history
   - Never manually edit applied migrations

4. **Use Shadow Database for Safety**
   - Prisma automatically creates shadow database for diffing
   - Detects schema drift and migration conflicts

5. **Backup Production Before Migrations**
   - Always have database backup before schema changes
   - Test rollback procedures

6. **Avoid Mixing Prisma Migrate with Manual SQL**
   - Let Prisma manage migrations exclusively
   - Manual SQL changes will cause schema drift

## Next Steps

1. ✅ Database running and migrations applied
2. ✅ Seed data generated
3. ⏳ Implement service layer (CRUD operations)
4. ⏳ Write integration tests
5. ⏳ Implement multi-tenant middleware
6. ⏳ Set up CI/CD database migrations

For implementation details, see:
- [data-model.md](data-model.md) - Complete schema documentation
- [plan.md](plan.md) - Implementation plan
- [research.md](research.md) - Technology decisions

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/)
- [Multi-Tenancy Patterns](https://www.prisma.io/docs/guides/database/multi-tenancy)
