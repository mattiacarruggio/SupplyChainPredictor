/**
 * Product Integration Tests
 *
 * Tests CRUD operations, constraints, and relationships for Product entity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, setCurrentTenant, clearCurrentTenant } from './setup';
import { productService, supplierService } from '../../src/services';

describe('Product Integration Tests', () => {
  const TEST_TENANT = 'test-tenant-001';

  beforeEach(() => {
    setCurrentTenant(TEST_TENANT);
  });

  it('should create a product', async () => {
    // First create a supplier
    const supplier = await supplierService.create({
      code: 'SUP-001',
      name: 'Test Supplier',
      country: 'USA',
      rating: 4,
    });

    const product = await productService.create({
      sku: 'PROD-001',
      name: 'Widget A',
      description: 'High-quality widget for industrial use',
      category: 'Hardware',
      unitOfMeasure: 'piece',
      leadTimeDays: 30,
      supplier: {
        connect: { id: supplier.id },
      },
    });

    expect(product.id).toBeDefined();
    expect(product.tenantId).toBe(TEST_TENANT);
    expect(product.sku).toBe('PROD-001');
    expect(product.name).toBe('Widget A');
    expect(product.category).toBe('Hardware');
    expect(product.leadTimeDays).toBe(30);
    expect(product.supplierId).toBe(supplier.id);
  });

  it('should find product by ID', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-002',
      name: 'Test Supplier 2',
      country: 'China',
      rating: 5,
    });

    const created = await productService.create({
      sku: 'PROD-002',
      name: 'Component B',
      category: 'Electronics',
      leadTimeDays: 45,
      supplier: {
        connect: { id: supplier.id },
      },
    });

    const found = await productService.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.sku).toBe('PROD-002');
    expect(found?.name).toBe('Component B');
  });

  it('should find all products', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-003',
      name: 'Test Supplier 3',
      country: 'Germany',
      rating: 4,
    });

    await productService.create({
      sku: 'PROD-003',
      name: 'Product One',
      category: 'Category A',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    await productService.create({
      sku: 'PROD-004',
      name: 'Product Two',
      category: 'Category B',
      leadTimeDays: 25,
      supplier: { connect: { id: supplier.id } },
    });

    const products = await productService.findAll();

    expect(products).toHaveLength(2);
    expect(products.every(p => p.tenantId === TEST_TENANT)).toBe(true);
  });

  it('should update a product', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-004',
      name: 'Test Supplier 4',
      country: 'Japan',
      rating: 5,
    });

    const created = await productService.create({
      sku: 'PROD-005',
      name: 'Original Product',
      category: 'Original Category',
      leadTimeDays: 30,
      supplier: { connect: { id: supplier.id } },
    });

    const updated = await productService.update(created.id, {
      name: 'Updated Product',
      category: 'New Category',
      leadTimeDays: 15,
      description: 'Updated description',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe('Updated Product');
    expect(updated.category).toBe('New Category');
    expect(updated.leadTimeDays).toBe(15);
    expect(updated.description).toBe('Updated description');
    expect(updated.sku).toBe('PROD-005'); // Unchanged
  });

  it('should delete a product', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-005',
      name: 'Test Supplier 5',
      country: 'USA',
      rating: 3,
    });

    const created = await productService.create({
      sku: 'PROD-006',
      name: 'To Be Deleted',
      category: 'Temporary',
      leadTimeDays: 10,
      supplier: { connect: { id: supplier.id } },
    });

    await productService.delete(created.id);

    const found = await productService.findById(created.id);
    expect(found).toBeNull();
  });

  it('should enforce unique constraint on SKU', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-006',
      name: 'Test Supplier 6',
      country: 'USA',
      rating: 4,
    });

    await productService.create({
      sku: 'PROD-UNIQUE',
      name: 'First Product',
      category: 'Category A',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    // Attempt to create product with same SKU should fail
    await expect(
      productService.create({
        sku: 'PROD-UNIQUE',
        name: 'Second Product',
        category: 'Category B',
        leadTimeDays: 25,
        supplier: { connect: { id: supplier.id } },
      })
    ).rejects.toThrow();
  });

  it('should enforce foreign key constraint to Supplier', async () => {
    // Attempt to create product with non-existent supplier should fail
    await expect(
      productService.create({
        sku: 'PROD-007',
        name: 'Orphan Product',
        category: 'Category',
        leadTimeDays: 30,
        supplier: {
          connect: { id: 'non-existent-supplier-id' },
        },
      })
    ).rejects.toThrow();
  });

  it('should include supplier relationship', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-007',
      name: 'Relationship Test Supplier',
      country: 'Canada',
      rating: 5,
    });

    const product = await productService.create({
      sku: 'PROD-008',
      name: 'Product with Supplier',
      category: 'Test',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    const productWithSupplier = await prisma.product.findUnique({
      where: { id: product.id },
      include: { supplier: true },
    });

    expect(productWithSupplier).toBeDefined();
    expect(productWithSupplier?.supplier).toBeDefined();
    expect(productWithSupplier?.supplier.id).toBe(supplier.id);
    expect(productWithSupplier?.supplier.name).toBe('Relationship Test Supplier');
  });

  it('should filter products by category', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-008',
      name: 'Test Supplier 8',
      country: 'USA',
      rating: 4,
    });

    await productService.create({
      sku: 'PROD-CAT-1',
      name: 'Electronics Product',
      category: 'Electronics',
      leadTimeDays: 30,
      supplier: { connect: { id: supplier.id } },
    });

    await productService.create({
      sku: 'PROD-CAT-2',
      name: 'Hardware Product',
      category: 'Hardware',
      leadTimeDays: 25,
      supplier: { connect: { id: supplier.id } },
    });

    const electronicsProducts = await productService.findAll({
      category: 'Electronics',
    });

    expect(electronicsProducts).toHaveLength(1);
    expect(electronicsProducts[0].category).toBe('Electronics');
    expect(electronicsProducts[0].sku).toBe('PROD-CAT-1');
  });

  it('should filter products by supplier', async () => {
    const supplier1 = await supplierService.create({
      code: 'SUP-009',
      name: 'Supplier One',
      country: 'USA',
      rating: 4,
    });

    const supplier2 = await supplierService.create({
      code: 'SUP-010',
      name: 'Supplier Two',
      country: 'China',
      rating: 5,
    });

    await productService.create({
      sku: 'PROD-S1-1',
      name: 'Product from Supplier 1',
      category: 'Category',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier1.id } },
    });

    await productService.create({
      sku: 'PROD-S2-1',
      name: 'Product from Supplier 2',
      category: 'Category',
      leadTimeDays: 25,
      supplier: { connect: { id: supplier2.id } },
    });

    const supplier1Products = await productService.findAll({
      supplierId: supplier1.id,
    });

    expect(supplier1Products).toHaveLength(1);
    expect(supplier1Products[0].supplierId).toBe(supplier1.id);
    expect(supplier1Products[0].sku).toBe('PROD-S1-1');
  });
});
