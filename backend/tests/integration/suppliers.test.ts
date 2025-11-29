/**
 * Supplier Integration Tests
 *
 * Tests CRUD operations, constraints, and relationships for Supplier entity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, setCurrentTenant, clearCurrentTenant } from './setup';
import { supplierService } from '../../src/services';

describe('Supplier Integration Tests', () => {
  const TEST_TENANT = 'test-tenant-001';

  beforeEach(() => {
    setCurrentTenant(TEST_TENANT);
  });

  it('should create a supplier', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-001',
      name: 'Acme Corporation',
      country: 'USA',
      contactEmail: 'contact@acme.com',
      contactPhone: '+1-555-0100',
      address: '123 Main Street, New York, NY 10001',
      rating: 4,
      notes: 'Primary supplier for electronic components',
    });

    expect(supplier.id).toBeDefined();
    expect(supplier.tenantId).toBe(TEST_TENANT);
    expect(supplier.code).toBe('SUP-001');
    expect(supplier.name).toBe('Acme Corporation');
    expect(supplier.country).toBe('USA');
    expect(supplier.contactEmail).toBe('contact@acme.com');
    expect(supplier.rating).toBe(4);
  });

  it('should find supplier by ID', async () => {
    const created = await supplierService.create({
      code: 'SUP-002',
      name: 'Global Tech Supplies',
      country: 'China',
      contactEmail: 'info@globaltech.cn',
      rating: 5,
    });

    const found = await supplierService.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.code).toBe('SUP-002');
    expect(found?.name).toBe('Global Tech Supplies');
  });

  it('should find all suppliers', async () => {
    await supplierService.create({
      code: 'SUP-003',
      name: 'Supplier One',
      country: 'USA',
      rating: 3,
    });

    await supplierService.create({
      code: 'SUP-004',
      name: 'Supplier Two',
      country: 'Germany',
      rating: 4,
    });

    const suppliers = await supplierService.findAll();

    expect(suppliers).toHaveLength(2);
    expect(suppliers.every(s => s.tenantId === TEST_TENANT)).toBe(true);
  });

  it('should update a supplier', async () => {
    const created = await supplierService.create({
      code: 'SUP-005',
      name: 'Original Name',
      country: 'USA',
      rating: 3,
    });

    const updated = await supplierService.update(created.id, {
      name: 'Updated Name',
      rating: 5,
      contactEmail: 'new@email.com',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe('Updated Name');
    expect(updated.rating).toBe(5);
    expect(updated.contactEmail).toBe('new@email.com');
    expect(updated.code).toBe('SUP-005'); // Unchanged
  });

  it('should delete a supplier', async () => {
    const created = await supplierService.create({
      code: 'SUP-006',
      name: 'To Be Deleted',
      country: 'USA',
      rating: 3,
    });

    await supplierService.delete(created.id);

    const found = await supplierService.findById(created.id);
    expect(found).toBeNull();
  });

  it('should enforce unique constraint on supplier code', async () => {
    await supplierService.create({
      code: 'SUP-UNIQUE',
      name: 'First Supplier',
      country: 'USA',
      rating: 3,
    });

    // Attempt to create supplier with same code should fail
    await expect(
      supplierService.create({
        code: 'SUP-UNIQUE',
        name: 'Second Supplier',
        country: 'Canada',
        rating: 4,
      })
    ).rejects.toThrow();
  });

  it('should support relationship with Products', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-007',
      name: 'Electronics Supplier',
      country: 'Japan',
      rating: 5,
    });

    // Create products associated with this supplier
    const product1 = await prisma.product.create({
      data: {
        sku: 'PROD-001',
        name: 'Microchip A1',
        category: 'Electronics',
        leadTimeDays: 30,
        supplierId: supplier.id,
      },
    });

    const product2 = await prisma.product.create({
      data: {
        sku: 'PROD-002',
        name: 'Microchip B2',
        category: 'Electronics',
        leadTimeDays: 45,
        supplierId: supplier.id,
      },
    });

    // Fetch supplier with products
    const supplierWithProducts = await prisma.supplier.findUnique({
      where: { id: supplier.id },
      include: { products: true },
    });

    expect(supplierWithProducts).toBeDefined();
    expect(supplierWithProducts?.products).toHaveLength(2);
    expect(supplierWithProducts?.products.map(p => p.sku)).toContain('PROD-001');
    expect(supplierWithProducts?.products.map(p => p.sku)).toContain('PROD-002');
  });

  it('should filter suppliers by country', async () => {
    await supplierService.create({
      code: 'SUP-USA-1',
      name: 'US Supplier',
      country: 'USA',
      rating: 4,
    });

    await supplierService.create({
      code: 'SUP-CHN-1',
      name: 'China Supplier',
      country: 'China',
      rating: 5,
    });

    const usSuppliers = await supplierService.findAll({ country: 'USA' });

    expect(usSuppliers).toHaveLength(1);
    expect(usSuppliers[0].country).toBe('USA');
    expect(usSuppliers[0].code).toBe('SUP-USA-1');
  });

  it('should filter suppliers by rating', async () => {
    await supplierService.create({
      code: 'SUP-RATE-3',
      name: 'Average Supplier',
      country: 'USA',
      rating: 3,
    });

    await supplierService.create({
      code: 'SUP-RATE-5',
      name: 'Excellent Supplier',
      country: 'USA',
      rating: 5,
    });

    const topSuppliers = await supplierService.findAll({ rating: { gte: 5 } });

    expect(topSuppliers).toHaveLength(1);
    expect(topSuppliers[0].rating).toBe(5);
    expect(topSuppliers[0].code).toBe('SUP-RATE-5');
  });
});
